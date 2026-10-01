import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same five-petal mark as icon.svg, rendered to PNG for iOS.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#E9BABC" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <g fill="#FBF7F4" transform="translate(32 32)">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-11" rx="7" ry="11" transform={`rotate(${r})`} />
            ))}
          </g>
          <circle cx="32" cy="32" r="5.5" fill="#B5646B" />
        </svg>
      </div>
    ),
    size,
  );
}
