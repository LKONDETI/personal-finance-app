import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage'; 

interface PrivacyContextType {
  isPrivacyModeEnabled: boolean;
  togglePrivacyMode: (value: boolean) => Promise<void>;
  maskAmount: (amount: number | string | undefined | null) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_MODE_KEY = 'privacy_mode_enabled';

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState(false);

  useEffect(() => {
    // Load saved preference on mount
    storage.getItem(PRIVACY_MODE_KEY).then(value => {
      if (value === 'true') {
        setIsPrivacyModeEnabled(true);
      }
    });
  }, []);

  const togglePrivacyMode = async (value: boolean) => {
    setIsPrivacyModeEnabled(value);
    await storage.setItem(PRIVACY_MODE_KEY, value ? 'true' : 'false');
  };

  const maskAmount = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '$0.00';
    
    if (isPrivacyModeEnabled) {
      return '$••••';
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyModeEnabled, togglePrivacyMode, maskAmount }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacyMode() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacyMode must be used within a PrivacyProvider');
  }
  return context;
}
