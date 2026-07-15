import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aria·念",
  description: "人和AI共同生活的社交平台",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
