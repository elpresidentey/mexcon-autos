import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { settingsService } from '../services/settings.service';
import type { PlatformSettings } from '../types';

interface SettingsContextType {
  settings: PlatformSettings | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const requestId = useRef(0);

  const loadSettings = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    if (!forceRefresh && settings && now - lastUpdated < CACHE_DURATION) {
      return;
    }

    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const data = await settingsService.getSettings();
      // Ignore stale responses if a newer refresh request already landed
      if (currentRequest !== requestId.current) return;
      setSettings(data);
      setLastUpdated(now);
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      const message = loadError instanceof Error ? loadError.message : 'Failed to load settings.';
      setError(message);
      console.error('Error loading settings:', loadError);
    } finally {
      if (currentRequest === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [settings, lastUpdated]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const refresh = useCallback(async () => {
    await loadSettings(true);
  }, [loadSettings]);

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};