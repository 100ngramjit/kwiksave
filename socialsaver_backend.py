"""
kwiksave Backend — Production-Ready FastAPI + yt-dlp
======================================================
Features:
- Validates URL with domain allowlist & injection guards.
- Runs yt-dlp in thread pool for info extraction.
- In-memory cache with 5-minute TTL.
- Streams downloads directly from disk (efficient for large files).
- Comprehensive error handling.

To Run:
    uvicorn kwiksave_backend:app --reload --port 8000
"""

import asyncio
import hashlib
import os
import re
import tempfile
import time
from contextlib import asynccontextmanager
from typing import Optional, Generator
from urllib.parse import urlparse

import httpx
import yt_dlp
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator


# ─────────────────────────────────────────────
#  App Initialization
# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 kwiksave API started.")
    yield
    print("🛑 kwiksave API shutting down.")

app = FastAPI(
    title="KwikSave API",
    description="Secure and efficient media downloader powered by yt-dlp.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
#  Constants & Security
# ─────────────────────────────────────────────

SUPPORTED_DOMAINS = {
    # YouTube
    "youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com",
    # Instagram
    "instagram.com", "www.instagram.com",
    # TikTok
    "tiktok.com", "www.tiktok.com", "vm.tiktok.com",
    # Twitter / X
    "twitter.com", "www.twitter.com", "x.com", "www.x.com",
    # Facebook
    "facebook.com", "www.facebook.com", "fb.watch",
}

MAX_URL_LENGTH = 2048
CACHE_TTL = 300  # 5 minutes
_info_cache: dict = {}


def validate_url(url: str) -> str:
    """Validate and sanitize URL to prevent injection and limit scope."""
    url = url.strip()
    if not url:
        raise ValueError("URL cannot be empty")
    if len(url) > MAX_URL_LENGTH:
        raise ValueError("URL is too long")
    
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP/HTTPS URLs are supported")
    
    domain = parsed.netloc.lower()
    if not any(domain == d or domain.endswith("." + d) for d in SUPPORTED_DOMAINS):
        raise ValueError(f"Domain '{domain}' is not supported for security reasons")

    # Basic injection guard: block common shell metacharacters
    # We allow '&' because it's standard for URL query parameters
    if re.search(r"[;|`$]", url):
        raise ValueError("URL contains invalid characters")
    
    return url


def get_cache_key(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()


def get_from_cache(url: str):
    key = get_cache_key(url)
    entry = _info_cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None


def add_to_cache(url: str, data: dict):
    _info_cache[get_cache_key(url)] = {"data": data, "ts": time.time()}


def human_readable_size(size_bytes: Optional[int]) -> str:
    if size_bytes is None: return "Unknown"
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} PB"


# ─────────────────────────────────────────────
#  yt-dlp Core Logic
# ─────────────────────────────────────────────

YDL_OPTS_BASE = {
    "quiet": True,
    "no_warnings": True,
    "noplaylist": True,
    "socket_timeout": 60,
    "retries": 10,
    "fragment_retries": 10,
    "nocheckcertificate": True,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

# Progress tracking store
progress_store = {}


def extract_info_sync(url: str) -> dict:
    """Run yt-dlp info extraction."""
    opts = {**YDL_OPTS_BASE, "skip_download": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=False)


def process_formats(info: dict) -> list[dict]:
    """Extract and categorize useful formats from raw yt-dlp data."""
    raw_formats = info.get("formats", [])
    processed = []
    seen_resolutions = set()

    # We want to capture distinct resolutions (1080p, 720p, etc.)
    # Note: High res (1080p+) are often video-only and need to be joined with audio.
    
    # 1. Collect Video Formats
    video_formats = [f for f in raw_formats if f.get("vcodec") != "none" and f.get("height")]
    # Sort by height desc, then by whether it has audio (prefer combined), then by extension (prefer mp4)
    video_formats.sort(key=lambda x: (
        -x.get("height", 0), 
        0 if x.get("acodec") != "none" else 1,
        0 if x.get("ext") == "mp4" else 1
    ))

    for f in video_formats:
        height = f.get("height")
        label = f"{height}p"
        if label in seen_resolutions:
            continue
        
        seen_resolutions.add(label)
        fid = f.get("format_id")
        acodec = f.get("acodec", "none")
        ext = f.get("ext", "")
        filesize = f.get("filesize") or f.get("filesize_approx")

        # If it's video-only, we'll ask yt-dlp to merge it with best audio during download
        final_fid = fid if acodec != "none" else f"{fid}+bestaudio/best"
        
        is_approx = f.get("filesize") is None and f.get("filesize_approx") is not None
        size_str = human_readable_size(filesize)
        if is_approx:
            size_str = f"~{size_str}"

        processed.append({
            "format_id": final_fid,
            "type": "video",
            "container": "MP4" if ext == "mp4" or acodec == "none" else ext.upper(),
            "label": label,
            "quality": "Ultra HD" if height >= 2160 else "2K" if height >= 1440 else "Best" if height >= 1080 else "High" if height >= 720 else "Medium",
            "size": size_str,
            "height": height
        })

    # 2. Collect Audio Formats
    audio_formats = [f for f in raw_formats if f.get("vcodec") == "none" and f.get("acodec") != "none"]
    audio_formats.sort(key=lambda x: -(x.get("abr") or 0))
    
    seen_audio = set()
    for f in audio_formats:
        abr = f.get("abr")
        if not abr: continue
        label = f"{int(abr)}kbps"
        if label in seen_audio: continue
        
        seen_audio.add(label)
        is_approx = f.get("filesize") is None and f.get("filesize_approx") is not None
        size_str = human_readable_size(f.get("filesize") or f.get("filesize_approx"))
        if is_approx:
            size_str = f"~{size_str}"

        processed.append({
            "format_id": f.get("format_id"),
            "type": "audio",
            "container": f.get("ext", "").upper() or "MP3",
            "label": label,
            "quality": "Best" if abr >= 256 else "Good" if abr >= 128 else "Medium",
            "size": size_str,
            "abr": abr
        })

    # Final sort: Video desc, then Audio desc
    processed.sort(key=lambda x: (0 if x["type"] == "video" else 1, -x.get("height", 0) if x["type"] == "video" else -x.get("abr", 0)))
    return processed


# ─────────────────────────────────────────────
#  Models
# ─────────────────────────────────────────────

class InfoRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url_field(cls, v):
        try:
            return validate_url(v)
        except ValueError as e:
            raise ValueError(str(e))


class MediaInfoResponse(BaseModel):
    title: str
    uploader: Optional[str]
    duration_str: Optional[str]
    view_count: Optional[str]
    thumbnail: Optional[str]
    formats: list[dict]
    platform: str


# ─────────────────────────────────────────────
#  API Routes
# ─────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/info", response_model=MediaInfoResponse)
async def get_info(request: InfoRequest):
    url = request.url
    
    # Check Cache
    cached = get_from_cache(url)
    if cached:
        return cached

    try:
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, extract_info_sync, url)
    except yt_dlp.utils.DownloadError as e:
        msg = str(e)
        if "Private video" in msg:
            raise HTTPException(403, "Video is private")
        if "not available" in msg.lower():
            raise HTTPException(404, "Video is unavailable")
        raise HTTPException(400, f"yt-dlp error: {msg[:100]}")
    except Exception as e:
        raise HTTPException(500, f"Internal error: {str(e)}")

    # Format data
    duration = info.get("duration")
    duration_str = time.strftime('%H:%M:%S', time.gmtime(duration)) if duration else None
    
    domain = urlparse(url).netloc.lower()
    platform = "youtube" if "youtube" in domain or "youtu.be" in domain else \
               "instagram" if "instagram" in domain else \
               "tiktok" if "tiktok" in domain else \
               "twitter" if "twitter" in domain or "x.com" in domain else "social"

    view_count = info.get("view_count")
    view_str = f"{view_count:,} views" if view_count else None

    # Robust thumbnail selection
    thumbnails = info.get("thumbnails", [])
    thumbnail = info.get("thumbnail")
    if thumbnails:
        # Sort by resolution/preference and pick the best one
        best_thumb = sorted(thumbnails, key=lambda x: (x.get("width", 0), x.get("preference", 0)), reverse=True)[0]
        thumbnail = best_thumb.get("url") or thumbnail

    response_data = {
        "title": info.get("title", "Unknown Title"),
        "uploader": info.get("uploader") or info.get("channel"),
        "duration_str": duration_str,
        "view_count": view_str,
        "thumbnail": thumbnail,
        "formats": process_formats(info),
        "platform": platform,
    }

    add_to_cache(url, response_data)
    return response_data


@app.get("/api/proxy/thumbnail")
async def proxy_thumbnail(url: str = Query(..., description="Thumbnail source URL")):
    """Proxy thumbnails to bypass platform hotlinking protections (e.g., Instagram)."""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.instagram.com/",
            }
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            
            content_type = resp.headers.get("Content-Type", "image/jpeg")
            return StreamingResponse(
                (chunk for chunk in [resp.content]),
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=86400"}
            )
    except Exception as e:
        print(f"Thumbnail proxy error: {e}")
        raise HTTPException(404, "Thumbnail not found")


def file_stream_generator(file_path: str, chunk_size=1024*1024):
    """Generator to stream file and then delete it and its parent directory."""
    dir_path = os.path.dirname(file_path)
    try:
        with open(file_path, "rb") as f:
            while chunk := f.read(chunk_size):
                yield chunk
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        # Try to remove parent dir if it's empty (we created it with mkdtemp)
        if os.path.exists(dir_path) and not os.listdir(dir_path):
            try:
                os.rmdir(dir_path)
            except:
                pass


@app.get("/api/progress/{client_id}")
async def progress_stream(client_id: str):
    """SSE endpoint for real-time download progress."""
    async def event_generator():
        start_time = time.time()
        timeout = 1800  # 30 minutes max for a download progress stream
        
        try:
            while time.time() - start_time < timeout:
                if client_id in progress_store:
                    import json
                    data = progress_store[client_id]
                    yield f"data: {json.dumps(data)}\n\n"
                    if data.get("status") in ("finished", "error"):
                        break
                await asyncio.sleep(0.5)
        finally:
            # Wait a few seconds then clean up to allow last miliseconds of UI update
            await asyncio.sleep(5)
            if client_id in progress_store:
                del progress_store[client_id]
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/download")
async def download(
    url: str = Query(..., description="Target URL"),
    format_id: str = Query(..., description="Selected format ID"),
    filename: str = Query("video", description="Output filename"),
    client_id: Optional[str] = Query(None, description="Client ID for progress tracking")
):
    try:
        url = validate_url(url)
    except ValueError as e:
        raise HTTPException(400, str(e))

    # We use a temporary directory for the download
    tmp_dir = tempfile.mkdtemp()
    
    def run_download():
        def progress_hook(d):
            if not client_id: return
            if d['status'] == 'downloading':
                p = d.get('_percent_str', '0%').replace('%','').strip()
                speed = d.get('_speed_str', 'N/A')
                eta = d.get('_eta_str', 'N/A')
                progress_store[client_id] = {
                    "status": "downloading",
                    "progress": p,
                    "speed": speed,
                    "eta": eta
                }
            elif d['status'] == 'finished':
                progress_store[client_id] = {"status": "finished", "progress": "100"}

        opts = {
            **YDL_OPTS_BASE,
            "format": format_id,
            "outtmpl": os.path.join(tmp_dir, "%(title)s.%(ext)s"),
            "merge_output_format": "mp4",
            "fixup": "detect_or_warn",
            "progress_hooks": [progress_hook],
            "postprocessor_args": {
                "ffmpeg": ["-report"] # Help debug if it fails
            } if os.environ.get("DEBUG") else {}
        }
        with yt_dlp.YoutubeDL(opts) as ydl:
            dl_info = ydl.extract_info(url, download=True)
            return ydl.prepare_filename(dl_info)

    try:
        loop = asyncio.get_event_loop()
        full_path = await loop.run_in_executor(None, run_download)
        
        if not os.path.exists(full_path):
            # Try to find any file in the tmp_dir if prepare_filename failed to match exactly
            files = os.listdir(tmp_dir)
            if not files:
                raise Exception("No file downloaded")
            full_path = os.path.join(tmp_dir, files[0])

        ext = os.path.splitext(full_path)[1].replace(".", "")
        mime_types = {
            "mp4": "video/mp4",
            "webm": "video/webm",
            "mp3": "audio/mpeg",
            "m4a": "audio/mp4",
            "mkv": "video/x-matroska",
        }
        media_type = mime_types.get(ext.lower(), "application/octet-stream")

        file_size = os.path.getsize(full_path)

        from urllib.parse import quote
        safe_filename = quote(f"{filename}.{ext}")

        return StreamingResponse(
            file_stream_generator(full_path),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}",
                "Content-Length": str(file_size),
                "Access-Control-Expose-Headers": "Content-Disposition, Content-Length"
            }
        )
    except Exception as e:
        # Cleanup on failure
        if client_id and client_id in progress_store:
            progress_store[client_id] = {"status": "error", "message": str(e)}
        if os.path.exists(tmp_dir):
            import shutil
            shutil.rmtree(tmp_dir)
        raise HTTPException(500, f"Download failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
