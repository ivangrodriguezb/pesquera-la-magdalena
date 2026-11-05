import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pesquera La Magdalena",
    short_name: "Pesquera",
    description: "Control de ventas, fiados, abonos y caja",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f7fb",
    theme_color: "#123a6e",
    lang: "es-CO",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
