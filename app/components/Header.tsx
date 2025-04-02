'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full text-center py-8 px-4 relative"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-2xl"
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        {/* Currency symbols animation */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {['$', '€', '£', '¥', '₹'].map((symbol, index) => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="absolute text-6xl font-bold text-gray-400 dark:text-gray-600"
              style={{
                left: `${20 + index * 15}%`,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        {/* Title with enhanced gradient text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-8 font-playfair bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 tracking-tight">
            Currency Converter
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 dark:from-blue-400/30 dark:via-purple-400/30 dark:to-pink-400/30 rounded-full mx-auto max-w-2xl"
          />
        </motion.div>
      </motion.div>
    </motion.header>
  );
}