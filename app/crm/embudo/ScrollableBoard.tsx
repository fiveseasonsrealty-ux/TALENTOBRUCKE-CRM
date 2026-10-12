"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ScrollableBoard.module.css";

export default function ScrollableBoard({ children }: { children: ReactNode }) {
  const board = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState({ visible: false, left: 0, right: 0, top: 0, previous: false, next: false });

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    let frame = 0;
    function measure() {
      frame = 0;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const maximum = element.scrollWidth - element.clientWidth;
      setControls({
        visible: maximum > 1 && visibleBottom - visibleTop >= 64,
        left: Math.max(8, rect.left - 46),
        right: Math.max(8, window.innerWidth - rect.right - 46),
        top: (visibleTop + visibleBottom) / 2,
        previous: element.scrollLeft > 1,
        next: element.scrollLeft < maximum - 1,
      });
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    measure();
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    return () => {
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  function move(direction: number) {
    const element = board.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.min(296, element.clientWidth * 0.85),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return <div className={styles.wrapper}>
    <div id="candidate-pipeline" ref={board} className={styles.board} tabIndex={0}
      role="region" aria-label="Etapas del embudo de candidatos">
      {children}
    </div>
    {controls.visible && <>
      <button type="button" className={styles.arrow} aria-label="Desplazar embudo a la izquierda"
        aria-controls="candidate-pipeline" title="Desplazar a la izquierda" disabled={!controls.previous}
        style={{ left: controls.left, top: controls.top }} onClick={() => move(-1)}>
        <span aria-hidden="true">❮</span>
      </button>
      <button type="button" className={styles.arrow} aria-label="Desplazar embudo a la derecha"
        aria-controls="candidate-pipeline" title="Desplazar a la derecha" disabled={!controls.next}
        style={{ right: controls.right, top: controls.top }} onClick={() => move(1)}>
        <span aria-hidden="true">❯</span>
      </button>
    </>}
  </div>;
}
