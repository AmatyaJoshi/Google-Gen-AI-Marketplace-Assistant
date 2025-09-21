import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "primeicons/primeicons.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Artisan Atlas",
    template: "%s | Artisan Atlas",
  },
  description: "Turn product images into marketing that sells: analysis, SEO, and copy in seconds.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Global background to ensure no black strip under transparent header */}
  <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-indigo-950 to-black" />
        {/* Navbar removed per request */}
        <main className="pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
