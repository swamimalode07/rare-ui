/**
 * CSS color helpers used by Rare UI components.
 * Turn hex, rgb, hsl, and named colors into `{ r, g, b }` channels.
 */

/** 8-bit RGB color. Each channel is 0 to 255. */
export type RGB = { r: number; g: number; b: number };

export const WHITE: RGB = { r: 255, g: 255, b: 255 };
export const BLACK: RGB = { r: 0, g: 0, b: 0 };

/**
 * Parse a hex color into RGB.
 * Accepts `#rgb`, `#rgba`, `#rrggbb`, and `#rrggbbaa`. The `#` is optional; alpha is ignored.
 *
 * @returns RGB, or `null` if the string is not valid hex.
 * @example
 * parseHex("#fc0") // { r: 255, g: 204, b: 0 }
 */
export function parseHex(h: string): RGB | null {
  let s = h.startsWith("#") ? h.slice(1) : h;
  if (s.length === 3 || s.length === 4) {
    s = [...s.slice(0, 3)].map((c) => c + c).join("");
  } else if (s.length === 8) {
    s = s.slice(0, 6);
  }
  if (s.length !== 6 || /[^0-9a-f]/i.test(s)) return null;
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

/** CSS named colors, keyed by lowercase name. */
const NAMED: Record<string, RGB> = Object.fromEntries(
  "black:000000,silver:c0c0c0,gray:808080,grey:808080,white:ffffff,maroon:800000,red:ff0000,purple:800080,fuchsia:ff00ff,magenta:ff00ff,green:008000,lime:00ff00,olive:808000,yellow:ffff00,navy:000080,blue:0000ff,teal:008080,aqua:00ffff,cyan:00ffff,orange:ffa500,aliceblue:f0f8ff,antiquewhite:faebd7,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4,blanchedalmond:ffebcd,blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc,crimson:dc143c,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9,darkgrey:a9a9a9,darkgreen:006400,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f,darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f,darkslateblue:483d8b,darkslategray:2f4f4f,darkslategrey:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dimgrey:696969,dodgerblue:1e90ff,firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520,greenyellow:adff2f,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5,lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff,lightgoldenrodyellow:fafad2,lightgray:d3d3d3,lightgrey:d3d3d3,lightgreen:90ee90,lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899,lightslategrey:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,limegreen:32cd32,linen:faf0e6,mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db,mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc,mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5,navajowhite:ffdead,oldlace:fdf5e6,olivedrab:6b8e23,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee,palevioletred:db7093,papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,rebeccapurple:663399,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,slategrey:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,whitesmoke:f5f5f5,yellowgreen:9acd32"
    .split(",")
    .map((pair) => {
      const [name, hex] = pair.split(":");
      return [name, parseHex(hex)!];
    }),
);

/** Read one rgb/hsl channel. Percent values are scaled; bare numbers stay as-is. */
function channel(v: string, scale = 255) {
  const t = v.trim();
  const pct = t.endsWith("%");
  const raw = pct ? t.slice(0, -1) : t;
  const n = Number(raw);
  if (raw === "" || Number.isNaN(n)) return NaN;
  return Math.round(pct ? (n / 100) * scale : n);
}

/** Parse the argument list inside `rgb()` or `rgba()`. */
function parseRgbArgs(args: string): RGB | null {
  const parts = args.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const r = channel(parts[0]);
  const g = channel(parts[1]);
  const b = channel(parts[2]);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return {
    r: Math.min(255, Math.max(0, r)),
    g: Math.min(255, Math.max(0, g)),
    b: Math.min(255, Math.max(0, b)),
  };
}

/**
 * Convert HSL to RGB.
 *
 * @param h Hue in degrees, 0 to 360.
 * @param s Saturation, 0 to 100.
 * @param l Lightness, 0 to 100.
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

/** Parse the argument list inside `hsl()` or `hsla()`. */
function parseHslArgs(args: string): RGB | null {
  const parts = args.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]);
  const l = parseFloat(parts[2]);
  if ([h, s, l].some((n) => Number.isNaN(n))) return null;
  return hslToRgb(((h % 360) + 360) % 360, s, l);
}

/** Reused 2d context for colors the string parsers do not handle. */
let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Parse any CSS color string into RGB.
 * Handles named colors, hex, `rgb()` / `rgba()`, and `hsl()` / `hsla()`.
 * In the browser, unknown syntax falls back to a canvas `fillStyle` parse.
 *
 * @returns RGB, or black `{ r: 0, g: 0, b: 0 }` if parsing fails.
 * @example
 * parseColor("rebeccapurple") // { r: 102, g: 51, b: 153 }
 * parseColor("rgb(255 136 0)") // { r: 255, g: 136, b: 0 }
 */
export function parseColor(input: string): RGB {
  const s = input.trim();
  const named = NAMED[s.toLowerCase()];
  if (named) return named;
  const hex = parseHex(s);
  if (hex) return hex;
  const rgb = /^rgba?\(\s*([\s\S]+)\)$/i.exec(s);
  if (rgb) {
    const parsed = parseRgbArgs(rgb[1]);
    if (parsed) return parsed;
  }
  const hsl = /^hsla?\(\s*([\s\S]+)\)$/i.exec(s);
  if (hsl) {
    const parsed = parseHslArgs(hsl[1]);
    if (parsed) return parsed;
  }
  if (typeof document !== "undefined") {
    if (probe === undefined) {
      probe = document.createElement("canvas").getContext("2d");
    }
    if (probe) {
      probe.fillStyle = "#000000";
      probe.fillStyle = s;
      const v = String(probe.fillStyle);
      const fromHex = v.startsWith("#") ? parseHex(v) : null;
      if (fromHex) return fromHex;
      const m = v.match(/\d+/g);
      if (m && m.length >= 3) return { r: +m[0], g: +m[1], b: +m[2] };
    }
  }
  return { r: 0, g: 0, b: 0 };
}

/**
 * Mix two colors. `t` is 0 to 1, where 0 is `a` and 1 is `b`.
 *
 * @example
 * mix({ r: 0, g: 0, b: 0 }, 0.5, { r: 255, g: 255, b: 255 }) // { r: 128, g: 128, b: 128 }
 */
export function mix(a: RGB, t: number, b: RGB): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

/**
 * Format RGB as a 6-digit hex string, like `#ff8800`.
 */
export function toHex({ r, g, b }: RGB) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}
