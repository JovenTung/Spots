import type { NextConfig } from "next";

// Pin the image optimizer to this project's Supabase host only — a wildcard
// `*.supabase.co` would let unauthenticated clients relay arbitrary Supabase
// projects through /_next/image (cost/DoS amplification). Instagram thumbnails
// deliberately render with `unoptimized` and need no entry here.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/sign/photos/**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24, // signed URLs are reused for a week
  },
};

export default nextConfig;
