/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Mail, ShieldCheck, Heart, Info, FileText } from 'lucide-react';
import { SITE_CONFIG } from '../data';

interface FooterProps {
  onTabSwitch: (tabId: string) => void;
}

export default function Footer({ onTabSwitch }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const showStatic = SITE_CONFIG.showStaticIcons !== false;

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
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
