"use client";

import { useEffect, useRef, useState } from "react";

const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js";

const MOBILE_SRC = "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";
const DESKTOP_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4";

declare global {
  interface Window { Hls: any; }
}

function loadHls(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Hls) { resolve(); return; }
    const existing = document.querySelector(`script[src="${HLS_CDN}"]`);
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const s = document.createElement("script");
    s.src = HLS_CDN;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function VideoHeroBg({ opacity = 0.45 }: { opacity?: number }) {
  const mobileRef = useRef<HTMLVideoElement>(null);
  const desktopRef = useRef<HTMLVideoElement>(null);
  const [mobileReady, setMobileReady] = useState(false);
  const [desktopReady, setDesktopReady] = useState(false);

  // Mobile — HLS stream
  useEffect(() => {
    const video = mobileRef.current;
    if (!video) return;
    let hls: any;

    (async () => {
      try {
        await loadHls();
        const Hls = window.Hls;
        if (Hls.isSupported()) {
          hls = new Hls({ maxBufferLength: 10, backBufferLength: 0, startLevel: -1 });
          hls.loadSource(MOBILE_SRC);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = MOBILE_SRC;
          video.addEventListener("loadedmetadata", () => video.play().catch(() => {}));
        }
        video.addEventListener("playing", () => setMobileReady(true), { once: true });
      } catch { /* silent fail */ }
    })();

    return () => { hls?.destroy(); };
  }, []);

  // Desktop — direct mp4
  useEffect(() => {
    const video = desktopRef.current;
    if (!video) return;
    video.src = DESKTOP_SRC;
    video.play().catch(() => {});
    video.addEventListener("playing", () => setDesktopReady(true), { once: true });
  }, []);

  const sharedVideoClass =
    "absolute inset-0 w-full h-full object-cover pointer-events-none select-none";

  return (
    <>
      {/* Mobile video — shown below lg */}
      <video
        ref={mobileRef}
        autoPlay muted loop playsInline
        aria-hidden="true"
        className={`${sharedVideoClass} block lg:hidden`}
        style={{
          opacity: mobileReady ? opacity : 0,
          transition: "opacity 1.6s ease",
          zIndex: 0,
        }}
      />

      {/* Desktop video — shown at lg+ */}
      <video
        ref={desktopRef}
        autoPlay muted loop playsInline
        aria-hidden="true"
        className={`${sharedVideoClass} hidden lg:block`}
        style={{
          opacity: desktopReady ? opacity : 0,
          transition: "opacity 1.6s ease",
          zIndex: 0,
        }}
      />

      {/* Gradient vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: [
            "linear-gradient(to bottom, rgba(5,7,9,0.82) 0%, rgba(5,7,9,0.2) 32%, transparent 58%)",
            "linear-gradient(to top,   rgba(5,7,9,0.97) 0%, rgba(5,7,9,0.6) 30%, transparent 62%)",
            "linear-gradient(to right, rgba(5,7,9,0.45) 0%, transparent 32%, transparent 68%, rgba(5,7,9,0.45) 100%)",
          ].join(", "),
        }}
      />

      {/* Scanline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
        }}
      />
    </>
  );
}
