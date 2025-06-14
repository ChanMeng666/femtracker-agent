import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileNavigation from "@/components/MobileNavigation";
import { PerformancePanel } from "@/components/SimplePerformanceOptimizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "女性健康助手 - FemTracker",
  description: "专业的女性健康追踪和管理应用，提供周期跟踪、症状记录、营养指导、运动建议和健康洞察",
  keywords: "女性健康,月经周期,症状追踪,营养指导,运动建议,健康管理",
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
    <html lang="zh-CN">
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
        {/* 跳转链接 */}
        <div className="skip-links">
          <a
            href="#main-content"
            className="skip-link"
          >
            跳转到主要内容
          </a>
          <a
            href="#navigation"
            className="skip-link"
          >
            跳转到导航菜单
          </a>
        </div>
        
        {/* 实时通知区域 */}
        <div
          id="live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          role="status"
        />
        
        <div className="min-h-screen bg-background">
          <main id="main-content" role="main">
            {children}
          </main>
          <MobileNavigation />
          <PerformancePanel />
        </div>
      </body>
    </html>
  );
}
