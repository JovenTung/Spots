import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spots",
    short_name: "Spots",
    description: "Track places you want to go and places you've been.",
    start_url: "/places",
    display: "standalone",
    background_color: "#F7F7F5",
    theme_color: "#F7F7F5",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
