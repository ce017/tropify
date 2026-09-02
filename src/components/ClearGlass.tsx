"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { buildLensMap } from "@/lib/lensMap";

export type ClearGlassOptions = {
  /** how far the backdrop is dragged at the rim, in px */
  strength?: number;
  /** width of the refracting band, in px */
  edge?: number;
  /** corner radius used to build the lens; defaults to a full capsule */
  radius?: number;
};

/**
 * Clear glass, the .glassEffect(.clear) look: the page shows through almost
 * unblurred, bends around the rim, and carries a bright specular edge.
 *
 * backdrop-filter is the only web primitive that samples what is actually
 * painted behind an element — iframes and WebGL canvases included — so this
 * genuinely takes the colour of whatever it sits over, live.
 */
export function useClearGlass<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { strength = 26, edge = 18, radius }: ClearGlassOptions = {},
) {
  const rawId = useId();
  const id = `lens${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [map, setMap] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (!w || !h) return;
      setBox({ w, h });
      setMap(buildLensMap(w, h, radius ?? h / 2, edge));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, edge, radius]);

  const filter = map ? `url(#${id}) saturate(1.7) brightness(1.06)` : undefined;

  /** the SVG filter this element's backdrop is piped through */
  const defs = map ? (
    <svg className="clearglass__defs" aria-hidden width="0" height="0">
      <filter
        id={id}
        filterUnits="userSpaceOnUse"
        x="0"
        y="0"
        width={box.w}
        height={box.h}
        colorInterpolationFilters="sRGB"
      >
        <feImage
          href={map}
          x="0"
          y="0"
          width={box.w}
          height={box.h}
          preserveAspectRatio="none"
          result="lens"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="lens"
          scale={strength}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  ) : null;

  return { defs, style: { backdropFilter: filter, WebkitBackdropFilter: filter } };
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & ClearGlassOptions;

export function ClearGlassButton({
  strength,
  edge,
  radius,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { defs, style } = useClearGlass(ref, { strength, edge, radius });

  return (
    <button
      {...rest}
      ref={ref}
      className={`clearglass clearglass--interactive ${className}`}
      style={{ ...style, ...rest.style }}
    >
      {defs}
      <span className="clearglass__label">{children}</span>
    </button>
  );
}

type PanelProps = ClearGlassOptions & {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A glass surface that holds other things — a nav bar, a toolbar, a card. */
export function ClearGlassPanel({
  as: Tag = "div",
  strength = 18,
  edge,
  radius,
  className = "",
  children,
}: PanelProps) {
  const ref = useRef<HTMLElement>(null);
  const { defs, style } = useClearGlass(ref, { strength, edge, radius });
  // `as` is intentionally open-ended; React cannot narrow the props of a
  // caller-chosen tag, so this one cast is the price of the polymorphism.
  const El = Tag as any;

  return (
    <El ref={ref} className={`clearglass ${className}`} style={style}>
      {defs}
      {children}
    </El>
  );
}
