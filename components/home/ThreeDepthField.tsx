"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

/** A bounded version of the original particle/wireframe scene. The portrait remains the WebGL fallback. */
export function ThreeDepthField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;
    let cancelled = false;
    let cleanup = () => {};

    async function mount() {
      const THREE = await import("three");
      if (cancelled || !container) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.dataset.renderer = "webgl";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, .1, 50);
      camera.position.z = 7.2;
      const group = new THREE.Group();
      scene.add(group);
      const cobalt = new THREE.LineBasicMaterial({ color: 0x3d6bff, transparent: true, opacity: .65 });
      const neon = new THREE.LineBasicMaterial({ color: 0xb6ff4d, transparent: true, opacity: .65 });
      const sourceGeometries = [new THREE.IcosahedronGeometry(.64, 0), new THREE.OctahedronGeometry(.42)];
      const shapes = sourceGeometries.map((geometry, index) => new THREE.LineSegments(new THREE.EdgesGeometry(geometry), index === 0 ? cobalt : neon));
      sourceGeometries.forEach(geometry => geometry.dispose());
      shapes[0].position.set(1.8, 1.1, -.5);
      shapes[1].position.set(-1.7, -.9, .2);
      shapes.forEach(shape => group.add(shape));

      const ringGeometry = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 81 }, (_, index) => {
          const angle = index / 80 * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * 2.35, Math.sin(angle) * 2.35, 0);
        })
      );
      const ring = new THREE.Line(ringGeometry, cobalt);
      ring.rotation.set(.7, .4, .4);
      group.add(ring);
      const secondRing = new THREE.Line(ringGeometry, neon);
      secondRing.rotation.set(-.9, .65, -.5);
      secondRing.scale.setScalar(.82);
      group.add(secondRing);

      const positions = new Float32Array(130 * 3);
      for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - .5) * 5;
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({ color: 0x7b9bff, size: .022, transparent: true, opacity: .65 });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);

      let frame = 0;
      let visible = true;
      let running = false;
      let elapsed = 0;
      let previous = 0;
      const pointer = { x: 0, y: 0 };
      const host = container.parentElement;
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = container.getBoundingClientRect();
        pointer.x = (event.clientX - rect.left) / rect.width - .5;
        pointer.y = (event.clientY - rect.top) / rect.height - .5;
      };
      const leave = () => { pointer.x = 0; pointer.y = 0; };
      const animate = (time: number) => {
        elapsed += previous ? Math.min(time - previous, 40) / 1000 : 0;
        previous = time;
        group.rotation.y += (pointer.x * .24 - group.rotation.y) * .035;
        group.rotation.x += (pointer.y * .15 - group.rotation.x) * .035;
        shapes[0].rotation.set(elapsed * .13, elapsed * .2, 0);
        shapes[0].position.y = 1.1 + Math.sin(elapsed * .7) * .22;
        shapes[1].rotation.set(0, -elapsed * .22, elapsed * .12);
        shapes[1].position.x = -1.7 + Math.sin(elapsed * .6) * .18;
        ring.rotation.z = .4 + elapsed * .08;
        secondRing.rotation.z = -.5 - elapsed * .1;
        particles.rotation.y = elapsed * .025;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      const sync = () => {
        const shouldRun = visible && !document.hidden;
        if (shouldRun === running) return;
        running = shouldRun;
        cancelAnimationFrame(frame);
        previous = 0;
        if (running) frame = requestAnimationFrame(animate);
      };
      const resize = new ResizeObserver(() => {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
      resize.observe(container);
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      intersection.observe(container);
      const theme = new MutationObserver(() => {
        const styles = getComputedStyle(document.documentElement);
        cobalt.color.set(styles.getPropertyValue("--cobalt").trim());
        neon.color.set(styles.getPropertyValue("--neon").trim());
        particleMaterial.color.set(styles.getPropertyValue("--cobalt-2").trim());
      });
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      const styles = getComputedStyle(document.documentElement);
      cobalt.color.set(styles.getPropertyValue("--cobalt").trim());
      neon.color.set(styles.getPropertyValue("--neon").trim());
      host?.addEventListener("pointermove", move, { passive: true });
      host?.addEventListener("pointerleave", leave);
      document.addEventListener("visibilitychange", sync);
      sync();

      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect(); intersection.disconnect(); theme.disconnect();
        host?.removeEventListener("pointermove", move);
        host?.removeEventListener("pointerleave", leave);
        document.removeEventListener("visibilitychange", sync);
        shapes.forEach(shape => shape.geometry.dispose());
        ringGeometry.dispose(); particleGeometry.dispose();
        cobalt.dispose(); neon.dispose(); particleMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    // A failed optional scene must not take down the portfolio content.
    void mount().catch(() => cleanup());
    return () => { cancelled = true; cleanup(); };
  }, [reducedMotion]);

  return <div ref={containerRef} className="c--three-depth-field" aria-hidden="true" />;
}
