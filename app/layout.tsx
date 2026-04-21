import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeSwitcher } from "@/components/theme-switcher";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Palm Beach Indian Association",
  description: "Membership registration and officer dashboard for the Palm Beach Indian Association.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-border/70 bg-card/85 p-1 shadow-lg backdrop-blur">
            <ThemeSwitcher />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
