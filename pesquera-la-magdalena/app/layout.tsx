import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Pesquera La Magdalena", template: "%s · Pesquera La Magdalena" },
  description: "Control interno de ventas, fiados, abonos y caja.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon-512.png", apple: "/icon-512.png" },
  appleWebApp: { capable: true, title: "Pesquera", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#123a6e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
