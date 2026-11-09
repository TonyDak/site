"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { getTypewriterFrame } from "./typewriter";

function TypewriterRun({ text }: { text: string }) {
  const [frame, setFrame] = useState(() => getTypewriterFrame(text, 0));
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    let elapsed = 0;
    let previous = performance.now();
    const resume = () => { previous = performance.now(); };
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) {
        elapsed += now - previous;
        const next = getTypewriterFrame(text, elapsed);
        setFrame(current => current.text === next.text && current.phase === next.phase ? current : next);
      }
      previous = now;
    }, 32);
    document.addEventListener("visibilitychange", resume);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", resume); };
  }, [reducedMotion, text]);

  return <span className="typewriter">
    <span className="typewriter-measure" aria-hidden="true">{text}</span>
    <span className="typewriter-visible" aria-hidden="true" data-phase={frame.phase}>{frame.text}</span>
    <span className="visually-hidden">{text}</span>
  </span>;
}

export function TypewriterText({ text }: { text: string }) {
  return <TypewriterRun key={text} text={text} />;
}
