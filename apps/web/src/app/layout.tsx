import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AssetFlow | Enterprise Asset & Resource Management",
  description:
    "Multi-tenant platform for managing physical assets, resource bookings, maintenance, and audit cycles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
