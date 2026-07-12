import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import { TransitionProvider } from "@/components/motion/TransitionProvider";
import "./globals.css";

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
    default: "Portfolio | Duc Nguyen",
    template: "%s | Duc Nguyen",
  },
  description: "Web & Mobile Developer portfolio for Nguyễn Hữu Đức.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Portfolio | Duc Nguyen",
    description: "Web & Mobile Developer portfolio for Nguyễn Hữu Đức.",
    url: siteUrl,
    siteName: "Duc Nguyen Portfolio",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Duc Nguyen Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Duc Nguyen",
    description: "Web & Mobile Developer portfolio for Nguyễn Hữu Đức.",
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
    <html lang="en" suppressHydrationWarning className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <LanguageProvider>
          <TransitionProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </TransitionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
