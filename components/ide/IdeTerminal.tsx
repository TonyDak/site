"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { useLanguage } from "@/components/language/LanguageProvider";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { ui } from "@/lib/content/ui";

export function IdeTerminal() {
  const { locale, content } = useLanguage();
  const t = ui[locale];
  const reducedMotion = useReducedMotion();
  const script = [
    { cmd: "whoami", output: content.site.ownerName },
    { cmd: "cat profile.txt", output: content.site.role },
    { cmd: "ls stack/", output: "Next.js · React Native\nNestJS · ASP.NET Core\nJava · Spring Boot" },
    { cmd: "cat focus.md", output: t.profileNote },
  ];
  const total = script.reduce((length, line) => length + line.cmd.length + 12, 0);
  const [progress, setProgress] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion || progress >= total) return;
    const timer = setTimeout(() => setProgress(value => value + 1), 45);
    return () => clearTimeout(timer);
  }, [reducedMotion, total, progress]);
  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight; }, [progress]);
  let remaining = reducedMotion ? total : progress;

  return (
    <div className="terminal">
      <div className="rail-head terminal-head">
        <span>{t.terminal}<span className="terminal-demo"> / {t.preview}</span></span>
        <button type="button" className="icon-btn" onClick={() => setProgress(0)} aria-label={t.replay} title={t.replay}><Icon name="replay" size={13} /></button>
      </div>
      <div ref={body} className="terminal-body" aria-label={t.preview}>
        {script.map((line, index) => {
          const length = remaining;
          remaining -= line.cmd.length + 12;
          if (length < 0) return null;
          const completed = length > line.cmd.length;
          return <div className="terminal-entry" key={index}>
            <div><span className="t-prompt">❯ </span><span className="t-cmd">{line.cmd.slice(0, Math.min(line.cmd.length, length))}</span>{!completed && <span className="t-cursor" />}</div>
            {completed && <div className={index === 0 ? "t-ok" : "t-dim"}>{line.output}</div>}
          </div>;
        })}
      </div>
    </div>
  );
}
