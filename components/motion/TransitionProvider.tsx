"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getNavigationTarget } from "./navigation";

type Phase = "idle" | "leaving" | "entering";
const TransitionContext = createContext<{ navigate: (href: string) => void; phase: Phase } | null>(null);

/** The original tiled page transition, scoped to routes rather than section jumps. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [started, setStarted] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    busy.current = false;
    setStarted(false);
    setPhase("idle");
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const navigate = useCallback((href: string) => {
    const target = getNavigationTarget(href, window.location.href);
    if (!target) { router.push(href); return; }
    if (busy.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(target);
      return;
    }
    busy.current = true;
    setPhase("leaving");
    timers.current.push(setTimeout(() => {
      startTransition(() => router.push(target));
      setStarted(true);
    }, 240));
    // Interrupted or failed navigation must never leave a blocking overlay.
    timers.current.push(setTimeout(reset, 2200));
  }, [reset, router]);

  useEffect(() => {
    if (!started || pending) return;
    const enter = setTimeout(() => setPhase("entering"), 0);
    const settle = setTimeout(reset, 420);
    return () => { clearTimeout(enter); clearTimeout(settle); };
  }, [pending, reset, started]);

  const value = useMemo(() => ({ navigate, phase }), [navigate, phase]);
  return (
    <TransitionContext.Provider value={value}>
      <div className={`c--route-transition ${phase === "idle" ? "" : `is-${phase}`}`} aria-hidden="true" data-phase={phase}>
        <div className="c--route-transition__grid">
          {Array.from({ length: 40 }, (_, index) => (
            <span key={index} className="c--route-transition__tile" style={{ "--tile-delay": `${((index % 8) + Math.floor(index / 8)) * 12}ms` } as CSSProperties} />
          ))}
        </div>
      </div>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionNavigate() {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransitionNavigate must be used inside TransitionProvider");
  return context;
}
