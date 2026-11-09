"use client";

import { useEffect, useRef } from "react";

/** Static editor grid/minimap with CSS-composited ambient light. */
export function EditorBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const styles = getComputedStyle(document.documentElement);
      const cobalt = styles.getPropertyValue("--cobalt").trim();
      const neon = styles.getPropertyValue("--neon").trim();
      const muted = styles.getPropertyValue("--text-3").trim();
      const light = document.documentElement.classList.contains("theme-light");
      ctx.strokeStyle = cobalt;
      ctx.globalAlpha = light ? .055 : .07;
      ctx.lineWidth = .6;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, height); }
      for (let y = 0; y < height; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(width, y + .5); }
      ctx.stroke();
      const columns = width > 600 ? [14, width - 118] : [width - 84];
      columns.forEach((left, column) => {
        for (let i = 0; i < 44; i++) {
          const y = i * 16;
          const indent = (i % 7 < 4 ? 8 : 0) + i % 3 * 5;
          const length = 14 + (i * 17 + column * 13) % 55;
          ctx.globalAlpha = light ? .10 : .13;
          ctx.fillStyle = i % 7 === 0 ? neon : i % 3 === 0 ? cobalt : muted;
          ctx.fillRect(left + indent, y, length, 2);
        }
      });
      ctx.globalAlpha = 1;
    };
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    draw();
    return () => { resize.disconnect(); theme.disconnect(); };
  }, []);
  return <><div className="editor-ambience" aria-hidden="true" /><canvas ref={canvasRef} className="editor-backdrop" aria-hidden="true" /></>;
}
