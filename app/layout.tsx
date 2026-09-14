import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanpolo CRM",
  description: "Track e-bike prospect companies, contacts, and calls",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
            <Link href="/" className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded bg-emerald-600" />
              Sanpolo CRM
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/companies" className="text-slate-600 hover:text-slate-900">
                Companies
              </Link>
              <Link
                href="/companies/new"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-white font-medium hover:bg-emerald-700"
              >
                + Add Company
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
