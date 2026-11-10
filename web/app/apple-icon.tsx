import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#2A2A30",
          clipPath:
            "polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 110,
            height: 110,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 42,
              width: 52,
              height: 42,
              border: "6px solid #E07A2F",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 24,
              width: 42,
              height: 24,
              borderTop: "5px solid #E07A2F",
              borderRight: "5px solid #E07A2F",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 58,
              top: 28,
              width: 36,
              height: 36,
              borderTop: "5px solid #F4F0EA",
              borderRight: "5px solid #F4F0EA",
              borderTopRightRadius: 36,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 58,
              top: 28,
              width: 54,
              height: 54,
              borderTop: "5px solid #F4F0EA",
              borderRight: "5px solid #F4F0EA",
              borderTopRightRadius: 54,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 58,
              top: 28,
              width: 12,
              height: 12,
              background: "#E07A2F",
              borderRadius: 6,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
