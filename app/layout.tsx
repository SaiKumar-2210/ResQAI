import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResQAI | Emergency Decision Support",
  description:
    "Gemma-powered multimodal emergency decision support for floods, fires, earthquakes, cyclones, storms, and collapse events.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/resqai-icon.svg",
    apple: "/icons/icon-192.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
