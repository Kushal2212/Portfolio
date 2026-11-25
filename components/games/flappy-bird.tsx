"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bird,
  Feather,
  Keyboard,
  MousePointerClick,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { saveBestScore, useBestScore } from "@/components/games/best-score";

const W = 480;
const H = 600;
const GROUND_H = 64;
const SKY_H = H - GROUND_H;
const BIRD_X = 132;
const BIRD_R = 13;
const GRAVITY = 1580;
const FLAP_VY = -430;
const MAX_FALL = 640;
const PIPE_W = 74;
const PIPE_SPACING = 252;
const PIPE_MARGIN = 72;
const GAP_START = 192;
const GAP_MIN = 138;

const BEST_KEY = "kd:arcade:flappy";

const COLORS = {
  cream: "#f1ece2",
  sage: "#b9cba4",
  sageDeep: "#7f9468",
  bamboo: "#9db386",
  bambooLight: "#c2d3ac",
  bambooDark: "#6f855c",
  leaf: "#8fa87a",
  beak: "#e2a05e",
  terrain: "#4d6742",
  accent: "#e07b6c",
};

type Pipe = { x: number; gapY: number; gapH: number; scored: boolean };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  rot: number;
  spin: number;
  size: number;
  leaf: boolean;
};

type Phase = "idle" | "running" | "paused" | "over";

type Flight = {
  phase: Phase;
  y: number;
  vy: number;
  rot: number;
  wing: number;
  pipes: Pipe[];
  particles: Particle[];
  score: number;
  elapsed: number;
  speed: number;
  ground: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const starRandom = mulberry32(25112026);
const STARS = Array.from({ length: 46 }, () => ({
  x: starRandom() * W,
  y: 16 + starRandom() * (SKY_H * 0.5),
  r: 0.5 + starRandom() * 1.15,
  alpha: 0.16 + starRandom() * 0.5,
  pulse: starRandom() * Math.PI * 2,
  speed: 0.7 + starRandom() * 1.1,
}));

const CLOUDS = [
  { x: 70, y: 118, scale: 1, drift: 6 },
  { x: 310, y: 76, scale: 0.68, drift: 10 },
  { x: 440, y: 158, scale: 0.52, drift: 14 },
  { x: 195, y: 196, scale: 0.42, drift: 18 },
];

function makePipe(x: number, score: number): Pipe {
  const gapH = Math.max(GAP_MIN, GAP_START - score * 2.4);
  const gapY = PIPE_MARGIN + Math.random() * (SKY_H - gapH - PIPE_MARGIN * 2);
  return { x, gapY, gapH, scored: false };
}

function ridgeY(x: number, offset: number, base: number, amp: number, phase: number) {
  return (
    base -
    amp *
      (0.55 +
        0.28 * Math.sin((x + offset) * 0.0085 + phase) +
        0.14 * Math.sin((x + offset) * 0.023 + phase * 1.6))
  );
}

function drawRidge(
  ctx: CanvasRenderingContext2D,
  offset: number,
  base: number,
  amp: number,
  color: string,
  phase: number,
) {
  ctx.beginPath();
  ctx.moveTo(0, SKY_H);
  for (let x = 0; x <= W; x += 8) {
    ctx.lineTo(x, ridgeY(x, offset, base, amp, phase));
  }
  ctx.lineTo(W, SKY_H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(241,236,226,0.09)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-26, 4, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(24, 5, 30, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  width: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.55, -width, length, 0);
  ctx.quadraticCurveTo(length * 0.55, width, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawCulm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (height <= 2) return;

  const body = ctx.createLinearGradient(x, 0, x + width, 0);
  body.addColorStop(0, COLORS.bamboo);
  body.addColorStop(0.42, COLORS.bambooLight);
  body.addColorStop(0.78, COLORS.bamboo);
  body.addColorStop(1, COLORS.bambooDark);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 11);
  ctx.fillStyle = body;
  ctx.fill();

  // Shaded right edge keeps the culm from reading as a flat block.
  ctx.beginPath();
  ctx.roundRect(x + width - 13, y + 6, 9, Math.max(0, height - 12), 6);
  ctx.fillStyle = "rgba(44,58,34,0.22)";
  ctx.fill();

  // Node rings every 46px.
  for (let node = y + 40; node < y + height - 12; node += 46) {
    ctx.strokeStyle = "rgba(239,244,229,0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, node);
    ctx.quadraticCurveTo(x + width / 2, node + 6, x + width - 2, node);
    ctx.stroke();

    ctx.strokeStyle = "rgba(52,68,40,0.34)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, node + 5);
    ctx.quadraticCurveTo(x + width / 2, node + 11, x + width - 2, node + 5);
    ctx.stroke();
  }

  // Soft highlight down the left side.
  const sheen = ctx.createLinearGradient(x + 4, 0, x + 20, 0);
  sheen.addColorStop(0, "rgba(255,255,255,0.24)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 8, 14, Math.max(0, height - 16), 7);
  ctx.fill();

  // Dusk light catches the left edge.
  const rim = ctx.createLinearGradient(x, 0, x + 9, 0);
  rim.addColorStop(0, "rgba(243,216,168,0.22)");
  rim.addColorStop(1, "rgba(243,216,168,0)");
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.roundRect(x, y + 14, 9, Math.max(0, height - 28), 5);
  ctx.fill();
  ctx.restore();

  // A couple of sprigs along the culm keep it reading as bamboo.
  if (height > 150) {
    drawLeaf(ctx, x + 3, y + height * 0.42, -2.3, 14, 3.4, COLORS.sageDeep);
    drawLeaf(ctx, x + width - 3, y + height * 0.62, -0.7, 15, 3.6, COLORS.leaf);
  }
}

function drawCap(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  const cap = ctx.createLinearGradient(x, 0, x + width, 0);
  cap.addColorStop(0, COLORS.bambooLight);
  cap.addColorStop(0.5, COLORS.bamboo);
  cap.addColorStop(1, COLORS.bambooDark);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, 23, 8);
  ctx.fillStyle = cap;
  ctx.fill();

  ctx.strokeStyle = "rgba(239,244,229,0.42)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 7);
  ctx.lineTo(x + width - 4, y + 7);
  ctx.stroke();
  ctx.restore();
}

function drawBambooGate(ctx: CanvasRenderingContext2D, pipe: Pipe) {
  const topHeight = pipe.gapY - 23;
  const bottomY = pipe.gapY + pipe.gapH;
  const bottomHeight = SKY_H - bottomY - 23;

  drawCulm(ctx, pipe.x, 0, PIPE_W, Math.max(0, topHeight));
  drawCap(ctx, pipe.x - 5, pipe.gapY - 23, PIPE_W + 10);

  drawCulm(ctx, pipe.x, bottomY + 23, PIPE_W, Math.max(0, bottomHeight));
  drawCap(ctx, pipe.x - 5, bottomY, PIPE_W + 10);

  // Leaf sprigs soften the gap edges.
  drawLeaf(ctx, pipe.x - 4, pipe.gapY - 28, -2.5, 20, 4.6, COLORS.leaf);
  drawLeaf(ctx, pipe.x + PIPE_W + 4, pipe.gapY - 32, -0.5, 17, 4.1, COLORS.bambooLight);
  drawLeaf(ctx, pipe.x + 6, bottomY + 30, 2.6, 18, 4.3, COLORS.leaf);
  drawLeaf(ctx, pipe.x + PIPE_W - 2, bottomY + 34, 0.7, 15, 3.7, COLORS.bambooDark);
  drawLeaf(ctx, pipe.x - 6, bottomY + 52, -2.9, 13, 3.4, COLORS.sageDeep);
}

function drawBird(ctx: CanvasRenderingContext2D, flight: Flight) {
  ctx.save();
  ctx.translate(BIRD_X, flight.y);
  ctx.rotate(flight.rot);

  // Tail feathers.
  ctx.beginPath();
  ctx.moveTo(-13, -2);
  ctx.lineTo(-25, -8);
  ctx.lineTo(-22, 2);
  ctx.closePath();
  ctx.fillStyle = COLORS.sageDeep;
  ctx.fill();

  // Body.
  const body = ctx.createLinearGradient(0, -15, 0, 15);
  body.addColorStop(0, "#dbe7c6");
  body.addColorStop(0.55, COLORS.sage);
  body.addColorStop(1, "#8ea478");
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // Belly.
  ctx.beginPath();
  ctx.ellipse(2, 5, 10, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(241,236,226,0.92)";
  ctx.fill();

  // Wing, flapping with the jump.
  const wing = Math.sin(flight.wing) * 0.7;
  ctx.save();
  ctx.translate(-1, 1);
  ctx.rotate(wing * 0.55);
  ctx.beginPath();
  ctx.ellipse(-1, 0, 9, 5.2, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.sageDeep;
  ctx.fill();
  ctx.strokeStyle = "rgba(40,48,31,0.28)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Beak.
  ctx.beginPath();
  ctx.moveTo(15, -2);
  ctx.lineTo(26, 1.5);
  ctx.lineTo(15, 5);
  ctx.closePath();
  ctx.fillStyle = COLORS.beak;
  ctx.fill();
  ctx.strokeStyle = "rgba(120,70,30,0.32)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eye and cheek.
  ctx.beginPath();
  ctx.arc(7, -4.5, 3.1, 0, Math.PI * 2);
  ctx.fillStyle = "#20261c";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8.1, -5.6, 1.05, 0, Math.PI * 2);
  ctx.fillStyle = "#f7f4ec";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2, -1, 2.7, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(224,123,108,0.2)";
  ctx.fill();

  ctx.restore();
}

function drawScene(ctx: CanvasRenderingContext2D, flight: Flight, calm: boolean) {
  ctx.clearRect(0, 0, W, H);

  const sky = ctx.createLinearGradient(0, 0, 0, SKY_H);
  sky.addColorStop(0, "#0c1514");
  sky.addColorStop(0.4, "#182722");
  sky.addColorStop(0.7, "#36412f");
  sky.addColorStop(0.88, "#74674a");
  sky.addColorStop(1, "#a3895f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, SKY_H);

  // Stars, thinning towards the warm horizon.
  for (const star of STARS) {
    const twinkle = calm ? 1 : 0.68 + 0.32 * Math.sin(flight.elapsed * star.speed + star.pulse);
    ctx.globalAlpha = star.alpha * twinkle * (1 - star.y / (SKY_H * 0.72));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.cream;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // A low sun with a wide dusk glow.
  const sunX = W * 0.74;
  const sunY = SKY_H * 0.76;
  const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 180);
  glow.addColorStop(0, "rgba(245,219,169,0.55)");
  glow.addColorStop(0.34, "rgba(240,196,132,0.2)");
  glow.addColorStop(1, "rgba(240,196,132,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, SKY_H);
  ctx.beginPath();
  ctx.arc(sunX, sunY, 27, 0, Math.PI * 2);
  ctx.fillStyle = "#f1d9a8";
  ctx.fill();

  for (const cloud of CLOUDS) {
    const drift = calm ? cloud.x : (cloud.x + flight.elapsed * cloud.drift) % (W + 240);
    drawCloud(ctx, drift - 120, cloud.y, cloud.scale);
  }

  const drift = calm ? 0 : flight.elapsed;
  drawRidge(ctx, drift * 7, SKY_H * 0.64, 76, "#1a2822", 0.9);
  drawRidge(ctx, drift * 14, SKY_H * 0.75, 60, "#22352a", 2.4);
  drawRidge(ctx, drift * 25, SKY_H * 0.87, 44, "#2b4231", 4.1);

  for (const pipe of flight.pipes) {
    drawBambooGate(ctx, pipe);
  }

  // Ground.
  const soil = ctx.createLinearGradient(0, SKY_H, 0, H);
  soil.addColorStop(0, "#3a5236");
  soil.addColorStop(0.16, "#26372a");
  soil.addColorStop(1, "#121a14");
  ctx.fillStyle = soil;
  ctx.fillRect(0, SKY_H, W, GROUND_H);
  ctx.fillStyle = COLORS.terrain;
  ctx.fillRect(0, SKY_H, W, 3);

  const tuftOffset = flight.ground % 28;
  ctx.strokeStyle = "rgba(185,203,164,0.32)";
  ctx.lineWidth = 1;
  for (let index = -1; index < W / 28 + 1; index += 1) {
    const x = index * 28 - tuftOffset;
    const height = 4 + ((index * 37) % 5);
    ctx.beginPath();
    ctx.moveTo(x, SKY_H + 6);
    ctx.quadraticCurveTo(x + 1, SKY_H + 6 - height, x + 3, SKY_H + 6 - height - 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6, SKY_H + 6);
    ctx.quadraticCurveTo(x + 7, SKY_H + 6 - height * 0.7, x + 9, SKY_H + 6 - height);
    ctx.stroke();
  }

  drawBird(ctx, flight);

  for (const particle of flight.particles) {
    ctx.globalAlpha = clamp(particle.life / particle.max, 0, 1);
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, particle.size, particle.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = particle.leaf ? COLORS.bambooLight : COLORS.cream;
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Warm horizon haze and a gentle vignette.
  const haze = ctx.createLinearGradient(0, SKY_H - 90, 0, SKY_H);
  haze.addColorStop(0, "rgba(196,150,96,0)");
  haze.addColorStop(1, "rgba(196,150,96,0.18)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, SKY_H - 90, W, 90);

  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
  vignette.addColorStop(0, "rgba(8,10,8,0)");
  vignette.addColorStop(1, "rgba(8,10,8,0.34)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function updateFlight(
  state: Flight,
  dt: number,
  onScore: (score: number) => void,
  onDie: (reason: string) => void,
) {
  state.elapsed += dt;
  state.speed = 138 + Math.min(36, state.score) * 2.3;

  state.vy = Math.min(MAX_FALL, state.vy + GRAVITY * dt);
  state.y += state.vy * dt;

  const targetRot = clamp(state.vy / MAX_FALL, -0.5, 0.85) * 0.95;
  state.rot += (targetRot - state.rot) * Math.min(1, dt * 9);
  state.wing += dt * (state.vy < 0 ? 22 : 7);

  if (state.y < BIRD_R + 6) {
    state.y = BIRD_R + 6;
    if (state.vy < 0) state.vy = 0;
  }

  if (state.y + BIRD_R * 0.85 >= SKY_H) {
    state.y = SKY_H - BIRD_R * 0.85;
    onDie("Down in the grass.");
    return;
  }

  for (const pipe of state.pipes) pipe.x -= state.speed * dt;
  state.ground += state.speed * dt;
  state.pipes = state.pipes.filter((pipe) => pipe.x + PIPE_W > -24);

  const last = state.pipes[state.pipes.length - 1];
  if (!last) {
    state.pipes.push(makePipe(W + 140, state.score));
  } else if (last.x < W - PIPE_SPACING) {
    state.pipes.push(makePipe(W + PIPE_W, state.score));
  }

  const birdLeft = BIRD_X - BIRD_R * 0.8;
  const birdRight = BIRD_X + BIRD_R * 0.9;
  const birdTop = state.y - BIRD_R * 0.8;
  const birdBottom = state.y + BIRD_R * 0.8;

  for (const pipe of state.pipes) {
    if (!pipe.scored && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
      pipe.scored = true;
      state.score += 1;
      onScore(state.score);
    }

    if (pipe.x < birdRight && pipe.x + PIPE_W > birdLeft) {
      if (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipe.gapH) {
        onDie("Clipped a bamboo gate.");
        return;
      }
    }
  }

  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 260 * dt;
    particle.rot += particle.spin * dt;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function HudCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#f1ece2]">{children}</p>
    </div>
  );
}

/**
 * Flappy Bird, themed as a dusk flight through bamboo gates. Same rules as the
 * arcade original: one bird, one life, and a personal best kept locally.
 */
export function FlappyBird({ active }: { active: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const activeRef = React.useRef(active);
  const calmRef = React.useRef(false);
  const storedBest = useBestScore(BEST_KEY);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [score, setScore] = React.useState(0);
  const [runs, setRuns] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [sessionBest, setSessionBest] = React.useState(0);

  const best = Math.max(storedBest, sessionBest);
  const level = 1 + Math.floor(score / 5);

  const flight = React.useRef<Flight>({
    phase: "idle",
    y: SKY_H / 2 - 24,
    vy: 0,
    rot: 0,
    wing: 0,
    pipes: [],
    particles: [],
    score: 0,
    elapsed: 0,
    speed: 138,
    ground: 0,
  });

  React.useEffect(() => {
    activeRef.current = active;
  }, [active]);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    calmRef.current = query.matches;
    const onChange = () => {
      calmRef.current = query.matches;
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Size the backing store for crisp text, then paint the idle scene once.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(ctx, flight.current, calmRef.current);
  }, []);

  const finish = React.useCallback((reason: string) => {
    const state = flight.current;
    if (state.phase === "over") return;
    state.phase = "over";
    setPhase("over");
    setMessage(reason);
    setSessionBest((value) => Math.max(value, state.score));
    saveBestScore(BEST_KEY, state.score);
  }, []);

  const start = React.useCallback(() => {
    const state = flight.current;
    state.phase = "running";
    state.y = SKY_H / 2 - 20;
    state.vy = -180;
    state.rot = -0.22;
    state.wing = 0;
    state.pipes = [makePipe(W + 150, 0)];
    state.particles = [];
    state.score = 0;
    state.elapsed = 0;
    state.speed = 138;
    state.ground = 0;

    setScore(0);
    setRuns((value) => value + 1);
    setMessage("Tap, click or press space to flap.");
    setPhase("running");
    canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const flap = React.useCallback(() => {
    const state = flight.current;
    if (state.phase !== "running") return;
    state.vy = FLAP_VY;
    state.wing = 0;

    if (calmRef.current) return;
    for (let index = 0; index < 4; index += 1) {
      const life = 0.4 + Math.random() * 0.3;
      state.particles.push({
        x: BIRD_X - 12,
        y: state.y + 7,
        vx: -45 - Math.random() * 85,
        vy: -35 + Math.random() * 80,
        life,
        max: life,
        rot: Math.random() * Math.PI,
        spin: -4 + Math.random() * 8,
        size: 2 + Math.random() * 2,
        leaf: false,
      });
    }
  }, []);

  const pause = React.useCallback(() => {
    const state = flight.current;
    if (state.phase !== "running") return;
    state.phase = "paused";
    setPhase("paused");
    setMessage("Paused");
  }, []);

  const resume = React.useCallback(() => {
    const state = flight.current;
    if (state.phase !== "paused") return;
    state.phase = "running";
    setPhase("running");
    setMessage("Back in the air.");
    canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const tap = React.useCallback(() => {
    if (flight.current.phase === "idle") start();
    else flap();
  }, [flap, start]);

  // Only runs while a flight is live; pausing or switching tabs freezes it.
  React.useEffect(() => {
    if (phase !== "running") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const state = flight.current;
      const raw = (now - last) / 1000;
      last = now;
      const dt = Math.min(raw, 1 / 30);

      if (activeRef.current && !document.hidden && state.phase === "running") {
        updateFlight(
          state,
          dt,
          (nextScore) => {
            setScore(nextScore);
            setMessage(`${nextScore} gate${nextScore === 1 ? "" : "s"} cleared.`);
          },
          finish,
        );
      }

      drawScene(ctx, state, calmRef.current);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [finish, phase]);

  // Space / arrows only while flying, so the rest of the site scrolls normally.
  React.useEffect(() => {
    if (phase !== "running") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === " " ||
        event.key === "ArrowUp" ||
        event.key === "w" ||
        event.key === "W"
      ) {
        event.preventDefault();
        flap();
      } else if (event.key === "Escape") {
        pause();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flap, pause, phase]);

  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)]">
        <div className="grid grid-cols-4 divide-x divide-white/10 border-b border-white/10 bg-[#171512]">
          <HudCell label="Score">{score}</HudCell>
          <HudCell label="Best">{best || "—"}</HudCell>
          <HudCell label="Level">{level}</HudCell>
          <HudCell label="Run">{runs || "—"}</HudCell>
        </div>

        <div className="relative bg-[#12110f]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            tabIndex={0}
            role="img"
            aria-label="Flappy bird play field. Press space, tap or click to flap through the bamboo gates."
            className="block h-auto w-full touch-none outline-none"
            onPointerDown={(event) => {
              event.preventDefault();
              tap();
            }}
          />

          <div className="arcade-scanlines" aria-hidden="true" />

          {phase === "running" && (
            <button
              type="button"
              onClick={pause}
              aria-label="Pause game"
              className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
            >
              <Pause className="size-3.5 fill-current" />
            </button>
          )}

          {phase !== "running" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0f0e0c]/78 px-6 text-center backdrop-blur-[2px]">
              {phase === "idle" && (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full border border-[#b9cba4]/30 bg-[#b9cba4]/10 text-[#b9cba4]">
                    <Bird className="size-5" />
                  </span>
                  <div>
                    <p className="font-serif text-2xl text-[#f1ece2]">Flappy bird</p>
                    <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/60">
                      A dusk flight through bamboo gates. One bird, no lives, endless road — keep
                      climbing as the gaps tighten.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
                    <span className="rounded-full border border-white/15 px-2 py-1">1 life</span>
                    <span className="rounded-full border border-white/15 px-2 py-1">endless</span>
                    <span className="rounded-full border border-white/15 px-2 py-1">+1 per gate</span>
                  </div>
                  <button
                    type="button"
                    onClick={start}
                    className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#b9cba4] px-5 py-2.5 text-sm font-semibold text-[#1b2015] transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    <Play className="size-4 fill-current" /> Take off
                  </button>
                  <p className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <Keyboard className="size-3" /> Space or ↑ to flap · Esc pauses
                  </p>
                </>
              )}

              {phase === "paused" && (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80">
                    <Pause className="size-5" />
                  </span>
                  <div>
                    <p className="font-serif text-2xl text-[#f1ece2]">Paused</p>
                    <p className="mt-2 text-xs text-white/55">The bamboo waits.</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={resume}
                      className="inline-flex items-center gap-2 rounded-full bg-[#b9cba4] px-4 py-2 text-sm font-semibold text-[#1b2015] transition-transform hover:scale-[1.03] active:scale-95"
                    >
                      <Play className="size-3.5 fill-current" /> Resume
                    </button>
                    <button
                      type="button"
                      onClick={start}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
                    >
                      <RotateCcw className="size-3.5" /> Restart
                    </button>
                  </div>
                </>
              )}

              {phase === "over" && (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full border border-[#b9cba4]/30 bg-[#b9cba4]/10 text-[#b9cba4]">
                    <Trophy className="size-5" />
                  </span>
                  <div>
                    <p className="font-serif text-2xl text-[#f1ece2]">Run over</p>
                    <p className="mt-1 text-xs text-white/55">{message}</p>
                    <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-[#f1ece2]">
                      {score}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      {score} {score === 1 ? "gate" : "gates"} cleared
                      {best > 0 ? ` · best ${best}` : ""}
                    </p>
                  </div>

                  {score > 0 && score >= best && (
                    <p className="inline-flex items-center gap-1.5 rounded-full border border-[#b9cba4]/25 bg-[#b9cba4]/10 px-2.5 py-1 text-[11px] font-medium text-[#b9cba4]">
                      <Feather className="size-3" /> New best flight
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={start}
                      className="inline-flex items-center gap-2 rounded-full bg-[#b9cba4] px-4 py-2 text-sm font-semibold text-[#1b2015] transition-transform hover:scale-[1.03] active:scale-95"
                    >
                      <RotateCcw className="size-3.5" /> Fly again
                    </button>
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
                    >
                      The stack <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MousePointerClick className="size-3.5" />
          <kbd className="arcade-kbd">Space</kbd>
          <kbd className="arcade-kbd">↑</kbd>
          or tap to flap
        </span>
        <span className="flex items-center gap-1.5">
          <Feather className="size-3.5" /> One touch ends the run
        </span>
        <span>Esc pauses</span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
