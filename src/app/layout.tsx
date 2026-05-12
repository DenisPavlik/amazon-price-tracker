import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import LoginView from "@/components/LoginView";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomTabBar from "@/components/BottomTabBar";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: "AmzPulse — Amazon Price Tracker",
  description: "AmzPulse tracks Amazon prices and notifies you the moment they drop.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const unreadCount = session?.user?.email
    ? await prisma.notification.count({
        where: { userEmail: session.user.email, isRead: false },
      })
    : 0;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {session ? (
            <div className="w-full max-w-[1440px] mx-auto p-4 min-h-screen pb-24 md:pb-4">
              <Header
                image={session.user?.image ?? undefined}
                username={session.user?.name ?? "User"}
                unreadCount={unreadCount}
              />
              <section className="grid grid-cols-12 gap-4 mt-4">
                <div className="hidden md:block col-span-3 pb-4">
                  <Sidebar />
                </div>
                <PageTransition>{children}</PageTransition>
              </section>
              <BottomTabBar
                unreadCount={unreadCount}
                image={session.user?.image ?? undefined}
                username={session.user?.name ?? "User"}
                email={session.user?.email ?? undefined}
              />
            </div>
          ) : (
            <LoginView />
          )}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
