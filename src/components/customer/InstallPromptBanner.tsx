import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Button } from '../common';

export const InstallPromptBanner = () => {
  const { canInstall, isInstalled, isIOS, shown, promptInstall, dismiss } = useInstallPrompt();

  if (!shown || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:max-w-md z-50">
      <div className="bg-white rounded-2xl shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5 p-4 flex items-center gap-4">
        <img
          src="/icon-192x192.png"
          alt="Mexcon Autos"
          className="w-12 h-12 rounded-xl bg-primary-50 object-contain flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <>
              <p className="font-bold text-ink text-sm leading-snug">Install Mexcon Autos</p>
              <p className="text-metallic-600 text-xs leading-snug mt-1">
                Tap the Share{' '}
                <svg className="inline w-4 h-4 text-metallic-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>{' '}
                icon in Safari, then “Add to Home Screen”.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-ink text-sm leading-snug">Install Mexcon Autos</p>
              <p className="text-metallic-600 text-xs leading-snug mt-1">
                Get the app on your home screen for faster access and offline browsing.
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && canInstall && (
            <Button size="sm" onClick={promptInstall}>
              Install
            </Button>
          )}
          <button
            onClick={dismiss}
            className="p-1.5 text-metallic-500 hover:text-ink hover:bg-metallic-100 rounded-lg transition-colors"
            aria-label="Dismiss install prompt"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};