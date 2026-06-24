import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Eye, HelpCircle, RefreshCw, X, ShieldAlert, Check, Sparkles, AlertCircle, Heart, Lock, Trash2, Search, MessageSquare } from 'lucide-react';
import countersData from '../data/counters.json';
import { SITE_CONFIG } from '../data';

export default function DynamicCounters() {
  // LIVESTREAM DATE calculations
  const DEFAULT_STREAM_DATE = countersData.stream_date || "2025-11-05";
  const [livestreamDateStr, setLivestreamDateStr] = useState<string>(() => {
    const saved = localStorage.getItem('chamchamz_stream_date');
    return saved || DEFAULT_STREAM_DATE;
  });

  const [daysSince, setDaysSince] = useState<number>(225);

  // VISITOR COUNTER and CANDLE MANIFEST setups
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [candleCount, setCandleCount] = useState<number>(0);
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

  // 2. Fetch/Increment on mount & poll counts from backend
  useEffect(() => {
    let active = true;

    // Helper to get local fallback counts
    const getLocalVisitorCount = () => {
      const saved = localStorage.getItem('chamchamz_visitor_count');
      return saved ? parseInt(saved, 10) : 0;
    };

    const getLocalCandleCount = () => {
      const saved = localStorage.getItem('chamchamz_candle_count');
      return saved ? parseInt(saved, 10) : 0;
    };

    const saveLocalVisitorCount = (val: number) => {
      localStorage.setItem('chamchamz_visitor_count', String(val));
    };

    const saveLocalCandleCount = (val: number) => {
      localStorage.setItem('chamchamz_candle_count', String(val));
    };

    // Fetch initial stats
    const fetchStats = () => {
      fetch('/api/stats')
        .then(async res => {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (active) {
              if (typeof data.visitorCount === 'number') {
                setVisitorCount(data.visitorCount);
                saveLocalVisitorCount(data.visitorCount);
              }
              if (typeof data.candleCount === 'number') {
                setCandleCount(data.candleCount);
                saveLocalCandleCount(data.candleCount);
              }
            }
          } catch (e) {
            if (active) {
              setVisitorCount(getLocalVisitorCount());
              setCandleCount(getLocalCandleCount());
            }
          }
        })
        .catch(err => {
          if (active) {
            setVisitorCount(getLocalVisitorCount());
            setCandleCount(getLocalCandleCount());
          }
        });
    };

    const hasVisitedThisSession = sessionStorage.getItem('chamchamz_visited');

    if (!hasVisitedThisSession) {
      // Increment visitor count globally on mount for a new session
      fetch('/api/visitor/increment', { method: 'POST' })
        .then(async res => {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (active && typeof data.visitorCount === 'number') {
              setVisitorCount(data.visitorCount);
              saveLocalVisitorCount(data.visitorCount);
              sessionStorage.setItem('chamchamz_visited', 'true');
            }
          } catch (e) {
            // Handle parsing error
          }
          if (active) {
            fetchStats();
          }
        })
        .catch(err => {
          if (active) {
            fetchStats();
          }
        });
    } else {
      // Already visited in this session, just fetch stats
      fetchStats();
    }

    // Poll counts every 10 seconds to keep pages updated across clients
    const pollInterval = setInterval(fetchStats, 10000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, []);

  // 3. Check if candle has been lit today
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('chamchamz_candle_lit_date');
    if (savedDate === todayStr) {
      setIsCandleLitToday(true);
    }
  }, []);

  // 4. Handle Candle lighting interaction
  const handleLightCandle = () => {
    if (isCandleLitToday) return;

    fetch('/api/candle/increment', { method: 'POST' })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (typeof data.candleCount === 'number') {
            setCandleCount(data.candleCount);
            localStorage.setItem('chamchamz_candle_count', String(data.candleCount));
          }
        } catch (e) {
          const saved = localStorage.getItem('chamchamz_candle_count');
          const current = saved ? parseInt(saved, 10) : 0;
          const updated = current + 1;
          setCandleCount(updated);
          localStorage.setItem('chamchamz_candle_count', String(updated));
        }
      })
      .catch(err => {
        const saved = localStorage.getItem('chamchamz_candle_count');
        const current = saved ? parseInt(saved, 10) : 0;
        const updated = current + 1;
        setCandleCount(updated);
        localStorage.setItem('chamchamz_candle_count', String(updated));
      });

    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('chamchamz_candle_lit_date', todayStr);
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
        {countersData.show_counters_section_title !== false && countersData.counters_section_title && (
          <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-amber-300 border-2 border-slate-900 text-slate-900 font-bold text-[10px] uppercase font-mono px-3 py-1 rounded-full shadow-sm z-10">
            {countersData.counters_section_title}
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Counter 1: Days Since Livestream */}
          <div className="flex items-center gap-5 bg-white/60 p-5 rounded-2xl border-2 border-slate-800 backdrop-blur-xs relative overflow-hidden group">
            {showStatic && (
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-sm transform group-hover:rotate-6 transition-transform">
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

          {/* Counter 2: Website Visitors */}
          <div className="flex items-center gap-5 bg-white/60 p-5 rounded-2xl border-2 border-slate-800 backdrop-blur-xs relative overflow-hidden group">
            {showStatic && (
              <div className="w-16 h-16 rounded-2xl bg-brand-cyan-300 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-sm transform group-hover:-rotate-6 transition-transform">
                {countersData.counter2_emoji || "🐾"}
              </div>
            )}
            <div className="flex-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#1e293b]/70 uppercase block mb-1">
                {countersData.counter2_title || "Tổng Lượt Tham Quan Archive"}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span id="visitor-counter" className="text-3.5xl md:text-4.5xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {visitorCount.toLocaleString()}
                </span>
                {/* Active glow tag to mimic real-time updates */}
                {countersData.show_counter2_live_tag !== false && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse ml-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {countersData.counter2_live_tag || "Live"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {countersData.counter2_desc || "Số lần fan chân chính mở xem rương lưu trữ kể từ ngày đầu tiên xây dựng."}
              </p>
            </div>
          </div>

        </div>

        {/* 🕯️ INTERACTIVE CANDLE MANIFEST BLOCK (PLACED UNDER THE TWO MAIN COUNTERS) */}
        <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-900/10">
          <div className="bg-amber-50/60 border-2 border-slate-800 rounded-2xl p-4 md:p-5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex-1 text-center md:text-left">
              <h4 
                className="text-xs md:text-sm font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-1.5 select-none"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span>Cùng nhau manifest cho Chamchamz bình an, may mắn, hạnh phúc và luôn ở cạnh nhau: 🕯️</span>
              </h4>
            </div>

            {/* Candle Buttons & Counters */}
            <div className="flex flex-row items-center gap-3 w-full md:w-auto justify-center">
              
              {/* Interactive candle thắp nến button (ON THE LEFT) */}
              <div className="relative">
                <motion.button
                  onClick={handleLightCandle}
                  disabled={isCandleLitToday}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs cursor-pointer border-2 shadow-[3px_3px_0px_rgba(15,23,42,1)] flex items-center gap-1.5 transition-all active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(15,23,42,1)] ${
                    isCandleLitToday
                      ? 'bg-amber-100 border-amber-300 text-amber-800 cursor-default'
                      : 'bg-slate-900 border-slate-900 text-white hover:bg-amber-400 hover:text-slate-900 hover:border-slate-900 hover:scale-[1.03]'
                  }`}
                  whileTap={isCandleLitToday ? {} : { scale: 0.95 }}
                >
                  <span className={`text-sm ${isCandleLitToday ? 'scale-110' : ''}`}>
                    {isCandleLitToday ? '🕯️🔥' : '🕯️'}
                  </span>
                  <span>{isCandleLitToday ? 'Nến đã thắp! ✨' : 'Thắp Nến Ngay'}</span>
                </motion.button>

                {/* Float-up effect when clicked */}
                <AnimatePresence>
                  {justLit && (
                    <motion.div
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -45, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 text-center flex items-center justify-center text-amber-500 font-extrabold text-xs pointer-events-none select-none z-10"
                    >
                      🕯️ +1 Manifest! 🔥
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total Candle count display (ON THE RIGHT) */}
              <div className="bg-white border-2 border-slate-900 px-3.5 py-1.5 rounded-2xl shadow-[3px_3px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-slate-400">Nến Đã Thắp 🕯️</span>
                <span className="text-sm md:text-base font-extrabold text-amber-600 font-mono tracking-tight">{candleCount.toLocaleString()}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Admin controller section */}
        {countersData.show_counters_bottom_note !== false && (
          <div className="mt-6 pt-5 border-t border-slate-900/10 flex items-center justify-between gap-4">
            <div className="text-[10px] text-slate-500 font-semibold italic flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#1e293b]/50" />
              <span>{countersData.counters_bottom_note}</span>
            </div>
          </div>
        )}

      </div>



    </section>
  );
}
