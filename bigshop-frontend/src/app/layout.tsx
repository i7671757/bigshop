import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import QueryProvider from '@/providers/QueryProvider';
import Header from '@/components/Header';
import { ChatInterface } from '@/components/AIAssistant/ChatInterface';
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
  title: "BigShop - Интернет-магазин продуктов питания",
  description: "Современный интернет-магазин продуктов питания с быстрой доставкой",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ru">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
        >
          <QueryProvider>
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            {/* ИИ-Ассистент доступен на всех страницах */}
            <ChatInterface />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
