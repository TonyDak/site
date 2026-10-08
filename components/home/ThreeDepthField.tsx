"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeDepthField() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let isDark = document.documentElement.classList.contains("theme-dark");

    // Colors based on theme
    const getColors = (dark: boolean) => ({
      fog: dark ? 0x100d23 : 0xfcfaf5,
      particles: dark ? 0x9d97ff : 0x5851db,
      accentParticles: dark ? 0x38bdf8 : 0x7c3aed,
      wireframe: dark ? 0x6366f1 : 0x818cf8,
      wireframeAccent: dark ? 0xc084fc : 0x6366f1,
      lines: dark ? 0x4f46e5 : 0xa5b4fc,
    });

    let currentColors = getColors(isDark);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(currentColors.fog, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0); // Transparent canvas
    container.appendChild(renderer.domElement);

    // 1. Particle Cloud with 3D Depth
    const particleCount = window.innerWidth < 768 ? 160 : 360;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(currentColors.particles);
    const color2 = new THREE.Color(currentColors.accentParticles);

    for (let i = 0; i < particleCount; i++) {
      // Spread across wide 3D space
      positions[i * 3] = (Math.random() - 0.5) * 1600;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

      scales[i] = Math.random() * 2.5 + 1.2;

      // Blend between two brand accent colors
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom point texture generator (soft glow circle)
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.75)");
        gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const pointMaterial = new THREE.PointsMaterial({
      size: 7.5,
      map: createCircleTexture(),
      transparent: true,
      opacity: isDark ? 0.75 : 0.55,
      vertexColors: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, pointMaterial);
    scene.add(particles);

    // 2. Floating 3D Geometric Objects (Wireframe low-poly nodes)
    const geoGroup = new THREE.Group();
    scene.add(geoGroup);

    // Shape 1: Icosahedron (Clean Architecture symbol)
    const icoGeo = new THREE.IcosahedronGeometry(68, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: currentColors.wireframe,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.38 : 0.28,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(480, 140, -180);
    geoGroup.add(icoMesh);

    // Shape 2: Octahedron (API / Services node)
    const octGeo = new THREE.OctahedronGeometry(45, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: currentColors.wireframeAccent,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.32 : 0.22,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(-520, -120, -120);
    geoGroup.add(octMesh);

    // Shape 3: Torus (Event Loop / Continuous Delivery node)
    const torusGeo = new THREE.TorusGeometry(52, 14, 8, 24);
    const torusMat = new THREE.MeshBasicMaterial({
      color: currentColors.wireframe,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.25 : 0.18,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(380, -220, -220);
    geoGroup.add(torusMesh);

    // Shape 4: Small Dodecahedron floating near top left
    const dodGeo = new THREE.DodecahedronGeometry(32, 0);
    const dodMat = new THREE.MeshBasicMaterial({
      color: currentColors.wireframeAccent,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.22,
    });
    const dodMesh = new THREE.Mesh(dodGeo, dodMat);
    dodMesh.position.set(-360, 220, -160);
    geoGroup.add(dodMesh);

    // 3. Dynamic Interactive Lines connecting nearby particles
    const maxLineConnections = 70;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3)
    );
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: currentColors.lines,
      transparent: true,
      opacity: isDark ? 0.3 : 0.18,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Mouse & Parallax Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      mouseX = (clientX - windowHalfX) * 0.45;
      mouseY = (clientY - windowHalfY) * 0.45;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    // Window Resize Handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Observe Theme Changes (light <-> dark)
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("theme-dark");
      if (dark !== isDark) {
        isDark = dark;
        currentColors = getColors(isDark);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.setHex(currentColors.fog);
        }
        pointMaterial.opacity = isDark ? 0.75 : 0.55;
        pointMaterial.blending = isDark
          ? THREE.AdditiveBlending
          : THREE.NormalBlending;
        icoMat.color.setHex(currentColors.wireframe);
        icoMat.opacity = isDark ? 0.38 : 0.28;
        octMat.color.setHex(currentColors.wireframeAccent);
        octMat.opacity = isDark ? 0.32 : 0.22;
        torusMat.color.setHex(currentColors.wireframe);
        torusMat.opacity = isDark ? 0.25 : 0.18;
        dodMat.color.setHex(currentColors.wireframeAccent);
        dodMat.opacity = isDark ? 0.35 : 0.22;
        lineMaterial.color.setHex(currentColors.lines);
        lineMaterial.opacity = isDark ? 0.3 : 0.18;
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Parallax Lerp
      targetX += (mouseX - targetX) * 0.035;
      targetY += (mouseY - targetY) * 0.035;

      camera.position.x = targetX * 0.8;
      camera.position.y = -targetY * 0.8 + 20;
      camera.lookAt(0, 0, 0);

      // Rotate Particles
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

      // Animate Geometry Nodes (Rotation + Floating)
      icoMesh.rotation.x = elapsedTime * 0.25;
      icoMesh.rotation.y = elapsedTime * 0.35;
      icoMesh.position.y = 140 + Math.sin(elapsedTime * 0.8) * 15;

      octMesh.rotation.y = -elapsedTime * 0.3;
      octMesh.rotation.z = elapsedTime * 0.2;
      octMesh.position.y = -120 + Math.cos(elapsedTime * 0.7) * 12;

      torusMesh.rotation.x = elapsedTime * 0.4;
      torusMesh.rotation.y = elapsedTime * 0.2;
      torusMesh.position.y = -220 + Math.sin(elapsedTime * 0.9) * 10;

      dodMesh.rotation.x = -elapsedTime * 0.3;
      dodMesh.rotation.y = -elapsedTime * 0.25;
      dodMesh.position.y = 220 + Math.cos(elapsedTime * 0.6) * 14;

      // Update Constellation dynamic connecting lines
      const posArray = geometry.attributes.position.array as Float32Array;
      let lineVertexIndex = 0;
      let lineIndex = 0;

      const connectionDist = 130;

      for (let i = 0; i < 45 && lineIndex < maxLineConnections; i++) {
        const x1 = posArray[i * 3];
        const y1 = posArray[i * 3 + 1];
        const z1 = posArray[i * 3 + 2];

        for (let j = i + 1; j < 45 && lineIndex < maxLineConnections; j++) {
          const x2 = posArray[j * 3];
          const y2 = posArray[j * 3 + 1];
          const z2 = posArray[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDist) {
            linePositions[lineVertexIndex] = x1;
            linePositions[lineVertexIndex + 1] = y1;
            linePositions[lineVertexIndex + 2] = z1;
            linePositions[lineVertexIndex + 3] = x2;
            linePositions[lineVertexIndex + 4] = y2;
            linePositions[lineVertexIndex + 5] = z2;

            lineVertexIndex += 6;
            lineIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      lineGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    // Handle Page Visibility for Performance
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        clock.start();
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      pointMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      dodGeo.dispose();
      dodMat.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="c--three-depth-field"
      aria-hidden="true"
    />
  );
}
