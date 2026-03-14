// ── Platform Detection ──────────────────────────────────────────────
export function detectPlatform(url) {
  if (!url) return null;
  const u = url.trim().toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  return null;
}

export function isValidUrl(url) {
  try {
    const u = new URL(url.trim());
    const hasDot = u.hostname.includes('.');
    return ["http:", "https:"].includes(u.protocol) && hasDot;
  } catch {
    return false;
  }
}

// ── Mock Media Data (Legacy) ─────────────────────────────────────────
// (Leaving these for reference or fallback if needed, though we'll use real API now)

// ── Simulate async fetch with progress (Visual only) ──────────────────────────────
export async function simulateFetch(onProgress) {
  const steps = [
    [15, "Connecting to platform…"],
    [35, "Fetching media metadata…"],
    [60, "Extracting available formats…"],
    [80, "Preparing download options…"],
    [100, "Done!"],
  ];
  for (const [pct, label] of steps) {
    await sleep(380 + Math.random() * 280);
    onProgress(pct, label);
  }
  await sleep(250);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── API helper (Real Backend) ─────────────────────────
const API_BASE = "http://localhost:8000";

export async function fetchMediaInfo(url) {
  const res = await fetch(`${API_BASE}/api/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = "An unexpected error occurred.";
    if (typeof err.detail === 'string') {
      msg = err.detail;
    } else if (Array.isArray(err.detail) && err.detail.length > 0) {
      msg = err.detail[0].msg || msg;
    } else if (err.message) {
      msg = err.message;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Download failed: ${response.status}`);
  }

  const total = parseInt(response.headers.get("content-length"), 10);
  const reader = response.body.getReader();
  let loaded = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress && !isNaN(total)) {
      onProgress(Math.round((loaded / total) * 100));
    } else if (onProgress) {
      onProgress(null); // Indeterminate
    }
  }

  const blob = new Blob(chunks, { type: response.headers.get("content-type") });
  return blob;
}

export function saveBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

