import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QPET LMS - Learning Management System",
  description:
    "Official Learning Management System for QPET: Manage student registrations, courses, fee receipts, and certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
