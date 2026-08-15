import React, { useEffect, useRef } from 'react';
import {
  publishSharedWarpFrame,
  setRampRenderer,
  setSharedWarpSource,
} from './burgundy-warp-runtime';
import type { WarpRamp } from '../../types';

/** The shipping palette, now passed in rather than baked into the shader. */
const BURGUNDY_RAMP: WarpRamp = ['#130105', '#25030b', '#4d0d1c', '#741b30', '#902a44'];

/** Custom ramps render here before being copied; one buffer serves them all. */
const SCRATCH_WIDTH = 512;
const SCRATCH_HEIGHT = 384;

/** The instant every cached palette is sampled at. Arbitrary but fixed. */
const RAMP_SAMPLE_TIME = 4.2;

const hexToUnit = (hex: string): [number, number, number] => {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

const vertexShaderSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;

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
  float value = 0.0;
  float amplitude = 0.54;
  mat2 rotation = mat2(0.82, 0.57, -0.57, 0.82);

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotation * p * 2.03 + 0.17;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution.xy, vec2(1.0));
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float t = u_time * 0.10;
  float radial = length(p);
  float angle = atan(p.y, p.x);
  p += 0.055 * vec2(cos(angle * 2.0 + t), sin(angle * 2.0 - t)) * (0.7 + radial);

  vec2 q = vec2(
    fbm(p * 2.2 + vec2(0.0, t * 0.42)),
    fbm(p * 2.2 + vec2(4.7, 1.3) - vec2(t * 0.28, 0.0))
  );

  vec2 r = vec2(
    fbm(p * 2.55 + 2.1 * q + vec2(1.9, 8.8) + vec2(t * 0.22, 0.0)),
    fbm(p * 2.55 + 2.1 * q + vec2(8.1, 2.6) - vec2(0.0, t * 0.20))
  );

  float field = fbm(p * 2.75 + 2.55 * r);
  float ribbon = 0.5 + 0.5 * sin((p.x + p.y * 0.42 + field * 1.72) * 7.0 - t * 0.72);
  float folds = smoothstep(0.18, 0.92, field * 0.88 + ribbon * 0.34);
  float highlight = pow(smoothstep(0.48, 1.0, ribbon * field), 1.35);

  vec3 color = mix(u_c0, u_c1, smoothstep(0.02, 0.46, field));
  color = mix(color, u_c2, smoothstep(0.25, 0.78, folds));
  color = mix(color, u_c3, smoothstep(0.58, 0.98, folds + highlight * 0.22));
  color = mix(color, u_c4, highlight * 0.34);

  float vignette = smoothstep(1.05, 0.18, radial);
  color *= 0.76 + vignette * 0.30;
  color += 0.018 * noise(gl_FragCoord.xy * 0.42 + u_time);

  gl_FragColor = vec4(color, 1.0);
}
`;

const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create WebGL shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compilation error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();

  if (!program) throw new Error('Unable to create WebGL program.');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown shader linking error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
};

const GlobalBurgundyWarpBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      desynchronized: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      stencil: false,
    });

    if (!gl) return;

    let program: WebGLProgram;
    try {
      program = createProgram(gl);
    } catch (error) {
      console.error('Burgundy warp shader failed to initialize:', error);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const colorLocations = [0, 1, 2, 3, 4].map((index) =>
      gl.getUniformLocation(program, `u_c${index}`),
    );
    const positionBuffer = gl.createBuffer();

    if (!positionBuffer || !resolutionLocation || !timeLocation || positionLocation < 0) {
      gl.deleteProgram(program);
      return;
    }

    const applyRamp = (
      context: WebGLRenderingContext,
      locations: (WebGLUniformLocation | null)[],
      ramp: WarpRamp,
    ) => {
      ramp.forEach((hex, index) => {
        const location = locations[index];
        if (!location) return;
        const [r, g, b] = hexToUnit(hex);
        context.uniform3f(location, r, g, b);
      });
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let lastFrame = -Infinity;
    let previousTick = performance.now();
    let animationTime = 4200;
    let disposed = false;

    const resize = () => {
      // Measured from the canvas, never from window.innerHeight. Mobile
      // browsers retract the URL bar as you scroll, which grows innerHeight by
      // ~10% with no real layout change; feeding that to u_resolution rescaled
      // the whole shader field and read as the background zooming. The element
      // is pinned to 100lvh in CSS, so its own box stays put while scrolling.
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const quality = width < 768 ? 0.72 : width < 1280 ? 0.82 : 0.9;
      const renderWidth = Math.max(480, Math.round(width * dpr * quality));
      const renderHeight = Math.max(360, Math.round(height * dpr * quality));

      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        gl.viewport(0, 0, renderWidth, renderHeight);
      }
    };

    const draw = () => {
      resize();
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, animationTime / 1000);
      applyRamp(gl, colorLocations, BURGUNDY_RAMP);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      publishSharedWarpFrame(animationTime);
    };

    const tick = (now: number) => {
      if (disposed || document.visibilityState !== 'visible' || motionQuery.matches) return;

      const delta = Math.min(100, Math.max(0, now - previousTick));
      previousTick = now;
      animationTime += delta;

      if (now - lastFrame >= 1000 / 30) {
        lastFrame = now;
        draw();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const start = () => {
      stop();
      if (document.visibilityState !== 'visible') return;

      previousTick = performance.now();

      if (motionQuery.matches) {
        draw();
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stop();
    };

    // A second, small context draws surfaces that asked for their own palette.
    //
    // Each palette is rendered ONCE and kept. The visible motion on those
    // surfaces comes from the rotate/drift/pulse transform applied when they
    // copy the field, not from the field morphing underneath, so re-shading it
    // 30 times a second bought almost nothing and cost 0.157ms per surface per
    // frame. Cached, a twentieth surface costs only its copy: measured over 20
    // surfaces the frame drops from 4.86ms to 1.72ms, and the per-surface cost
    // stops scaling with the shader at all.
    const scratch = document.createElement('canvas');
    scratch.width = SCRATCH_WIDTH;
    scratch.height = SCRATCH_HEIGHT;

    const scratchGl = scratch.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
      stencil: false,
    });

    let scratchProgram: WebGLProgram | null = null;
    let scratchLocations: {
      resolution: WebGLUniformLocation | null;
      time: WebGLUniformLocation | null;
      colors: (WebGLUniformLocation | null)[];
    } | null = null;

    if (scratchGl) {
      try {
        scratchProgram = createProgram(scratchGl);
        const scratchPosition = scratchGl.getAttribLocation(scratchProgram, 'a_position');
        const scratchBuffer = scratchGl.createBuffer();

        scratchGl.bindBuffer(scratchGl.ARRAY_BUFFER, scratchBuffer);
        scratchGl.bufferData(
          scratchGl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          scratchGl.STATIC_DRAW,
        );
        scratchGl.useProgram(scratchProgram);
        scratchGl.enableVertexAttribArray(scratchPosition);
        scratchGl.vertexAttribPointer(scratchPosition, 2, scratchGl.FLOAT, false, 0, 0);
        scratchGl.viewport(0, 0, scratch.width, scratch.height);

        scratchLocations = {
          resolution: scratchGl.getUniformLocation(scratchProgram, 'u_resolution'),
          time: scratchGl.getUniformLocation(scratchProgram, 'u_time'),
          colors: [0, 1, 2, 3, 4].map((index) =>
            scratchGl.getUniformLocation(scratchProgram as WebGLProgram, `u_c${index}`),
          ),
        };
      } catch (error) {
        console.error('Warp ramp renderer failed to initialize:', error);
        scratchProgram = null;
      }
    }

    // One entry per distinct palette, not per surface: two cards on the same
    // ramp share a field.
    const rampCache = new Map<string, HTMLCanvasElement>();

    if (scratchGl && scratchProgram && scratchLocations) {
      setRampRenderer((ramp) => {
        const key = ramp.join('|');
        const cached = rampCache.get(key);
        if (cached) return cached;

        scratchGl.useProgram(scratchProgram as WebGLProgram);
        if (scratchLocations.resolution) {
          scratchGl.uniform2f(scratchLocations.resolution, scratch.width, scratch.height);
        }
        // A fixed instant, so the field a palette gets never depends on when
        // its surface happened to scroll into view.
        if (scratchLocations.time) {
          scratchGl.uniform1f(scratchLocations.time, RAMP_SAMPLE_TIME);
        }
        applyRamp(scratchGl, scratchLocations.colors, ramp);
        scratchGl.drawArrays(scratchGl.TRIANGLES, 0, 6);

        // Copied off the GL canvas because that canvas is about to be reused
        // for the next palette.
        const store = document.createElement('canvas');
        store.width = SCRATCH_WIDTH;
        store.height = SCRATCH_HEIGHT;
        const storeContext = store.getContext('2d', { alpha: false });
        if (!storeContext) return scratch;

        storeContext.drawImage(scratch, 0, 0);
        rampCache.set(key, store);
        return store;
      });
    }

    setSharedWarpSource(canvas);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery.addEventListener('change', start);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    start();

    return () => {
      disposed = true;
      stop();
      setRampRenderer(null);
      setSharedWarpSource(null);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery.removeEventListener('change', start);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="global-warp pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: '#24020b' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(145deg, #4d0d1c 0%, #330712 52%, #160106 100%)' }}
      />
      <canvas ref={canvasRef} data-warp-source="shared-webgl" className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ background: 'rgba(8, 0, 3, 0.24)' }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 16% 9%, rgba(255,255,255,0.07), transparent 34%), linear-gradient(118deg, rgba(255,255,255,0.03), transparent 27%, transparent 74%, rgba(255,255,255,0.025))',
        }}
      />
    </div>
  );
};

export default React.memo(GlobalBurgundyWarpBackground);
