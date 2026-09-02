/**
 * Clear Glass — Apple's .glassEffect(.clear) look for the web.
 * No dependencies, no build step. MIT.
 *
 * The page shows through almost unblurred, bends around the rim, and carries a
 * bright specular edge. backdrop-filter is the only web primitive that samples
 * what is actually painted behind an element — iframes and WebGL canvases
 * included — so this takes the colour of whatever it sits over, live.
 *
 *   import { clearGlass } from './clear-glass.js'
 *   clearGlass(document.querySelectorAll('.my-button'))
 */

let uid = 0;

/**
 * Displacement map for the edge lens: R = x offset, G = y offset, both centred
 * on 128 (no displacement). The offset points along the outward normal of the
 * rounded rect and falls off to nothing `edge` pixels in, so only the rim bends.
 */
export function buildLensMap(width, height, radius, edge) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

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

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {Element|Iterable<Element>} target
 * @param {{strength?: number, edge?: number, radius?: number}} [options]
 * @returns {() => void} teardown
 */
export function clearGlass(target, options = {}) {
  const { strength = 26, edge = 18, radius } = options;
  const nodes =
    target instanceof Element ? [target] : Array.from(target ?? []);
  const teardowns = nodes.map((el) => attach(el, strength, edge, radius));
  return () => teardowns.forEach((fn) => fn());
}

function attach(el, strength, edge, radius) {
  const id = `clearglass-lens-${++uid}`;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';

  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('filterUnits', 'userSpaceOnUse');
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  filter.setAttribute('x', '0');
  filter.setAttribute('y', '0');

  const feImage = document.createElementNS(SVG_NS, 'feImage');
  feImage.setAttribute('x', '0');
  feImage.setAttribute('y', '0');
  feImage.setAttribute('preserveAspectRatio', 'none');
  feImage.setAttribute('result', 'lens');

  const feDisplace = document.createElementNS(SVG_NS, 'feDisplacementMap');
  feDisplace.setAttribute('in', 'SourceGraphic');
  feDisplace.setAttribute('in2', 'lens');
  feDisplace.setAttribute('scale', String(strength));
  feDisplace.setAttribute('xChannelSelector', 'R');
  feDisplace.setAttribute('yChannelSelector', 'G');

  filter.append(feImage, feDisplace);
  svg.append(filter);
  el.append(svg);
  el.classList.add('clearglass');

  const measure = () => {
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (!w || !h) return;

    const map = buildLensMap(w, h, radius ?? h / 2, edge);
    filter.setAttribute('width', String(w));
    filter.setAttribute('height', String(h));
    feImage.setAttribute('width', String(w));
    feImage.setAttribute('height', String(h));
    feImage.setAttribute('href', map);

    // If the engine rejects url() in backdrop-filter (Safari, Firefox) this
    // inline value is dropped and the stylesheet's plainer filter applies.
    const value = `url(#${id}) saturate(1.7) brightness(1.06)`;
    el.style.backdropFilter = value;
    el.style.webkitBackdropFilter = value;
  };

  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);

  return () => {
    ro.disconnect();
    svg.remove();
    el.style.backdropFilter = '';
    el.style.webkitBackdropFilter = '';
  };
}
