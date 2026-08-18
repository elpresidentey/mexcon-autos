import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'mexcon-install-dismissed';

const detectInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari exposes `standalone` on navigator for installed PWAs
  (navigator as unknown as { standalone?: boolean }).standalone === true;

const detectIOS = () => {
  const ua = navigator.userAgent;
  // iPhone / iPod / iPad (older iOS) expose their device in the UA.
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ masquerades as a Mac in the UA; a touch-capable Safari
  // engine is the reliable tell (works even when maxTouchPoints is 0/1).
  return /Macintosh|Mac OS X/.test(ua) && 'ontouchend' in document;
};

export const useInstallPrompt = (delayMs = 3000) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectInstalled);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) !== null);
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setIsInstalled(true);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const timer = window.setTimeout(() => setElapsed(true), delayMs);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(timer);
    };
  }, [delayMs]);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const isIOS = detectIOS();

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIOS,
    // Show the prompt only once the criteria are met (or iOS) and the delay
    // has passed, never when installed, and not after an explicit dismissal.
    shown: elapsed && !isInstalled && !dismissed && (!!deferredPrompt || isIOS),
    promptInstall,
    dismiss,
  };
};