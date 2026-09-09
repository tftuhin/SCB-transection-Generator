import type { Metadata } from "next";
import localFont from "next/font/local";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://scb-transection-generator.vercel.app'),
  title: "SCB Transection Generator",
  description: "Create multiple transfer records and generate the bank Excel file.",
  openGraph: {
    title: "SCB Transection Generator",
    description: "Create multiple transfer records and generate the bank Excel file.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SCB Transection Generator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SCB Transection Generator",
    description: "Create multiple transfer records and generate the bank Excel file.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
