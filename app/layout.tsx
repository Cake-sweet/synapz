import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerProvider } from "@/components/synapz/ServiceWorkerProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Synapz - Daily Facts & Learning",
    template: "%s | Synapz",
  },
  description: "Discover interesting facts daily with gamification. Earn streaks, points, and expand your knowledge with text-to-speech learning.",
  keywords: ["Synapz", "learning", "facts", "education", "gamification", "streaks", "PWA"],
  authors: [{ name: "Synapz Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Synapz",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Synapz - Daily Facts & Learning",
    description: "Discover interesting facts daily with gamification",
    type: "website",
    siteName: "Synapz",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Synapz Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Synapz - Daily Facts & Learning",
    description: "Discover interesting facts daily with gamification",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-900 text-white`}
      >
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
        <Toaster />
      </body>
    </html>
  );
}
