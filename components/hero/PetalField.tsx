"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useTheme } from "next-themes";
import { bindFullscreenQuad, createProgram } from "@/lib/webgl";
import { buildFlowerRelief, DIST_RANGE, RELIEF_SIZE } from "@/lib/flowerRelief";
import { cn } from "@/lib/utils";

const MAX_DPR = 2;
const RESOLUTION_SCALE = 0.7;
const SPIN = 0.04;
const INTRO_SECONDS = 1.4;
const POINTER_EASE = 0.05;
const BLOOM_EASE = 0.08;
const BLOOM_REACH = 3;

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_rot;
uniform float u_intro;
uniform float u_bloom;
uniform float u_dark;
uniform vec2 u_pointer;
uniform vec2 u_center;
uniform float u_size;
uniform vec4 u_veil;
uniform sampler2D u_relief;

const float TAU = 6.2831853;
const float PETALS = 5.0;
const float STRANDS = 110.0;
const vec3 ORANGE = vec3(0.988, 0.298, 0.004);

float hash1(float n) {
  return fract(sin(n) * 43758.5453);
}

float hash2(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
    mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// x: strand coordinate, y: position across the petal in [-1, 1], z: petal index
vec3 petal(vec2 p) {
  float r = length(p) + 1e-4;
  // offset a quarter turn so each silk petal grows out of a logo petal
  float a = atan(p.y, p.x) - u_rot - 1.5708 - 0.85 * r * r;
  float sector = TAU / PETALS;
  float k = floor(a / sector + 0.5);
  float v = (a - k * sector) / (0.5 * sector);
  k = mod(k, PETALS);
  // barbs drift from the midline toward the seams as they travel out, like a feather
  float c = abs(v) - 0.5 * log(r);
  return vec3(c, v, k);
}

vec4 relief(vec2 q) {
  vec4 t = texture2D(u_relief, q * 0.5 + 0.5);
  return vec4(t.rg * 2.0 - 1.0, 0.0, (t.b - 0.5) * ${(DIST_RANGE * 2).toFixed(3)});
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float m = min(u_resolution.x, u_resolution.y);
  vec2 p = (frag - u_center) / m;
  float r = length(p);
  float lr = log(r + 1e-4);

  vec3 pet = petal(p);
  float eps = 1.0 / m;
  vec2 grad = vec2(petal(p + vec2(eps, 0.0)).x - pet.x, petal(p + vec2(0.0, eps)).x - pet.x);
  vec2 tangent = normalize(vec2(-grad.y, grad.x) + 1e-6);

  float side = step(0.0, pet.y);
  float seed = pet.z * 13.7 + side * 5.3;
  float flow = lr * 1.6 - u_time * 0.035;
  float sc = pet.x * STRANDS;
  float hair = noise(vec2(sc, flow + seed)) * 0.6 + noise(vec2(sc * 2.7, flow * 1.7 + seed)) * 0.4;
  hair = smoothstep(0.25, 0.95, hair);
  float clump = noise(vec2(pet.x * 9.0, lr * 0.8 + seed - u_time * 0.02));
  clump = smoothstep(0.15, 0.85, clump);

  // anisotropic highlight: strands light up where they run across the light, so every bend gets a sheen band
  float la = 2.1 + u_pointer.x * 0.6;
  vec3 light = normalize(vec3(cos(la), sin(la) + u_pointer.y * 0.4, 0.7));
  vec3 half_ = normalize(light + vec3(0.0, 0.0, 1.0));
  float th = dot(vec3(tangent, 0.0), half_);
  float sinTh = sqrt(max(1.0 - th * th, 0.0));
  float tl = dot(tangent, normalize(light.xy));
  float diffuse = sqrt(max(1.0 - tl * tl, 0.0));
  float spec = pow(sinTh, 70.0);
  float glow = pow(sinTh, 10.0);

  float body = sqrt(max(1.0 - pet.y * pet.y, 0.0));
  float crease = smoothstep(1.0, 0.8, abs(pet.y));

  // strands leave the flower in brand orange and cool to champagne and smoke as they travel out
  vec3 smoke = vec3(0.6, 0.56, 0.53);
  vec3 champagne = vec3(0.94, 0.85, 0.74);
  vec3 ember = vec3(1.0, 0.4, 0.1);
  vec3 tint = mix(smoke, champagne, clump * 0.75);
  float lane = hash1(floor(sc * 0.5) + seed);
  float heat = smoothstep(0.8, 0.18, r) * (0.45 + 0.55 * clump) + step(0.975, lane) * 0.5;
  tint = mix(tint, ember, clamp(heat, 0.0, 0.9));

  float lum = hair * (0.04 + 0.4 * diffuse * body) * (0.25 + 0.75 * clump);
  lum += spec * body * (0.25 + 0.9 * hair) * (0.4 + 0.6 * clump) + glow * 0.08 * hair;
  lum *= crease;

  float e = length((frag - u_veil.xy) / max(u_veil.zw, vec2(1.0)));
  float veil = mix(0.1, 1.0, smoothstep(0.5, 1.6, e));
  float hollow = smoothstep(0.04, 0.26, r);
  float edge = smoothstep(0.0, 0.25, frag.y / u_resolution.y) * 0.6 + 0.4;
  float shade = veil * hollow * edge;

  vec3 darkCol = vec3(0.012, 0.012, 0.014) + tint * lum * shade;
  vec3 lightCol = mix(vec3(0.965, 0.965, 0.972), tint * 0.5, clamp(hair * body * crease * 0.55 * shade, 0.0, 1.0));
  lightCol += vec3(1.0) * spec * body * shade * 0.35;
  lightCol *= mix(0.9, 1.0, crease);
  vec3 col = mix(lightCol, darkCol, u_dark);

  float size = u_size * u_intro;
  vec2 q = rotate((frag - u_center) / max(size, 1.0), -u_rot);

  // petals part as the pointer nears, and arrive parted before settling closed
  q -= normalize(q + 1e-5) * (u_bloom * 0.09 + max(1.0 - u_intro, 0.0) * 0.35);

  float shadowD = relief(q - vec2(0.03, 0.08)).w;
  col *= 1.0 - (1.0 - smoothstep(-0.03, 0.22, shadowD)) * 0.6 * u_intro;

  vec4 rel = relief(q);
  float px = 1.0 / max(size, 1.0);
  float coverage = smoothstep(px, -px, rel.w) * step(abs(q.x), 1.0) * step(abs(q.y), 1.0);

  if (coverage > 0.0) {
    vec2 nxy = rotate(rel.xy, u_rot);
    vec3 n = normalize(vec3(nxy * 0.6, sqrt(max(1.0 - dot(nxy, nxy), 0.0))));

    // the logo is woven from the same silk: fibres run out from the heart of the flower
    float fa = atan(q.y, q.x);
    float fr = length(q);
    float weave = noise(vec2(fa * 38.0, fr * 2.5 - u_time * 0.04)) * 0.65
      + noise(vec2(fa * 85.0, fr * 4.0)) * 0.35;
    weave = smoothstep(0.15, 0.9, weave);
    vec2 fibre = rotate(normalize(q + 1e-5), u_rot);
    float fh = dot(vec3(fibre, 0.0), half_);
    float satin = pow(sqrt(max(1.0 - fh * fh, 0.0)), 36.0);
    float lit = max(dot(n, light), 0.0);
    vec3 silkPetal = ORANGE * (0.22 + 0.78 * lit) * (0.84 + 0.16 * weave);
    silkPetal += vec3(1.0, 0.78, 0.58) * satin * (0.55 + 0.45 * weave) * (0.35 + 0.65 * n.z);
    silkPetal *= mix(0.5, 1.0, smoothstep(0.0, 0.5, n.z));
    col = mix(col, silkPetal, coverage);
  }

  col += (hash2(frag + fract(u_time)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

function easeOutBack(t: number) {
  const c = 1.4;
  const x = t - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
}

export default function PetalField({
  flowerRef,
  veilRef,
  className,
}: {
  flowerRef: RefObject<HTMLElement | null>;
  veilRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(1);
  const redrawRef = useRef<() => void>(() => {});
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    darkRef.current = resolvedTheme === "light" ? 0 : 1;
    redrawRef.current();
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compiled = createProgram(gl, VERT, FRAG);
    const reliefData = buildFlowerRelief();
    if (!compiled || !reliefData) return;

    const { program } = compiled;
    gl.useProgram(program);
    const quad = bindFullscreenQuad(gl, program, "a_pos");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, RELIEF_SIZE, RELIEF_SIZE, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, reliefData,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = u("u_resolution");
    const uTime = u("u_time");
    const uRot = u("u_rot");
    const uIntro = u("u_intro");
    const uBloom = u("u_bloom");
    const uDark = u("u_dark");
    const uPointer = u("u_pointer");
    const uCenter = u("u_center");
    const uSize = u("u_size");
    const uVeil = u("u_veil");
    gl.uniform1i(u("u_relief"), 0);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    const elapsed = () => (performance.now() - startedAt) / 1000;

    let scale = 1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, cssX: -1e4, cssY: -1e4, bloom: 0 };
    const flowerCss = { x: 0, y: 0, r: 1 };

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const flower = flowerRef.current?.getBoundingClientRect();
      const veil = veilRef.current?.getBoundingClientRect();
      if (flower) {
        flowerCss.x = flower.left + flower.width / 2 - box.left;
        flowerCss.y = flower.top + flower.height / 2 - box.top;
        flowerCss.r = flower.width / 2;
        gl.uniform2f(
          uCenter,
          (flower.left + flower.width / 2 - box.left) * scale,
          (box.bottom - (flower.top + flower.height / 2)) * scale,
        );
        gl.uniform1f(uSize, (flower.width / 2) * scale);
      }
      if (veil) {
        gl.uniform4f(
          uVeil,
          (veil.left + veil.width / 2 - box.left) * scale,
          (box.bottom - (veil.top + veil.height / 2)) * scale,
          (veil.width / 2) * scale,
          (veil.height / 2) * scale,
        );
      }
    };

    const draw = () => {
      const t = reduceMotion ? 0 : elapsed();
      pointer.x += (pointer.tx - pointer.x) * POINTER_EASE;
      pointer.y += (pointer.ty - pointer.y) * POINTER_EASE;
      const distance = Math.hypot(pointer.cssX - flowerCss.x, pointer.cssY - flowerCss.y);
      const near = 1 - Math.min(Math.max((distance - flowerCss.r) / (flowerCss.r * BLOOM_REACH), 0), 1);
      pointer.bloom += (near * near - pointer.bloom) * BLOOM_EASE;
      gl.uniform1f(uBloom, pointer.bloom);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uRot, t * SPIN);
      gl.uniform1f(uIntro, reduceMotion ? 1 : easeOutBack(Math.min(t / INTRO_SECONDS, 1)));
      gl.uniform1f(uDark, darkRef.current);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    redrawRef.current = draw;

    let frame = 0;
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const play = () => {
      if (frame || reduceMotion) return;
      frame = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RESOLUTION_SCALE;
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uResolution, w, h);
      }
      measure();
      draw();
    };

    const onPointer = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.cssX = event.clientX - box.left;
      pointer.cssY = event.clientY - box.top;
      pointer.tx = ((event.clientX - box.left) / box.width) * 2 - 1;
      pointer.ty = -(((event.clientY - box.top) / box.height) * 2 - 1);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    if (flowerRef.current) resizeObserver.observe(flowerRef.current);
    if (veilRef.current) resizeObserver.observe(veilRef.current);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
      else pause();
    });
    visibilityObserver.observe(canvas);

    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      pause();
      redrawRef.current = () => {};
      window.removeEventListener("pointermove", onPointer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(quad);
      compiled.dispose();
    };
  }, [flowerRef, veilRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
