import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

const DesktopNav = dynamic(() => import("@/components/DesktopNav"), { ssr: false });

export const metadata: Metadata = {
  title: "Teatime — a walk away",
  description: "Find someone nearby for tea, coffee, a smoke, or lunch.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5f1ea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="w-full min-h-screen flex flex-col relative lg:pl-64">
          <DesktopNav />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
