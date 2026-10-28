import { ADVECT, BLUR, CURL, DIVERGENCE, FIELD, GRADIENT, PRESSURE, SPLAT, VERTEX, VORTICITY } from "./shaders";

// Moving colour behind a site panel. The field is drawn at a fraction of the panel's
// resolution, blurred, dithered and stretched by CSS: soft and cheap. A small fluid
// simulation, stirred by the cursor and a slow ambient drift, pushes the field around.

export type FluidSettings = {
  colors: [string, string, string];
  stops: [number, number, number];
  motion: { speed: number; morph: number; flow: number };
  texture: { scale: number; octaves: number; warp: number };
  origin: { x: number; y: number };
  fade: { start: number; end: number; ease: [number, number, number, number]; fromBottom: boolean };
  chroma: number;
  fluid: { dissipation: number; curl: number; radius: number; force: number; ambient: number; distort: number; follow: number };
  render: { refHeight: number; scale: number; blur: number };
};

type Program = { p: WebGLProgram; u: (name: string) => WebGLUniformLocation | null };
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Double = { read: Target; write: Target; swap: () => void };

const SIM_H = 48;
const PRESSURE_ITERATIONS = 12;

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export class FluidField {
  private gl: WebGL2RenderingContext;
  private floatTargets: boolean;
  private progs: Record<"field" | "blur" | "advect" | "splat" | "curl" | "vorticity" | "divergence" | "pressure" | "gradient", Program>;
  private vao: WebGLVertexArrayObject;
  private scene: Target | null = null;
  private blurTmp: Target | null = null;
  private velocity: Double | null = null;
  private pressure: Double | null = null;
  private curl: Target | null = null;
  private divergence: Target | null = null;
  private still: WebGLTexture; // zero velocity, when float targets aren't available
  private heightScale = 1;
  private mobile = false;
  private time = 0;
  private last = 0;
  private raf = 0;
  private active = false;
  private pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, inside: false, engage: 0, moved: false };
  private resizeObs: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    private host: HTMLElement,
    private settings: FluidSettings,
  ) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.floatTargets = Boolean(gl.getExtension("EXT_color_buffer_float"));
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.progs = {
      field: this.program(FIELD),
      blur: this.program(BLUR),
      advect: this.program(ADVECT),
      splat: this.program(SPLAT),
      curl: this.program(CURL),
      vorticity: this.program(VORTICITY),
      divergence: this.program(DIVERGENCE),
      pressure: this.program(PRESSURE),
      gradient: this.program(GRADIENT),
    };
    this.still = this.texture(1, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    this.resize();
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(host);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  setActive(on: boolean) {
    this.active = on;
    if (on && !this.raf && document.visibilityState === "visible") {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  teardown() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObs.disconnect();
    window.removeEventListener("pointermove", this.onPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    // Free what we made, but keep the context usable: React can mount the same canvas again
    // (a lost context stays lost).
    const gl = this.gl;
    for (const p of Object.values(this.progs)) gl.deleteProgram(p.p);
    for (const t of [this.scene, this.blurTmp, this.curl, this.divergence, this.velocity?.read, this.velocity?.write, this.pressure?.read, this.pressure?.write]) this.free(t ?? null);
    gl.deleteTexture(this.still);
    gl.deleteVertexArray(this.vao);
  }

  // ---------- setup ----------

  private program(fragment: string): Program {
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`shader compile failed: ${gl.getShaderInfoLog(s) || `GL error ${gl.getError()}`}`);
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "program link failed");
    const cache = new Map<string, WebGLUniformLocation | null>();
    return { p, u: (name) => (cache.has(name) ? cache.get(name)! : (cache.set(name, gl.getUniformLocation(p, name)), cache.get(name)!)) };
  }

  private texture(w: number, h: number, internal: number, format: number, type: number) {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    return t;
  }

  private target(w: number, h: number, float: boolean): Target {
    const gl = this.gl;
    const tex = float ? this.texture(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT) : this.texture(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  }

  private double(w: number, h: number): Double {
    const d = { read: this.target(w, h, true), write: this.target(w, h, true), swap: () => ([d.read, d.write] = [d.write, d.read]) };
    return d;
  }

  private free(t: Target | null) {
    if (!t) return;
    this.gl.deleteTexture(t.tex);
    this.gl.deleteFramebuffer(t.fbo);
  }

  private resize = () => {
    const { render } = this.settings;
    const rect = this.host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    this.mobile = window.innerWidth <= 980;
    const dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 2);
    const scale = this.mobile ? Math.min(render.scale, 0.2) : render.scale;
    const w = Math.max(2, Math.round(rect.width * dpr * scale));
    const h = Math.max(2, Math.round(rect.height * dpr * scale));
    this.heightScale = Math.max(1, rect.height / render.refHeight);
    if (this.canvas.width === w && this.canvas.height === h && this.scene) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.free(this.scene);
    this.free(this.blurTmp);
    this.scene = this.target(w, h, false);
    this.blurTmp = this.target(w, h, false);
    if (this.floatTargets && !this.velocity) {
      const sw = Math.min(128, Math.max(16, Math.round((SIM_H * rect.width) / rect.height)));
      this.velocity = this.double(sw, SIM_H);
      this.pressure = this.double(sw, SIM_H);
      this.curl = this.target(sw, SIM_H, true);
      this.divergence = this.target(sw, SIM_H, true);
    }
    if (!this.raf) this.draw(); // a still frame, so a paused panel isn't empty
  };

  // ---------- input ----------

  private onPointer = (e: PointerEvent) => {
    const r = this.host.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    this.pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    if (!this.pointer.inside) return;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.moved = true;
  };

  private onVisibility = () => {
    if (document.visibilityState === "visible") this.setActive(this.active);
    else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  };

  // ---------- frame ----------

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.active || document.visibilityState !== "visible") return;
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;
    this.time += dt;
    this.simulate(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private bindTarget(t: Target | null) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fbo : null);
    gl.viewport(0, 0, t ? t.w : this.canvas.width, t ? t.h : this.canvas.height);
  }

  private use(p: Program) {
    this.gl.useProgram(p.p);
    return p;
  }

  private tex(unit: number, t: WebGLTexture, p: Program, name: string) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.uniform1i(p.u(name), unit);
  }

  private blit(t: Target | null) {
    this.bindTarget(t);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  private splat(x: number, y: number, fx: number, fy: number) {
    const v = this.velocity!;
    const p = this.use(this.progs.splat);
    this.gl.uniform2f(p.u("u_texel"), 1 / v.read.w, 1 / v.read.h);
    this.tex(0, v.read.tex, p, "u_target");
    this.gl.uniform2f(p.u("u_point"), x, y);
    this.gl.uniform2f(p.u("u_force"), fx, fy);
    this.gl.uniform1f(p.u("u_radius"), this.settings.fluid.radius / 100);
    this.gl.uniform1f(p.u("u_aspect"), v.read.w / v.read.h);
    this.blit(v.write);
    v.swap();
  }

  private simulate(dt: number) {
    const gl = this.gl;
    const v = this.velocity;
    if (!v || !this.pressure || !this.curl || !this.divergence) return;
    const f = this.settings.fluid;
    const texel = [1 / v.read.w, 1 / v.read.h] as const;

    // The cursor's movement stirs the field.
    const ptr = this.pointer;
    ptr.engage += ((ptr.inside ? 1 : 0) - ptr.engage) * Math.min(1, dt * 6);
    if (ptr.moved) {
      const dx = ptr.x - ptr.px;
      const dy = ptr.y - ptr.py;
      if (Math.abs(dx) + Math.abs(dy) > 1e-5 && Math.abs(dx) + Math.abs(dy) < 0.3) this.splat(ptr.x, ptr.y, dx * f.force, dy * f.force);
      ptr.px = ptr.x;
      ptr.py = ptr.y;
      ptr.moved = false;
    }
    // A slow ambient current so the water is never quite still.
    const t = this.time;
    const ax = 0.5 + 0.38 * Math.sin(t * 0.21);
    const ay = 0.35 + 0.25 * Math.sin(t * 0.17 + 1.3);
    this.splat(ax, ay, Math.cos(t * 0.37) * f.ambient * 6, Math.sin(t * 0.29) * f.ambient * 6);

    let p = this.use(this.progs.curl);
    gl.uniform2f(p.u("u_texel"), ...texel);
    this.tex(0, v.read.tex, p, "u_velocity");
    this.blit(this.curl);

    p = this.use(this.progs.vorticity);
    gl.uniform2f(p.u("u_texel"), ...texel);
    this.tex(0, v.read.tex, p, "u_velocity");
    this.tex(1, this.curl.tex, p, "u_curl");
    gl.uniform1f(p.u("u_strength"), f.curl);
    gl.uniform1f(p.u("u_dt"), dt);
    this.blit(v.write);
    v.swap();

    p = this.use(this.progs.divergence);
    gl.uniform2f(p.u("u_texel"), ...texel);
    this.tex(0, v.read.tex, p, "u_velocity");
    this.blit(this.divergence);

    p = this.use(this.progs.pressure);
    gl.uniform2f(p.u("u_texel"), ...texel);
    this.tex(1, this.divergence.tex, p, "u_divergence");
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      this.tex(0, this.pressure.read.tex, p, "u_pressure");
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    p = this.use(this.progs.gradient);
    gl.uniform2f(p.u("u_texel"), ...texel);
    this.tex(0, this.pressure.read.tex, p, "u_pressure");
    this.tex(1, v.read.tex, p, "u_velocity");
    this.blit(v.write);
    v.swap();

    p = this.use(this.progs.advect);
    gl.uniform2f(p.u("u_texel"), ...texel);
    this.tex(0, v.read.tex, p, "u_velocity");
    this.tex(1, v.read.tex, p, "u_source");
    gl.uniform1f(p.u("u_dt"), dt);
    gl.uniform1f(p.u("u_dissipation"), f.dissipation);
    this.blit(v.write);
    v.swap();
  }

  private draw() {
    const gl = this.gl;
    const s = this.settings;
    if (!this.scene || !this.blurTmp) return;
    const blur = this.mobile ? s.render.blur * 0.5 : s.render.blur;
    const direct = blur <= 0.05;

    const p = this.use(this.progs.field);
    gl.uniform2f(p.u("u_res"), this.canvas.width, this.canvas.height);
    gl.uniform1f(p.u("u_heightScale"), this.heightScale);
    gl.uniform1f(p.u("u_time"), this.time);
    gl.uniform1f(p.u("u_speed"), s.motion.speed);
    gl.uniform1f(p.u("u_morph"), s.motion.morph);
    gl.uniform1f(p.u("u_flow"), s.motion.flow);
    gl.uniform1f(p.u("u_scale"), s.texture.scale);
    gl.uniform1f(p.u("u_octaves"), s.texture.octaves);
    gl.uniform1f(p.u("u_warp"), s.texture.warp);
    gl.uniform2f(p.u("u_origin"), s.origin.x, s.origin.y);
    gl.uniform3f(p.u("u_c1"), ...rgb(s.colors[0]));
    gl.uniform3f(p.u("u_c2"), ...rgb(s.colors[1]));
    gl.uniform3f(p.u("u_c3"), ...rgb(s.colors[2]));
    gl.uniform3f(p.u("u_stops"), ...s.stops);
    gl.uniform1f(p.u("u_fadeStart"), s.fade.start);
    gl.uniform1f(p.u("u_fadeEnd"), s.fade.end);
    gl.uniform1f(p.u("u_fadeFromBottom"), s.fade.fromBottom ? 1 : 0);
    gl.uniform4f(p.u("u_ease"), ...s.fade.ease);
    this.tex(0, this.velocity ? this.velocity.read.tex : this.still, p, "u_velocity");
    gl.uniform1f(p.u("u_distort"), this.velocity ? s.fluid.distort : 0);
    gl.uniform1f(p.u("u_chroma"), this.velocity ? s.chroma : 0);
    gl.uniform1f(p.u("u_follow"), s.fluid.follow);
    gl.uniform1f(p.u("u_pointerOn"), this.pointer.engage);
    gl.uniform2f(p.u("u_pointer"), this.pointer.x, this.pointer.y);
    gl.uniform1f(p.u("u_dither"), direct ? 1 : 0);
    gl.disable(gl.BLEND);
    this.blit(direct ? null : this.scene);
    if (direct) return;

    const b = this.use(this.progs.blur);
    gl.uniform2f(b.u("u_texel"), 1 / this.canvas.width, 1 / this.canvas.height);
    gl.uniform1f(b.u("u_radius"), blur);
    this.tex(0, this.scene.tex, b, "u_tex");
    gl.uniform2f(b.u("u_dir"), 1, 0);
    gl.uniform1f(b.u("u_dither"), 0);
    this.blit(this.blurTmp);
    this.tex(0, this.blurTmp.tex, b, "u_tex");
    gl.uniform2f(b.u("u_dir"), 0, 1);
    gl.uniform1f(b.u("u_dither"), 1);
    this.blit(null);
  }
}
