"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  p *= 1.2;
  // flower core in shader space
  vec2 core = vec2(0.5 * u_res.x / u_res.y, 0.48) * 1.2;
  float r = length(p - core);

  // long breathing cycle for the whole flower
  float breath = 0.5 + 0.5 * sin(u_time * 0.4);

  // organic warp so the energy rings never look mechanical
  float n = fbm(p * 2.0 + u_time * 0.04);

  // energy waves traveling outward from the core
  float wave = 0.5 + 0.5 * sin(r * 12.0 - u_time * 0.55 + n * 5.0);
  wave = wave * wave * (3.0 - 2.0 * wave);

  float coreGlow = exp(-r * r * 5.0) * (0.75 + 0.25 * breath);

  vec3 darkOrange = vec3(0.48, 0.11, 0.01);
  vec3 brand = vec3(0.988, 0.298, 0.004);
  vec3 hot = vec3(1.0, 0.4, 0.06);
  vec3 lightNeon = vec3(1.0, 0.55, 0.16);

  vec3 col = mix(darkOrange, brand, wave * (0.6 + 0.2 * breath));
  col = mix(col, hot, smoothstep(0.72, 1.0, wave) * 0.7);

  // neon builds toward the petal tips
  col = mix(col, hot, smoothstep(0.3, 0.8, r) * 0.55);

  // light flooding out of the heart
  col = mix(col, lightNeon, coreGlow * 0.8);
  col += vec3(0.18, 0.07, 0.01) * exp(-r * r * 7.0) * (0.8 + 0.2 * breath);

  // neon lift
  col = min(col * 1.12, vec3(1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

// logo paths with a baked-in gaussian blur: feathered alpha mask, shader stays sharp inside
const FEATHERED_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-24 -24 354 336'%3E%3Cfilter id='f' x='-40%25' y='-40%25' width='180%25' height='180%25'%3E%3CfeGaussianBlur stdDeviation='2.5'/%3E%3C/filter%3E%3Cpath filter='url(%23f)' d='M171.407 160.92C164.542 159.023 161.805 150.762 166.178 145.14L208.358 90.9236C218.289 78.1584 236.552 75.5634 249.646 85.0569L276.341 104.412C282.527 108.897 285.207 116.799 283.026 124.122L272.808 158.432C268.145 174.089 251.813 183.137 236.066 178.786L171.407 160.92Z'/%3E%3Cpath filter='url(%23f)' d='M160.245 142.909C156.32 148.852 147.617 148.903 143.622 143.007L105.093 86.1372C96.0216 72.7475 99.1971 54.5769 112.272 45.0574L138.929 25.6496C145.106 21.1522 153.45 21.045 159.741 25.3822L189.214 45.7026C202.663 54.9754 206.221 73.3047 197.217 86.9357L160.245 142.909Z'/%3E%3Cpath filter='url(%23f)' d='M138.056 146.108C142.495 151.678 139.854 159.97 133.012 161.947L67.0197 181.017C51.482 185.507 35.182 176.872 30.1689 161.495L19.9485 130.145C17.58 122.881 20.0564 114.912 26.1254 110.269L54.5588 88.5184C67.5338 78.5927 86.0655 80.8731 96.2471 93.6484L138.056 146.108Z'/%3E%3Cpath filter='url(%23f)' d='M136.708 167.248C143.377 164.748 150.448 169.822 150.214 176.94L147.957 245.595C147.426 261.76 134.177 274.594 118.003 274.61L85.0296 274.642C77.3885 274.65 70.5753 269.832 68.0353 262.626L56.1352 228.863C50.7049 213.455 58.6003 196.535 73.8965 190.8L136.708 167.248Z'/%3E%3Cpath filter='url(%23f)' d='M155.677 175.933C155.36 168.818 162.371 163.661 169.068 166.084L233.666 189.445C248.875 194.946 256.987 211.513 252.004 226.899L241.846 258.269C239.492 265.539 232.805 270.53 225.166 270.718L189.378 271.603C173.047 272.006 159.395 259.269 158.667 242.949L155.677 175.933Z'/%3E%3C/svg%3E")`;

export default function FlowerShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    let visible = true;
    let running = true;
    let gl: WebGLRenderingContext | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    const start = performance.now();

    const draw = () => {
      if (!gl || gl.isContextLost()) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      if (!running || !visible) return;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl?.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

    const init = () => {
      gl = canvas.getContext("webgl", { alpha: false, antialias: false });
      if (!gl) return;
      if (gl.isContextLost()) {
        // browser evicted this context; ask for it back, reinit fires on restore
        gl.getExtension("WEBGL_lose_context")?.restoreContext();
        return;
      }

      const compile = (type: number, src: string) => {
        const shader = gl!.createShader(type)!;
        gl!.shaderSource(shader, src);
        gl!.compileShader(shader);
        return shader;
      };

      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uRes = gl.getUniformLocation(program, "u_res");
      uTime = gl.getUniformLocation(program, "u_time");

      resize();
      if (!reduceMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => {
      if (running) init();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) return;
      if (gl?.isContextLost()) {
        gl.getExtension("WEBGL_lose_context")?.restoreContext();
        return;
      }
      draw();
      if (!reduceMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    init();

    // no loseContext here: next reuses the canvas dom across navigations,
    // and a context lost without a listening preventDefault is unrestorable
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, []);

  return (
    <div aria-hidden="true" className={cn("relative aspect-[306/288]", className)}>
      {/* blur must sit on a parent of the mask, or the mask edge stays sharp */}
      <div className="size-full">
        <div
          className="size-full"
          style={{
            WebkitMaskImage: FEATHERED_MASK,
            maskImage: FEATHERED_MASK,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <canvas ref={canvasRef} className="size-full" />
        </div>
      </div>
      {/* <div
        className="absolute -inset-[12%] opacity-45 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          WebkitMaskImage:
            "radial-gradient(closest-side, black 55%, transparent 100%)",
          maskImage:
            "radial-gradient(closest-side, black 55%, transparent 100%)",
        }}
      /> */}
    </div>
  );
}
