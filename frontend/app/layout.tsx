import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';
import ClientProvider from '@/HOC/ClientProvider';

import './globals.css';

const font = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PhotoFlow, le réseau social lumineux',
  description: 'Le média qui illumine le quotidien',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <ClientProvider>
          {children}
          <Toaster />
        </ClientProvider>
      </body>
    </html>
  );
}
