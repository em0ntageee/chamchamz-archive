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
  // Upper area (y: 5% - 25%) - Left & Right
  { emoji: '⭐', size: 'text-2xl md:text-3xl', x: '5%', y: '8%', delay: 0, duration: 4.5 },
  { emoji: '🐾', size: 'text-xl md:text-2xl', x: '92%', y: '12%', delay: 1.5, duration: 4.8 },
  { emoji: '🌸', size: 'text-2xl md:text-3xl', x: '15%', y: '20%', delay: 0.8, duration: 5.2 },
  { emoji: '💖', size: 'text-xl md:text-2xl', x: '82%', y: '18%', delay: 2.3, duration: 4.0 },

  // Middle-Upper Area (y: 28% - 48%) - Spaced out nicely
  { emoji: '🐢', size: 'text-2xl md:text-3xl', x: '4%', y: '33%', delay: 1.2, duration: 5.0 },
  { emoji: '⭐', size: 'text-lg md:text-xl', x: '94%', y: '38%', delay: 0.4, duration: 4.6 },
  { emoji: '❤️', size: 'text-2xl md:text-3xl', x: '12%', y: '45%', delay: 2.1, duration: 5.5 },
  { emoji: '🍀', size: 'text-2xl md:text-3xl', x: '86%', y: '46%', delay: 1.1, duration: 4.9 },

  // MIDDLE BODY (y: 50% - 70%) - "thân giữa website hơi ít icon, thêm 1 chút nhé"
  { emoji: '🐢', size: 'text-2xl md:text-3xl', x: '7%', y: '56%', delay: 0.5, duration: 5.3 },
  { emoji: '💖', size: 'text-2xl md:text-3.5xl', x: '91%', y: '62%', delay: 1.8, duration: 4.7 },
  { emoji: '🌸', size: 'text-xl md:text-2xl', x: '14%', y: '68%', delay: 2.7, duration: 5.1 },
  { emoji: '⭐', size: 'text-2xl md:text-3xl', x: '85%', y: '69%', delay: 0.9, duration: 4.3 },

  // Lower Area (y: 75% - 95%) - Beautiful distribution
  { emoji: '🐢', size: 'text-2xl md:text-3xl', x: '9%', y: '80%', delay: 1.9, duration: 5.1 },
  { emoji: '❤️', size: 'text-xl md:text-2xl', x: '93%', y: '82%', delay: 0.2, duration: 4.7 },
  { emoji: '🌼', size: 'text-2xl md:text-3.5xl', x: '35%', y: '94%', delay: 1.1, duration: 5.4 },
  { emoji: '🐾', size: 'text-xl md:text-2.5xl', x: '68%', y: '92%', delay: 2.5, duration: 4.9 },
  { emoji: '💖', size: 'text-2xl md:text-3xl', x: '87%', y: '91%', delay: 1.4, duration: 4.6 },
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
