import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import MobileNavigation from "@/components/MobileNavigation";
import { PerformancePanel } from "@/components/UnifiedPerformanceOptimizer";
import { AccessibilityProvider } from "@/components/AccessibilityEnhancements";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Women's Health Assistant - FemTracker",
  description: "Professional women's health tracking and management app, providing cycle tracking, symptom recording, nutrition guidance, exercise advice and health insights",
  keywords: "women's health,menstrual cycle,symptom tracking,nutrition guidance,exercise advice,health management",
  authors: [{ name: "FemTracker Team" }],
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FemTracker" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mobile-optimized pwa-app`}
      >
        {/* Skip links */}
        <div className="skip-links">
          <a
            href="#main-content"
            className="skip-link"
          >
            Skip to main content
          </a>
          <a
            href="#navigation"
            className="skip-link"
          >
            Skip to navigation menu
          </a>
        </div>
        
        {/* Live notification area */}
        <div
          id="live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          role="status"
        />
        
        <SessionProvider>
          <AuthGuard>
            <AccessibilityProvider>
              <div className="min-h-screen bg-background">
                <main id="main-content" role="main">
                  {children}
                </main>
                <MobileNavigation />
                <PerformancePanel />
              </div>
            </AccessibilityProvider>
          </AuthGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
