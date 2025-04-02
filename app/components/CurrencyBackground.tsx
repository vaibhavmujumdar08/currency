'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CurrencySymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  duration: number;
}

const CURRENCY_SYMBOLS = ['₿', 'Ξ', 'Ł', 'Ð', '₳', 'Ӿ', '₮', 'Ɍ', '◈', '∆'];

export default function CurrencyBackground() {
  const [symbols, setSymbols] = useState<CurrencySymbol[]>([]);

  useEffect(() => {
    const generateSymbols = () => {
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        symbol: CURRENCY_SYMBOLS[Math.floor(Math.random() * CURRENCY_SYMBOLS.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: 0.8 + Math.random() * 1.5,
        rotation: Math.random() * 360,
        duration: 15 + Math.random() * 20
      }));
    };

    setSymbols(generateSymbols());
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {symbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          initial={{
            x: `${symbol.x}vw`,
            y: `${symbol.y}vh`,
            scale: symbol.scale,
            rotate: symbol.rotation,
            opacity: 0.3
          }}
          animate={{
            x: [`${symbol.x}vw`, `${(symbol.x + 50) % 100}vw`],
            y: [`${symbol.y}vh`, `${(symbol.y + 50) % 100}vh`],
            rotate: [symbol.rotation, symbol.rotation + 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: symbol.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute text-3xl text-blue-400 dark:text-blue-600 select-none font-bold"
        >
          {symbol.symbol}
        </motion.div>
      ))}
    </div>
  );
}