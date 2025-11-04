import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Management BSSN",
  description: "Sistem Manajemen Talenta ASN BSSN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
