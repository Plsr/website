"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

const STORAGE_KEY = "featured-writing-revealed";

export function RevealOnScroll({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    // Take over from the first-paint hiding applied by the inline script in
    // the root layout before hydration.
    const releaseFirstPaintHold = () =>
      document.documentElement.classList.remove("reveal-pending");

    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        releaseFirstPaintHold();
        return;
      }
    } catch {
      // sessionStorage unavailable — play the animation as before
    }

    const markRevealed = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    };

    section.classList.add("is-observed");
    releaseFirstPaintHold();

    const bounds = section.getBoundingClientRect();
    const isInitiallyVisible =
      bounds.top < window.innerHeight && bounds.bottom > 0;

    if (isInitiallyVisible) {
      section.classList.add("is-visible", "is-initially-visible");
      markRevealed();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        section.classList.add("is-visible");
        markRevealed();
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="featured-writing">
      {children}
    </section>
  );
}
