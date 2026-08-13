import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_MS = 2400;
const DOT_MS = 320;

/** Brand intro overlay shown briefly on app load. */
export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [dots, setDots] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((count) => {
        if (count >= 3) {
          window.clearInterval(interval);
          return count;
        }
        return count + 1;
      });
    }, DOT_MS);

    const timeout = window.setTimeout(() => {
      onCompleteRef.current();
    }, SPLASH_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800"
      role="status"
      aria-label="MEXTECH is loading"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center px-6 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
          <WrenchScrewdriverIcon className="h-10 w-10 text-white" aria-hidden="true" />
        </div>

        <h1 className="font-display text-6xl font-bold uppercase tracking-tight text-white sm:text-7xl">
          MEXTECH
          <span className="inline-flex w-14 text-left" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                initial={{ opacity: 0 }}
                animate={{ opacity: dots > dot ? 1 : 0 }}
                className="inline-block"
              >
                .
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary-100 sm:text-base"
        >
          We guarantee you the best quality
        </motion.p>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: SPLASH_MS / 1000, ease: 'linear' }}
          className="h-full bg-accent-400"
        />
      </div>
    </motion.div>
  );
};