import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own corner mask, so this stays square-edged.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #FF8A7A 0%, #FF6B5B 60%, #ED5545 100%)",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 256 256" fill="none">
          <path
            d="M128 24a80 80 0 0 0-80 80c0 57.5 68.5 118.4 74.4 123.5a8.7 8.7 0 0 0 11.2 0C139.5 222.4 208 161.5 208 104a80 80 0 0 0-80-80Z"
            fill="#FFFFFF"
          />
          <circle cx="128" cy="104" r="34" fill="#FF6B5B" />
        </svg>
      </div>
    ),
    size,
  );
}
