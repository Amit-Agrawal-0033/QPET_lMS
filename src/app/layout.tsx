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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener('error', function(e) {
                  var msg = (e && e.message) || '';
                  var isChunkError =
                    msg.indexOf('Loading chunk') !== -1 ||
                    msg.indexOf('ChunkLoadError') !== -1 ||
                    msg.indexOf('Failed to fetch dynamically imported module') !== -1 ||
                    msg.indexOf('is not a function') !== -1 ||
                    (e && e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK') && (e.target.src || e.target.href) && (e.target.src || e.target.href).indexOf('/_next/static/') !== -1);
                  if (isChunkError) {
                    var key = 'qpet_chunk_reload_ts';
                    var last = sessionStorage.getItem(key);
                    var now = Date.now();
                    if (!last || now - Number(last) > 10000) {
                      sessionStorage.setItem(key, String(now));
                      window.location.reload();
                    }
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
