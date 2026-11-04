import Image from "next/image";
import { Camera, Flag, Goal, Trophy } from "lucide-react";
import { Reveal } from "@/components/aceternity/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

const chipClass =
  "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/65";

const creditClass =
  "inline-flex max-w-[72%] items-center gap-1.5 truncate rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] text-white/65 backdrop-blur-sm transition-colors hover:text-white";

function CricketMark() {
  return (
    <svg viewBox="0 0 220 220" className="size-full" aria-hidden>
      <defs>
        <radialGradient id="cricket-ball" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#cf5a52" />
          <stop offset="52%" stopColor="#a2322d" />
          <stop offset="100%" stopColor="#571512" />
        </radialGradient>
        <linearGradient id="cricket-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe7a8" />
          <stop offset="55%" stopColor="#f0c45e" />
          <stop offset="100%" stopColor="#a97a25" />
        </linearGradient>
      </defs>
      <circle
        cx="110"
        cy="110"
        r="94"
        fill="none"
        stroke="url(#cricket-rim)"
        strokeWidth="1.6"
        strokeDasharray="2 9"
        opacity="0.75"
      />
      <circle cx="110" cy="110" r="72" fill="url(#cricket-ball)" stroke="#3b0f0c" strokeWidth="2" />
      <path
        d="M62 68 C 91 92, 129 130, 157 153"
        fill="none"
        stroke="#f8ead0"
        strokeWidth="2"
        strokeDasharray="2 6"
        opacity="0.8"
      />
      <path
        d="M74 55 C 103 82, 137 118, 164 147"
        fill="none"
        stroke="#f8ead0"
        strokeWidth="1.1"
        strokeDasharray="1 7"
        opacity="0.5"
      />
      <path
        d="M110 38 A72 72 0 0 1 182 110"
        fill="none"
        stroke="#f0c45e"
        strokeWidth="1.4"
        opacity="0.45"
      />
      <circle cx="74" cy="62" r="2.4" fill="#f0c45e" opacity="0.8" />
      <circle cx="148" cy="158" r="1.6" fill="#f0c45e" opacity="0.6" />
    </svg>
  );
}

function FootballMark() {
  return (
    <svg viewBox="0 0 220 220" className="size-full" aria-hidden>
      <defs>
        <linearGradient id="brazil-yellow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe97a" />
          <stop offset="55%" stopColor="#ffdf00" />
          <stop offset="100%" stopColor="#d8a900" />
        </linearGradient>
        <radialGradient id="brazil-green" cx="28%" cy="22%" r="88%">
          <stop offset="0%" stopColor="#149c55" />
          <stop offset="100%" stopColor="#04522c" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="110" r="94" fill="url(#brazil-green)" stroke="#ffdf00" strokeWidth="1.4" opacity="0.95" />
      <path d="M110 28 L192 110 L110 192 L28 110 Z" fill="url(#brazil-yellow)" opacity="0.95" />
      <circle cx="110" cy="110" r="45" fill="#002776" />
      <path
        d="M68 102 Q110 80 152 102"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M72 116 Q110 98 148 116"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="92" cy="124" r="2.2" fill="#ffffff" opacity="0.9" />
      <circle cx="112" cy="130" r="1.7" fill="#ffffff" opacity="0.8" />
      <circle cx="130" cy="123" r="1.4" fill="#ffffff" opacity="0.7" />
      <path d="M110 18 L113 26 L121 29 L113 32 L110 40 L107 32 L99 29 L107 26 Z" fill="#ffdf00" opacity="0.85" />
    </svg>
  );
}

export function SportingAllegiances() {
  return (
    <div className="mt-20 border-t border-border pt-16">
      <SectionHeading
        eyebrow="Sporting loyalties"
        title={
          <>
            Two teams I&apos;ll <span className="font-serif font-normal">stop for</span>.
          </>
        }
        description="Cricket and football are the two tabs that stay open on match days. One is a long conversation; the other is a sudden argument. I follow both."
      />

      <Reveal className="mt-10 grid gap-5 lg:grid-cols-2">
        <article
          className="group relative isolate flex flex-col overflow-hidden rounded-[2rem] border border-white/10 text-white shadow-[0_40px_90px_-70px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:-translate-y-1 hover:border-white/25"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, #0f5a39 0%, transparent 55%), radial-gradient(90% 80% at 100% 0%, #8a651c 0%, transparent 45%), linear-gradient(160deg, #061f17 0%, #0a2f22 55%, #051a13 100%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 z-20 h-[3px]"
            style={{ background: "linear-gradient(90deg,#007a4d,#ffb612,#de3831,#002395,#ffffff)" }}
          />

          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src="/images/sport/south-africa-cricket-team.webp"
              alt="The South Africa cricket team posing together on the field in 2008"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061f17] via-[#061f17]/15 to-black/25" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                <Trophy className="size-3 text-[#f0c45e]" /> Cricket
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/55 backdrop-blur-sm">
                RSA / 01
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
              <a
                href="https://commons.wikimedia.org/wiki/File:South_African_Cricket_team_2008.jpg"
                target="_blank"
                rel="noreferrer"
                className={creditClass}
                title="Photo: PaddyBriggs via Wikimedia Commons (public domain)"
              >
                <Camera className="size-2.5 shrink-0" /> PaddyBriggs · Public domain
              </a>
              <div className="size-12 shrink-0 drop-shadow-lg sm:size-14">
                <CricketMark />
              </div>
            </div>
          </div>

          <span className="pointer-events-none absolute -bottom-12 right-4 select-none font-serif text-[10rem] leading-none text-white/[0.04]">
            SA
          </span>

          <div className="relative flex flex-1 flex-col p-7 sm:p-9">
            <div className="max-w-md">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                The team I follow
              </p>
              <h3 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.035em] sm:text-5xl">
                South Africa
              </h3>
              <p className="mt-2 font-serif text-2xl italic text-[#f2cc74]">The Proteas</p>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
                Fast bowlers, sharp fielding and a habit of making a quiet afternoon feel like the
                last over of a final. I will always check the score.
              </p>
            </div>

            <div className="mt-auto pt-10">
              <div className="flex flex-wrap gap-2">
                <span className={chipClass}>Test cricket</span>
                <span className={chipClass}>Proteas</span>
                <span className={chipClass}>Green &amp; gold</span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <p className="text-[11px] text-white/45">Test cricket is the long conversation.</p>
                <Flag className="size-3.5 shrink-0 text-white/30" aria-hidden />
              </div>
            </div>
          </div>
        </article>

        <article
          className="group relative isolate flex flex-col overflow-hidden rounded-[2rem] border border-white/10 text-white shadow-[0_40px_90px_-70px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:-translate-y-1 hover:border-white/25"
          style={{
            background:
              "radial-gradient(100% 90% at 100% 0%, #1a6b3a 0%, transparent 50%), radial-gradient(80% 80% at 0% 100%, #1f3f8f 0%, transparent 45%), linear-gradient(155deg, #08251a 0%, #0b3322 55%, #061c14 100%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 z-20 h-[3px]"
            style={{ background: "linear-gradient(90deg,#009c3b,#ffdf00,#002776,#ffffff)" }}
          />

          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src="/images/sport/brazil-football-team.webp"
              alt="The Brazil national football team lined up before a match in yellow and blue"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08251a] via-[#08251a]/15 to-black/25" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                <Goal className="size-3 text-[#ffdf00]" /> Football
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/55 backdrop-blur-sm">
                BRA / 02
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
              <a
                href="https://commons.wikimedia.org/wiki/File:Brazil_national_Team_,photos_by_Hanson.jpg"
                target="_blank"
                rel="noreferrer"
                className={creditClass}
                title="Photo: Hanson K Joseph via Wikimedia Commons (CC BY-SA 4.0)"
              >
                <Camera className="size-2.5 shrink-0" /> Hanson K Joseph · CC BY-SA 4.0
              </a>
              <div className="size-12 shrink-0 drop-shadow-lg sm:size-14">
                <FootballMark />
              </div>
            </div>
          </div>

          <span className="pointer-events-none absolute -bottom-12 right-4 select-none font-serif text-[10rem] leading-none text-white/[0.04]">
            BRA
          </span>

          <div className="relative flex flex-1 flex-col p-7 sm:p-9">
            <div className="max-w-md">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                The team I follow
              </p>
              <h3 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.035em] sm:text-5xl">
                Brazil
              </h3>
              <p className="mt-2 font-serif text-2xl italic text-[#ffe27a]">A Seleção</p>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
                Yellow shirts, impossible first touches and the belief that the next attack can
                change everything. Football is better when it looks like they are enjoying it.
              </p>
            </div>

            <div className="mt-auto pt-10">
              <div className="flex flex-wrap gap-2">
                <span className={chipClass}>Seleção</span>
                <span className={chipClass}>World Cup</span>
                <span className={chipClass}>Joga bonito</span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <p className="text-[11px] text-white/45">Football is the sudden argument.</p>
                <Flag className="size-3.5 shrink-0 text-white/30" aria-hidden />
              </div>
            </div>
          </div>
        </article>
      </Reveal>
    </div>
  );
}
