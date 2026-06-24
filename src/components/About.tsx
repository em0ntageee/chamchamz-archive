/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, BookOpen, Quote, Heart, CheckCircle2, LockKeyhole } from 'lucide-react';
import { SITE_CONFIG } from '../data';

export default function About() {
  const [pledgesCount, setPledgesCount] = useState(520);
  const [justClicked, setJustClicked] = useState(false);
  const [isAgreed, setIsAgreed] = useState(() => {
    return localStorage.getItem('chamchamz_security_agreed') === 'true';
  });

  // Load pledge count from server (synced globally)
  const fetchPledges = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.pledgeCount === 'number') {
          setPledgesCount(data.pledgeCount);
        }
      })
      .catch(err => {
        console.error('Error fetching pledge count:', err);
        // Local fallback: count clicks locally
        const savedClicks = localStorage.getItem('chamchamz_pledge_clicks_v2');
        const clickCount = savedClicks ? parseInt(savedClicks, 10) : 0;
        setPledgesCount(520 + clickCount);
      });
  };

  useEffect(() => {
    fetchPledges();
    // Poll the pledge count every 15 seconds to keep it updated for everyone in real-time
    const interval = setInterval(fetchPledges, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePledge = () => {
    if (isAgreed) return;
    setIsAgreed(true);
    localStorage.setItem('chamchamz_security_agreed', 'true');
    setJustClicked(true);
    setTimeout(() => setJustClicked(false), 800);

    fetch('/api/pledge/increment', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.pledgeCount === 'number') {
          setPledgesCount(data.pledgeCount);
        }
      })
      .catch(err => {
        console.error('Error incrementing pledge count:', err);
        // Fallback: save to localStorage click count
        const savedClicks = localStorage.getItem('chamchamz_pledge_clicks_v2');
        const clickCount = (savedClicks ? parseInt(savedClicks, 10) : 0) + 1;
        localStorage.setItem('chamchamz_pledge_clicks_v2', String(clickCount));
        setPledgesCount(520 + clickCount);
      });
  };

  return (
    <section id="about-section" className="py-16 bg-white rounded-3xl mx-4 my-8 p-6 md:p-12 shadow-xs border border-brand-teal-100 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center gap-2.5">
            <BookOpen className="w-7 h-7 text-brand-teal-500" />
            <span>{SITE_CONFIG.aboutTitle || "Về Chamchamz Archive 🎨"}</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-brand-cyan-300 to-brand-teal-300 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Story (Col-7) */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>{SITE_CONFIG.aboutStoryTitle || "🏰 Câu Chuyện Của Góc Nhỏ"}</span>
              </h3>
              {SITE_CONFIG.aboutStoryPara1 && (
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                  {SITE_CONFIG.aboutStoryPara1}
                </p>
              )}
              {SITE_CONFIG.aboutStoryPara2 && (
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                  {SITE_CONFIG.aboutStoryPara2}
                </p>
              )}
            </div>

            {/* Credibility Card */}
            {SITE_CONFIG.aboutTrustText && (
              <div className="p-4 rounded-2xl bg-brand-cyan-50 border border-brand-cyan-200 mt-4">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-brand-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cyan-800">
                      {SITE_CONFIG.aboutTrustTitle || "ĐỘ TIN CẬY TUYỆT ĐỐI"}
                    </h4>
                    <p className="text-xs text-slate-650 mt-1 leading-relaxed font-semibold">
                      {SITE_CONFIG.aboutTrustText}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Strict Security Rules Block (Col-5) */}
          <div className="md:col-span-5 bg-gradient-to-br from-brand-teal-50/70 to-brand-cyan-50/70 rounded-2xl p-6 border-2 border-brand-teal-200/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600 w-fit">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {SITE_CONFIG.aboutRulesTitle || "Quy Tắc Tối Thượng 🔐"}
              </h3>
              {SITE_CONFIG.aboutRulesSubtitle && (
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  {SITE_CONFIG.aboutRulesSubtitle}
                </p>
              )}
              
              {/* Rules check list */}
              <ul className="space-y-2.5 text-xs text-slate-650 font-semibold">
                {SITE_CONFIG.aboutRule1 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{SITE_CONFIG.aboutRule1}</span>
                  </li>
                )}
                {SITE_CONFIG.aboutRule2 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{SITE_CONFIG.aboutRule2}</span>
                  </li>
                )}
                {SITE_CONFIG.aboutRule3 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{SITE_CONFIG.aboutRule3}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Interactive Pledge Widget */}
            <div className="mt-6 pt-5 border-t border-brand-teal-200/50">
              <div className="relative">
                <motion.button
                  id="btn-sign-pledge"
                  onClick={handlePledge}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs border-2 cursor-pointer transition-colors flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                    isAgreed 
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-slate-900 border-slate-900 text-white hover:bg-brand-teal-500 hover:text-slate-900 hover:border-slate-900'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className={`w-4 h-4 text-rose-400 ${justClicked ? 'scale-150 animate-bounce' : 'animate-pulse'}`} />
                  <span>{isAgreed ? "Đã ghi nhận." : "Mình đã nắm rõ quy định"}</span>
                </motion.button>

                {justClicked && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -40, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-x-0 -top-8 text-center text-rose-500 font-bold text-sm pointer-events-none"
                  >
                    ❤️
                  </motion.div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
