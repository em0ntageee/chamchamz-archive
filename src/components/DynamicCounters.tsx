import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, AlertCircle, Heart } from 'lucide-react';
import countersData from '../data/counters.json';
import { SITE_CONFIG } from '../data';

export default function DynamicCounters() {
  // LIVESTREAM DATE calculations
  const livestreamDateStr = countersData.stream_date || "2025-11-05";

  const [daysSince, setDaysSince] = useState<number>(225);

  // MANIFEST CANDLE and CLOVER states
  const [isCandleLitToday, setIsCandleLitToday] = useState(false);
  const [justLit, setJustLit] = useState(false);

  // 1. Calculate days passed since livestream date
  useEffect(() => {
    try {
      const streamDate = new Date(livestreamDateStr);
      const today = new Date();
      
      streamDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - streamDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysSince(diffDays >= 0 ? diffDays : 0);
    } catch (e) {
      setDaysSince(225);
    }
  }, [livestreamDateStr]);

  // 2. Check if candle has been lit
  useEffect(() => {
    const savedState = localStorage.getItem('chamchamz_candle_lit_manifest');
    if (savedState === 'true') {
      setIsCandleLitToday(true);
    }
  }, []);

  // 3. Handle Candle lighting interaction
  const handleLightCandle = () => {
    if (isCandleLitToday) return;

    // Send POST background call to keep API routes alive but do not wait/show numbers
    fetch('/api/candle/increment', { method: 'POST' })
      .catch(() => {
        // Fail-silent, we do not block client feedback
      });

    localStorage.setItem('chamchamz_candle_lit_manifest', 'true');
    setIsCandleLitToday(true);
    setJustLit(true);
    setTimeout(() => setJustLit(false), 2000);
  };

  const showStatic = SITE_CONFIG.showStaticIcons !== false;

  return (
    <section id="dynamic-counters-section" className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Container Card */}
      <div className="bg-gradient-to-r from-brand-blue-101 via-white to-brand-cyan-100 rounded-3xl border-4 border-slate-900 p-6 md:p-8 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] relative overflow-visible">
        
        {/* Playful top tag */}
        <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-amber-300 border-2 border-slate-900 text-slate-900 font-bold text-[10px] font-mono px-3 py-1 rounded-full shadow-sm z-10">
          Chamchamz Archive ᯓ★
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Column 1: Days Since Livestream */}
          <div className="flex items-center gap-5 bg-white/60 p-5 rounded-2xl border-2 border-slate-800 backdrop-blur-xs relative overflow-hidden group">
            {showStatic && (
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-sm transform group-hover:rotate-6 transition-transform flex-shrink-0">
                {countersData.counter1_emoji || "🗓️"}
              </div>
            )}
            <div className="flex-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#1e293b]/70 uppercase block mb-1">
                {countersData.counter1_title || "Kỷ Niệm Cặp Đôi (Livestream)"}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span id="days-since-counter" className="text-3.5xl md:text-4.5xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {daysSince}
                </span>
                <span className="text-sm font-bold text-slate-500">{countersData.counter1_suffix || "ngày đã trôi qua"}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {(countersData.counter1_desc || "Được tính tự động từ ngày livestream ({date}).").replace("{date}", new Date(livestreamDateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }))}
              </p>
            </div>
          </div>

          {/* Column 2: REPLACED WITH INTERACTIVE MANIFEST CLOVER BOX */}
          <div className="bg-white/70 p-5 rounded-2xl border-2 border-slate-800 backdrop-blur-xs relative overflow-hidden flex flex-col justify-between group">
            
            <AnimatePresence mode="wait">
              {!isCandleLitToday ? (
                /* STATE 1: UNLIT - CANDLE REQUEST */
                <motion.div
                  key="unlit-manifest"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-5 flex-1"
                >
                  {showStatic && (
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-sm transform group-hover:-rotate-6 transition-transform flex-shrink-0">
                      🕯️
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#1e293b]/70 uppercase block mb-1">
                      Manifest ✨
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {countersData.manifest_lead_text || "Cùng nhau manifest cho Chamchamz bình an, may mắn, hạnh phúc và luôn ở cạnh nhau: 🕯️"}
                    </h3>
                    
                    <div className="mt-3">
                      <motion.button
                        onClick={handleLightCandle}
                        className="py-1.5 px-4 bg-slate-900 border-2 border-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-400 hover:text-slate-900 hover:border-slate-900 transition-all flex items-center gap-1.5 active:translate-y-0.5 shadow-md"
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>🕯️</span>
                        <span>Thắp Nến Ngay</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* STATE 2: LIT - GLOWING 4-LEAF CLOVER */
                <motion.div
                  key="lit-manifest"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-5 flex-1"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-sm relative overflow-visible">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative z-10"
                      >
                        🍀
                      </motion.span>
                      
                      {/* Pulsing halo */}
                      <span className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-ping" />
                    </div>
                    
                    {/* Small rising hearts */}
                    <span className="absolute -top-1 -right-1 text-xs animate-bounce">✨</span>
                  </div>

                  <div className="flex-1 py-1">
                    <div className="text-[12px] md:text-xs text-emerald-800 font-bold leading-relaxed bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 space-y-1 shadow-sm">
                      <p>Vũ trụ đã lắng nghe lời nguyện cầu!</p>
                      <p>Những điều tốt đẹp đã bắt đầu nở rộ 🍀</p>
                      <p>Hãy cùng chờ đợi những điều kỳ diệu sắp đến nha ❤️</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating particles effect on click */}
            <AnimatePresence>
              {justLit && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -45, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 flex items-center justify-center text-center text-emerald-600 font-extrabold text-xs pointer-events-none select-none z-10"
                >
                  🍀 May Mắn Đã Khởi Đầu! ✨
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Note */}
        {countersData.show_counters_bottom_note !== false && (
          <div className="mt-6 pt-5 border-t border-slate-900/10 flex items-center justify-between gap-4">
            <div className="text-[10px] text-slate-500 font-semibold italic flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#1e293b]/50" />
              <span>Góc nhỏ bình yên luôn rộng mở chào đón bạn ghé thăm mỗi ngày.</span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
