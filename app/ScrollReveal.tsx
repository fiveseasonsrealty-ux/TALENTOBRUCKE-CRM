"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const rect = entry.boundingClientRect;
          const triggerPoint = window.innerHeight * 0.72;

          if (entry.isIntersecting && rect.top <= triggerPoint) {
            element.classList.add("reveal-visible");
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: [0, 0.1, 0.25, 0.5],
        rootMargin: "0px 0px -28% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}
