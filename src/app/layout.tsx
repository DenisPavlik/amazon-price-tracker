import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import LoginView from "@/components/LoginView";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amazon Price Tracker",
  description: "Track a price for your favorite items here",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
    if (!session) {
      return <LoginView />;
    }
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
      <div className="p-4 h-screen">
      <Header
        image={session.user?.image ?? undefined}
        username={session.user?.name ?? 'User'} />
      <section className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-3 pb-4">
          <Sidebar />
        </div>
        {children}
        </section>
    </div>
    <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
