"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ThreeModule = typeof import("three");
export type HeroPointer = React.RefObject<{ x: number; y: number }>;

type HeroThreeProps = {
  /** Normalised pointer position in the range -0.5…0.5. */
  pointer: HeroPointer;
  /** Skip WebGL entirely when the visitor prefers reduced motion. */
  reduce?: boolean;
  className?: string;
};

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uDark;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
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
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.02 + 17.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;
    p += uPointer * 0.07;

    float t = uTime * 0.05;
    vec2 flow = vec2(
      fbm(p * 1.7 + vec2(t, -t * 0.6)),
      fbm(p * 1.7 + vec2(5.2, 1.3) - t)
    );
    float n = fbm(p * 2.25 + flow * 1.35 + vec2(-t * 0.7, t * 0.45));
    float bands = 0.5 + 0.5 * sin((p.y * 3.4 + n * 2.6) * 1.75 + uTime * 0.11);

    vec3 sage = vec3(0.729, 0.796, 0.643);
    vec3 olive = vec3(0.494, 0.651, 0.463);
    vec3 teal = vec3(0.361, 0.592, 0.620);
    vec3 sand = vec3(0.675, 0.561, 0.384);

    vec3 darkColor = mix(olive * 0.72, teal, bands * 0.55 + flow.x * 0.3);
    darkColor = mix(darkColor, sand, smoothstep(0.55, 1.0, flow.y) * 0.42);
    darkColor = mix(darkColor, sage, smoothstep(0.35, 0.92, n) * 0.52);

    vec3 lightColor = mix(vec3(0.87, 0.89, 0.82), olive * 1.18, bands * 0.5 + flow.x * 0.25);
    lightColor = mix(lightColor, vec3(0.79, 0.86, 0.83), smoothstep(0.4, 0.92, n) * 0.5);
    lightColor = mix(lightColor, vec3(0.9, 0.84, 0.71), smoothstep(0.55, 1.0, flow.y) * 0.38);

    vec3 color = mix(lightColor, darkColor, uDark);
    float radial = smoothstep(0.66, 0.08, length((vUv - 0.5) * vec2(1.0, 0.92)));
    float alpha = radial * mix(0.34, 0.78, uDark);
    alpha *= 0.5 + 0.5 * n;

    gl_FragColor = vec4(color, alpha);
  }
`;

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uDark;

  attribute vec3 aColor;
  attribute float aScale;
  attribute float aPhase;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float drift = uTime * 0.22;
    p.x += sin(drift + aPhase) * 0.075;
    p.y += cos(drift * 0.8 + aPhase * 1.35) * 0.1;
    p.z += sin(drift * 0.65 + aPhase * 0.7) * 0.09;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (19.0 / max(0.001, -mv.z));

    float twinkle = 0.55 + 0.45 * sin(uTime * 0.85 + aPhase * 2.6);
    float depthFade = smoothstep(-1.4, 1.4, p.z);

    vColor = mix(aColor * 0.4, aColor, uDark);
    vAlpha = twinkle * uOpacity * (0.55 + 0.45 * depthFade);
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceToCenter = length(centered);
    float alpha = smoothstep(0.5, 0.05, distanceToCenter);
    alpha *= alpha;

    if (alpha < 0.008) discard;

    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`;

function createScene(
  THREE: ThreeModule,
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  pointer: HeroPointer,
) {
  let dark = document.documentElement.classList.contains("dark");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0, 7.4);

  const scene = new THREE.Scene();

  const backgroundScene = new THREE.Scene();
  const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const backgroundUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uDark: { value: dark ? 1 : 0 },
    uAspect: { value: 1 },
  };

  const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
  const backgroundMaterial = new THREE.ShaderMaterial({
    uniforms: backgroundUniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  backgroundScene.add(new THREE.Mesh(backgroundGeometry, backgroundMaterial));

  const count = window.innerWidth < 640 ? 260 : 520;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);

  const palette = [
    new THREE.Color("#cfe0b8"),
    new THREE.Color("#9ec9b0"),
    new THREE.Color("#8fd0d6"),
    new THREE.Color("#e6c79a"),
    new THREE.Color("#eef6e5"),
  ];
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.45 + Math.pow(Math.random(), 0.62) * 2.15;
    positions[i * 3] = Math.cos(angle) * radius * 1.02;
    positions[i * 3 + 1] = Math.sin(angle) * radius * 1.22;
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * 1.15;

    color
      .copy(palette[i % palette.length])
      .lerp(palette[(i * 3 + 1) % palette.length], Math.random() * 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    scales[i] = Math.random() < 0.08 ? 3.4 + Math.random() * 1.4 : 1 + Math.random() * 2.2;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const particleUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uOpacity: { value: dark ? 0.92 : 0.52 },
    uDark: { value: dark ? 1 : 0 },
  };

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: PARTICLE_VERTEX_SHADER,
    fragmentShader: PARTICLE_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  const particleGroup = new THREE.Group();
  particleGroup.add(particles);
  scene.add(particleGroup);

  let pointerX = 0;
  let pointerY = 0;
  let elapsed = 0;
  let frame = 0;
  let running = false;
  let inView = true;
  let lastTime = 0;

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    backgroundUniforms.uAspect.value = width / height;
    particleUniforms.uPixelRatio.value = renderer.getPixelRatio();
  }

  function renderFrame(now: number) {
    if (!running) return;

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += delta;

    const targetX = pointer.current?.x ?? 0;
    const targetY = pointer.current?.y ?? 0;
    pointerX += (targetX - pointerX) * 0.055;
    pointerY += (targetY - pointerY) * 0.055;

    backgroundUniforms.uTime.value = elapsed;
    backgroundUniforms.uPointer.value.set(pointerX, -pointerY);
    particleUniforms.uTime.value = elapsed;

    camera.position.x = pointerX * 0.5;
    camera.position.y = -pointerY * 0.35;
    camera.lookAt(0, 0, 0);

    particleGroup.rotation.y = pointerX * 0.34 + elapsed * 0.03;
    particleGroup.rotation.x = -pointerY * 0.24 + Math.sin(elapsed * 0.2) * 0.04;
    particleGroup.rotation.z = elapsed * 0.012;

    renderer.clear();
    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);

    frame = window.requestAnimationFrame(renderFrame);
  }

  function start() {
    if (running || document.hidden || !inView) return;
    running = true;
    lastTime = performance.now();
    frame = window.requestAnimationFrame(renderFrame);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(frame);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      if (inView) start();
      else stop();
    },
    { rootMargin: "220px" },
  );
  intersectionObserver.observe(host);

  function onVisibilityChange() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  function applyTheme() {
    dark = document.documentElement.classList.contains("dark");
    backgroundUniforms.uDark.value = dark ? 1 : 0;
    particleUniforms.uDark.value = dark ? 1 : 0;
    particleUniforms.uOpacity.value = dark ? 0.92 : 0.52;
    particleMaterial.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    particleMaterial.needsUpdate = true;
  }

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  start();
  renderer.render(backgroundScene, backgroundCamera);
  renderer.render(scene, camera);
  canvas.style.opacity = "1";

  return () => {
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    themeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibilityChange);

    backgroundGeometry.dispose();
    backgroundMaterial.dispose();
    particleGeometry.dispose();
    particleMaterial.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function HeroThree({ pointer, reduce = false, className }: HeroThreeProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduce) return;

    const host = hostRef.current;
    if (!host) return;

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
    ) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const boot = () => {
      void import("three")
        .then((THREE) => {
          if (cancelled) return;
          const canvas = document.createElement("canvas");
          canvas.setAttribute("aria-hidden", "true");
          canvas.style.cssText = [
            "position:absolute",
            "inset:0",
            "display:block",
            "width:100%",
            "height:100%",
            "pointer-events:none",
            "opacity:0",
            "transition:opacity 1.1s ease",
            "-webkit-mask-image:linear-gradient(to right, transparent 0%, #000 13%, #000 87%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)",
            "mask-image:linear-gradient(to right, transparent 0%, #000 13%, #000 87%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)",
            "-webkit-mask-composite:source-in",
            "mask-composite:intersect",
          ].join(";");
          host.appendChild(canvas);
          try {
            cleanup = createScene(THREE, canvas, host, pointer);
          } catch {
            // Lost WebGL context or unsupported device: remove the blank canvas
            // and let the CSS gradient stand in.
            canvas.remove();
          }
        })
        .catch(() => {
          // WebGL unavailable or the chunk failed to load: keep the CSS fallback.
        });
    };

    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(boot, { timeout: 1800 });
    } else {
      timeoutHandle = setTimeout(boot, 350);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
      cleanup?.();
      cleanup = undefined;
    };
  }, [pointer, reduce]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn("pointer-events-none absolute -inset-5 -z-10 sm:-inset-8", className)}
    >
      <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_46%,rgba(126,166,118,0.26),rgba(92,151,158,0.14)_46%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_50%_46%,rgba(185,203,164,0.4),rgba(92,151,158,0.28)_42%,rgba(172,143,98,0.2)_62%,transparent_78%)]" />
    </div>
  );
}
