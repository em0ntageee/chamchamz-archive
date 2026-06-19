/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles, ArrowDown, Lock, Heart } from 'lucide-react';
import { SITE_CONFIG } from '../data';

interface HeroProps {
  onExploreClick: (tabId: string) => void;
  onAboutClick: () => void;
}

export default function Hero({ onExploreClick, onAboutClick }: HeroProps) {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4">


      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Cute Mascot Showcase Avatar */}
        <motion.div
          id="mascot-avatar"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          className="relative mb-6"
        >
          {SITE_CONFIG.mascotImageUrl ? (
            /* Outer original-ratio content box without forced circular layout and without chamchamz sticker */
            <div className="max-w-xs max-h-56 overflow-hidden rounded-2xl border-4 border-slate-800 shadow-md relative group transition-transform hover:scale-102 flex items-center justify-center bg-white p-1">
              <img 
                src={SITE_CONFIG.mascotImageUrl} 
                alt="Uploaded Mascot" 
                className="max-h-48 object-contain rounded-xl w-auto h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            /* Main mascot fallback container with sticker */
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-brand-cyan-200 via-white to-brand-blue-200 border-4 border-slate-800 flex items-center justify-center shadow-md relative group hover:rotate-3 transition-transform overflow-hidden">
              {/* Custom SVG Cute Hamster Mascot Face fallback */}
              <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-24 md:h-24">
                {/* Ears */}
                <ellipse cx="25" cy="25" rx="15" ry="12" fill="#bae6fd" stroke="#1E293B" strokeWidth="3" />
                <ellipse cx="25" cy="25" rx="8" ry="6" fill="#FCE7F3" />
                <ellipse cx="75" cy="25" rx="15" ry="12" fill="#bae6fd" stroke="#1E293B" strokeWidth="3" />
                <ellipse cx="75" cy="25" rx="8" ry="6" fill="#FCE7F3" />
                {/* Body/Face */}
                <rect x="15" y="25" width="70" height="60" rx="35" fill="#f0f9ff" stroke="#1E293B" strokeWidth="3" />
                {/* Chubby cheeks */}
                <ellipse cx="28" cy="65" rx="10" ry="7" fill="#FCA5A5" opacity="0.8" />
                <ellipse cx="72" cy="65" rx="10" ry="7" fill="#FCA5A5" opacity="0.8" />
                {/* Eyes */}
                <circle cx="38" cy="52" r="5" fill="#1E293B" />
                <circle cx="38" cy="50" r="1.5" fill="#FFFFFF" />
                <circle cx="62" cy="52" r="5" fill="#1E293B" />
                <circle cx="62" cy="50" r="1.5" fill="#FFFFFF" />
                {/* Mouth & Whiskers */}
                <path d="M 46 62 Q 50 66 54 62" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                <path d="M 50 63 L 50 58" stroke="#1E293B" strokeWidth="3" />
              </svg>
              
              {/* Cute Sticker elements overlapping the avatar */}
              <span className="absolute -top-1 -right-3 bg-rose-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-slate-800 rotate-12 shadow-sm font-sans z-10">
                CHAMCHAM {SITE_CONFIG.navbarMascotEmoji || "🐹"}
              </span>
            </div>
          )}

          {/* Halo Indicator */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-cyan-300 to-brand-blue-300 rounded-full blur-xs opacity-45 -z-10 animate-pulse"></div>
        </motion.div>



        {/* Primary Headline */}
        <motion.h1
          id="hero-headline"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-none mb-4"
        >
          <span className="bg-gradient-to-r from-brand-blue-500 via-brand-cyan-500 to-brand-blue-600 bg-clip-text text-transparent">
            {SITE_CONFIG.heroHeadline}
          </span>
          <br />
          <span className="text-2xl md:text-3.5xl lg:text-4xl text-slate-705 font-medium block mt-3">
            {SITE_CONFIG.heroSubheadline}
          </span>
        </motion.h1>

        {/* Compelling Subheadline */}
        <motion.p
          id="hero-subheadline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-650 text-sm md:text-base max-w-2xl leading-relaxed mb-8 px-4 font-medium"
        >
          {SITE_CONFIG.heroDescription}
        </motion.p>

         {/* Call to Actions (CTAs) */}
         <motion.div
           id="hero-cta-buttons"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 justify-center items-center"
         >
           {/* Main CTA */}
           {SITE_CONFIG.showHeroPrimaryCta && (
             <button
               id="btn-hero-explore"
               onClick={() => onExploreClick('hints')}
               className="group bg-slate-900 hover:bg-brand-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-102 active:scale-95 transition-all outline-none border-2 border-slate-900"
             >
               <span>{SITE_CONFIG.ctaPrimaryText}</span>
               <Sparkles className="w-4 h-4 text-brand-cyan-300 group-hover:rotate-12 transition-transform" />
             </button>
           )}
 
           {/* Secondary CTA */}
           <button
             id="btn-hero-security-rules"
             onClick={onAboutClick}
             className="bg-white hover:bg-brand-cyan-50 text-slate-700 font-semibold py-3.5 px-6 rounded-2xl border-2 border-slate-800 shadow-sm cursor-pointer flex items-center justify-center gap-2 hover:scale-102 active:scale-95 transition-transform"
           >
             <span>{SITE_CONFIG.ctaSecondaryText}</span>
             <Lock className="w-4 h-4 text-amber-500" />
           </button>
         </motion.div>

        {/* Soft Decorative Info Line - Hidden */}
      </div>
    </section>
  );
}
