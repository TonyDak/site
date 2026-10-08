"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface HeroDepthCardProps {
  ownerName: string;
  role: string;
}

export function HeroDepthCard({ ownerName, role }: HeroDepthCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max rotation in degrees
    const maxRotate = 14;
    const rotateX = ((y - centerY) / centerY) * -maxRotate;
    const rotateY = ((x - centerX) / centerX) * maxRotate;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform({
      rotateX,
      rotateY,
      glareX,
      glareY,
      glareOpacity: 0.65,
    });
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    });
  }, []);

  return (
    <div className="c--hero-depth-stage">
      <div
        ref={cardRef}
        className={`c--hero-depth-card ${isHovered ? "is-hovered" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `perspective(1100px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        }}
      >
        {/* Layer 0: Background 3D Ambient Glow */}
        <div className="c--depth-layer-glow" aria-hidden="true" />

        {/* Layer 1: Image & Glass Canvas (Z: 25px) */}
        <div className="c--depth-layer-canvas">
          <div className="c--depth-img-frame">
            <Image
              src="/avatar-lowpoly-v2.jpg"
              alt={`${ownerName} — ${role}`}
              width={420}
              height={420}
              className="c--depth-img"
              priority
            />
            {/* Dynamic Glare / Specular Sheen */}
            <div
              className="c--depth-glare"
              style={{
                background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 35%, transparent 70%)`,
                opacity: transform.glareOpacity,
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Layer 2: Floating 3D Depth Elements (Z: 50px - 75px) */}
        <div className="c--depth-layer-foreground" aria-hidden="true">
          {/* Index Tag */}
          <div className="c--depth-index-badge">
            <span className="c--depth-index-dot" />
            <span>01</span>
          </div>

          {/* Floating Tech Chip 1 - Web & Mobile */}
          <div className="c--depth-chip c--depth-chip-top">
            <span className="c--depth-chip-icon">✦</span>
            <span className="c--depth-chip-text">Next.js & React Native</span>
          </div>

          {/* Floating Tech Chip 2 - Backend */}
          <div className="c--depth-chip c--depth-chip-bottom-left">
            <span className="c--depth-chip-icon">⚡</span>
            <span className="c--depth-chip-text">NestJS · Spring Boot</span>
          </div>

          {/* Floating Status Badge */}
          <div className="c--depth-status-badge">
            <span className="c--depth-status-pulse" />
            <span>Available for projects</span>
          </div>

          {/* 3D Tech Crosshairs */}
          <div className="c--depth-crosshair c--depth-crosshair-tl">+</div>
          <div className="c--depth-crosshair c--depth-crosshair-br">+</div>
        </div>
      </div>
    </div>
  );
}
