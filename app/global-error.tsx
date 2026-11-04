"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121110",
          color: "#ece8df",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ color: "#b9cba4", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Critical error
          </p>
          <h1 style={{ fontSize: 28, marginTop: 12, letterSpacing: "-0.03em" }}>
            The site couldn&apos;t load.
          </h1>
          <p style={{ color: "#aaa297", fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>
            Something went wrong at the root of the application. Reloading usually helps.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              background: "#b9cba4",
              color: "#121110",
              border: "none",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
          {error.digest && (
            <p style={{ color: "#aaa297", fontSize: 10, marginTop: 16 }}>digest: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
