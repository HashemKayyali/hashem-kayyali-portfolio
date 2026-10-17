// Verbatim V1 GLSL, recovered 13 October 2026. See docs/design/V1-SMOKE-PROVENANCE.md.
// Original fragment SHA-256: a378a6f85f61762e2c10ddd7561ec1bde7bb5a9fa97424eee93cd281fd5671bf
export const V1_FRAGMENT_SHADER = `
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
uniform float u_density;

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
  // Tightens the field so more of the pattern lands inside a surface that
  // would otherwise blow one soft patch up to cover itself.
  p *= u_density;

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

// Keep all geometry, five-octave noise and color-blending equations intact.
// Light paper has no dark vignette or additive grain. Palette is supplied as uniforms.
export const V1_EDITORIAL_FRAGMENT_SHADER = V1_FRAGMENT_SHADER.replace(
  /  float vignette = smoothstep\(1\.05, 0\.18, radial\);[\s\S]*?color \+= 0\.018 \* noise\(gl_FragCoord\.xy \* 0\.42 \+ u_time\);/,
  '  // Editorial finish: retain paper luminance and the original pigment folds.',
);
