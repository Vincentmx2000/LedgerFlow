import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export const SUPPORTED_CURRENCIES = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    country: 'India',
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    country: 'United States',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    country: 'European Union',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    country: 'United Kingdom',
  },
  {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    locale: 'en-AE',
    country: 'United Arab Emirates',
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    country: 'Singapore',
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    country: 'Canada',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    country: 'Australia',
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    country: 'Japan',
  },
];

const CurrencyContext = createContext({
  currency: 'INR',
  symbol: '₹',
  currencyConfig: SUPPORTED_CURRENCIES[0],
  setCurrency: () => {},
  formatAmount: () => '',
  supportedCurrencies: SUPPORTED_CURRENCIES,
});

export const CurrencyProvider = ({ children }) => {
  const { user, updateUser } = useAuth();

  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('ledgerflow_currency') || user?.currency || 'INR';
  });

  // Keep in sync if user profile loads or changes from server
  useEffect(() => {
    if (user?.currency && user.currency !== currency) {
      setCurrencyState(user.currency);
      localStorage.setItem('ledgerflow_currency', user.currency);
    }
  }, [user?.currency]);

  const currencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const changeCurrency = async (newCode) => {
    const valid = SUPPORTED_CURRENCIES.find((c) => c.code === newCode);
    if (!valid) return { success: false, message: 'Invalid currency code' };

    setCurrencyState(newCode);
    localStorage.setItem('ledgerflow_currency', newCode);

    try {
      if (updateUser) {
        updateUser({ currency: newCode });
      }
      await api.updateProfile({ currency: newCode });
      return { success: true };
    } catch (err) {
      console.warn('Failed to update currency on server profile:', err.message);
      return { success: true }; // Local state updated regardless
    }
  };

  /**
   * Format any number or string into a formatted currency string.
   * e.g. formatAmount(4250, { showSign: true }) => "+₹4,250.00"
   */
  const formatAmount = (val, options = {}) => {
    const { showSign = false, showSymbol = true } = options;
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    const absVal = Math.abs(num);

    const formattedNumber = absVal.toLocaleString(currencyConfig.locale || 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const sym = showSymbol ? currencyConfig.symbol : '';

    if (showSign) {
      if (num > 0) return `+${sym}${formattedNumber}`;
      if (num < 0) return `-${sym}${formattedNumber}`;
      return `${sym}${formattedNumber}`;
    }

    if (num < 0) return `-${sym}${formattedNumber}`;
    return `${sym}${formattedNumber}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: currencyConfig.symbol,
        currencyConfig,
        setCurrency: changeCurrency,
        formatAmount,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
