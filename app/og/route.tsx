import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const alt = "Kushal Dahal — Full-Stack Engineer & Interaction Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET() {
  const settings = await getSettings();
  const nameParts = settings.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? settings.fullName;
  const lastName = nameParts.slice(1).join(" ");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#121110",
          color: "#ece8df",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -260,
            left: 300,
            width: 800,
            height: 800,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(185,203,164,0.22) 0%, rgba(185,203,164,0) 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(214,184,148,0.16) 0%, rgba(214,184,148,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: "#ece8df",
              color: "#121110",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            ✳
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 20, letterSpacing: "-0.02em" }}>
            kushal<span style={{ color: "#aaa297" }}>.dahal</span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 15,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#b9cba4",
            }}
          >
            portfolio · 2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, lineHeight: 0.98, letterSpacing: "-0.05em", fontWeight: 700 }}>
            {firstName}
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              fontFamily: "Georgia, serif",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {lastName || settings.fullName}
            <div style={{ width: 18, height: 18, borderRadius: 9999, background: "#b9cba4", marginTop: 30 }} />
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#aaa297", letterSpacing: "-0.01em" }}>
            {settings.title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #322e28",
            paddingTop: 26,
            fontSize: 17,
            color: "#aaa297",
          }}
        >
          <span>{settings.hometown} · working worldwide</span>
          <span style={{ color: "#b9cba4" }}>kushaldahal.dev</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
