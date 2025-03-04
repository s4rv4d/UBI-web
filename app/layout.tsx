import "@coinbase/onchainkit/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Provider } from "./providers/provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const frameMetadata = {
  version: "next",
  imageUrl: `${String(
    process.env.NEXT_PUBLIC_HOST_URL
  )}/BUILD-previewFrame.png`,
  button: {
    title: "Launch App",
    action: {
      type: "launch_frame",
      name: "UBI Mini App",
      url: `${String(process.env.NEXT_PUBLIC_HOST_URL)}/`,
      splashImageUrl: `${String(
        process.env.NEXT_PUBLIC_HOST_URL
      )}/BUILDLogo.png`,
      splashBackgroundColor: "#0000EB",
    },
  },
};

export const metadata: Metadata = {
  title: "UBI",
  description: "Universal Builder Income",
  other: {
    "fc:frame": JSON.stringify(frameMetadata),
    "og:image": frameMetadata.imageUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" richColors={true} />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
