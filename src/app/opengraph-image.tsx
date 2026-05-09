import { ImageResponse } from "next/og";

export const alt = "To Do + AI — a tiny todo app with Claude-powered task breakdown.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "4px solid #000",
            paddingBottom: 20,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#000",
          }}
        >
          <span>To Do / AI</span>
          <span style={{ color: "#6b6b6b" }}>Test project · Isak</span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 220,
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: -8,
              textTransform: "uppercase",
              color: "#000",
            }}
          >
            To Dos
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            borderTop: "4px solid #000",
            marginTop: 30,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "22px 0",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#000",
              display: "flex",
            }}
          >
            A working list, broken down by Claude when it gets unwieldy.
          </div>
          <div
            style={{
              padding: "22px 28px",
              background: "#ffd1dc",
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#000",
              borderLeft: "4px solid #000",
              display: "flex",
              alignItems: "center",
            }}
          >
            AI ↳ Break
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
