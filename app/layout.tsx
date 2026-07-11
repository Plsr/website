import type { Metadata } from "next";
import { Lato, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chrisjarling.com"),
  title: {
    default: "Chris Jarling",
    template: "%s — Chris Jarling",
  },
  description:
    "Personal site of Chris Jarling — Engineering Manager at Gigs. Writing on engineering, leadership, and life.",
  applicationName: "Chris Jarling",
  authors: [{ name: "Chris Jarling", url: "https://chrisjarling.com" }],
  creator: "Chris Jarling",
  openGraph: {
    type: "website",
    siteName: "Chris Jarling",
    title: "Chris Jarling",
    description:
      "Personal site of Chris Jarling — Engineering Manager at Gigs.",
    url: "https://chrisjarling.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chris Jarling",
    description:
      "Personal site of Chris Jarling — Engineering Manager at Gigs.",
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
      className={`${lato.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
