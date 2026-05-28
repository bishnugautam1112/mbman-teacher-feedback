import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Anomalous Teacher Feedback System | MBMAN",
  description: "A secure, 100% anonymous feedback and review system for teachers at Madan Bhandari Memorial Academy Nepal.",
  verification: {
    google: "ro693PVgKzq1RCtDvyrw56_f6T0adACF8VI6kIjicBw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
