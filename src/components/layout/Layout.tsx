import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';
import { WhatsAppButton } from '../customer/WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow bg-white">{children}</main>
      <Footer />
      <WhatsAppButton />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#14532d',
            borderRadius: '0.75rem',
            border: '1px solid #bbf7d0',
            boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.12)',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};
