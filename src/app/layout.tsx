import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWARegistration } from "@/components/PWARegistration";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoalTracker — Compete with Friends",
  description: "Set goals, compete with friends, and hold each other accountable",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GoalTracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
          <meta name="theme-color" content="#4f46e5" />
        </head>
        <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <PWARegistration />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
