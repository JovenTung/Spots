import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Supabase Storage signed URLs (visit photos)
      { protocol: "https", hostname: "*.supabase.co" },
      // Instagram post thumbnails (source_thumbnail_url)
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
};

export default nextConfig;
