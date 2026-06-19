/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import Hero from './components/Hero';
import DynamicCounters from './components/DynamicCounters';
import BackgroundMusic from './components/BackgroundMusic';
import About from './components/About';
import ArchiveExplorer from './components/ArchiveExplorer';
import Footer from './components/Footer';
import BlueprintDrawer from './components/BlueprintDrawer';
import { Sparkles, Shield, Heart } from 'lucide-react';
import { SITE_CONFIG } from './data';

export default function App() {
  const [explorerTab, setExplorerTab] = useState('hints');

  // Interactive scroll and tab selection trigger
  const handleExploreTabSelect = (tabId: string) => {
    setExplorerTab(tabId);
    
    // Tiny timeout to ensure active states update before scroll calculation
    setTimeout(() => {
      const explorerElement = document.getElementById('explorer-viewport');
      if (explorerElement) {
        explorerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Switch specifically to the About section
  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue-50 via-brand-cyan-50 to-white relative pb-12">
      
      {/* 🌸 FLOATING NAVIGATION TOP BAR */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b-2 border-slate-900 px-4 py-3 md:py-4 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo brand */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-cyan-400 border-2 border-slate-900 flex items-center justify-center text-xl group-hover:rotate-6 transition-transform">
              🐹
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm md:text-base leading-none block">{SITE_CONFIG.siteTitle}</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{SITE_CONFIG.siteSubtitle}</span>
            </div>
          </div>

          {/* Nav buttons linked to Active tabs / sections */}
          <nav className="flex items-center gap-2 md:gap-4 text-xs font-bold text-slate-600">
            {SITE_CONFIG.showAbout && (
              <button
                id="nav-btn-about"
                onClick={handleScrollToAbout}
                className="px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                Về Chúng Mình
              </button>
            )}
            
            {SITE_CONFIG.showCounters && (
              <button
                 id="nav-btn-counters"
                 onClick={() => {
                   const el = document.getElementById('dynamic-counters-section');
                   if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }}
                 className="px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                Chỉ Số Live 📊
              </button>
            )}

            {SITE_CONFIG.showHints && (
              <button
                id="nav-btn-hints"
                onClick={() => handleExploreTabSelect('hints')}
                className="px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors hidden sm:inline"
              >
                Manh Mối
              </button>
            )}

            {SITE_CONFIG.showGallery && (
              <button
                id="nav-btn-gallery"
                onClick={() => handleExploreTabSelect('gallery')}
                className="px-2.5 py-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors hidden sm:inline"
              >
                Triển Lãm
              </button>
            )}

            {/* Quick entry Action button */}
            {SITE_CONFIG.showContact && (
              <button
                id="nav-btn-explore-now"
                onClick={() => handleExploreTabSelect('contact')}
                className="bg-brand-cyan-200 border-2 border-slate-900 text-slate-850 px-3.5 py-1.5 rounded-xl hover:bg-slate-900 hover:text-white cursor-pointer active:scale-95 transition-all text-[11px]"
              >
                Gửi Thư Yêu Thương ✉️
              </button>
            )}
          </nav>

        </div>
      </header>

      {/* 🌟 MAIN APP CONTENT RUNWAYS */}
      <main className="relative">
        
        {/* Section 1: Hero */}
        <Hero 
          onExploreClick={handleExploreTabSelect} 
          onAboutClick={handleScrollToAbout} 
        />

        {/* Section 1.5: Dynamic Live Counters */}
        {SITE_CONFIG.showCounters && <DynamicCounters />}

        {/* Section 2: Interactive Explorer (Tab Card Selector & Active module viewers) */}
        {(SITE_CONFIG.showHints || SITE_CONFIG.showGallery || SITE_CONFIG.showRecs || SITE_CONFIG.showContact) && (
          <ArchiveExplorer initialTab={explorerTab} />
        )}

        {/* Section 3: About (Pledge & Bio) */}
        {SITE_CONFIG.showAbout && <About />}

      </main>

      {/* Section 4: Footer */}
      <Footer onTabSwitch={handleExploreTabSelect} />

      {/* 📋 BLUEPRINT EXPERT OVERLAY DATA */}
      <BlueprintDrawer />

      {/* 🎵 FLOATING BACK GROUND MUSIC WIDGET */}
      {SITE_CONFIG.showMusic && <BackgroundMusic />}

    </div>
  );
}
