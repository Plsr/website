"use client";

import { useLayoutEffect, useRef } from "react";

const STORAGE_KEY = "headline-typed";

export function TypewriterHeadline({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;

    if (!el) return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        el.classList.add("typewriter-done");
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage unavailable — play the animation as before
    }
  }, []);

  return (
    <span ref={ref} className="headline-typewriter" aria-hidden="true">
      <span>{text}</span>
    </span>
  );
}
