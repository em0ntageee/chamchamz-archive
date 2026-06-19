/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Eye, HelpCircle, RefreshCw, X, ShieldAlert, Check, Sparkles, AlertCircle } from 'lucide-react';
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

  // VISITOR COUNTER setup
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    const saved = localStorage.getItem('chamchamz_visitor_count_reset_v3');
    if (saved) return parseInt(saved, 10);
    // Base value loaded from CMS counters_data
    return typeof countersData.base_visits === 'number' ? countersData.base_visits : 0;
  });

  // Admin Config Panel Visibility
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminDateInput, setAdminDateInput] = useState(livestreamDateStr);
  const [adminVisitorInput, setAdminVisitorInput] = useState(String(visitorCount));
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Calculate days passed since livestream date
  useEffect(() => {
    try {
      const streamDate = new Date(livestreamDateStr);
      const today = new Date();
      
      // Reset hours to get exact integer days
      streamDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - streamDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Safeguard against future date
      setDaysSince(diffDays >= 0 ? diffDays : 0);
    } catch (e) {
      setDaysSince(225);
    }
  }, [livestreamDateStr]);

  // Initial land visitor increment + continuous live updates simulation
  useEffect(() => {
    // Land increment
    const updatedCount = visitorCount + 1;
    setVisitorCount(updatedCount);
    localStorage.setItem('chamchamz_visitor_count_reset_v3', String(updatedCount));

    // Simulated ticking (sporadic visitor increments every 5-15 seconds to look vibrant and alive)
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const next = prev + Math.floor(Math.random() * 2) + 1;
        localStorage.setItem('chamchamz_visitor_count_reset_v3', String(next));
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Save new admin specifications
  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess(false);

    if (!adminDateInput) {
      setAdminError('Vui lòng chọn hoặc nhập ngày livestream của cặp đôi!');
      return;
    }

    const checkDate = new Date(adminDateInput);
    if (isNaN(checkDate.getTime())) {
      setAdminError('Định dạng ngày không hợp lệ!');
      return;
    }

    const parsedVisits = parseInt(adminVisitorInput, 10);
    if (isNaN(parsedVisits) || parsedVisits < 0) {
      setAdminError('Số lượng lượt truy cập phải là số lớn hơn hoặc bằng 0!');
      return;
    }

    localStorage.setItem('chamchamz_stream_date', adminDateInput);
    localStorage.setItem('chamchamz_visitor_count_reset_v3', String(parsedVisits));
    
    setLivestreamDateStr(adminDateInput);
    setVisitorCount(parsedVisits);
    
    setAdminSuccess(true);
    setTimeout(() => {
      setAdminSuccess(false);
      setIsAdminOpen(false);
    }, 1500);
  };

  // Reset counters to 0 / values specified in requirements
  const handleResetToZero = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setAdminDateInput(todayStr);
    setAdminVisitorInput('0');
    
    localStorage.setItem('chamchamz_stream_date', todayStr);
    localStorage.setItem('chamchamz_visitor_count_reset_v3', '0');
    
    setLivestreamDateStr(todayStr);
    setVisitorCount(0);
    
    setAdminSuccess(true);
    setTimeout(() => {
      setAdminSuccess(false);
      setIsAdminOpen(false);
    }, 1500);
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

        {/* Admin configuration button bottom bar - Hidden on main website and managed in CMS */}
        {countersData.show_counters_bottom_note !== false && countersData.counters_bottom_note && (
          <div className="mt-6 pt-5 border-t border-slate-900/10 flex items-center justify-between">
            <div className="text-[10px] text-slate-500 font-semibold italic flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#1e293b]/50" />
              <span>{countersData.counters_bottom_note}</span>
            </div>
          </div>
        )}

      </div>

      {/* ⚙️ ADMIN CONTROLLER DIALOG EXPANSION */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              onClick={() => setIsAdminOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Dialog panel */}
            <motion.div
              className="bg-white rounded-3xl border-4 border-slate-900 w-full max-w-md p-6 relative z-10 shadow-2xl text-slate-800"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-cyan-100 rounded-lg text-brand-cyan-600">
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Bộ Điều Chỉnh Quản Trị</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Cài đặt trực tiếp dữ liệu counter trang chủ</p>
                  </div>
                </div>
                
                <button
                  id="btn-close-admin-counters"
                  onClick={() => setIsAdminOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form bodies */}
              <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                
                {/* Event date configuration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Ngày livestream bắt đầu (Livestream Date)</label>
                  <input
                    id="input-admin-stream-date"
                    type="date"
                    value={adminDateInput}
                    onChange={(e) => setAdminDateInput(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold">Cặp đôi livestream vào {DEFAULT_STREAM_DATE} mang lại mốc 225 ngày.</p>
                </div>

                {/* Visit Baseline configuration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Thiết lập số lượt truy cập (Visits Value)</label>
                  <input
                    id="input-admin-visitor-count"
                    type="number"
                    value={adminVisitorInput}
                    onChange={(e) => setAdminVisitorInput(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-cyan-500"
                  />
                </div>

                {/* Status messages */}
                {adminError && (
                  <div className="text-[10px] font-bold text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {adminSuccess && (
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500 animate-pulse" />
                    <span>Lưu thông tin thành công!</span>
                  </div>
                )}

                {/* Submit button bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {/* Reset action according to requirements (reset days calculation and visits to 0) */}
                  <button
                    id="btn-admin-reset-counters"
                    type="button"
                    onClick={handleResetToZero}
                    className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border-2 border-rose-100 rounded-xl text-xs cursor-pointer focus:outline-none hover:scale-102 transition-transform"
                  >
                    Reset về 0 hằng ngày
                  </button>

                  <button
                    id="btn-admin-save-counters"
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-slate-900 text-white hover:bg-brand-cyan-500 hover:text-slate-900 border-2 border-slate-900 font-bold rounded-xl text-xs cursor-pointer hover:scale-101 active:scale-97 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
