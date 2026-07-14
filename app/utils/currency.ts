'use client';

import { useState, useEffect } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // Conversion rate from BDT (1 BDT = rate in this currency)
  label: string;
}

export const CURRENCIES: { [key: string]: CurrencyConfig } = {
  BDT: { code: 'BDT', symbol: '৳', rate: 1.0, label: 'BDT (Bangladeshi Taka)' },
  USD: { code: 'USD', symbol: '$', rate: 0.0084, label: 'USD (US Dollar)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.0078, label: 'EUR (Euro)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0066, label: 'GBP (British Pound)' },
  INR: { code: 'INR', symbol: '₹', rate: 0.70, label: 'INR (Indian Rupee)' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 0.0115, label: 'CAD (Canadian Dollar)' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 0.0130, label: 'AUD (Australian Dollar)' },
};

// Fallback timezone-based detection
const detectTimeZoneCurrency = (): string => {
  if (typeof window === 'undefined') return 'USD';
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Dhaka') || timeZone.includes('Asia/Dhaka')) {
      return 'BDT';
    }
    if (
      timeZone.includes('Europe/Paris') ||
      timeZone.includes('Europe/Berlin') ||
      timeZone.includes('Europe/Rome') ||
      timeZone.includes('Europe/Madrid') ||
      timeZone.includes('Europe/Amsterdam') ||
      timeZone.includes('Europe/Vienna') ||
      timeZone.includes('Europe/Brussels') ||
      timeZone.includes('Europe/Dublin') ||
      timeZone.includes('Europe/Helsinki') ||
      timeZone.includes('Europe/Athens')
    ) {
      return 'EUR';
    }
    if (timeZone.includes('Europe/London') || timeZone.includes('GB') || timeZone.includes('London')) {
      return 'GBP';
    }
    if (timeZone.includes('Kolkata') || timeZone.includes('Asia/Kolkata') || timeZone.includes('Calcutta')) {
      return 'INR';
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || timeZone.includes('America/Toronto')) {
      return 'CAD';
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Australia/')) {
      return 'AUD';
    }
  } catch (e) {
    console.error('Timezone currency detection failed:', e);
  }
  return 'USD'; // global fallback
};

export const getPreferredCurrency = (): string => {
  if (typeof window === 'undefined') return 'USD';
  const stored = localStorage.getItem('preferred_currency');
  if (stored && CURRENCIES[stored]) {
    return stored;
  }
  const detected = detectTimeZoneCurrency();
  localStorage.setItem('preferred_currency', detected);
  return detected;
};

export const setPreferredCurrency = (code: string) => {
  if (typeof window === 'undefined') return;
  if (CURRENCIES[code]) {
    localStorage.setItem('preferred_currency', code);
    window.dispatchEvent(new CustomEvent('currency-change', { detail: { currency: code } }));
  }
};

export const initializeCurrency = async () => {
  if (typeof window === 'undefined') return;
  
  // First set based on timezone or local storage
  const initial = getPreferredCurrency();
  
  // Try to refine via IP lookup if not manually set before
  const hasManualChoice = localStorage.getItem('preferred_currency');
  if (!hasManualChoice) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.currency && CURRENCIES[data.currency]) {
          localStorage.setItem('preferred_currency', data.currency);
          window.dispatchEvent(new CustomEvent('currency-change', { detail: { currency: data.currency } }));
          return;
        }
      }
    } catch (e) {
      console.warn('Geolocation currency lookup failed. Using timezone fallback.');
    }
  }
};

// Formats prices consistently. Returns primary currency price and optionally BDT as reference.
export const formatPrice = (priceInBDT: number, showSecondary: boolean = true): string => {
  const currentCode = getPreferredCurrency();
  const config = CURRENCIES[currentCode] || CURRENCIES.USD;
  
  const convertedPrice = priceInBDT * config.rate;
  const formattedConverted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(convertedPrice);

  if (showSecondary && config.code !== 'BDT') {
    const formattedOriginal = new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInBDT);
    return `${formattedConverted} (${formattedOriginal})`;
  }

  return formattedConverted;
};

export const useCurrency = () => {
  const [currencyCode, setCurrencyCode] = useState<string>('USD');

  useEffect(() => {
    // Run initialization on mount
    initializeCurrency().then(() => {
      setCurrencyCode(getPreferredCurrency());
    });

    const handleCurrencyChange = () => {
      setCurrencyCode(getPreferredCurrency());
    };
    window.addEventListener('currency-change', handleCurrencyChange);
    return () => window.removeEventListener('currency-change', handleCurrencyChange);
  }, []);

  return {
    currencyCode,
    currencyConfig: CURRENCIES[currencyCode] || CURRENCIES.USD,
    setCurrency: setPreferredCurrency,
    format: (priceInBDT: number, showSecondary: boolean = true) => formatPrice(priceInBDT, showSecondary),
  };
};
