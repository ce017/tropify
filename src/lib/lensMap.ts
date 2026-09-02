/**
 * Displacement map for the clear-glass edge lens.
 *
 * Apple's clear glass barely blurs — what sells it is the background being
 * *bent* in a band around the rim while the middle stays sharp. feDisplacementMap
 * does that if you feed it a map whose R/G channels encode the offset per pixel.
 *
 * Here R = x offset, G = y offset, both centred on 128 (= no displacement).
 * The offset points along the outward normal of the rounded rect and falls off
 * to nothing by `edge` pixels in, so only the rim refracts.
 */
export function buildLensMap(
  width: number,
  height: number,
  radius: number,
  edge: number,
): string {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const image = ctx.createImageData(w, h);
  const data = image.data;
  const r = Math.min(radius, Math.min(w, h) / 2);
  const halfW = w / 2;
  const halfH = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - halfW;
      const py = y + 0.5 - halfH;

      // signed distance to a rounded rectangle (positive inside)
      const qx = Math.abs(px) - (halfW - r);
      const qy = Math.abs(py) - (halfH - r);
      const ax = Math.max(qx, 0);
      const ay = Math.max(qy, 0);
      const outside = Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
      const inset = -outside;

      // outward normal
      let nx = 0;
      let ny = 0;
      if (qx > 0 || qy > 0) {
        const len = Math.hypot(ax, ay) || 1;
        nx = (ax / len) * Math.sign(px || 1);
        ny = (ay / len) * Math.sign(py || 1);
      } else if (qx > qy) {
        nx = Math.sign(px || 1);
      } else {
        ny = Math.sign(py || 1);
      }

      // sharp in the middle, bending hard right at the rim
      const t = Math.max(0, Math.min(1, 1 - inset / edge));
      const amount = t * t * t;

      const i = (y * w + x) * 4;
      data[i] = Math.round(128 + nx * amount * 127);
      data[i + 1] = Math.round(128 + ny * amount * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
