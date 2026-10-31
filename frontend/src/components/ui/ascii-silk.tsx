import { useEffect, useRef } from "react";
import { createAsciiSilkRenderer } from "./ascii-silk-renderer";

export { asciiSilkRecipe, createAsciiSilkRenderer, silkEdge, silkLuminance, silkOverlay } from "./ascii-silk-renderer";
export type { SilkAnimation, SilkMode, SilkRecipe } from "./ascii-silk-renderer";

export default function AsciiSilk({ paused = false, className }: { paused?: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createAsciiSilkRenderer(canvas);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, lastFrame = 0, drawnAt = 0, sized = false, visible = false;

    const active = () => !paused && !reducedMotion.matches && !document.hidden && visible;
    const tick = (now: number) => {
      frame = 0;
      if (!active() || !sized) return;
      if (lastFrame) elapsedRef.current += Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      if (now - drawnAt >= 1000 / 15) {
        renderer.render(elapsedRef.current);
        drawnAt = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; lastFrame = 0;
      if (sized && visible && !document.hidden) renderer.render(elapsedRef.current);
      if (sized && active()) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) { sized = false; sync(); return; }
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1200000 / (rect.width * rect.height)));
      renderer.resize(rect.width * scale, rect.height * scale, scale);
      sized = true;
      sync();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersection.observe(canvas);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();
    return () => {
      observer.disconnect();
      intersection.disconnect();
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [paused]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }} />;
}
