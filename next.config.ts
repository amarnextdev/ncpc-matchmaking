import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Supabase Storage public-images bucket (logos, banners, project photos).
      // Private documents never go through next/image.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/public-images/**",
      },
    ],
  },
};

export default nextConfig;
