'use client';

import CurrencyConverter from './components/CurrencyConverter';
import CurrencyBackground from './components/CurrencyBackground';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <CurrencyBackground />
      <CurrencyConverter />
    </main>
  );
}
