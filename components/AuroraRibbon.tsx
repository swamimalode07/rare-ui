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

// one silk band entering upper-left, descending to the bottom-right, widening as it goes
float ribbon(vec2 uv, float seed, float speed, float endY, float baseThick) {
  float x = uv.x;
  // one clean swoop: drops fast off the left, lands gently at the right
  float ease = 1.0 - pow(1.0 - x, 1.8);
  float path = mix(0.9, endY, ease);
  float wiggle = (fbm(vec2(x * 1.4 - u_time * speed, seed)) - 0.5)
    * 0.12 * (0.3 + 0.7 * x);
  float d = uv.y - (path + wiggle);
  float spread = baseThick * mix(0.12, 1.6, smoothstep(0.0, 0.9, x));
  float body = exp(-d * d / spread);
  // diffuse a little as it spreads
  body *= mix(1.0, 0.78, smoothstep(0.3, 1.0, x));
  float fibers = 0.7 + 0.3 * fbm(vec2(x * 4.0 - u_time * speed * 2.2, uv.y * 9.0 + seed));
  return body * fibers;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;

  // three strands fanning apart toward the bottom right
  float a1 = ribbon(uv, 3.1, 0.05, 0.42, 0.01);
  float a2 = ribbon(uv, 7.7, 0.032, 0.2, 0.04);
  float a3 = ribbon(uv, 11.3, 0.074, 0.02, 0.0035);

  vec3 deep = vec3(0.34, 0.07, 0.0);
  vec3 brand = vec3(0.988, 0.298, 0.004);
  vec3 hot = vec3(1.0, 0.36, 0.02);

  // premultiplied accumulation: wide deep band, main brand ribbon, hot filament
  vec3 col = mix(deep, brand, clamp(a2 * 1.3, 0.0, 1.0)) * a2 * 0.75;
  col += brand * a1 * 1.05;
  col += hot * a3 * 1.25;

  float alpha = clamp(a2 * 0.7 + a1 * 1.05 + a3 * 1.25, 0.0, 1.0);

  // keep the canvas borders clean where a strand drifts near them
  float edge = smoothstep(0.0, 0.05, uv.y) * (1.0 - smoothstep(0.95, 1.0, uv.y));
  gl_FragColor = vec4(col * edge, alpha * edge);
}
`;

export default function AuroraRibbon({ className }: { className?: string }) {
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
      gl = canvas.getContext("webgl", { alpha: true, antialias: false });
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
    <div aria-hidden="true" className={cn("relative", className)}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
