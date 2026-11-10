import { ImageResponse } from "next/og";

export const alt = "RadarStock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#DEDEE2",
          padding: 64,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 108,
              height: 108,
              background: "#1F1F24",
              clipPath:
                "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                border: "6px solid #F4F0EA",
                borderRadius: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: "#E07A2F",
                  borderRadius: 16,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#1F1F24",
                textTransform: "uppercase",
              }}
            >
              RadarStock
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#E07A2F",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Gestão de estoque
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderTop: "4px solid #1F1F24",
            paddingTop: 28,
            maxWidth: 920,
          }}
        >
          <div style={{ fontSize: 30, color: "#1F1F24", lineHeight: 1.35 }}>
            Monorepo full-stack com Next.js, Express, Prisma e Zod — RBAC,
            alertas e relatórios.
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#5A5A66",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Showcase de engenharia para portfólio
          </div>
        </div>
      </div>
    ),
    size,
  );
}
