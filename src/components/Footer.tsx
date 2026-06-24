/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, Heart, Info, FileText, Lock, Unlock, X, Power, AlertCircle } from 'lucide-react';
import { SITE_CONFIG } from '../data';

interface FooterProps {
  onTabSwitch: (tabId: string) => void;
}

export default function Footer({ onTabSwitch }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const showStatic = SITE_CONFIG.showStaticIcons !== false;

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('chamchamz_admin_unlocked') === 'true';
  });
  const [loginError, setLoginError] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  const fetchCommentsStatus = () => {
    fetch('/api/comments/status')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.commentsEnabled === 'boolean') {
          setCommentsEnabled(data.commentsEnabled);
        }
      })
      .catch(err => console.error('Error fetching comments status:', err));
  };

  useEffect(() => {
    if (isAdminModalOpen) {
      setIsUnlocked(localStorage.getItem('chamchamz_admin_unlocked') === 'true');
      fetchCommentsStatus();
      setLoginError('');
      setAdminPassword('');
    }
  }, [isAdminModalOpen]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'chamchamz') {
      localStorage.setItem('chamchamz_admin_unlocked', 'true');
      setIsUnlocked(true);
      setAdminPassword('');
      setLoginError('');
      window.dispatchEvent(new Event('storage'));
    } else {
      setLoginError('Mật khẩu quản trị chưa chính xác!');
    }
  };

  const handleAdminLogout = () => {
    localStorage.setItem('chamchamz_admin_unlocked', 'false');
    setIsUnlocked(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleComments = () => {
    fetch('/api/comments/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentsEnabled: !commentsEnabled,
        token: 'chamchamz'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.commentsEnabled === 'boolean') {
          setCommentsEnabled(data.commentsEnabled);
          window.dispatchEvent(new Event('storage'));
        }
      })
      .catch(err => console.error('Error toggling comments status:', err));
  };

  return (
    <footer id="footer-section" className="bg-slate-900 text-slate-300 mt-16 rounded-t-[2.5rem] border-t-4 border-slate-950 overflow-hidden">
      
      {/* Top playful branding banner */}
      {SITE_CONFIG.showFooterTopBanner !== false && (
        <div className="bg-gradient-to-r from-brand-teal-400 to-brand-cyan-400 py-3.5 px-4 text-center border-b-4 border-slate-950">
          <p className="text-slate-900 font-bold text-xs uppercase tracking-widest font-sans flex items-center justify-center gap-1.5">
            <span>{SITE_CONFIG.footerTopBannerText || "ONLY FOR CHAMCHAMZ"}</span>
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Col 1: Brand & Bio (Col-5) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2 group">
            {SITE_CONFIG.showFooterLogo !== false && (
              <div className="w-8 h-8 rounded-lg bg-brand-cyan-200 border-2 border-slate-950 flex items-center justify-center text-lg shadow-sm">
                {showStatic ? (SITE_CONFIG.footerLogoEmoji || "🐾") : "🏢"}
              </div>
            )}
            <strong className="text-white text-lg font-bold tracking-tight">{SITE_CONFIG.footerLogoText || "Chamchamz Archive"}</strong>
          </div>
          
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
            {SITE_CONFIG.footerBrandDesc || "Nơi cất giữ báu vật rực rỡ và những hạt giống niềm vui của bé Chamchamz. Chúng tôi cam kết tạo ra một môi trường lưu trữ an toàn, tôn trọng quyền riêng tư của thần tượng và cộng đồng người hâm mộ tại Việt Nam."}
          </p>

          {SITE_CONFIG.footerProtectionText && (
            <div className="flex items-center gap-2 text-[10px] text-brand-teal-400 font-bold">
              {showStatic && <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-400" />}
              <span>{SITE_CONFIG.footerProtectionText}</span>
            </div>
          )}
        </div>

        {/* Col 2: Navigation (Col-3) */}
        {SITE_CONFIG.showFooterNav !== false && (
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">{SITE_CONFIG.footerNavTitle || "Bản đồ Thư Mục"}</h4>
            <ul className="space-y-2 text-xs font-semibold">
              {SITE_CONFIG.showHints !== false && (
                <li>
                  <button
                    id="footer-link-hints"
                    onClick={() => onTabSwitch('hints')}
                    className="text-slate-400 hover:text-brand-cyan-300 cursor-pointer hover:translate-x-1 transition-transform text-left"
                  >
                    {SITE_CONFIG.footerNavHintLabel || "📁 Hộp Manh Mối (Hints)"}
                  </button>
                </li>
              )}
              {SITE_CONFIG.showGallery !== false && (
                <li>
                  <button
                    id="footer-link-gallery"
                    onClick={() => onTabSwitch('gallery')}
                    className="text-slate-400 hover:text-brand-cyan-300 cursor-pointer hover:translate-x-1 transition-transform text-left"
                  >
                    {SITE_CONFIG.footerNavGalleryLabel || "📁 Triển Lãm Ảnh (Gallery)"}
                  </button>
                </li>
              )}
              {SITE_CONFIG.showRecs !== false && (
                <li>
                  <button
                    id="footer-link-recs"
                    onClick={() => onTabSwitch('recs')}
                    className="text-slate-400 hover:text-brand-cyan-300 cursor-pointer hover:translate-x-1 transition-transform text-left"
                  >
                    {SITE_CONFIG.footerNavRecsLabel || "📁 Đề Xuất Nghệ Thuật (Recs)"}
                  </button>
                </li>
              )}
              {SITE_CONFIG.showContact !== false && (
                <li>
                  <button
                    id="footer-link-contact"
                    onClick={() => onTabSwitch('contact')}
                    className="text-slate-400 hover:text-brand-cyan-300 cursor-pointer hover:translate-x-1 transition-transform text-left"
                  >
                    {SITE_CONFIG.footerNavContactLabel || "📁 Hòm Thư Yêu Thương (Contact)"}
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Col 3: Contact & Legal (Col-4) */}
        {SITE_CONFIG.showFooterContactCol !== false && (
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">{SITE_CONFIG.footerContactTitle || "Liên Hệ Người Giữ Khóa"}</h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-450 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                {showStatic && <Mail className="w-4 h-4 text-brand-teal-400 flex-shrink-0" />}
                <span className="font-mono text-[11px] text-slate-350">{SITE_CONFIG.footerContactEmail || "archive@chamchamz.fan"}</span>
              </div>

              {SITE_CONFIG.footerContactInfoText && (
                <div className="flex gap-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  {showStatic && <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                  <span>{SITE_CONFIG.footerContactInfoText}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Ground bottom footer line */}
      {SITE_CONFIG.showFooterBottomBar !== false && (
        <div className="bg-slate-950 py-6 px-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>{SITE_CONFIG.footerCopyrightText || `© ${currentYear} Chamchamz Archive. Bản quyền được bảo vệ an ninh tuyệt hảo.`}</p>
            <div className="flex gap-4 items-center">
              <span className="hover:text-slate-400 cursor-default">{SITE_CONFIG.footerPolicyLabel || "Chính Sách Nội Bộ"}</span>
              <span className="hover:text-slate-400 cursor-default">{SITE_CONFIG.footerTermsLabel || "Điều Khoản Fan"}</span>
              <span className="text-slate-700">|</span>
              <button 
                id="footer-admin-btn"
                onClick={() => setIsAdminModalOpen(true)}
                className="hover:text-brand-cyan-300 hover:scale-105 active:scale-95 transition-all text-slate-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-teal-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl border-4 border-slate-900 p-6 shadow-[5px_5px_0px_rgba(15,23,42,1)] w-full max-w-md relative text-slate-850 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-slate-900 bg-slate-100 hover:bg-rose-100 text-slate-900 cursor-pointer hover:scale-105 transition-all"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              {!isUnlocked ? (
                /* 1. LOGIN STATE */
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="text-center pb-2">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl border-2 border-slate-900 flex items-center justify-center text-2xl mx-auto mb-2">
                      🔐
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">Xác Thực Quyền Admin</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Vui lòng nhập mật khẩu quản trị để mở khóa chức năng kiểm duyệt và cài đặt hòm thư.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1">
                      <span>Mật khẩu quản trị:</span>
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-rose-400 placeholder-slate-400 text-slate-800 transition-colors"
                      autoFocus
                    />
                  </div>

                  {loginError && (
                    <p className="text-[10px] font-bold text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100 text-center">
                      ⚠️ {loginError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-900 border-2 border-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-brand-cyan-300 hover:text-slate-900 hover:border-slate-900 transition-all flex items-center justify-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Xác Nhận</span>
                  </motion.button>
                </form>
              ) : (
                /* 2. ADMIN PANEL STATE */
                <div className="space-y-5">
                  <div className="text-center pb-2 border-b border-slate-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl border-2 border-slate-900 flex items-center justify-center text-2xl mx-auto mb-2">
                      🛡️
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">Bảng Điều Khiển Admin</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span>Đã đăng nhập hệ thống bảo an</span>
                    </p>
                  </div>

                  {/* Mailbox toggle feature */}
                  <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Trạng thái hòm thư yêu thương</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Cho phép người hâm mộ gửi thư mới</p>
                      </div>
                      <button
                        onClick={handleToggleComments}
                        className={`py-1.5 px-3 rounded-lg font-bold text-[10px] border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                          commentsEnabled
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{commentsEnabled ? 'ĐANG MỞ' : 'TẠM KHÓA'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Explanation for deletion */}
                  <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-[11px] text-sky-800 font-semibold leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1 text-xs">
                      <span>💡 Mẹo lọc thư nhanh:</span>
                    </p>
                    <p>
                      Khi quyền Admin được mở khóa, nút xóa (<span className="text-rose-600 font-bold">Trash 🗑️</span>) sẽ tự động xuất hiện kế bên các bức thư tại khu vực <strong className="text-slate-900">"Lời yêu gửi Chamchamz"</strong> ở phía trên.
                    </p>
                    <p>Bạn chỉ cần cuộn lên đó và nhấn trực tiếp nút xóa để lọc bỏ thư rác/spam.</p>
                  </div>

                  {/* Logout */}
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setIsAdminModalOpen(false)}
                      className="flex-1 py-2 px-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Xong
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="flex-1 py-2 px-3 bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Đăng Xuất Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
}
