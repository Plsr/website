"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function RevealOnScroll({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    section.classList.add("is-observed");

    const bounds = section.getBoundingClientRect();
    const isInitiallyVisible =
      bounds.top < window.innerHeight && bounds.bottom > 0;

    if (isInitiallyVisible) {
      section.classList.add("is-visible", "is-initially-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        section.classList.add("is-visible");
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
