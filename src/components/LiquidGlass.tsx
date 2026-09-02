"use client";

import { useEffect, useRef } from "react";
import "@/styles/liquid-glass.css";

/** liquid-glass-js ships as classic scripts that define globals, so they are
 *  loaded from /public at runtime rather than imported. Order matters:
 *  html2canvas -> container.js -> button.js (Button extends Container). */
const SCRIPTS = [
  "/liquid-glass/html2canvas.min.js",
  "/liquid-glass/container.js",
  "/liquid-glass/button.js",
];

type GlassInstance = { element: HTMLElement };

type GlassButtonCtor = new (options: {
  text: string;
  size?: number;
  type?: "rounded" | "circle" | "pill";
  tintOpacity?: number;
  warp?: boolean;
  onClick?: (text: string) => void;
}) => GlassInstance;

/** container.js/button.js declare `class Container` / `class Button` at the top
 *  level of a classic script. Those are lexical globals, NOT properties of
 *  window, so they can only be reached by evaluating the bare identifier. */
function resolveButton(): GlassButtonCtor | null {
  try {
    return new Function(
      "return typeof Button !== 'undefined' ? Button : null",
    )() as GlassButtonCtor | null;
  } catch {
    return null;
  }
}

let loader: Promise<void> | null = null;

function loadGlass(): Promise<void> {
  if (loader) return loader;
  loader = SCRIPTS.reduce(
    (chain, src) =>
      chain.then(
        () =>
          new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const el = document.createElement("script");
            el.src = src;
            el.async = false;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error(`failed to load ${src}`));
            document.head.appendChild(el);
          }),
      ),
    Promise.resolve(),
  );
  return loader;
}

export type LiquidGlassSpec = {
  text: string;
  size?: number;
  type?: "rounded" | "circle" | "pill";
  tintOpacity?: number;
  warp?: boolean;
};

export function LiquidGlassBar({ buttons }: { buttons: LiquidGlassSpec[] }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const mounted: HTMLElement[] = [];

    loadGlass()
      .then(() => {
        const Button = resolveButton();
        if (cancelled || !host.current || !Button) return;
        for (const spec of buttons) {
          const button = new Button({
            text: spec.text,
            size: spec.size ?? 24,
            type: spec.type ?? "pill",
            tintOpacity: spec.tintOpacity ?? 0.2,
            warp: spec.warp ?? false,
            onClick: (text) => console.log(`${text} clicked`),
          });
          host.current.appendChild(button.element);
          mounted.push(button.element);
        }
      })
      .catch((err) => console.error("[liquid-glass]", err));

    return () => {
      cancelled = true;
      for (const el of mounted) el.remove();
    };
  }, [buttons]);

  return <div ref={host} className="actions" />;
}
