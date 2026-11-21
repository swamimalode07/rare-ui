import { RAREUI_PETALS } from "@/components/logos";

export const RELIEF_SIZE = 512;

// shader decodes blue as signed distance in [-DIST_RANGE, DIST_RANGE] flower units
export const DIST_RANGE = 0.25;

const BEVEL = 0.2;
const SMOOTH_PX = 8;
const PIVOT_X = 131;
const PIVOT_Y = 136;
const FILL = 0.42;
const INF = 1e20;

function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

function distanceTo(feature: Uint8Array, n: number) {
  const grid = new Float64Array(n * n);
  for (let i = 0; i < n * n; i++) grid[i] = feature[i] ? 0 : INF;

  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) f[y] = grid[y * n + x];
    edt1d(f, n, d, v, z);
    for (let y = 0; y < n; y++) grid[y * n + x] = d[y];
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) f[x] = grid[y * n + x];
    edt1d(f, n, d, v, z);
    for (let x = 0; x < n; x++) grid[y * n + x] = Math.sqrt(d[x]);
  }
  return grid;
}

// distance fields crease along each petal's spine; blurring melts those creases into liquid curves
function blur(field: Float64Array, n: number, sigma: number) {
  const radius = Math.ceil(sigma * 2.5);
  const kernel = new Float64Array(radius * 2 + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma));
    sum += kernel[i + radius];
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;

  const tmp = new Float64Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let acc = 0;
      for (let i = -radius; i <= radius; i++) {
        acc += field[y * n + Math.min(Math.max(x + i, 0), n - 1)] * kernel[i + radius];
      }
      tmp[y * n + x] = acc;
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let acc = 0;
      for (let i = -radius; i <= radius; i++) {
        acc += tmp[Math.min(Math.max(y + i, 0), n - 1) * n + x] * kernel[i + radius];
      }
      field[y * n + x] = acc;
    }
  }
}

function height(d: number) {
  const u = Math.min(Math.max(-d / BEVEL, 0), 1);
  return BEVEL * Math.sqrt(1 - (1 - u) * (1 - u));
}

export function buildFlowerRelief() {
  const n = RELIEF_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scale = (n * FILL) / PIVOT_Y;
  ctx.translate(n / 2, n / 2);
  ctx.scale(scale, scale);
  ctx.translate(-PIVOT_X, -PIVOT_Y);
  ctx.fillStyle = "#000";
  for (const d of RAREUI_PETALS) ctx.fill(new Path2D(d));

  const alpha = ctx.getImageData(0, 0, n, n).data;
  const inside = new Uint8Array(n * n);
  const outside = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) {
    inside[i] = alpha[i * 4 + 3] > 127 ? 1 : 0;
    outside[i] = 1 - inside[i];
  }

  const toInside = distanceTo(inside, n);
  const toOutside = distanceTo(outside, n);

  const unit = 2 / n;
  const signed = new Float64Array(n * n);
  const h = new Float64Array(n * n);
  for (let i = 0; i < n * n; i++) {
    signed[i] = (toInside[i] - toOutside[i]) * unit;
    h[i] = height(signed[i]);
  }

  blur(h, n, SMOOTH_PX);

  const at = (x: number, y: number) =>
    h[Math.min(Math.max(y, 0), n - 1) * n + Math.min(Math.max(x, 0), n - 1)];

  // rows are flipped so texture v runs upward like gl_FragCoord
  const out = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) / (2 * unit);
      const dy = -(at(x, y + 1) - at(x, y - 1)) / (2 * unit);
      const len = Math.hypot(dx, dy, 1);
      const o = ((n - 1 - y) * n + x) * 4;
      out[o] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      out[o + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      out[o + 2] = Math.round(
        Math.min(Math.max(0.5 + signed[y * n + x] / (2 * DIST_RANGE), 0), 1) * 255,
      );
      out[o + 3] = 255;
    }
  }
  return out;
}
