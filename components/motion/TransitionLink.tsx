"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useTransitionNavigate } from "./TransitionProvider";
import { getNavigationTarget } from "./navigation";

export function TransitionLink({ href, onNavigate, ...props }: ComponentProps<typeof Link>) {
  const { navigate } = useTransitionNavigate();
  return <Link {...props} href={href} onNavigate={(event) => {
    let prevented = false;
    onNavigate?.({ preventDefault: () => { prevented = true; event.preventDefault(); } });
    if (prevented) return;
    // Next preserves external, download and modifier-key navigation.
    const target = getNavigationTarget(String(href), window.location.href);
    if (!target) return;
    event.preventDefault();
    navigate(target);
  }} />;
}
