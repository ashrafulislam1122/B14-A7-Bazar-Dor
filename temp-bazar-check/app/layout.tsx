
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "বাজার দর | প্রতিদিনের বাজারদর",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের দৈনিক বাজারদর জানুন। দাম তুলনা করুন এবং সাশ্রয়ী কেনাকাটা করুন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}