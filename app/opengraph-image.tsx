import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Notto — Distinctive, complete HTML pages";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoData = await readFile(join(process.cwd(), "public/notto-logo-negative.png"), "base64");
const logoSrc = `data:image/png;base64,${logoData}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#090909",
          padding: "96px",
        }}
      >
        <img src={logoSrc} width={360} height={90} alt="" />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            width: 64,
            height: 6,
            background: "#F36C20",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 42,
            lineHeight: 1.4,
            color: "#A2A8B2",
            maxWidth: 900,
          }}
        >
          Distinctive, complete HTML pages you can copy into any coding agent.
        </div>
      </div>
    ),
    { ...size },
  );
}
