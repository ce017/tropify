"use client";

import { PortalFieldCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import type { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};

/** cloud-field renders inside a sandboxed <iframe>, so it can only be stacked,
 *  never composited with in-page WebGL. Layering is handled by the caller. */
export function CloudField({ className, style }: Props) {
  return (
    <PortalFieldCollection
      variant="cloud-field"
      hue={0}
      saturation={1.0}
      brightness={1.0}
      className={className}
      style={style}
    />
  );
}
