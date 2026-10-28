// GLSL for the panel backgrounds (lib/fluid/engine.ts). WebGL2 / GLSL ES 3.00.

// Fullscreen triangle pair from gl_VertexID: no vertex buffers needed.
export const VERTEX = `#version 300 es
void main() {
  vec2 p[6] = vec2[6](vec2(-1,-1), vec2(1,-1), vec2(-1,1), vec2(-1,1), vec2(1,-1), vec2(1,1));
  gl_Position = vec4(p[gl_VertexID], 0.0, 1.0);
}`;

// Interleaved gradient noise: a per-pixel offset under 1/255 that hides 8-bit banding.
const DITHER = `
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }`;

// The coloured field: layered value noise, warped into itself, drifting outward from an
// origin just above the top edge on a seamless two-phase loop, pushed around by the fluid
// velocity, mapped onto a three-stop gradient and faded towards one edge.
export const FIELD = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_heightScale;
uniform float u_time;
uniform float u_speed, u_morph, u_flow, u_scale, u_octaves, u_warp;
uniform vec2 u_origin;
uniform vec3 u_c1, u_c2, u_c3;
uniform vec3 u_stops;
uniform float u_fadeStart, u_fadeEnd, u_fadeFromBottom;
uniform vec4 u_ease;
uniform sampler2D u_velocity;
uniform float u_distort, u_chroma, u_follow, u_pointerOn;
uniform vec2 u_pointer;
uniform float u_dither;
out vec4 fragColor;
${DITHER}

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  return n * n;
}
const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
float fbm(vec2 p) {
  int octaves = int(u_octaves + 0.5);
  float sum = 0.0, norm = 0.0, w = 0.5;
  p += u_time * u_morph;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    sum += w * vnoise(p);
    norm += w;
    p = ROT * p * 2.02;
    w *= 0.5;
  }
  return sum / max(norm, 1e-4);
}
float warped(vec2 p) { return fbm(p + u_warp * fbm(p + u_warp * fbm(p))); }

// Two samples half a cycle apart, cross-faded, so the outward drift loops without a seam.
float shadeAt(vec2 d) {
  vec2 dir = d / max(length(d), 1e-4);
  float t = u_time * u_speed;
  float a = fract(t), b = fract(t + 0.5);
  float s = mix(warped(d * u_scale - dir * a * u_flow), warped(d * u_scale - dir * b * u_flow), abs(1.0 - 2.0 * a));
  return clamp(s, 0.0, 1.0);
}

vec3 gradient3(float t) {
  vec3 ab = mix(u_c1, u_c2, clamp((t - u_stops.x) / max(u_stops.y - u_stops.x, 1e-4), 0.0, 1.0));
  return mix(ab, u_c3, clamp((t - u_stops.y) / max(u_stops.z - u_stops.y, 1e-4), 0.0, 1.0));
}

// CSS cubic-bezier(x1, y1, x2, y2) at t: Newton-solve x(s) = t, return y(s).
float bez(float s, float a, float b) { float i = 1.0 - s; return 3.0 * i * i * s * a + 3.0 * i * s * s * b + s * s * s; }
float bezD(float s, float a, float b) { float i = 1.0 - s; return 3.0 * i * i * a + 6.0 * i * s * (b - a) + 3.0 * s * s * (1.0 - b); }
float ease(float t, vec4 e) {
  float s = t;
  for (int k = 0; k < 5; k++) s = clamp(s - (bez(s, e.x, e.z) - t) / max(bezD(s, e.x, e.z), 1e-3), 0.0, 1.0);
  return bez(s, e.y, e.w);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  // Taller panels show more of the field at the same grain, rather than a zoomed-in one.
  vec2 d = (uv - u_origin) * vec2(aspect, 1.0) * u_heightScale;

  vec2 vel = texture(u_velocity, uv).xy;
  d += vel * u_distort;
  if (u_pointerOn > 0.0) {
    vec2 toP = (u_pointer - uv) * vec2(aspect, 1.0);
    d += toP * u_follow * u_pointerOn * exp(-dot(toP, toP) * 10.0);
  }
  float g = shadeAt(d);

  // Colour fringe along the flow, strongest where it moves fastest.
  float r = g, b = g;
  if (u_chroma > 0.0) {
    float speed = length(vel);
    vec2 off = vel / max(speed, 1e-5) * min(speed * 0.02, 0.06) * u_chroma;
    float dg = (dFdx(g) * off.x + dFdy(g) * off.y) * (u_res.y / u_heightScale);
    r = clamp(g + dg, 0.0, 1.0);
    b = clamp(g - dg, 0.0, 1.0);
  }
  vec3 col = vec3(gradient3(r).r, gradient3(g).g, gradient3(b).b);

  float axis = (u_fadeFromBottom > 0.5 ? uv.y : 1.0 - uv.y) * u_heightScale;
  float end = min(u_fadeEnd, u_heightScale);
  float alpha = 1.0 - ease(clamp((axis - u_fadeStart) / max(end - u_fadeStart, 1e-4), 0.0, 1.0), u_ease);

  vec4 outc = vec4(col * alpha, alpha); // premultiplied
  if (u_dither > 0.5) outc += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = outc;
}`;

// Separable 9-tap gaussian in 5 linear samples. The vertical pass writes the canvas and
// dithers last, so the blur doesn't smooth the dither away.
export const BLUR = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_texel;
uniform vec2 u_dir;
uniform float u_radius;
uniform float u_dither;
out vec4 fragColor;
${DITHER}
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  float s = u_radius * 0.25;
  vec2 o1 = u_dir * u_texel * 1.3846153846 * s;
  vec2 o2 = u_dir * u_texel * 3.2307692308 * s;
  vec4 c = texture(u_tex, uv) * 0.2270270270
    + (texture(u_tex, uv + o1) + texture(u_tex, uv - o1)) * 0.3162162162
    + (texture(u_tex, uv + o2) + texture(u_tex, uv - o2)) * 0.0702702703;
  if (u_dither > 0.5) c += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = c;
}`;

// ---- Fluid (stable fluids on a small grid: the cursor stirs, the field follows) ----

const SIM = `#version 300 es
precision highp float;
uniform vec2 u_texel;
out vec4 fragColor;
`;

export const ADVECT = `${SIM}
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform float u_dt;
uniform float u_dissipation;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  vec2 back = uv - u_dt * texture(u_velocity, uv).xy * u_texel;
  fragColor = u_dissipation * texture(u_source, back);
}`;

export const SPLAT = `${SIM}
uniform sampler2D u_target;
uniform vec2 u_point;
uniform vec2 u_force;
uniform float u_radius;
uniform float u_aspect;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  vec2 p = uv - u_point;
  p.x *= u_aspect;
  fragColor = vec4(texture(u_target, uv).xy + u_force * exp(-dot(p, p) / u_radius), 0.0, 1.0);
}`;

export const CURL = `${SIM}
uniform sampler2D u_velocity;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  float l = texture(u_velocity, uv - vec2(u_texel.x, 0)).y, r = texture(u_velocity, uv + vec2(u_texel.x, 0)).y;
  float b = texture(u_velocity, uv - vec2(0, u_texel.y)).x, t = texture(u_velocity, uv + vec2(0, u_texel.y)).x;
  fragColor = vec4(0.5 * (r - l - t + b), 0.0, 0.0, 1.0);
}`;

export const VORTICITY = `${SIM}
uniform sampler2D u_velocity;
uniform sampler2D u_curl;
uniform float u_strength;
uniform float u_dt;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  float l = texture(u_curl, uv - vec2(u_texel.x, 0)).x, r = texture(u_curl, uv + vec2(u_texel.x, 0)).x;
  float b = texture(u_curl, uv - vec2(0, u_texel.y)).x, t = texture(u_curl, uv + vec2(0, u_texel.y)).x;
  float c = texture(u_curl, uv).x;
  vec2 f = vec2(abs(t) - abs(b), abs(r) - abs(l));
  f = f / (length(f) + 1e-5) * u_strength * c;
  f.y = -f.y;
  fragColor = vec4(texture(u_velocity, uv).xy + f * u_dt, 0.0, 1.0);
}`;

export const DIVERGENCE = `${SIM}
uniform sampler2D u_velocity;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  float l = texture(u_velocity, uv - vec2(u_texel.x, 0)).x, r = texture(u_velocity, uv + vec2(u_texel.x, 0)).x;
  float b = texture(u_velocity, uv - vec2(0, u_texel.y)).y, t = texture(u_velocity, uv + vec2(0, u_texel.y)).y;
  fragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}`;

export const PRESSURE = `${SIM}
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  float l = texture(u_pressure, uv - vec2(u_texel.x, 0)).x, r = texture(u_pressure, uv + vec2(u_texel.x, 0)).x;
  float b = texture(u_pressure, uv - vec2(0, u_texel.y)).x, t = texture(u_pressure, uv + vec2(0, u_texel.y)).x;
  fragColor = vec4((l + r + b + t - texture(u_divergence, uv).x) * 0.25, 0.0, 0.0, 1.0);
}`;

export const GRADIENT = `${SIM}
uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
void main() {
  vec2 uv = gl_FragCoord.xy * u_texel;
  float l = texture(u_pressure, uv - vec2(u_texel.x, 0)).x, r = texture(u_pressure, uv + vec2(u_texel.x, 0)).x;
  float b = texture(u_pressure, uv - vec2(0, u_texel.y)).x, t = texture(u_pressure, uv + vec2(0, u_texel.y)).x;
  fragColor = vec4(texture(u_velocity, uv).xy - 0.5 * vec2(r - l, t - b), 0.0, 1.0);
}`;
