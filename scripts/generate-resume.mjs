/**
 * Builds a one-page resume PDF with no external dependencies.
 * Usage: node scripts/generate-resume.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(root, "public/resume.pdf");

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = [0.12, 0.11, 0.1];
const MUTED = [0.38, 0.37, 0.35];
const ACCENT = [0.44, 0.65, 0.12];

const escapeText = (text) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7e]/g, "");

const ops = [];
const text = (value, x, y, { font = "F1", size = 9.5, color = INK } = {}) => {
  ops.push(
    `BT /${font} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapeText(value)}) Tj ET`,
  );
};

const rule = (y, { color = [0.86, 0.85, 0.82], width = 0.7 } = {}) => {
  ops.push(
    `${color[0]} ${color[1]} ${color[2]} RG ${width} w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`,
  );
};

const approxWidth = (value, size, font = "F1") => {
  const factor = font === "F2" ? 0.56 : 0.505;
  return value.length * size * factor;
};

const rightText = (value, y, { font = "F1", size = 9, color = MUTED } = {}) => {
  text(value, PAGE_W - MARGIN - approxWidth(value, size, font), y, { font, size, color });
};

const wrap = (value, maxWidth, size, font = "F1") => {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (approxWidth(candidate, size, font) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const paragraph = (value, y, { size = 9.4, leading = 13, color = INK, width = CONTENT_W } = {}) => {
  for (const line of wrap(value, width, size)) {
    text(line, MARGIN, y, { size, color });
    y -= leading;
  }
  return y;
};

const bullet = (value, y, { size = 9.2, leading = 12.4 } = {}) => {
  const lines = wrap(value, CONTENT_W - 12, size);
  text("-", MARGIN, y, { size, color: ACCENT });
  for (const line of lines) {
    text(line, MARGIN + 11, y, { size, color: INK });
    y -= leading;
  }
  return y;
};

const sectionTitle = (title, y) => {
  text(title.toUpperCase(), MARGIN, y, { font: "F2", size: 8.4, color: ACCENT });
  rule(y - 5);
  return y - 19;
};

const role = (title, company, dates, y) => {
  text(title, MARGIN, y, { font: "F2", size: 10.4 });
  rightText(dates, y, { size: 8.8 });
  text(company, MARGIN, y - 12.5, { size: 9, color: MUTED });
  return y - 25;
};

// ── Header ────────────────────────────────────────────────────────────────
let y = PAGE_H - MARGIN - 8;
text("KUSHAL DAHAL", MARGIN, y, { font: "F2", size: 25 });
rightText("Kathmandu, Nepal", y + 2, { size: 9 });
text("Full-stack engineer & interaction designer", MARGIN, y - 17, { font: "F3", size: 11.5, color: MUTED });
y -= 34;
text("hello@kushaldahal.dev  |  kushaldahal.dev  |  github.com/kushaldahal  |  linkedin.com/in/kushaldahal", MARGIN, y, {
  size: 8.8,
  color: MUTED,
});
y -= 13;
ops.push(`${ACCENT[0]} ${ACCENT[1]} ${ACCENT[2]} RG 2 w ${MARGIN} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`);
y -= 22;

// ── Profile ───────────────────────────────────────────────────────────────
y = paragraph(
  "I build calm, fast product interfaces end to end: data model, API, design system and the last 10% of polish. Eight years across startups and studios, mostly with TypeScript, React, Next.js and PostgreSQL. I care about accessibility, performance budgets and motion that earns its place.",
  y,
);
y -= 12;

// ── Experience ────────────────────────────────────────────────────────────
y = sectionTitle("Experience", y);

y = role("Independent product engineer", "Studio practice - Kathmandu / remote", "2022 - Present", y);
y = bullet("Design and ship full-stack products for small teams: Next.js App Router front ends, PostgreSQL data models, auth, billing and deployment.", y);
y = bullet("Built and maintain Lumen UI, an open-source component library with 2.1k GitHub stars and 40k monthly npm downloads.", y);
y = bullet("Lead interface work for Atlas, a trail-planning app used by 12k hikers; cut time-to-first-route from 48s to 9s.", y);
y -= 5;

y = role("Senior frontend engineer", "Lumen Labs", "2020 - 2022", y);
y = bullet("Owned the design system and marketing site; introduced visual regression tests and a token pipeline adopted by four product teams.", y);
y = bullet("Rebuilt the analytics dashboard in React and Recharts, reducing initial bundle size by 38% and improving LCP from 3.4s to 1.6s.", y);
y = bullet("Mentored three engineers and ran a fortnightly interface critique that became a company ritual.", y);
y -= 5;

y = role("Frontend engineer", "Himalayan Digital", "2018 - 2020", y);
y = bullet("Delivered responsive commerce and editorial sites for regional clients, from Figma handoff to production monitoring.", y);
y = bullet("Created the agency's accessibility checklist and trained the team on keyboard and screen-reader testing.", y);
y -= 10;

// ── Selected work ─────────────────────────────────────────────────────────
y = sectionTitle("Selected work", y);

const work = [
  [
    "Lumen UI",
    "Open-source React component library. Headless primitives, accessible defaults, 2.1k stars.",
  ],
  [
    "Atlas",
    "Trail planning for the Himalaya. Offline-first maps, elevation profiles, shareable routes.",
  ],
  [
    "This portfolio",
    "Next.js 16, Prisma, custom auth and a small analytics pipeline. Built to be read, not just viewed.",
  ],
];
for (const [name, description] of work) {
  text(name, MARGIN, y, { font: "F2", size: 9.4 });
  const lines = wrap(description, CONTENT_W - 110, 9, "F1");
  let lineY = y;
  for (const line of lines) {
    text(line, MARGIN + 110, lineY, { size: 9, color: MUTED });
    lineY -= 11.5;
  }
  y = Math.min(y - 13, lineY - 2);
  y -= 2;
}
y -= 4;

// ── Skills ────────────────────────────────────────────────────────────────
y = sectionTitle("Skills", y);
const skills = [
  ["Product", "TypeScript, React, Next.js, Tailwind CSS, Framer Motion, accessibility"],
  ["Backend", "Node.js, PostgreSQL, Prisma, REST, tRPC, auth, background jobs"],
  ["Craft", "Design systems, prototyping, typography, motion, performance budgets"],
  ["Tools", "Figma, Git, Vercel, Playwright, Vitest, Sentry, Linear"],
];
for (const [label, value] of skills) {
  text(label, MARGIN, y, { font: "F2", size: 9.2 });
  const lines = wrap(value, CONTENT_W - 70, 9.1);
  let lineY = y;
  for (const line of lines) {
    text(line, MARGIN + 70, lineY, { size: 9.1, color: INK });
    lineY -= 11.5;
  }
  y = lineY - 2;
}
y -= 6;

// ── Education ─────────────────────────────────────────────────────────────
y = sectionTitle("Education", y);
text("B.Sc. Computer Science", MARGIN, y, { font: "F2", size: 9.6 });
rightText("2014 - 2018", y, { size: 8.8 });
text("Tribhuvan University, Kathmandu", MARGIN, y - 12, { size: 9, color: MUTED });
y -= 32;

// ── Footer ────────────────────────────────────────────────────────────────
rule(PAGE_H - MARGIN - 8, { color: [0.86, 0.85, 0.82] });
text("References and a longer case-study deck available on request.", MARGIN, PAGE_H - MARGIN - 22, {
  size: 8.2,
  color: MUTED,
});
rightText("kushaldahal.dev", PAGE_H - MARGIN - 22, { size: 8.2 });

// ── Assemble PDF ──────────────────────────────────────────────────────────
const content = ops.join("\n");
const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 4 0 R >>`,
  `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefStart = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, Buffer.from(pdf, "latin1"));
console.log(`Wrote ${outFile} (${Buffer.byteLength(pdf, "latin1")} bytes, 1 page)`);
