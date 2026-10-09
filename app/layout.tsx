import type { Metadata } from "next";
import "./globals.css";
import {themeInitScript} from './theme.mjs';

export const metadata: Metadata = {
  title: "Career Desk",
  description: "A private, thoughtful workspace for your next career chapter.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:themeInitScript}} /><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

