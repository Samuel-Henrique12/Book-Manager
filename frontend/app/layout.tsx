import type { Metadata } from "next";
import { Instrument_Sans, Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";

// Configuração das Fontes do Google
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

// Títulos da Área Logada
const titulo = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Book Manager",
  description: "Toda a sua estante, organizada em um só lugar.",
};

// Layout Raiz da Aplicação
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${serif.variable} ${titulo.variable} antialiased`}
    >
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
