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
  float t = u_time * 0.12;

  // domain-warped fbm for the liquid drift
  vec2 q = vec2(fbm(p + t), fbm(p - t * 0.7 + 4.7));
  vec2 r = vec2(
    fbm(p + q * 1.8 + vec2(1.7, 9.2) + t * 0.4),
    fbm(p + q * 1.8 + vec2(8.3, 2.8) - t * 0.3)
  );
  float f = fbm(p + r * 2.0);

  vec3 darkOrange = vec3(0.48, 0.11, 0.01);
  vec3 brand = vec3(0.988, 0.298, 0.004);
  vec3 hot = vec3(1.0, 0.45, 0.12);
  vec3 gold = vec3(1.0, 0.78, 0.35);

  vec3 col = mix(darkOrange, brand, smoothstep(0.2, 0.75, f));
  col = mix(col, hot, smoothstep(0.4, 0.95, q.y) * 0.55);
  col = mix(col, gold, smoothstep(0.5, 1.0, r.x) * 0.4);

  // dark orange shade drifting through keeps contrast alive above the blur
  col *= 0.78 + 0.22 * smoothstep(0.15, 0.75, f);

  // neon lift
  col = min(col * 1.12, vec3(1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function FlowerShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
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

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    let visible = true;
    let running = true;
    const start = performance.now();

    const draw = () => {
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
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    if (!reduceMotion) raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div aria-hidden="true" className={cn("relative aspect-[306/288]", className)}>
      {/* blur must sit on a parent of the mask, or the mask edge stays sharp */}
      <div className="size-full" /* style={{ filter: "blur(6px)" }} */>
        <div
          className="size-full"
          style={{
            WebkitMaskImage: "url('/logos/Rareui.svg')",
            maskImage: "url('/logos/Rareui.svg')",
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
