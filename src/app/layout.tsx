import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { auth0 } from "@/lib/auth0";
import { QueryProvider } from "@/presentation/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Callisto SaaS",
  description: "Callisto SaaS — B2B multi-tenant app with Auth0 Organizations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Auth0Provider user={session?.user}>
          <QueryProvider>{children}</QueryProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
