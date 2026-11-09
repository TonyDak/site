"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const vertexShader = `
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  varying vec3 vView;
  void main() {
    vUv = uv;
    float t = uv.x * 6.28318;
    float twist = t * .68 + uTime * .07 + uPhase;
    float width = (uv.y - .5) * 1.7;
    vec3 p;
    p.x = (uv.x - .5) * 17.0;
    p.y = sin(t * .85 + uTime * .09 + uPhase) * .85 + width * cos(twist);
    p.z = cos(t * .65 - uTime * .07 + uPhase) * .75 + width * sin(twist) * 1.6;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vView = view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;
const fragmentShader = `
  uniform vec3 uCobalt;
  uniform vec3 uNeon;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uAccent;
  varying vec2 vUv;
  varying vec3 vView;
  void main() {
    vec3 normal = normalize(cross(dFdx(vView), dFdy(vView)));
    if (!gl_FrontFacing) normal = -normal;
    vec3 viewDir = normalize(-vView);
    vec3 light = normalize(vec3(-.4, .8, 1.0));
    float diffuse = .4 + .6 * abs(dot(normal, light));
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.4);
    float specular = pow(max(dot(reflect(-light, normal), viewDir), 0.0), 26.0);
    float rim = exp(-min(vUv.y, 1.0 - vUv.y) * 100.0);
    float shift = clamp(uAccent + sin(vUv.x * 4.0 + uTime * .06) * .15, 0.0, 1.0);
    vec3 tint = mix(uCobalt, uNeon, shift);
    vec3 color = mix(tint * (.8 + diffuse * .4), vec3(1.0), specular * .3);
    color = mix(color, tint * 1.3, rim * .6);
    float edge = smoothstep(0.0, .1, vUv.x) * smoothstep(0.0, .1, 1.0 - vUv.x)
               * smoothstep(0.0, .008, vUv.y) * smoothstep(0.0, .008, 1.0 - vUv.y);
    float alpha = edge * (.10 + fresnel * .42 + specular * .14 + rim * .62) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Lit, folded ribbons behind the editor. The 2D backdrop is the fallback. */
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
        uPhase: { value: 0 }, uAccent: { value: 0 },
      };
      const geometry = new THREE.PlaneGeometry(1, 1, 140, 24);
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const accentMaterial = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: { ...uniforms, uPhase: { value: 2.5 }, uAccent: { value: 1 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const ribbon = new THREE.Mesh(geometry, material);
      ribbon.position.set(0, -1.6, -.5);
      ribbon.rotation.z = -.12;
      const accentRibbon = new THREE.Mesh(geometry, accentMaterial);
      accentRibbon.position.set(0, -2.6, -1.6);
      accentRibbon.rotation.z = .14;
      accentRibbon.scale.set(1, .65, .8);
      scene.add(ribbon, accentRibbon);
      let frame = 0;
      let previous = 0;
      let visible = true;
      const pointer = { x: 0, y: 0 };
      const pointerHost = host.parentElement;
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = host.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / rect.width - .5;
        pointer.y = (event.clientY - rect.top) / rect.height - .5;
      };
      const leave = () => { pointer.x = 0; pointer.y = 0; };
      const render = () => renderer.render(scene, camera);
      const colors = () => {
        // Ambient materials keep the vivid brand pigments; light-theme text tokens
        // are intentionally darker and would make translucent glass look gray.
        uniforms.uCobalt.value.set("#3d6bff");
        uniforms.uNeon.value.set("#b6ff4d");
        uniforms.uOpacity.value = document.documentElement.classList.contains("theme-light") ? .9 : 1.15;
        render();
      };
      const animate = (time: number) => {
        frame = requestAnimationFrame(animate);
        if (time - previous < 50) return;
        uniforms.uTime.value += previous ? Math.min(time - previous, 100) / 1000 : 0;
        previous = time;
        camera.position.x += (pointer.x * .3 - camera.position.x) * .035;
        camera.position.y += (1.8 - pointer.y * .2 - camera.position.y) * .035;
        camera.lookAt(0, -.5, 0);
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
      pointerHost?.addEventListener("pointermove", move, { passive: true });
      pointerHost?.addEventListener("pointerleave", leave);
      colors();
      sync();
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect(); theme.disconnect(); intersection.disconnect();
        document.removeEventListener("visibilitychange", sync);
        pointerHost?.removeEventListener("pointermove", move);
        pointerHost?.removeEventListener("pointerleave", leave);
        geometry.dispose(); material.dispose(); accentMaterial.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
    }
    void mount().catch(() => cleanup());
    return () => { cancelled = true; cleanup(); };
  }, [reducedMotion]);
  return <div ref={hostRef} className="editor-depth" aria-hidden="true" />;
}
