import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Sistema full-stack de gestão de estoque com RBAC, alertas e relatórios — monorepo Next.js, Express, Prisma e Zod. Showcase de engenharia para portfólio.";

export const metadata: Metadata = {
  metadataBase: new URL("https://radar-stock.vercel.app"),
  title: {
    absolute: "RadarStock",
  },
  description: siteDescription,
  applicationName: "RadarStock",
  authors: [{ name: "Gustavo Henrique" }],
  creator: "Gustavo Henrique",
  keywords: [
    "RadarStock",
    "gestão de estoque",
    "inventory",
    "RBAC",
    "Next.js",
    "Express",
    "Prisma",
    "TypeScript",
    "Zod",
    "monorepo",
    "portfólio",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "RadarStock",
    description: siteDescription,
    siteName: "RadarStock",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RadarStock",
    description: siteDescription,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full font-sans", jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col tabular-nums">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
