import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "myJournal - Personal Journal & Task Tracker",
  description: "A personal journal and task tracking application built with Next.js, TypeScript, and Tailwind CSS.",
  keywords: ["journal", "task tracker", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React"],
  authors: [{ name: "Development Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "myJournal",
    description: "Personal journal and task tracking with modern React stack",
    url: "https://example.com",
    siteName: "myJournal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "myJournal",
    description: "Personal journal and task tracking with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
