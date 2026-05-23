import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Provider - Lead Distribution System",
  description: "Distribute service leads fairly to providers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.svg" 
                alt="Provider Logo" 
                width={40} 
                height={40}
                className="hover:opacity-80 transition-opacity"
              />
              <span className="text-xl font-bold text-gray-900">Provider</span>
            </Link>
            <div className="flex gap-8 items-center">
              <Link
                href="/request-service"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Public Form
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Provider Dashboard
              </Link>
              <Link
                href="/test-tools"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Testing Tools
              </Link>
              <button className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity shadow-sm border border-gray-200">
                <Image 
                  src="/avatar.svg" 
                  alt="User Avatar" 
                  width={40} 
                  height={40}
                  className="w-full h-full"
                />
              </button>
            </div>
          </nav>
        </header>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
