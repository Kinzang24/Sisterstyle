import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";

const fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces.ttf", style: "normal" },
    { path: "./fonts/Fraunces-Italic.ttf", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = localFont({
  src: [
    { path: "./fonts/PlusJakartaSans.ttf", style: "normal" },
    { path: "./fonts/PlusJakartaSans-Italic.ttf", style: "italic" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Sister'Style — Product Collection",
  description: "A Bhutanese clothing boutique, built on Next.js.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
