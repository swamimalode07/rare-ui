import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Databuddy } from '@databuddy/sdk/react';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rareui.swamii.me"),
  title: "Rare UI",
  description: "A shadcn registry of rare components.",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
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
            clientId="6714ae32-d16e-4158-bb10-4998f3ff7729"
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
