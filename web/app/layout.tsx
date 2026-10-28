import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RadarStock",
  description: "Operação de estoque rápida e focada",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full font-sans", inter.variable, jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col tabular-nums">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
