"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { FrameStore } from "./frame-store";
import { frames, frameSrc, PORTRAIT_FIT } from "@/lib/frames";

type Props = {
  /** Scroll progress through the pin, 0 → 1. */
  progress: MotionValue<number>;
  /** Fired once frame 1 has been drawn. */
  onReady?: () => void;
  /** Download progress 0 → 1. */
  onLoadProgress?: (p: number) => void;
};

const MOBILE_QUERY = "(max-width: 768px)";
/** Time constant (ms) for easing the drawn position towards the scroll position. */
const SMOOTHING_MS = 70;

/**
 * Draws the image sequence on a <canvas>, scrubbed by `progress`.
 *  - DPR-aware backing store (capped at 2× to bound memory/fill-rate)
 *  - object-fit: cover on landscape; a larger-than-contain portrait fit on phones
 *  - sub-frame interpolation: blends frame N and N+1 by the fractional index
 *  - draws in requestAnimationFrame only while the hero is on screen
 */
export function FrameCanvas({ progress, onReady, onLoadProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const onLoadProgressRef = useRef(onLoadProgress);
  onReadyRef.current = onReady;
  onLoadProgressRef.current = onLoadProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const iw = mobile ? frames.mobileWidth : frames.width;
    const ih = mobile ? frames.mobileHeight : frames.height;
    const last = frames.count - 1;
    const urls = Array.from({ length: frames.count }, (_, i) => frameSrc(i, mobile));
    const store = new FrameStore(urls, {
      frameBytes: iw * ih * 4,
      budgetBytes: (mobile ? 96 : 256) * 1024 * 1024,
    });

    let current = progress.get() * last;
    let lastTarget = current;
    let lastDrawn = -1;
    let direction = 1;
    let needsDraw = true;
    let visible = true;
    let raf = 0;
    let lastTime = performance.now();
    let readyFired = false;

    // ---- sizing ------------------------------------------------------------
    let fit = { dx: 0, dy: 0, dw: 0, dh: 0, portrait: false };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.round(rect.width * dpr));
      const ch = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      if (cw / ch <= 1) {
        const dw = cw * PORTRAIT_FIT.widthRatio;
        const dh = (dw * ih) / iw;
        fit = { dx: (cw - dw) / 2, dy: ch * PORTRAIT_FIT.centerY - dh / 2, dw, dh, portrait: true };
      } else {
        const s = Math.max(cw / iw, ch / ih);
        const dw = iw * s;
        const dh = ih * s;
        fit = { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw, dh, portrait: false };
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      needsDraw = true;
    };

    // ---- drawing -----------------------------------------------------------
    const draw = (position: number) => {
      const i0 = Math.floor(position);
      const frac = position - i0;
      const base = store.nearest(i0);
      if (!base) return false;

      const { dx, dy, dw, dh, portrait } = fit;
      ctx.globalAlpha = 1;
      ctx.fillStyle = frames.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base.frame, dx, dy, dw, dh);

      // Blend towards the next frame for sub-frame smoothness.
      if (frac > 0.02 && base.index === i0) {
        const next = store.get(i0 + 1);
        if (next) {
          ctx.globalAlpha = frac;
          ctx.drawImage(next, dx, dy, dw, dh);
          ctx.globalAlpha = 1;
        }
      }

      // Portrait: feather the top/bottom edges into the background.
      if (portrait) {
        const f = dh * 0.16;
        const top = ctx.createLinearGradient(0, dy, 0, dy + f);
        top.addColorStop(0, frames.background);
        top.addColorStop(1, frames.background + "00");
        ctx.fillStyle = top;
        ctx.fillRect(0, dy - 1, canvas.width, f + 1);
        const bottom = ctx.createLinearGradient(0, dy + dh - f, 0, dy + dh);
        bottom.addColorStop(0, frames.background + "00");
        bottom.addColorStop(1, frames.background);
        ctx.fillStyle = bottom;
        ctx.fillRect(0, dy + dh - f, canvas.width, f + 1);
      }
      return true;
    };

    // ---- loop --------------------------------------------------------------
    const tick = (time: number) => {
      raf = 0;
      const target = progress.get() * last;
      if (target !== lastTarget) {
        direction = target > lastTarget ? 1 : -1;
        lastTarget = target;
      }
      const dt = Math.min(64, time - lastTime);
      lastTime = time;
      current += (target - current) * (1 - Math.exp(-dt / SMOOTHING_MS));
      if (Math.abs(target - current) < 0.002) current = target;

      if (needsDraw || Math.abs(current - lastDrawn) > 0.0005) {
        store.prefetch(current, direction);
        if (draw(current)) {
          lastDrawn = current;
          needsDraw = false;
          if (!readyFired) {
            readyFired = true;
            onReadyRef.current?.();
          }
        }
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) {
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    store.onChange = () => {
      needsDraw = true;
      start();
    };
    store.onProgress = (p) => onLoadProgressRef.current?.(p);

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      start();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    const onVisibility = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribe = progress.on("change", start);

    // Frame 1 immediately; the rest once the page has finished loading so the
    // sequence never competes with first paint.
    let loadListener: (() => void) | null = null;
    store.loadFirst().then(() => {
      needsDraw = true;
      start();
      const rest = () => store.loadRest();
      if (document.readyState === "complete") setTimeout(rest, 0);
      else {
        loadListener = rest;
        window.addEventListener("load", rest, { once: true });
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
      if (loadListener) window.removeEventListener("load", loadListener);
      store.destroy();
    };
  }, [progress]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
