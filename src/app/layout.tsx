import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { FileSpreadsheet, Users } from "lucide-react";
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
          <aside className="w-64 bg-white border-r flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                  SCB
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 leading-tight">SCB Transection</h1>
                  <p className="text-[11px] text-gray-500 font-medium">Generator</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              <Link 
                href="/" 
                className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 mr-3" />
                Generator
              </Link>
              <Link 
                href="/vendors" 
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 mr-3" />
                Vendor Pool
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
