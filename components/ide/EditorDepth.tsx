"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vHeight;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z = sin(p.x * .55 + uTime * .18) * .42
        + cos(p.y * .7 - uTime * .14) * .25
        + sin((p.x + p.y) * .35 + uTime * .1) * .18;
    vHeight = p.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = `
  uniform vec3 uCobalt;
  uniform vec3 uNeon;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  varying float vHeight;
  void main() {
    vec2 grid = vUv * vec2(42.0, 24.0);
    vec2 footprint = max(fwidth(grid), vec2(.001));
    vec2 distances = abs(fract(grid - .5) - .5) / footprint;
    float line = 1.0 - min(min(distances.x, distances.y), 1.0);
    float edge = smoothstep(0.0, .14, vUv.x) * smoothstep(0.0, .14, 1.0 - vUv.x)
               * smoothstep(0.0, .28, 1.0 - vUv.y);
    float crest = smoothstep(.15, .65, vHeight);
    vec3 color = mix(uCobalt, uNeon, crest * .6);
    float pulse = smoothstep(.94, 1.0, sin(vUv.y * 16.0 - uTime * .2));
    float alpha = edge * (.018 + line * .32 + pulse * .025) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Restored perspective grid-wave; the static editor grid is the fallback. */
export function EditorDepth() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const host = hostRef.current;
    if (!host || reducedMotion) return;
    let cancelled = false;
    let cleanup = () => {};
    async function mount() {
      const THREE = await import("three");
      if (cancelled || !host) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.dataset.renderer = "editor-depth";
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, .1, 80);
      camera.position.set(0, 1.8, 9);
      camera.lookAt(0, -.5, 0);
      const uniforms = {
        uTime: { value: 0 }, uCobalt: { value: new THREE.Color() },
        uNeon: { value: new THREE.Color() }, uOpacity: { value: .6 },
      };
      const geometry = new THREE.PlaneGeometry(16, 9, 80, 48);
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const terrain = new THREE.Mesh(geometry, material);
      terrain.position.set(0, -2.2, -1);
      terrain.rotation.set(-1.05, 0, -.2);
      scene.add(terrain);
      let frame = 0;
      let previous = 0;
      let visible = true;
      const render = () => renderer.render(scene, camera);
      const colors = () => {
        const styles = getComputedStyle(document.documentElement);
        uniforms.uCobalt.value.set(styles.getPropertyValue("--cobalt").trim());
        uniforms.uNeon.value.set(styles.getPropertyValue("--neon").trim());
        uniforms.uOpacity.value = document.documentElement.classList.contains("theme-light") ? .4 : .55;
        render();
      };
      const animate = (time: number) => {
        frame = requestAnimationFrame(animate);
        if (time - previous < 1000 / 30) return;
        uniforms.uTime.value += previous ? Math.min(time - previous, 100) / 1000 : 0;
        previous = time;
        render();
      };
      const sync = () => {
        cancelAnimationFrame(frame);
        previous = 0;
        if (!document.hidden && visible) frame = requestAnimationFrame(animate);
      };
      const resize = new ResizeObserver(() => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        render();
      });
      resize.observe(host);
      const theme = new MutationObserver(colors);
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      intersection.observe(host);
      document.addEventListener("visibilitychange", sync);
      colors();
      sync();
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect(); theme.disconnect(); intersection.disconnect();
        document.removeEventListener("visibilitychange", sync);
        geometry.dispose(); material.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
    }
    void mount().catch(() => cleanup());
    return () => { cancelled = true; cleanup(); };
  }, [reducedMotion]);
  return <div ref={hostRef} className="editor-depth" aria-hidden="true" />;
}
