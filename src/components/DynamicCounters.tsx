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
  const [visitorCount, setVisitorCount] = useState<number>(5240);
  const [candleCount, setCandleCount] = useState<number>(1314);
  const [isCandleLitToday, setIsCandleLitToday] = useState(false);
  const [justLit, setJustLit] = useState(false);

  // Admin Config Panel Visibility and Verification
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return localStorage.getItem('chamchamz_admin_unlocked') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [adminDateInput, setAdminDateInput] = useState(livestreamDateStr);
  const [adminVisitorInput, setAdminVisitorInput] = useState(String(visitorCount));
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Admin Comments Management states
  const [adminTab, setAdminTab] = useState<'counters' | 'comments'>('counters');
  const [adminComments, setAdminComments] = useState<any[]>([]);
  const [commentsSearch, setCommentsSearch] = useState('');
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

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

    // Increment visitor count globally on mount
    fetch('/api/visitor/increment', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (active && typeof data.visitorCount === 'number') {
          setVisitorCount(data.visitorCount);
          setAdminVisitorInput(String(data.visitorCount));
        }
      })
      .catch(err => console.error('Error incrementing visitor count:', err));

    // Fetch initial stats
    const fetchStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          if (active) {
            if (typeof data.visitorCount === 'number') {
              setVisitorCount(data.visitorCount);
              setAdminVisitorInput(String(data.visitorCount));
            }
            if (typeof data.candleCount === 'number') {
              setCandleCount(data.candleCount);
            }
          }
        })
        .catch(err => console.error('Error fetching global stats:', err));
    };

    fetchStats();

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
      .then(res => res.json())
      .then(data => {
        if (typeof data.candleCount === 'number') {
          setCandleCount(data.candleCount);
        }
      })
      .catch(err => console.error('Failed to light candle:', err));

    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('chamchamz_candle_lit_date', todayStr);
    setIsCandleLitToday(true);
    setJustLit(true);
    setTimeout(() => setJustLit(false), 2000);
  };

  // 5. Admin Password Verification
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordInput === 'chamchamz') {
      setIsAdminUnlocked(true);
      localStorage.setItem('chamchamz_admin_unlocked', 'true');
      setPasswordInput('');
      window.dispatchEvent(new Event('storage')); // Notify comments board instantly
    } else {
      setPasswordError('Mật khẩu không chính xác! Gợi ý: mật khẩu là tên gia đình của hai đứa.');
    }
  };

  // 5.5 Fetch & Delete Admin Comments
  const fetchAdminComments = () => {
    setIsCommentsLoading(true);
    fetch('/api/comments')
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setAdminComments(data);
            localStorage.setItem('chamchamz_local_comments', JSON.stringify(data));
          } else {
            throw new Error('Not an array');
          }
        } catch (e) {
          const saved = localStorage.getItem('chamchamz_local_comments');
          if (saved) setAdminComments(JSON.parse(saved));
        }
      })
      .catch(err => {
        console.error('Error fetching admin comments:', err);
        const saved = localStorage.getItem('chamchamz_local_comments');
        if (saved) setAdminComments(JSON.parse(saved));
      })
      .finally(() => setIsCommentsLoading(false));

    fetch('/api/comments/status')
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && typeof data.commentsEnabled === 'boolean') {
            setCommentsEnabled(data.commentsEnabled);
            localStorage.setItem('chamchamz_comments_enabled', String(data.commentsEnabled));
          }
        } catch (e) {
          const localEnabled = localStorage.getItem('chamchamz_comments_enabled') !== 'false';
          setCommentsEnabled(localEnabled);
        }
      })
      .catch(err => {
        console.error('Error fetching admin comments status:', err);
        const localEnabled = localStorage.getItem('chamchamz_comments_enabled') !== 'false';
        setCommentsEnabled(localEnabled);
      });
  };

  const handleToggleComments = (newValue: boolean) => {
    // Save locally first immediately for static hosts
    setCommentsEnabled(newValue);
    localStorage.setItem('chamchamz_comments_enabled', String(newValue));
    window.dispatchEvent(new Event('storage')); // notify other sections

    fetch('/api/comments/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentsEnabled: newValue,
        token: 'chamchamz'
      })
    })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!data.success) {
            console.warn(data.error || 'Cập nhật trạng thái trên server thất bại!');
          }
        } catch (e) {
          // Handled locally
        }
      })
      .catch(err => {
        console.error('Error toggling comments status on server:', err);
      });
  };

  const handleDeleteAdminComment = (id: string) => {
    if (!window.confirm('Cậu có chắc chắn muốn xóa lời yêu thương này không? Action này không thể hoàn tác!')) {
      return;
    }

    // Delete locally first immediately
    setAdminComments(prev => prev.filter(c => c.id !== id));
    try {
      const saved = localStorage.getItem('chamchamz_local_comments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          localStorage.setItem('chamchamz_local_comments', JSON.stringify(parsed.filter((c: any) => c.id !== id)));
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new Event('storage')); // notify other sections

    fetch(`/api/comments/${id}?token=chamchamz`, {
      method: 'DELETE'
    })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!data.success) {
            console.warn(data.error || 'Xóa trên server thất bại!');
          }
        } catch (e) {
          // Handled locally
        }
      })
      .catch(err => {
        console.error('Error deleting comment on server:', err);
      });
  };

  useEffect(() => {
    if (isAdminUnlocked && adminTab === 'comments' && isAdminOpen) {
      fetchAdminComments();
    }
  }, [isAdminUnlocked, adminTab, isAdminOpen]);

  // 6. Save new admin specifications
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

    // Call server to set counter globally
    fetch('/api/visitor/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: parsedVisits,
        token: 'chamchamz'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAdminError(data.error);
        } else {
          localStorage.setItem('chamchamz_stream_date', adminDateInput);
          setLivestreamDateStr(adminDateInput);
          setVisitorCount(parsedVisits);
          setAdminSuccess(true);
          setTimeout(() => {
            setAdminSuccess(false);
            setIsAdminOpen(false);
          }, 1500);
        }
      })
      .catch(err => {
        console.error('Admin set visitor count error:', err);
        setAdminError('Lỗi kết nối server!');
      });
  };

  // 7. Reset counters to 0
  const handleResetToZero = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    fetch('/api/visitor/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: 0,
        token: 'chamchamz'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAdminError(data.error);
        } else {
          localStorage.setItem('chamchamz_stream_date', todayStr);
          setAdminDateInput(todayStr);
          setAdminVisitorInput('0');
          setLivestreamDateStr(todayStr);
          setVisitorCount(0);
          setAdminSuccess(true);
          setTimeout(() => {
            setAdminSuccess(false);
            setIsAdminOpen(false);
          }, 1500);
        }
      })
      .catch(err => {
        console.error('Reset error:', err);
        setAdminError('Lỗi kết nối server!');
      });
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
              <h4 className="text-xs md:text-sm font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-1.5">
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
            
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-800 border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-xl cursor-pointer transition-colors"
            >
              ⚙️ Admin Panel
            </button>
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
                    <p className="text-[10px] text-slate-400 font-semibold">Cấu hình dữ liệu counter & bình luận</p>
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

              {/* Password Gate */}
              {!isAdminUnlocked ? (
                <form onSubmit={handleVerifyPassword} className="space-y-4">
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Vui lòng nhập mật khẩu quản trị để sửa đổi chỉ số hoặc quản trị quyền bình luận:
                  </p>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Mật Khẩu</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-cyan-500 text-slate-800"
                    />
                  </div>

                  {passwordError && (
                    <div className="text-[9px] font-bold text-rose-500 bg-rose-50 p-2 border border-rose-100 rounded-xl">
                      {passwordError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 border-2 border-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-brand-cyan-500 hover:text-slate-900 hover:border-slate-900 transition-colors"
                  >
                    Xác Thực Admin
                  </button>
                </form>
              ) : (
                /* Unlocked Admin Panel Forms */
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl text-emerald-800 text-[10px] font-bold">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      Đã mở khóa quyền quản trị!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminUnlocked(false);
                        localStorage.removeItem('chamchamz_admin_unlocked');
                        window.dispatchEvent(new Event('storage'));
                      }}
                      className="text-[9px] underline text-rose-600 hover:text-rose-800 cursor-pointer"
                    >
                      Khóa lại 🔒
                    </button>
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAdminTab('counters')}
                      className={`flex-1 py-2 text-xs font-extrabold border-b-2 text-center transition-colors cursor-pointer ${
                        adminTab === 'counters'
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      ⚙️ Chỉ Số
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('comments')}
                      className={`flex-1 py-2 text-xs font-extrabold border-b-2 text-center transition-colors cursor-pointer ${
                        adminTab === 'comments'
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      ✉️ Quản lý Thư & Lời Yêu
                    </button>
                  </div>

                  {adminTab === 'counters' ? (
                    <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                      {/* Event date configuration */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">Ngày livestream bắt đầu (Livestream Date)</label>
                        <input
                          id="input-admin-stream-date"
                          type="date"
                          value={adminDateInput}
                          onChange={(e) => setAdminDateInput(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-cyan-500 text-slate-800"
                        />
                        <p className="text-[10px] text-slate-400 font-semibold">Mặc định: {DEFAULT_STREAM_DATE}. Thay đổi ngày sẽ cập nhật số ngày kỷ niệm cặp đôi.</p>
                      </div>

                      {/* Visit Baseline configuration */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block">Thiết lập số lượt truy cập (Visits Value)</label>
                        <input
                          id="input-admin-visitor-count"
                          type="number"
                          value={adminVisitorInput}
                          onChange={(e) => setAdminVisitorInput(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-brand-cyan-500 text-slate-800"
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
                          <span>Cập nhật thành công!</span>
                        </div>
                      )}

                      {/* Submit button bar */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
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
                  ) : (
                    /* Lời Yêu Thương Management sub-view */
                    <div className="space-y-3">
                      {/* Comments status toggle switch */}
                      <div className="flex items-center justify-between p-3 bg-white border-2 border-slate-200 rounded-xl">
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800">Trạng thái nhận Thư & Lời yêu mới</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            {commentsEnabled ? 'Đang mở (Fan có thể gửi lời chúc mới)' : 'Đã đóng (Ẩn khung gửi thư, chỉ hiện lời chúc cũ)'}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={commentsEnabled}
                            onChange={(e) => handleToggleComments(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                        </label>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={commentsSearch}
                          onChange={(e) => setCommentsSearch(e.target.value)}
                          placeholder="Tìm người gửi hoặc nội dung..."
                          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold focus:outline-none focus:border-slate-800 text-slate-800"
                        />
                      </div>

                      {/* Comments Scroll Container */}
                      <div className="border-2 border-slate-200 rounded-xl bg-slate-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {isCommentsLoading ? (
                          <div className="p-8 text-center text-xs text-slate-400 font-semibold flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                            <span>Đang tải lời yêu thương...</span>
                          </div>
                        ) : (() => {
                          const filtered = adminComments.filter(c => {
                            const term = commentsSearch.toLowerCase();
                            return (
                              c.from.toLowerCase().includes(term) ||
                              c.text.toLowerCase().includes(term)
                            );
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="p-8 text-center text-xs text-slate-400 font-bold">
                                Không tìm thấy lời yêu thương nào!
                              </div>
                            );
                          }

                          return filtered.map((c) => {
                            let badgeBg = 'bg-slate-100 text-slate-700';
                            let emoji = '💖';
                            if (c.to === 'James') {
                              badgeBg = 'bg-amber-100 text-amber-800';
                              emoji = '🐈‍⬛';
                            } else if (c.to === 'Juhoon') {
                              badgeBg = 'bg-sky-100 text-sky-850';
                              emoji = '🐢';
                            }
                            
                            return (
                              <div key={c.id} className="p-3 bg-white hover:bg-slate-50/50 flex items-start justify-between gap-3 transition-colors">
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-xs text-slate-800 truncate">{c.from}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-1 ${badgeBg}`}>
                                      <span>{emoji}</span>
                                      <span>{c.to === 'Chamchamz' ? 'Cả hai' : c.to}</span>
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-650 font-medium break-words leading-normal">
                                    {c.text}
                                  </p>
                                  <span className="text-[9px] font-mono text-slate-400 block font-semibold">
                                    {new Date(c.timestamp).toLocaleString('vi-VN')}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdminComment(c.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-150 text-rose-600 hover:text-rose-800 border border-rose-100 hover:border-rose-200 rounded-lg cursor-pointer transition-colors flex-shrink-0 self-center"
                                  title="Xóa lời yêu thương này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
