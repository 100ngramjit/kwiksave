# KwikSave 🚀

KwikSave is a high-performance, open-source media download engine. It provides a seamless, professional-grade interface for extracting high-fidelity video and audio from global social platforms including YouTube, Instagram, X (Twitter), and Facebook.

---

## 🏗️ Technical Architecture

KwikSave uses a **Decoupled Asynchronous Streaming Architecture**. This ensures the UI remains responsive while the server handles heavy multi-gigabit media streams.

### 1. High-Performance Backend (FastAPI)

The backend is built with **FastAPI**, leveraging Python's `asyncio` for non-blocking I/O.

#### 🛠️ Core Dependency Stack:

- **FastAPI (v0.100+)**: Provides the asynchronous REST framework. Chosen for its native support for `StreamingResponse` and top-tier performance benchmarks.
- **yt-dlp**: A highly optimized fork of `youtube-dl`. We use it for its aggressive update cycle, ensuring we bypass platform changes and rate-limiting.
- **Uvicorn**: An ultra-fast ASGI implementation that manages the worker processes.
- **Pydantic**: Enforces strict Type Hinting and Data Validation for all incoming request payloads.

#### ⚙️ Internal Logic & Workflows:

- **Thread Pool Execution**: Since `yt-dlp` is primarily a synchronous library, we wrap info extraction and downloading in `loop.run_in_executor(None, ...)` to ensure the main event loop is never blocked.
- **Atomic Temporary Storage**: For every download request, a unique `tempfile.mkdtemp()` is created. This prevents filename collisions and ensures localized cleanup.
- **Smart Formatting Engine**: The backend doesn't just return raw yt-dlp data; it processes metadata and categorizes it into user-friendly Quality Labels (e.g., "Ultra HD", "320kbps") and merges video-only streams with best-audio automatically using `ffmpeg` (where available on the host).

#### 📡 API Definitions:

| Endpoint        | Method | Purpose             | Key Mechanism                                                       |
| :-------------- | :----- | :------------------ | :------------------------------------------------------------------ |
| `/api/info`     | `POST` | Metadata Extraction | Returns title, view counts, and available format IDs.               |
| `/api/download` | `GET`  | Binary Streaming    | Pipes the file from the source to the user via a chunked generator. |
| `/api/health`   | `GET`  | Monitoring          | Simple heartbeat for load balancers.                                |

---

### 2. Modern Frontend (React + Geist)

The UI is a **SPA (Single Page Application)** focused on feedback-driven design.

#### 🌊 Real-Time Progress Engine:

Unlike standard browsers' "hidden" downloads, KwikSave uses a custom **ReadableStream Reader** implementation in `utils.js`.

1. It initiates a `fetch()` request to the backend.
2. It captures the `response.body.getReader()`.
3. It monitors the `content-length` header to calculate a precise **0-100% progress** value as chunks arrive.
4. Chunks are pushed into an array and finally converted to a **Blob** for a localized "Save As" trigger.

#### 🎨 Design System:

- **Geist UI Integration**: A minimalist, high-contrast theme focused on typography and spacing.
- **Theme Engine**: Uses CSS Custom Properties (`--primary`, `--background`) mapped inside an `@theme` block in `index.css`.
- **Glassmorphism**: Backdrop blurs (`backdrop-filter`) and localized shimmers for premium finish.

---

## 🔄 Sequence Diagram: The Download Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Platform (YT/IG)

    User->>Frontend: Pastes Link & Clicks Fetch
    Frontend->>Backend: POST /api/info (URL)
    Backend->>Platform: Extract Metadata (No DL)
    Platform-->>Backend: Metadata (Formats, Title)
    Backend-->>Frontend: Processed Info JSON
    Frontend-->>User: Shows Quality Options

    User->>Frontend: Clicks "Download 1080p"
    Frontend->>Backend: GET /api/download (Fid, URL)
    Backend->>Platform: Download Binary (Atomic Tmp)
    Platform-->>Backend: Binary Stream
    Backend-->>Frontend: StreamingResponse (Chunked)
    loop Progress Tracking
        Frontend-->>User: Precise % Progress Update
    end
    Frontend->>User: Save Blob to Disk (Cleanup Trigger)
    Backend->>Backend: Clear Temp Directory
```

---

## 🛡️ Security & Privacy Deep-Dive

- **Input Sanitization**: Our `validate_url` helper uses a whitelist of `SUPPORTED_DOMAINS` and a strict Regex `[;|` ` $]` to block shell injection attempts.
- **State Management**: The application is entirely **stateless**. No database is required. We don't track what you save, when you save it, or your IP address.
- **Cache Evacuation**: We use an in-memory dictionary for media info with a **5-minute TTL (Time-To-Live)**. This speeds up consecutive resolution requests while ensuring stale data is purged.

---

## 📂 Code Structure Overview

- **`kwiksave_backend.py`**: The "Grand Master" file containing all API routes, yt-dlp configurations, and security logic.
- **`src/utils.js`**: Home to the `fetchWithProgress` logic—the bridge between the browser's networking and our UI progress bars.
- **`src/index.css`**: The core style manifest defining Geist typography and the Shimmer/Spinner animations.
- **`src/components/`**: Focused, atomic React components (MediaCard, DownloadBox) that handle local UI states (Idle vs. Downloading).

---

## ⚡ Quick Deployment

1. **Backend**:
   ```bash
   pip install fastapi uvicorn yt-dlp
   python kwiksave_backend.py
   ```
2. **Frontend**:
   ```bash
   npm install && npm start
   ```
