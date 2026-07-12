import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/gh/devicons/devicon/icons/**" }] },
};

export default nextConfig;
