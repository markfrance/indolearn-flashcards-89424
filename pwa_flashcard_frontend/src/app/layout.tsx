import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import ClientHeader from "./ClientHeader";

export const metadata: Metadata = {
  title: "IndoLearn Flashcards",
  description: "PWA for Indonesian vocabulary learning with spaced repetition.",
  manifest: "/manifest.webmanifest",
  themeColor: "#1E3A8A",
  applicationName: "IndoLearn",
  viewport: { width: "device-width", initialScale: 1, viewportFit: "cover" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/icon-192.png" }]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ClientHeader />
          <main className="container" role="main">
            {children}
          </main>
          <footer className="footer container" role="contentinfo">
            <div className="card">
              <div className="card-inner" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem', flexWrap:'wrap'}}>
                <p>&copy; {new Date().getFullYear()} IndoLearn. All rights reserved.</p>
                <div style={{display:'flex',gap:'.75rem'}}>
                  <Link className="btn btn-ghost" href="/privacy">Privacy</Link>
                  <Link className="btn btn-ghost" href="/terms">Terms</Link>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
        <Script id="pwa-sw" strategy="afterInteractive">
          {`if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(console.error);
              });
            }`}
        </Script>
      </body>
    </html>
  );
}
