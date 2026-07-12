import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AssetFlow | Enterprise Asset & Resource Management',
  description: 'Manage physical assets, resource bookings, and maintenance cycles in a multi-tenant ERP platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-glow bg-glow-top-left" />
        <div className="bg-glow bg-glow-bottom-right" />
        {children}
      </body>
    </html>
  );
}
