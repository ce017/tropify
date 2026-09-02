"use client";

import { useEffect, useRef, useState } from "react";
import { Cards } from "@/components/Cards";

/**
 * Pins the gallery: the page scrolls until the carousel fills the screen, holds
 * it there while your scrolling spins it through a full turn, then releases and
 * carries on down the page.
 *
 * A sticky child inside a tall wrapper does the pinning; the wrapper's scroll
 * progress becomes the carousel's rotation.
 */
const TURNS = 3; // extra viewports of scroll spent inside the gallery

export function CardsSection() {
  const wrap = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      progress.current =
        travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    };

    // mounting the canvas while it is far off-screen left it rendering black,
    // so it comes in as the section approaches
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "25% 0px" },
    );
    io.observe(el);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={wrap}
      className="pin"
      style={{ height: `${(TURNS + 1) * 100}dvh` }}
      data-html2canvas-ignore
    >
      <div className="pin__sticky">
        {visible ? <Cards progress={progress} /> : null}
      </div>
    </section>
  );
}
