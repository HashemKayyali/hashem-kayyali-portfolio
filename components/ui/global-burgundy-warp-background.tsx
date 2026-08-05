import React, { useEffect, useRef } from 'react';
import { publishSharedWarpFrame, setSharedWarpSource } from './burgundy-warp-runtime';

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

  vec3 deepest = vec3(0.075, 0.003, 0.020);
  vec3 deep = vec3(0.145, 0.012, 0.043);
  vec3 burgundy = vec3(0.302, 0.051, 0.110);
  vec3 lifted = vec3(0.455, 0.105, 0.190);
  vec3 wine = vec3(0.565, 0.165, 0.265);

  vec3 color = mix(deepest, deep, smoothstep(0.02, 0.46, field));
  color = mix(color, burgundy, smoothstep(0.25, 0.78, folds));
  color = mix(color, lifted, smoothstep(0.58, 0.98, folds + highlight * 0.22));
  color = mix(color, wine, highlight * 0.34);

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
    const positionBuffer = gl.createBuffer();

    if (!positionBuffer || !resolutionLocation || !timeLocation || positionLocation < 0) {
      gl.deleteProgram(program);
      return;
    }

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
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
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

    setSharedWarpSource(canvas);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery.addEventListener('change', start);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    start();

    return () => {
      disposed = true;
      stop();
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
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
