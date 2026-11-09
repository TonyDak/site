"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Icon } from "@/components/ide/icons";

export function HeroDepthCard({ ownerName, role }: { ownerName: string; role: string }) {
  const card = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!card.current || reducedMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.current.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-2px)`;
  };
  return (
    <div className="c--hero-depth-stage" onPointerMove={move} onPointerLeave={() => { if (card.current) card.current.style.transform = ""; }}>
      <div ref={card} className="c--hero-depth-card">
        <div className="portrait-file"><Icon name="readme" size={13} /><span>profile.jpg</span></div>
        <div className="depth-portrait">
          <Image src="/avatar-lowpoly-v2.jpg" alt={`${ownerName} — ${role}`} width={520} height={520} sizes="(max-width: 600px) 240px, 260px" priority />
        </div>
      </div>
    </div>
  );
}
