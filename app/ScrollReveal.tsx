
"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal")
    );

    let userHasScrolled = false;

    const revealElements = () => {
      if (!userHasScrolled) return;

      const triggerPoint = window.innerHeight * 0.82;

      elements.forEach((element) => {
        if (element.classList.contains("reveal-visible")) return;

        const rect = element.getBoundingClientRect();

        if (rect.top < triggerPoint && rect.bottom > 0) {
          element.classList.add("reveal-visible");
        }
      });
    };

    const handleScroll = () => {
      userHasScrolled = true;
      revealElements();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", revealElements);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", revealElements);
    };
  }, []);

  return null;
}
