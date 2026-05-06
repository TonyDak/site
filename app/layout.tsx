import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TransitionProvider } from "@/components/motion/TransitionProvider";
import "./globals.css";

export const dynamic = "force-dynamic";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Syne({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Portfolio | Tony",
    template: "%s | Tony Portfolio",
  },
  description: "Netwrix-inspired portfolio with premium transitions and motion.",
  openGraph: {
    title: "Portfolio | Tony",
    description: "Netwrix-inspired portfolio with premium transitions and motion.",
    url: siteUrl,
    siteName: "Tony Portfolio",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tony Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Tony",
    description: "Netwrix-inspired portfolio with premium transitions and motion.",
    images: ["/opengraph-image"],
  },
};

const themeScript = `(() => {
  try {
    const stored = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  } catch {
    document.documentElement.classList.add('theme-light');
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <TransitionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </TransitionProvider>
      </body>
    </html>
  );
}
