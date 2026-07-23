"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import OwlMark from "@/components/shared/OwlMark";
import { translations } from "@/lib/translations";

/**
 * Portrait, gated video player bezel — the theatrical reveal (framed play
 * button → short loading beat → diagonal gate splits → autoplay with sound)
 * plus custom controls (play/pause, scrub, time, mute, fullscreen, replay).
 *
 * Extracted from VideoShowcase so it can be reused per-stage in ProductShowcase.
 * It renders ONLY the bezel — no <section>/SectionLabel/hint — and takes the
 * gated `src` (already including any ?video=<id>) so the caller controls which
 * clip plays. Streaming/range logic lives in /api/proposals/video.
 */
type Phase = "idle" | "loading" | "open";

const LOADING_MS = 1500;

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function VideoPlayer({
  src,
  label,
  lang,
  maxWidth = "min(440px, 92vw)",
}: {
  src: string;
  label?: string;
  lang: "en" | "es";
  // Bezel width. Default suits a standalone section; the staged showcase passes
  // a narrower value so the portrait clip fits a two-column stage row.
  maxWidth?: string;
}) {
  const t = translations[lang];
  const [phase, setPhase] = useState<Phase>("idle");

  const videoRef = useRef<HTMLVideoElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const panelARef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const cursorFor = (interactive: boolean) =>
    fullscreen ? (interactive ? "pointer" : "default") : "none";

  const startPlayback = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
    } catch {
      /* metadata not ready yet — plays from 0 anyway */
    }
    v.muted = false;
    setMuted(false);
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
  };

  useEffect(() => {
    if (phase !== "loading") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const id = setTimeout(() => {
        setPhase("open");
        startPlayback();
      }, 400);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setPhase("open");
          startPlayback();
        },
      });
      tl.to(contentRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      tl.to(panelARef.current, { xPercent: 135, yPercent: -135, duration: 0.9, ease: "power3.inOut" }, "<");
      tl.to(panelBRef.current, { xPercent: -135, yPercent: 135, duration: 0.9, ease: "power3.inOut" }, "<");
    }, LOADING_MS);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!scrubbing) setCurrent(v.currentTime);
    };
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
    };
    const onVol = () => setMuted(v.muted);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("volumechange", onVol);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("volumechange", onVol);
    };
  }, [phase, scrubbing]);

  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element })
          .webkitFullscreenElement ||
        null;
      setFullscreen(fsEl === bezelRef.current);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setEnded(false);
    v.play().catch(() => {});
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const toggleFullscreen = () => {
    const el = bezelRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null;
    if (!el) return;
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const fsEl = document.fullscreenElement || doc.webkitFullscreenElement;
    const run = fsEl
      ? document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.()
      : el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.();
    Promise.resolve(run).catch(() => {});
  };

  const trackRef = useRef<HTMLDivElement>(null);
  const seekToClientX = (clientX: number) => {
    const track = trackRef.current;
    const v = videoRef.current;
    if (!track || !v || !duration) return;
    const rect = track.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const time = frac * duration;
    setCurrent(time);
    v.currentTime = time;
  };
  const onTrackPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setScrubbing(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    seekToClientX(e.clientX);
  };
  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    seekToClientX(e.clientX);
  };
  const onTrackPointerUp = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setScrubbing(false);
  };

  const progress = duration ? (current / duration) * 100 : 0;

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "var(--color-bg-void)",
    zIndex: 3,
    willChange: "transform",
  };

  return (
    <div
      ref={bezelRef}
      style={{
        position: "relative",
        width: maxWidth,
        aspectRatio: "1080 / 1914",
        margin: "0 auto",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-void)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 40px 90px -50px rgba(0,0,0,0.75)",
        cursor: cursorFor(false),
      }}
    >
      {phase !== "idle" && (
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="auto"
          onClick={phase === "open" ? togglePlay : undefined}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            cursor: cursorFor(phase === "open"),
          }}
        />
      )}

      {phase === "loading" && (
        <>
          <div ref={panelARef} style={{ ...panelStyle, clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
          <div ref={panelBRef} style={{ ...panelStyle, clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
          <div
            ref={contentRef}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <OwlMark height={72} />
            <span
              style={{
                position: "absolute",
                bottom: "1.6rem",
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                color: "var(--color-text-secondary)",
              }}
            >
              {t.proposals.viewer.videoLoading}
            </span>
          </div>
        </>
      )}

      {phase === "idle" && (
        <button
          onClick={() => setPhase("loading")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            background: "transparent",
            border: 0,
            cursor: "none",
            color: "var(--color-text-primary)",
            zIndex: 5,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
              fontWeight: 500,
              color: "var(--color-bg-void)",
              backgroundColor: "var(--color-accent)",
              border: "2px solid var(--color-accent)",
              borderRadius: "2px",
              padding: "0.9rem 2.25rem",
            }}
          >
            ▶ {t.proposals.viewer.videoCta}
          </span>
          {label && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                padding: "0 1rem",
                textAlign: "center",
              }}
            >
              {label}
            </span>
          )}
        </button>
      )}

      {phase === "open" && ended && (
        <button
          onClick={replay}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            background: "color-mix(in srgb, var(--color-bg-void) 55%, transparent)",
            border: 0,
            cursor: cursorFor(true),
            zIndex: 4,
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--color-bg-void)",
              backgroundColor: "var(--color-accent)",
              borderRadius: "9999px",
              padding: "0.7rem 1.6rem",
            }}
          >
            ↺ {t.proposals.viewer.videoReplay}
          </span>
        </button>
      )}

      {phase === "open" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 4,
            padding: "2.5rem 0.85rem 0.7rem",
            background: "linear-gradient(to top, rgba(0,0,0,0.72), transparent)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            ref={trackRef}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            style={{
              position: "relative",
              height: "14px",
              display: "flex",
              alignItems: "center",
              cursor: cursorFor(true),
              touchAction: "none",
            }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.28)", borderRadius: "2px" }} />
            <div style={{ position: "absolute", left: 0, width: `${progress}%`, height: "3px", background: "var(--color-accent)", borderRadius: "2px" }} />
            <div
              style={{
                position: "absolute",
                left: `${progress}%`,
                width: "12px",
                height: "12px",
                marginLeft: "-6px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                boxShadow: "0 0 0 3px rgba(0,0,0,0.35)",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} style={{ ...ctrlBtn, cursor: cursorFor(true) }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.04em",
                color: "#fff",
              }}
            >
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <span style={{ flex: 1 }} />
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} style={{ ...ctrlBtn, cursor: cursorFor(true) }}>
              {muted ? "🔇" : "🔊"}
            </button>
            <button onClick={toggleFullscreen} aria-label="Fullscreen" style={{ ...ctrlBtn, cursor: cursorFor(true) }}>
              ⤢
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  background: "transparent",
  border: 0,
  color: "#fff",
  fontSize: "0.85rem",
  lineHeight: 1,
  padding: "0.25rem 0.35rem",
};
