import type { Metadata } from "next";
import { Inter, Geist_Mono, Cal_Sans } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Databuddy } from '@databuddy/sdk/react';
import { SITE_URL } from "@/lib/site";
import { SITE_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const calSans = Cal_Sans({
  variable: "--font-cal-sans",
  subsets: ["latin"],
  weight: "400",
});

const openRunde = localFont({
  variable: "--font-open-runde",
  src: [
    {
      path: "../public/fonts/OpenRunde-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenRunde-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenRunde-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenRunde-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rare UI — Rare Animated React Components",
    template: "%s | Rare UI",
  },
  description: "A shadcn registry of rare components.",
  keywords: SITE_KEYWORDS,
  icons: {
    icon: [{ url: "/logos/Rareui.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Rare UI",
    description: "A shadcn registry of rare components.",
    url: "/",
    siteName: "Rare UI",
    images: [
      {
        url: "/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Rare UI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rare UI",
    description: "A shadcn registry of rare components.",
    images: ["/ogimage.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${openRunde.variable} ${calSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh items-center justify-center bg-background px-8 text-center md:hidden">
            <p className="text-base font-medium text-foreground">
              Rare UI is only available on desktop.
            </p>
          </div>

          <div className="hidden flex-1 flex-col md:flex">{children}</div>
          <Databuddy
            clientId={process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID!}
            trackHashChanges={true}
            trackAttributes={true}
            trackOutgoingLinks={true}
            trackInteractions={true}
            trackWebVitals={true}
            trackErrors={true}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
