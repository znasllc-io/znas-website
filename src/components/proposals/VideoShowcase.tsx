"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import SectionLabel from "@/components/ui/SectionLabel";
import OwlMark from "@/components/shared/OwlMark";
import { translations } from "@/lib/translations";

/**
 * "Video" showcase — a custom, gated video player with the same theatrical
 * reveal as the Try Now portal. Click the framed play button → a short loading
 * beat ("Loading your new video…") → the diagonal gate splits open → the video
 * autoplays from the start (single click, sound on). Custom controls only (no
 * native browser player): play/pause, a scrubbable timeline, time, mute,
 * fullscreen, and a Replay button at the end. Streamed range-gated via
 * /api/proposals/video?slug=.
 */
type Phase = "idle" | "loading" | "open";

const LOADING_MS = 1500; // shorter than the portal's 4s reveal

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function VideoShowcase({
  number,
  slug,
  label,
  hint,
  lang,
}: {
  number: string;
  slug: string;
  label?: string;
  hint?: string;
  lang: "en" | "es";
}) {
  const t = translations[lang];
  const [phase, setPhase] = useState<Phase>("idle");
  const src = `/api/proposals/video?slug=${encodeURIComponent(slug)}`;

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

  // The site's custom cursor is a fixed element at the top of the DOM, so the
  // player hides the native cursor (`cursor: none`) in its favor. In
  // fullscreen the browser only paints the bezel subtree — the custom cursor
  // lives outside it — so there we must restore the native cursor or the user
  // is left with nothing to point with. Track fullscreen and switch the player
  // surfaces to the native cursor only while it's active.
  const cursorFor = (interactive: boolean) =>
    fullscreen ? (interactive ? "pointer" : "default") : "none";

  // Start playback from the top, with sound. The opening click is the user
  // gesture; if the browser still blocks unmuted autoplay, fall back to muted.
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

  // Drive the loading → gate-open sequence.
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
      // Loading UI fades out, gate parts along the anti-diagonal.
      tl.to(contentRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      tl.to(panelARef.current, { xPercent: 135, yPercent: -135, duration: 0.9, ease: "power3.inOut" }, "<");
      tl.to(panelBRef.current, { xPercent: -135, yPercent: 135, duration: 0.9, ease: "power3.inOut" }, "<");
    }, LOADING_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Keep control state in sync with the media element.
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

  // Track whether the player is the current fullscreen element. Handle the
  // WebKit-prefixed event + property too (Safari), or the state never flips
  // there and the cursor stays hidden.
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
    // Prefer the standard API, fall back to WebKit-prefixed (Safari). Swallow
    // rejections so a blocked request can't surface as an unhandled rejection.
    const run = fsEl
      ? document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.()
      : el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.();
    Promise.resolve(run).catch(() => {});
  };

  // Scrub: pointer down/move on the track seeks the video.
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
    <section id="video" className="section-padding" style={{ backgroundColor: "var(--color-bg-void)" }}>
      <div className="container">
        <SectionLabel number={number} label={t.proposals.viewer.sections.video} />
        <p
          className="text-body"
          style={{ color: "var(--color-text-secondary)", maxWidth: "640px", margin: "1rem 0 2.25rem", lineHeight: 1.7 }}
        >
          {hint || t.proposals.viewer.videoHint}
        </p>

        {/* Portrait bezel */}
        <div
          ref={bezelRef}
          style={{
            position: "relative",
            width: "min(440px, 92vw)",
            aspectRatio: "1080 / 1914",
            margin: "0 auto",
            borderRadius: "14px",
            overflow: "hidden",
            backgroundColor: "var(--color-bg-void)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 40px 90px -50px rgba(0,0,0,0.75)",
            // In fullscreen the bezel fills the screen and the portrait video
            // letterboxes, so most of the surface is bezel background. Give the
            // bezel itself the native cursor (it inherits down to the letterbox
            // area); the video/controls keep their own pointer. Outside
            // fullscreen it stays `none` so the site's custom cursor shows.
            cursor: cursorFor(false),
          }}
        >
          {/* Video (mounts once we leave idle) */}
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
                // contain, not cover: the portrait clip must never be cropped —
                // in landscape fullscreen it letterboxes (side bars) instead of
                // scaling up to fill and cutting off the top/bottom. In the
                // portrait bezel the aspect matches, so it fills edge-to-edge.
                objectFit: "contain",
                display: "block",
                cursor: cursorFor(phase === "open"),
              }}
            />
          )}

          {/* Loading gate */}
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

          {/* Idle — the "sell it" screen */}
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

          {/* Replay overlay */}
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

          {/* Custom controls (open phase) */}
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
              {/* Scrub track */}
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

              {/* Buttons row */}
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
      </div>
    </section>
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
