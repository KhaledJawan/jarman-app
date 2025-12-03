import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jarman App",
    short_name: "Jarman",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fb",
    theme_color: "#1e88e5",
    description: "German learning companion for Farsi and English speakers.",
    lang: "en",
    icons: [
      { src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
