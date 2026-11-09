"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** Ambient editor grid and syntax minimap; never intercepts reading or navigation. */
export function EditorBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let cobalt = "#3d6bff";
    let neon = "#b6ff4d";
    let muted = "#858d9e";
    let light = false;

    const draw = () => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const glow = (x: number, y: number, radius: number, color: string, opacity: number) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = opacity;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      };
      glow(width * (.78 + Math.sin(elapsed * .08) * .12), height * .16, Math.max(width, height) * .7, cobalt, light ? .13 : .2);
      glow(width * (.18 + Math.cos(elapsed * .06) * .1), height * .82, Math.max(width, height) * .55, neon, light ? .065 : .09);

      ctx.globalAlpha = light ? .03 : .045;
      ctx.strokeStyle = cobalt;
      ctx.lineWidth = .6;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, height); }
      for (let y = 0; y < height; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(width, y + .5); }
      ctx.stroke();

      // Small, ordered syntax bars suggest an IDE minimap without readable text.
      const columns = width > 600 ? [14, width - 118] : [width - 84];
      columns.forEach((left, column) => {
        for (let i = 0; i < 44; i++) {
          const y = (i * 16 + elapsed * (column ? -3 : 3) + height * 2) % (height + 120) - 60;
          const indent = (i % 7 < 4 ? 8 : 0) + (i % 3) * 5;
          const length = 14 + ((i * 17 + column * 13) % 55);
          ctx.globalAlpha = light ? .10 : .13;
          ctx.fillStyle = i % 7 === 0 ? neon : i % 3 === 0 ? cobalt : muted;
          ctx.fillRect(left + indent, y, length, 2);
          if (i % 4 !== 0) {
            ctx.globalAlpha *= .65;
            ctx.fillStyle = cobalt;
            ctx.fillRect(left + indent + length + 5, y, 7 + i % 9, 2);
          }
        }
      });
      // A very faint traveling highlight across the grid.
      const scanY = (elapsed * 15) % (height + 160) - 80;
      const scan = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      scan.addColorStop(0, "transparent");
      scan.addColorStop(.5, cobalt);
      scan.addColorStop(1, "transparent");
      ctx.globalAlpha = light ? .025 : .035;
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 50, width, 100);
      ctx.globalAlpha = 1;
    };

    const colors = () => {
      const styles = getComputedStyle(document.documentElement);
      cobalt = styles.getPropertyValue("--cobalt").trim();
      neon = styles.getPropertyValue("--neon").trim();
      muted = styles.getPropertyValue("--text-3").trim();
      light = document.documentElement.classList.contains("theme-light");
      draw();
    };
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    });
    resize.observe(canvas);
    const theme = new MutationObserver(colors);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    colors();

    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      if (time - previous < 50) return;
      elapsed += previous ? Math.min(time - previous, 100) / 1000 : 0;
      previous = time;
      draw();
    };
    const syncVisibility = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!document.hidden && !reducedMotion) frame = requestAnimationFrame(animate);
    };
    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="editor-backdrop" aria-hidden="true" data-motion={reducedMotion ? "static" : "animated"} />;
}
