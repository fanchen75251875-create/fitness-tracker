import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/store/AuthContextSupabase";
import { AppProviderWrapper } from "@/components/layout/AppProviderWrapper";
import { LayoutContent } from "@/components/layout/LayoutContent";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fitness Tracker",
  description: "Premium Carbon Cycle & Workout Tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthProvider>
          <AppProviderWrapper>
            <LayoutContent>{children}</LayoutContent>
          </AppProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
