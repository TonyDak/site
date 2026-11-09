import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import { TransitionProvider } from "@/components/motion/TransitionProvider";
import "./globals.css";
import "../styles/portfolio.css";

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nguyễn Hữu Đức — Web & Mobile Developer",
    template: "%s · ducnguyen.dev",
  },
  description:
    "Web & Mobile Developer building enterprise products with Next.js, React Native, NestJS and ASP.NET Core — growing into backend engineering with Java & Spring Boot.",
  openGraph: {
    title: "Nguyễn Hữu Đức — Web & Mobile Developer",
    description: "Portfolio & engineering notes of Nguyễn Hữu Đức (ducnguyen.dev).",
    url: siteUrl,
    siteName: "ducnguyen.dev",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ducnguyen.dev" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nguyễn Hữu Đức — Web & Mobile Developer",
    description: "Portfolio & engineering notes of Nguyễn Hữu Đức (ducnguyen.dev).",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0c10" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
  ],
};

// Dark is the default identity; a saved choice always wins.
const themeScript = `(() => {
  try {
    const stored = localStorage.getItem('portfolio-theme');
    const theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-' + theme);
  } catch {
    document.documentElement.classList.add('theme-dark');
  }
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <LanguageProvider><TransitionProvider>{children}</TransitionProvider></LanguageProvider>
      </body>
    </html>
  );
}
