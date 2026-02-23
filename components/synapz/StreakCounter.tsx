'use client';

import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ count, size = 'md' }: StreakCounterProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-xl gap-2',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <motion.div
        key={count}
        initial={{ scale: 1.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Flame
          size={iconSizes[size]}
          className={count > 0 ? 'text-orange-500' : 'text-slate-500'}
          fill={count > 0 ? '#f97316' : 'transparent'}
        />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`font-bold ${count > 0 ? 'text-orange-400' : 'text-slate-500'}`}
        >
          {count}
        </motion.span>
      </AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 text-sm ml-1"
        >
          day{count !== 1 ? 's' : ''}
        </motion.span>
      )}
    </div>
  );
}
