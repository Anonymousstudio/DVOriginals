import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PrintCraft Store - Custom Print-on-Demand Products',
  description: 'Discover premium custom printed products. T-shirts, hoodies, mugs, and more. Fast shipping across India and worldwide.',
  keywords: 'custom printing, print on demand, t-shirts, hoodies, mugs, personalized gifts, India',
  authors: [{ name: 'PrintCraft Store' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'PrintCraft Store - Custom Print-on-Demand Products',
    description: 'Premium custom printed products with fast delivery',
    siteName: 'PrintCraft Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrintCraft Store - Custom Print-on-Demand Products',
    description: 'Premium custom printed products with fast delivery',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <link rel="canonical" href="https://yourdomain.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}