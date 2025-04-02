'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrencies, getExchangeRates } from '../types/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' }
];

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<{ [key: string]: string }>({});
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFromSearch, setShowFromSearch] = useState<boolean>(false);
  const [showToSearch, setShowToSearch] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const fromButtonRef = useRef<HTMLButtonElement>(null);
  const toButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 0 });

  const filteredCurrencies = Object.entries(currencies).filter(([code, name]) =>
    code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, date]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFromSearch && !showToSearch) return;

      const items = filteredCurrencies;
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            const [code] = items[selectedIndex];
            if (showFromSearch) {
              setFromCurrency(code);
              setShowFromSearch(false);
            } else {
              setToCurrency(code);
              setShowToSearch(false);
            }
            setSelectedIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowFromSearch(false);
          setShowToSearch(false);
          setSelectedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFromSearch, showToSearch, selectedIndex, filteredCurrencies]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showFromSearch || showToSearch) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        const currentAmount = parseFloat(amount.replace(/,/g, ''));
        setAmount((currentAmount + 1).toString());
        break;
      case 'ArrowDown':
        e.preventDefault();
        const newAmount = parseFloat(amount.replace(/,/g, ''));
        if (newAmount > 0) {
          setAmount((newAmount - 1).toString());
        }
        break;
    }
  };

  const loadCurrencies = async () => {
    try {
      const data = await getCurrencies(date);
      setCurrencies(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load currencies');
      setIsLoading(false);
    }
  };

  const convertCurrency = async () => {
    try {
      setIsConverting(true);
      const rates = await getExchangeRates(fromCurrency, date);
      const rate = rates[fromCurrency.toLowerCase()][toCurrency.toLowerCase()];
      const result = (parseFloat(amount) * rate).toFixed(2);
      setConvertedAmount(result);
      setError('');
    } catch (err) {
      setError('Failed to convert currency');
    } finally {
      setIsConverting(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const updateDropdownPosition = (button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    // Calculate if dropdown would go off screen
    const dropdownHeight = 400; // Approximate max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Position dropdown above if not enough space below
    const top = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
      ? rect.top - dropdownHeight - 8
      : rect.bottom + 8;
    
    setDropdownPosition({
      top: top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      maxHeight: Math.min(dropdownHeight, spaceBelow - 16)
    });
  };

  const handleFromButtonClick = () => {
    setShowFromSearch(!showFromSearch);
    if (!showFromSearch && fromButtonRef.current) {
      updateDropdownPosition(fromButtonRef.current);
    }
  };

  const handleToButtonClick = () => {
    setShowToSearch(!showToSearch);
    if (!showToSearch && toButtonRef.current) {
      updateDropdownPosition(toButtonRef.current);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove commas and convert to number for calculations
    const numericValue = value.replace(/,/g, '');
    setAmount(numericValue);
  };

  const formatNumber = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    // Split into whole and decimal parts
    const [whole, decimal] = numericValue.split('.');
    // Add commas to whole part
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Combine whole and decimal parts
    return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 font-medium"
          >
            Loading exchange rates...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8 w-full"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header with Gradient Text and Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 relative"
        >
          <div className="absolute right-0 top-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Historical Rate
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="p-2 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                aria-label="Select date for historical rates"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
            Currency Converter
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
            Convert between currencies with real-time exchange rates
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          {/* From Currency Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 animate-gradient" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-semibold text-gray-900 dark:text-white">
                  From Currency
                </label>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                >
                  <span className="text-xl text-blue-600 dark:text-blue-400">
                    {POPULAR_CURRENCIES.find(c => c.code === fromCurrency)?.symbol || fromCurrency}
                  </span>
                </motion.div>
              </div>
              
              <div className="relative">
                <button
                  ref={fromButtonRef}
                  onClick={handleFromButtonClick}
                  className="w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left flex justify-between items-center transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500 group"
                  aria-label="Select from currency"
                  aria-expanded={showFromSearch}
                  aria-controls="from-currency-dropdown"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {POPULAR_CURRENCIES.find(c => c.code === fromCurrency)?.symbol || fromCurrency}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {fromCurrency.toUpperCase()} - {currencies[fromCurrency]}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: showFromSearch ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                    aria-hidden="true"
                  >
                    ▼
                  </motion.span>
                </button>
                {showFromSearch && fromButtonRef.current && createPortal(
                  <motion.div
                    ref={dropdownRef}
                    id="from-currency-dropdown"
                    role="listbox"
                    aria-label="Select from currency"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 bg-white dark:bg-gray-700 border-2 rounded-2xl shadow-xl overflow-y-auto backdrop-blur-sm"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                      maxHeight: `${dropdownPosition.maxHeight}px`
                    }}
                  >
                    <div className="sticky top-0 bg-white dark:bg-gray-700 border-b-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-4 text-lg border-b-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Search from currency"
                          autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {filteredCurrencies.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No currencies found
                      </div>
                    ) : (
                      filteredCurrencies.map(([code, name], index) => (
                        <motion.button
                          key={code}
                          role="option"
                          aria-selected={index === selectedIndex}
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            setFromCurrency(code);
                            setShowFromSearch(false);
                            setSelectedIndex(-1);
                          }}
                          className={`w-full p-4 text-left transition-colors duration-200 border-b last:border-b-0 ${
                            index === selectedIndex
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">
                              {POPULAR_CURRENCIES.find(c => c.code === code)?.symbol || code}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{code.toUpperCase()}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{name}</span>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </motion.div>,
                  document.body
                )}
              </div>

              <div className="mt-4">
                <label className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatNumber(amount)}
                    onChange={handleAmountChange}
                    onKeyDown={handleKeyDown}
                    className="w-full p-4 text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    aria-label="Enter amount to convert"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 dark:text-gray-500">
                    {POPULAR_CURRENCIES.find(c => c.code === fromCurrency)?.symbol || fromCurrency}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Swap Button - Centered between cards */}
          <motion.button
            onClick={swapCurrencies}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
            title="Swap currencies"
          >
            <span className="text-xl">⇄</span>
          </motion.button>

          {/* To Currency Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 dark:from-green-500/10 dark:to-teal-500/10 animate-gradient" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-semibold text-gray-900 dark:text-white">
                  To Currency
                </label>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <span className="text-xl text-green-600 dark:text-green-400">
                    {POPULAR_CURRENCIES.find(c => c.code === toCurrency)?.symbol || toCurrency}
                  </span>
                </motion.div>
              </div>

              <div className="relative">
                <button
                  ref={toButtonRef}
                  onClick={handleToButtonClick}
                  className="w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left flex justify-between items-center transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500 group"
                  aria-label="Select to currency"
                  aria-expanded={showToSearch}
                  aria-controls="to-currency-dropdown"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {POPULAR_CURRENCIES.find(c => c.code === toCurrency)?.symbol || toCurrency}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {toCurrency.toUpperCase()} - {currencies[toCurrency]}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: showToSearch ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                    aria-hidden="true"
                  >
                    ▼
                  </motion.span>
                </button>
                {showToSearch && toButtonRef.current && createPortal(
                  <motion.div
                    ref={dropdownRef}
                    id="to-currency-dropdown"
                    role="listbox"
                    aria-label="Select to currency"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 bg-white dark:bg-gray-700 border-2 rounded-2xl shadow-xl overflow-y-auto backdrop-blur-sm"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                      maxHeight: `${dropdownPosition.maxHeight}px`
                    }}
                  >
                    <div className="sticky top-0 bg-white dark:bg-gray-700 border-b-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-4 text-lg border-b-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Search to currency"
                          autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {filteredCurrencies.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No currencies found
                      </div>
                    ) : (
                      filteredCurrencies.map(([code, name], index) => (
                        <motion.button
                          key={code}
                          role="option"
                          aria-selected={index === selectedIndex}
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            setToCurrency(code);
                            setShowToSearch(false);
                            setSelectedIndex(-1);
                          }}
                          className={`w-full p-4 text-left transition-colors duration-200 border-b last:border-b-0 ${
                            index === selectedIndex
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">
                              {POPULAR_CURRENCIES.find(c => c.code === code)?.symbol || code}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{code.toUpperCase()}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{name}</span>
                            </div>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </motion.div>,
                  document.body
                )}
              </div>

              <div className="mt-4">
                <label className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Converted Amount
                </label>
                <div className="relative">
                  <div className="w-full p-4 text-2xl font-bold border-2 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {isConverting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"
                        />
                        <span className="text-lg text-gray-600 dark:text-gray-300">Converting...</span>
                      </div>
                    ) : convertedAmount ? (
                      `${formatNumber(convertedAmount)} ${toCurrency}`
                    ) : (
                      '0.00'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls Section - Below Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            {/* Removed swap button and date controls from here */}
          </div>
        </motion.div>

        {/* Popular Currencies Section - Made more compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Popular Currencies</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
            {POPULAR_CURRENCIES.map((currency) => (
              <motion.button
                key={currency.code}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFromCurrency(currency.code);
                  setShowFromSearch(false);
                }}
                className={`p-2 text-xs border-2 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 dark:border-gray-600 dark:text-white transition-all duration-200 ${
                  fromCurrency === currency.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg'
                    : ''
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">{currency.symbol}</span>
                  <span className="font-medium text-xs">{currency.code}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border-2 border-red-200 dark:border-red-800 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}