import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from '../customer/WhatsAppButton';
import { ChatWidget } from '../customer/ChatWidget';

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
      <ChatWidget />
    </div>
  );
};
