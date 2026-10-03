import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "I-Manage",
    short_name: "I-Manage",
    description: "The operating system for ambitious landlords and property teams.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#15231d",
    theme_color: "#15231d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  }
}
