import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/reviews",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
