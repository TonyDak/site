import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    const headers = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'; form-action 'self'; base-uri 'self'" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [{ source: "/admin/:path*", headers }, { source: "/api/admin/:path*", headers }];
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/gh/devicons/devicon/icons/**" }] },
};

export default nextConfig;
