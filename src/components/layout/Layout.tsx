import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from '../customer/WhatsAppButton';
import { ChatWidget } from '../customer/ChatWidget';
import { BackToTop } from './BackToTop';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-grow bg-white"
      >
        {children}
      </motion.main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      <BackToTop />
    </div>
  );
};
