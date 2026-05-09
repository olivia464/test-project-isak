import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffd1dc"
          strokeWidth="3.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <path d="M4 12 L10 18 L20 6" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
