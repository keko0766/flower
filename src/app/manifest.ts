import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ақ Гүл — доставка цветов в Алматы",
    short_name: "Ақ Гүл",
    start_url: "/ru",
    display: "standalone",
    background_color: "#FBF7F4",
    theme_color: "#E9BABC",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
