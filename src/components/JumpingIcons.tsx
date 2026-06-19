import React from 'react';
import { motion } from 'motion/react';

interface FloatingIcon {
  emoji: string;
  size: string;
  x: string; // Left offset
  y: string; // Top offset
  delay: number;
  duration: number;
}

const FLOATING_ITEMS: FloatingIcon[] = [
  { emoji: '⭐', size: 'text-xl md:text-2xl', x: '3%', y: '8%', delay: 0, duration: 4 },
  { emoji: '🐱', size: 'text-2xl md:text-3xl', x: '8%', y: '25%', delay: 1.5, duration: 4.5 },
  { emoji: '🐢', size: 'text-xl md:text-2xl', x: '5%', y: '50%', delay: 0.5, duration: 5 },
  { emoji: '💖', size: 'text-2xl md:text-3xl', x: '12%', y: '70%', delay: 2.2, duration: 4.8 },
  { emoji: '🐷', size: 'text-3xl md:text-4xl', x: '4%', y: '90%', delay: 1.1, duration: 4.2 },
  { emoji: '✨', size: 'text-xl md:text-2xl', x: '25%', y: '15%', delay: 0.7, duration: 3.9 },
  { emoji: '⭐', size: 'text-2xl md:text-3xl', x: '50%', y: '5%', delay: 1.9, duration: 4.6 },
  { emoji: '💖', size: 'text-xl md:text-2xl', x: '75%', y: '12%', delay: 2.5, duration: 5.2 },
  { emoji: '🐱', size: 'text-2xl md:text-3xl', x: '92%', y: '8%', delay: 0.3, duration: 4.3 },
  { emoji: '🐢', size: 'text-xl md:text-2xl', x: '88%', y: '30%', delay: 1.6, duration: 4.7 },
  { emoji: '🐷', size: 'text-2xl md:text-3xl', x: '94%', y: '60%', delay: 1.2, duration: 4.1 },
  { emoji: '✨', size: 'text-2xl md:text-3xl', x: '82%', y: '85%', delay: 2.0, duration: 4.9 },
  { emoji: '⭐', size: 'text-xl md:text-2xl', x: '45%', y: '45%', delay: 0.8, duration: 5.1 },
  { emoji: '💖', size: 'text-2xl md:text-3xl', x: '65%', y: '75%', delay: 1.4, duration: 4.4 },
  { emoji: '🐱', size: 'text-2xl', x: '35%', y: '95%', delay: 2.8, duration: 4.6 },
  { emoji: '🐷', size: 'text-2xl', x: '60%', y: '92%', delay: 0.5, duration: 5.0 },
];

export default function JumpingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {FLOATING_ITEMS.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${item.size} drop-shadow-sm filter`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -28, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}
