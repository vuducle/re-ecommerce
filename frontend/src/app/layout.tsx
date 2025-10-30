import type { Metadata } from 'next';
import { Geist, Geist_Mono, Orbitron } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import ReduxProvider from '../components/ReduxProvider.client';
import { MobileMenuProvider } from '../context/MobileMenuContext';
import { NotificationProvider } from '../context/NotificationContext';
import Notification from '../components/Notification';
import REAudio from '@/components/REAudio.client';
import Footer from '../components/Footer';
import CookieDialog from '@/components/CookieDialog.client';
import FloatingActionButtons from '@/components/FloatingActionButtons.client';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | RE-Commerce',
    default: 'RE-Commerce',
  },
  description: 'An e-commerce site with a Resident Evil 4 theme.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the environment variable on the server side
  const pbUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__RUNTIME_CONFIG__ = {
                NEXT_PUBLIC_POCKETBASE_URL: "${pbUrl}"
              };
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
      >
        <div
          className="fixed inset-0 z-[-1] opacity-10 pointer-events-none mix-blend-overlay bg-cover bg-center"
          style={{
            backgroundImage: "url('/img/re4-background.jpg')",
          }}
          aria-hidden="true"
        />
        <ReduxProvider>
          <MobileMenuProvider>
            <NotificationProvider>
              <Notification />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <REAudio />
                <FloatingActionButtons />
              </div>
              <CookieDialog />
            </NotificationProvider>
          </MobileMenuProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
