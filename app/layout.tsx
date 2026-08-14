import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Lumen | Decentralized Digital Asset Marketplace",
  description:
    "A transparent, decentralized digital asset marketplace running on Ethereum Sepolia testnet with on-chain ownership history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased relative">
        <Web3Provider>
          <AnimatedBackground />
          <div className="relative z-10 flex-1 flex flex-col w-full">
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </div>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#15181C",
                border: "1px solid #22262B",
                color: "#F2F3F4",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
