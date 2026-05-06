import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image() {
    const siteConfig = await getSiteConfig();

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: "linear-gradient(130deg, #1a1536 0%, #2d2862 55%, #5851db 100%)",
                    color: "#f9f7ff",
                    padding: "64px",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "Arial",
                }}
            >
                <div
                    style={{
                        fontSize: 28,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        opacity: 0.85,
                    }}
                >
                    {siteConfig.name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "850px" }}>
                    <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>
                        {siteConfig.ownerName}
                    </div>
                    <div style={{ fontSize: 34, lineHeight: 1.2, opacity: 0.96 }}>{siteConfig.role}</div>
                </div>
                <div style={{ fontSize: 24, opacity: 0.85 }}>
                    Calm motion · Strong hierarchy · Conversion-oriented web experiences
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
