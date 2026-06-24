/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, Search, Tag, Play, Pause, Calendar, 
  User, Send, Volume2, Sparkles, AlertCircle, Heart, X, Smile, Star 
} from 'lucide-react';
import { HintItem, GalleryItem, RecItem, FanMessage } from '../types';
import { HINTS_DATA, GALLERY_DATA, RECS_DATA, INITIAL_MESSAGES, SITE_CONFIG } from '../data';
import contactData from '../data/contact.json';
import Markdown from 'react-markdown';

interface ArchiveExplorerProps {
  initialTab?: string;
}

export default function ArchiveExplorer({ initialTab = 'hints' }: ArchiveExplorerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  // States for Hints Module
  const [hints, setHints] = useState<HintItem[]>(HINTS_DATA);
  const [hintSearch, setHintSearch] = useState('');
  const [selectedHintCategory, setSelectedHintCategory] = useState<string>('all');
  const [unlockMessageId, setUnlockMessageId] = useState<string | null>(null);
  const [selectedHintItem, setSelectedHintItem] = useState<HintItem | null>(null);
  const [hintsPage, setHintsPage] = useState(1);

  // States for Gallery Module
  const [gallerySearch, setGallerySearch] = useState('');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('all');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryPage, setGalleryPage] = useState(1);

  // States for Recommendations Module
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeRecType, setActiveRecType] = useState<string>('all');
  const [recsPage, setRecsPage] = useState(1);
  const [selectedRecItem, setSelectedRecItem] = useState<RecItem | null>(null);

  // Reset pagination on category or search updates
  useEffect(() => {
    setHintsPage(1);
  }, [selectedHintCategory, hintSearch]);

  useEffect(() => {
    setGalleryPage(1);
  }, [selectedGalleryCategory, gallerySearch]);

  useEffect(() => {
    setRecsPage(1);
  }, [activeRecType]);

  // States for Contact / Fan Wall
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('✨');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Load active tab on prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load fan letters from localStorage + initial seed data
  useEffect(() => {
    const saved = localStorage.getItem('chamchamz_fan_letters');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages(INITIAL_MESSAGES);
      }
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  // Save fan letters to localStorage
  const saveLetters = (newLetters: FanMessage[]) => {
    setMessages(newLetters);
    localStorage.setItem('chamchamz_fan_letters', JSON.stringify(newLetters));
  };

  // Switch tabs & scroll smoothly
  const handleTabSwitch = (tabId: string) => {
    setActiveTab(tabId);
    const explorerElement = document.getElementById('explorer-viewport');
    if (explorerElement) {
      explorerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle local file-to-reveal unlock action for locked hints
  const unlockHint = (hintId: string) => {
    setHints(prev => 
      prev.map(item => item.id === hintId ? { ...item, isUnlocked: true } : item)
    );
    setUnlockMessageId(hintId);
    setTimeout(() => {
      setUnlockMessageId(null);
    }, 3000);
  };

  // Handle fan letter submission
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('Vui lòng nhập biệt danh cưng xỉu của bạn!');
      return;
    }
    if (!messageText.trim() || messageText.length < 5) {
      setFormError('Lá thư phải chứa ít nhất 5 ký tự để gieo tình yêu thương nhé!');
      return;
    }

    const newMessage: FanMessage = {
      id: `msg-${Date.now()}`,
      authorName: authorName.trim(),
      createdAt: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      sticker: selectedSticker,
      messageText: messageText.trim()
    };

    const updated = [newMessage, ...messages];
    saveLetters(updated);
    setAuthorName('');
    setMessageText('');
    setFormError('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Helper to parse DD/MM/YYYY date strings cleanly for sorting
  const parseDateString = (dateStr: string): number => {
    if (!dateStr || typeof dateStr !== 'string') return 0;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // months are 0-indexed in JS
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day).getTime();
      }
    }
    return Date.parse(dateStr) || 0;
  };

  // Filter hints
  const filteredHints = useMemo(() => {
    return hints.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(hintSearch.toLowerCase()) || 
                            item.content.toLowerCase().includes(hintSearch.toLowerCase());
      const matchesCategory = selectedHintCategory === 'all' || item.category === selectedHintCategory;
      return matchesSearch && matchesCategory;
    });
  }, [hints, hintSearch, selectedHintCategory]);

  // Sort Hints (newest first / descending date)
  const sortedHints = useMemo(() => {
    return [...filteredHints].sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
  }, [filteredHints]);

  // Extract all tags from Gallery Data
  const allGalleryTags = useMemo(() => {
    const tags = new Set<string>();
    GALLERY_DATA.forEach(item => item.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, []);

  // Filter gallery items
  const filteredGallery = useMemo(() => {
    return GALLERY_DATA.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(gallerySearch.toLowerCase()) || 
                            item.description.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                            item.tags.some(t => t.toLowerCase().includes(gallerySearch.toLowerCase()));
      const matchesCategory = selectedGalleryCategory === 'all' || 
                              (item.category && item.category.toLowerCase() === selectedGalleryCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [gallerySearch, selectedGalleryCategory]);

  // Sort Gallery (newest first / descending date)
  const sortedGallery = useMemo(() => {
    return [...filteredGallery].sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
  }, [filteredGallery]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return RECS_DATA.filter(item => {
      if (activeRecType === 'all') return true;
      return item.type === activeRecType;
    });
  }, [activeRecType]);

  // Sort Recs (newest first based on ID index)
  const sortedRecs = useMemo(() => {
    return [...filteredRecs].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });
  }, [filteredRecs]);

  // Pagination setups (Items per page = 6)
  const ITEMS_PER_PAGE = 6;

  // Paginated Lists
  const paginatedHints = useMemo(() => {
    const startIndex = (hintsPage - 1) * ITEMS_PER_PAGE;
    return sortedHints.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedHints, hintsPage]);

  const totalHintsPages = Math.ceil(sortedHints.length / ITEMS_PER_PAGE) || 1;

  const paginatedGallery = useMemo(() => {
    const startIndex = (galleryPage - 1) * ITEMS_PER_PAGE;
    return sortedGallery.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedGallery, galleryPage]);

  const totalGalleryPages = Math.ceil(sortedGallery.length / ITEMS_PER_PAGE) || 1;

  const paginatedRecs = useMemo(() => {
    const startIndex = (recsPage - 1) * ITEMS_PER_PAGE;
    return sortedRecs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedRecs, recsPage]);

  const totalRecsPages = Math.ceil(sortedRecs.length / ITEMS_PER_PAGE) || 1;

  // STICKERS list for selection
  const stickers = ['✨', '💖', '🍀', '🍑', '🌸', '🍩', '🐾', '🎀'];

  return (
    <div id="archive-explorer" className="max-w-6xl mx-auto px-4 py-8">
      
      {/* 🚀 CATEGORY SELECTOR CARDS SECTION */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <p className="text-brand-teal-600 uppercase text-xs font-bold tracking-wider font-mono">
            {SITE_CONFIG.explorerSectionTag || "✦ Chọn Thư Mục Phân Loại ✦"}
          </p>
          <h2 className="text-2.5xl font-bold text-slate-810 mt-1 font-sans font-semibold">
            {SITE_CONFIG.explorerSectionTitle || "Mở tủ lưu trữ của Chamchamz"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 font-sans">
          {/* Card 1: Hints */}
          {SITE_CONFIG.showHints && (
            <button
              id="cat-card-hints"
              onClick={() => handleTabSwitch('hints')}
              className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
                activeTab === 'hints' 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
              }`}
            >
            {SITE_CONFIG.showStaticIcons !== false && <div className="text-2xl">{SITE_CONFIG.hintsTabEmoji || "🔑"}</div>}
              <div>
                <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">{SITE_CONFIG.hintsTabBadge || "Trang #01"}</span>
                <h3 className="text-base font-bold mt-1 text-slate-850 group-hover:text-amber-500 transition-colors uppercase text-[12px] tracking-wide">{SITE_CONFIG.hintsTabTitle || "Hints"}</h3>
                {SITE_CONFIG.showHintsTabDesc && (
                  <p className="text-[11px] opacity-70 mt-1 line-clamp-1">{SITE_CONFIG.hintsTabDesc}</p>
                )}
              </div>
              {activeTab === 'hints' && (
                <div className="absolute right-2.5 top-2.5 bg-amber-400 border-2 border-slate-900 text-slate-900 p-1.5 rounded-full shadow-xs flex items-center justify-center animate-wrap animate-pulse">
                  <Star className="w-3 h-3 fill-slate-900" />
                </div>
              )}
            </button>
          )}

          {/* Card 2: Gallery */}
          {SITE_CONFIG.showGallery && (
            <button
              id="cat-card-gallery"
              onClick={() => handleTabSwitch('gallery')}
              className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
                activeTab === 'gallery' 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
              }`}
            >
            {SITE_CONFIG.showStaticIcons !== false && <div className="text-2xl">{SITE_CONFIG.galleryTabEmoji || "📸"}</div>}
              <div>
                <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">{SITE_CONFIG.galleryTabBadge || "Trang #02"}</span>
                <h3 className="text-base font-bold mt-1 text-slate-850 group-hover:text-amber-500 transition-colors uppercase text-[12px] tracking-wide">{SITE_CONFIG.galleryTabTitle || "Gallery"}</h3>
                {SITE_CONFIG.showGalleryTabDesc && (
                  <p className="text-[11px] opacity-70 mt-1 line-clamp-1">{SITE_CONFIG.galleryTabDesc}</p>
                )}
              </div>
              {activeTab === 'gallery' && (
                <div className="absolute right-2.5 top-2.5 bg-amber-400 border-2 border-slate-900 text-slate-900 p-1.5 rounded-full shadow-xs flex items-center justify-center animate-wrap animate-pulse">
                  <Star className="w-3 h-3 fill-slate-900" />
                </div>
              )}
            </button>
          )}

          {/* Card 3: Recs */}
          {SITE_CONFIG.showRecs && (
            <button
              id="cat-card-recs"
              onClick={() => handleTabSwitch('recs')}
              className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
                activeTab === 'recs' 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
              }`}
            >
            {SITE_CONFIG.showStaticIcons !== false && <div className="text-2xl">{SITE_CONFIG.recsTabEmoji || "🎵"}</div>}
              <div>
                <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">{SITE_CONFIG.recsTabBadge || "Trang #03"}</span>
                <h3 className="text-base font-bold mt-1 text-slate-850 group-hover:text-amber-500 transition-colors uppercase text-[12px] tracking-wide">{SITE_CONFIG.recsTabTitle || "Recs"}</h3>
                {SITE_CONFIG.showRecsTabDesc && (
                  <p className="text-[11px] opacity-70 mt-1 line-clamp-1">{SITE_CONFIG.recsTabDesc}</p>
                )}
              </div>
              {activeTab === 'recs' && (
                <div className="absolute right-2.5 top-2.5 bg-amber-400 border-2 border-slate-900 text-slate-900 p-1.5 rounded-full shadow-xs flex items-center justify-center animate-wrap animate-pulse">
                  <Star className="w-3 h-3 fill-slate-900" />
                </div>
              )}
            </button>
          )}

          {/* Card 4: Contact */}
          {SITE_CONFIG.showContact && (
            <button
              id="cat-card-contact"
              onClick={() => handleTabSwitch('contact')}
              className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
                activeTab === 'contact' 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
              }`}
            >
            {SITE_CONFIG.showStaticIcons !== false && <div className="text-2xl">{SITE_CONFIG.contactsTabEmoji || "✉️"}</div>}
              <div>
                <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">{SITE_CONFIG.contactsTabBadge || "Trang #04"}</span>
                <h3 className="text-base font-bold mt-1 text-slate-850 group-hover:text-amber-500 transition-colors uppercase text-[12px] tracking-wide">{SITE_CONFIG.contactsTabTitle || "Contacts"}</h3>
                {SITE_CONFIG.showContactsTabDesc && (
                  <p className="text-[11px] opacity-70 mt-1 line-clamp-1">{SITE_CONFIG.contactsTabDesc}</p>
                )}
              </div>
              {activeTab === 'contact' && (
                <div className="absolute right-2.5 top-2.5 bg-amber-400 border-2 border-slate-900 text-slate-900 p-1.5 rounded-full shadow-xs flex items-center justify-center animate-wrap animate-pulse">
                  <Star className="w-3 h-3 fill-slate-900" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 🧭 DETAIL VIEWER CONTAINER */}
      <div 
        id="explorer-viewport" 
        className="bg-brand-cyan-50/50 rounded-3xl border-4 border-slate-900 p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"
      >
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-400 border border-slate-900 inline-block"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 border border-slate-900 inline-block"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-brand-teal-400 border border-slate-900 inline-block"></span>
            <span className="text-slate-500 font-mono text-xs font-bold uppercase pl-2 tracking-widest hidden sm:inline">
              Folder: /{activeTab}_archive/
            </span>
          </div>
        </div>

        {/* Dynamic Tab Renderer */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HINTS */}
          {activeTab === 'hints' && (
            <motion.div
              key="hints-wrapper"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{SITE_CONFIG.hintsSectionTitle || "Cất Giữ Manh Mối Bí Mật 🔑"}</h3>
                  {SITE_CONFIG.showHintsSectionDesc && (
                    <p className="text-xs text-slate-500 font-semibold">{SITE_CONFIG.hintsSectionDesc}</p>
                  )}
                </div>
              </div>

              {/* Category buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'Livestream', 'Youtube', 'Phỏng vấn', 'Kênh bên ngoài'].map((catName) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedHintCategory(catName)}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold border-2 cursor-pointer transition-transform hover:scale-101 active:scale-95 ${
                      selectedHintCategory === catName 
                        ? 'bg-brand-teal-400 border-slate-900 text-slate-1000 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {catName === 'all' ? 'All' : catName}
                  </button>
                ))}
              </div>

              {/* Hints grid view like gallery */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {paginatedHints.map((hint) => (
                  <motion.div 
                    key={hint.id}
                    onClick={() => {
                      if (!hint.isUnlocked) {
                        unlockHint(hint.id);
                      }
                      setSelectedHintItem(hint);
                    }}
                    className="group bg-gradient-to-br from-amber-50 to-orange-100/90 rounded-2xl border-2 border-slate-900 p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between h-56"
                  >
                    <div>
                      {/* Emoji / Illustration block */}
                      <div className="flex items-center justify-between">
                        <div className="h-14 w-14 bg-white/90 border border-slate-900 rounded-xl flex items-center justify-center text-2.5xl mb-3 shadow-xs">
                          {hint.hintIllustration || '🔑'}
                        </div>
                        {hint.category && (
                          <span className="text-[9px] font-mono font-bold bg-white/90 border-2 border-slate-900 rounded-full px-2 py-0.5 text-slate-850 uppercase tracking-wider mb-3">
                            {hint.category}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{hint.title}</h4>

                      {/* Lock-sensitive description preview */}
                      {hint.isUnlocked ? (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed font-semibold">
                          {hint.content}
                        </p>
                      ) : (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-amber-50 rounded-lg p-1.5 border border-dashed border-amber-200">
                          <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span className="line-clamp-1">Nội dung mật đang ẩn... Click để lật mở 🔑</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer bar */}
                    <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between text-[9px] font-bold font-mono text-slate-500">
                      <span>{hint.date || "Secret"}</span>
                      {hint.isUnlocked && <span className="text-brand-teal-600 font-bold">Lật mở ✔ Code</span>}
                    </div>
                  </motion.div>
                ))}

                {paginatedHints.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-slate-900 border-dashed">
                    <span className="text-2xl block mb-2 font-mono">🌸</span>
                    <p className="text-sm text-slate-500 font-semibold">Đang đợi cập nhật thêm...</p>
                  </div>
                )}
              </div>

              {/* Hints Pagination Controls */}
              {totalHintsPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 font-sans">
                  <button
                    onClick={() => setHintsPage(p => Math.max(1, p - 1))}
                    disabled={hintsPage === 1}
                    className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-bold text-xs disabled:opacity-45 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    ◀
                  </button>
                  {Array.from({ length: totalHintsPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setHintsPage(pageNum)}
                        className={`w-8 h-8 rounded-lg border-2 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer ${
                          hintsPage === pageNum
                            ? 'bg-brand-teal-400 border-slate-900 text-slate-1000 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setHintsPage(p => Math.min(totalHintsPages, p + 1))}
                    disabled={hintsPage === totalHintsPages}
                    className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-bold text-xs disabled:opacity-45 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery-wrapper"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{SITE_CONFIG.gallerySectionTitle || "Tuyệt tác Triển Lãm Ảnh 📷"}</span>
                  </h3>
                  {SITE_CONFIG.showGallerySectionDesc && (
                    <p className="text-xs text-slate-500 font-semibold">{SITE_CONFIG.gallerySectionDesc}</p>
                  )}
                </div>
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-1.5 font-sans">
                {['all', 'IG', 'Weverse', 'Reels/Challenge', 'Nguồn bên ngoài'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedGalleryCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 cursor-pointer transition-colors ${
                      selectedGalleryCategory === cat
                        ? 'bg-brand-cyan-500 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {paginatedGallery.map((item) => (
                  <motion.div
                    key={item.id}
                    id={`gallery-item-${item.id}`}
                    onClick={() => setSelectedGalleryItem(item)}
                    className={`group bg-gradient-to-br ${item.colorTheme || "from-sky-105 to-sky-200"} rounded-2xl border-2 border-slate-900 p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] transition-all cursor-zoom-in hover:-translate-y-0.5 flex flex-col justify-between h-56`}
                    layoutId={`gallery-anim-${item.id}`}
                  >
                    <div>
                      {/* Emoji Illustration Showcase */}
                      <div className="flex items-center justify-between">
                        <div className="h-14 w-14 bg-white/90 border border-slate-900 rounded-xl flex items-center justify-center text-2.5xl mb-3 shadow-xs">
                          {item.emoji || "🖼️"}
                        </div>
                        {item.category && (
                          <span className="text-[9px] font-mono font-bold bg-white/90 border-2 border-slate-900 rounded-full px-2 py-0.5 text-slate-850 uppercase tracking-wider mb-3">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed font-semibold">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Footer bar */}
                    <div className="pt-2 border-t border-slate-900/10 flex items-center justify-end text-[9px] font-bold font-mono">
                      <span className="opacity-50">{item.date}</span>
                    </div>
                  </motion.div>
                ))}

                {paginatedGallery.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-slate-900 border-dashed">
                    <span className="text-2xl block mb-2 font-mono">🌸</span>
                    <p className="text-sm text-slate-500 font-semibold">Đang đợi cập nhật thêm...</p>
                  </div>
                )}
              </div>

              {/* Gallery Pagination Controls */}
              {totalGalleryPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 font-sans">
                  <button
                    onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                    disabled={galleryPage === 1}
                    className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-bold text-xs disabled:opacity-45 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    ◀
                  </button>
                  {Array.from({ length: totalGalleryPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setGalleryPage(pageNum)}
                        className={`w-8 h-8 rounded-lg border-2 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer ${
                          galleryPage === pageNum
                            ? 'bg-brand-cyan-500 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setGalleryPage(p => Math.min(totalGalleryPages, p + 1))}
                    disabled={galleryPage === totalGalleryPages}
                    className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-bold text-xs disabled:opacity-45 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: RECOMMENDATIONS */}
          {activeTab === 'recs' && (
            <motion.div
              key="recs-wrapper"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{SITE_CONFIG.recsSectionTitle || "Không Gian Đề Xuất Nghệ Thuật 🎵"}</h3>
                  {SITE_CONFIG.showRecsSectionDesc && (
                    <p className="text-xs text-slate-500 font-semibold">{SITE_CONFIG.recsSectionDesc}</p>
                  )}
                </div>

                {/* Filter buttons */}
                <div className="flex gap-1.5 self-start">
                  {['all', 'Fanfic/Author', 'Art/Artist', 'Khác'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveRecType(type)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border-2 cursor-pointer transition-colors ${
                        activeRecType === type
                          ? 'bg-brand-teal-500 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendations grid view (identical to Hints & Gallery) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {paginatedRecs.map((rec) => (
                  <motion.div 
                    key={rec.id}
                    onClick={() => setSelectedRecItem(rec)}
                    className="group bg-gradient-to-br from-teal-50 to-emerald-100/95 rounded-2xl border-2 border-slate-900 p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between h-56"
                  >
                    <div>
                      {/* Emoji / Illustration block */}
                      <div className="flex items-center justify-between">
                        <div className="h-14 w-14 bg-white/90 border border-slate-900 rounded-xl flex items-center justify-center text-2.5xl mb-3 shadow-xs font-mono">
                          {rec.recIllustration || (rec.type === 'Fanfic/Author' ? '📖' : rec.type === 'Art/Artist' ? '🎨' : '🩵')}
                        </div>
                        {rec.type && (
                          <span className="text-[9px] font-mono font-bold bg-white/90 border-2 border-slate-900 rounded-full px-2 py-0.5 text-slate-850 uppercase tracking-wider mb-3">
                            {rec.type === 'Fanfic/Author' ? 'Fanfic' : rec.type === 'Art/Artist' ? 'Fanart' : 'Khác'}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{rec.title}</h4>

                      {/* Description / Content Preview */}
                      {rec.reason && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed font-semibold">
                          {rec.reason}
                        </p>
                      )}
                    </div>

                    {/* Metadata Footer bar */}
                    <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between text-[9px] font-bold font-mono text-slate-500">
                      <span>{rec.creator || "Tác giả"}</span>
                      <span className="text-brand-teal-600 font-bold">Xem chi tiết ↗</span>
                    </div>
                  </motion.div>
                ))}

                {paginatedRecs.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-slate-900 border-dashed">
                    <span className="text-2xl block mb-2 font-mono">🌸</span>
                    <p className="text-sm text-slate-500 font-semibold">Đang đợi cập nhật thêm...</p>
                  </div>
                )}
              </div>

              {/* Recommendations Pagination Controls */}
              {totalRecsPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 font-sans">
                  <button
                    onClick={() => setRecsPage(p => Math.max(1, p - 1))}
                    disabled={recsPage === 1}
                    className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-bold text-xs disabled:opacity-45 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    ◀
                  </button>
                  {Array.from({ length: totalRecsPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setRecsPage(pageNum)}
                        className={`w-8 h-8 rounded-lg border-2 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer ${
                          recsPage === pageNum
                            ? 'bg-brand-teal-400 border-slate-900 text-slate-1000 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setRecsPage(p => Math.min(totalRecsPages, p + 1))}
                    disabled={recsPage === totalRecsPages}
                    className="px-3 py-1.5 rounded-lg border-2 border-slate-900 bg-white font-bold text-xs disabled:opacity-45 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: CONTACT & FAN MESSAGES WALL */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact-wrapper"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto py-8"
            >
              <div className="bg-white border-2 border-slate-900 p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] font-sans space-y-4">
                <div className="text-sm font-semibold text-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold">Email:</span>
                    <a 
                      id="contact-link-email" 
                      href={`mailto:${SITE_CONFIG.contactEmail || "archive@chamchamz.fan"}`} 
                      className="text-brand-teal-600 hover:text-brand-teal-700 hover:underline font-mono"
                    >
                      {SITE_CONFIG.contactEmail || "archive@chamchamz.fan"}
                    </a>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 pb-3">
                    <span className="text-slate-500 font-bold">Facebook:</span>
                    <a 
                      id="contact-link-facebook" 
                      href={SITE_CONFIG.contactFacebook || "https://facebook.com/chamchamz"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-teal-600 hover:text-brand-teal-700 hover:underline font-mono"
                    >
                      {SITE_CONFIG.contactFacebook || "https://facebook.com/chamchamz"}
                    </a>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1">
                    <span className="text-slate-500 font-bold">Threads:</span>
                    <a 
                      id="contact-link-threads" 
                      href={SITE_CONFIG.contactThreads || "https://threads.net/@chamchamz"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-teal-600 hover:text-brand-teal-700 hover:underline font-mono"
                    >
                      {SITE_CONFIG.contactThreads || "https://threads.net/@chamchamz"}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 🖼️ GALLERY LIGHTBOX DIALOG OVERLAY */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              onClick={() => setSelectedGalleryItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Lightbox Card layout */}
            <motion.div
              className="bg-white rounded-3xl border-4 border-slate-900 w-full max-w-lg p-6 md:p-8 relative z-10 shadow-2xl flex flex-col justify-between text-slate-800"
              layoutId={`gallery-anim-${selectedGalleryItem.id}`}
            >
              <button
                id="btn-close-lightbox"
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer"
                onClick={() => setSelectedGalleryItem(null)}
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                {/* Big cute visual representation / Uploaded Image Showcase */}
                {selectedGalleryItem.images && selectedGalleryItem.images.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    <div className="aspect-video rounded-2xl border-2 border-slate-900 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm">
                      <img 
                        src={selectedGalleryItem.images[0].image_file} 
                        alt={selectedGalleryItem.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {selectedGalleryItem.images[0].caption && (
                      <p className="text-[11px] text-slate-500 italic text-center font-semibold">
                        "{selectedGalleryItem.images[0].caption}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={`aspect-video rounded-2xl bg-gradient-to-br ${selectedGalleryItem.colorTheme} flex items-center justify-center text-6xl border-2 border-slate-900 shadow-sm relative overflow-hidden mb-6`}>
                    <span>{selectedGalleryItem.emoji}</span>
                  </div>
                )}

                {/* Subtitle tag chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedGalleryItem.tags.map(t => (
                    <span key={t} className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedGalleryItem.title}</h3>
                
                {/* Description paragraphs */}
                {selectedGalleryItem.description && (
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {selectedGalleryItem.description}
                  </p>
                )}

                {/* Source Url Link block */}
                {selectedGalleryItem.sourceUrl && (
                  <div className="mt-4 pt-1.5 flex flex-wrap gap-2">
                    {selectedGalleryItem.sourceUrl.split(/[\s,;]+/).map(u => u.trim()).filter(u => u.startsWith('http')).map((url, uidx, arr) => (
                      <a 
                        key={uidx}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 bg-brand-teal-50 border border-brand-teal-200 text-brand-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-brand-teal-100 transition-colors cursor-pointer"
                      >
                        <span>{arr.length > 1 ? `Link gốc ${uidx + 1} 🔗` : `Xem link gốc 🔗`}</span>
                      </a>
                    ))}
                  </div>
                )}


              </div>

              {/* Actions footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end text-xs font-bold font-mono">
                <button
                  id="btn-agree-close-lightbox"
                  onClick={() => setSelectedGalleryItem(null)}
                  className="bg-slate-900 hover:bg-brand-teal-500 hover:text-slate-900 text-white font-bold py-2 px-5 rounded-xl cursor-pointer hover:scale-101 active:scale-95 transition-transform"
                >
                  Đồng ý & Đóng 🌸
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* 🔍 HINT DEEP LIGHTBOX DIALOG OVERLAY */}
        {selectedHintItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              onClick={() => setSelectedHintItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Lightbox Card layout */}
            <motion.div
              className="bg-white rounded-3xl border-4 border-slate-900 w-full max-w-lg p-6 md:p-8 relative z-10 shadow-2xl flex flex-col justify-between text-slate-800"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                id="btn-close-hint-lightbox"
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer"
                onClick={() => setSelectedHintItem(null)}
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                {/* Big cute visual representation / Emoji block */}
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-6xl border-2 border-slate-900 shadow-sm relative overflow-hidden mb-6">
                  {selectedHintItem.isUnlocked && selectedHintItem.imageFile ? (
                    <img 
                      src={selectedHintItem.imageFile} 
                      alt={selectedHintItem.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{selectedHintItem.hintIllustration || "🔑"}</span>
                  )}
                  <div className="absolute bottom-2 right-2 bg-white/90 border border-slate-900 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                    {selectedHintItem.isUnlocked ? "UNLOCKED 🌸" : "SECRET HINT 🔐"}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-brand-teal-700 bg-brand-teal-50 px-2.5 py-0.5 rounded-full border border-brand-teal-100">
                    {selectedHintItem.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {selectedHintItem.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedHintItem.title}</h3>

                {/* Lock evaluation panel */}
                {selectedHintItem.isUnlocked ? (
                  <div className="space-y-4">
                    {selectedHintItem.content && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-72 overflow-y-auto shadow-inner text-xs font-semibold leading-relaxed text-slate-600">
                        <div className="markdown-body text-xs break-words">
                          <Markdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-base font-extrabold text-slate-900 mt-3 mb-1.5" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2.5 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2.5 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-extrabold text-slate-950" {...props} />,
                              em: ({node, ...props}) => <em className="italic text-slate-705" {...props} />,
                            }}
                          >
                            {selectedHintItem.content}
                          </Markdown>
                        </div>
                      </div>
                    )}

                    {selectedHintItem.sourceUrl && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {selectedHintItem.sourceUrl.split(/[\s,;]+/).map(u => u.trim()).filter(u => u.startsWith('http')).map((url, uidx, arr) => (
                          <a 
                            key={uidx}
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 bg-brand-teal-50 border border-brand-teal-200 text-brand-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-brand-teal-100 transition-colors cursor-pointer"
                          >
                            <span>{arr.length > 1 ? `Link gốc ${uidx + 1} 🔗` : `Xem link gốc 🔗`}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border-2 border-slate-900 text-amber-600">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">Nội Dung Manh Mối Này Đang Bị Khóa</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto px-4 font-semibold leading-relaxed">
                          Nhấp chuột để lập tức cam kết tuyệt đối bảo mật thông tin nội bộ của fandom và mở khóa lật mở!
                        </p>
                      </div>
                    </div>

                    <button 
                      id={`btn-modal-unlock-${selectedHintItem.id}`}
                      onClick={() => {
                        unlockHint(selectedHintItem.id);
                        setSelectedHintItem(prev => prev ? { ...prev, isUnlocked: true } : null);
                      }}
                      className="mx-auto bg-slate-900 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer hover:bg-brand-teal-500 hover:text-slate-900 flex items-center gap-1.5 hover:scale-102 transition-all shadow-md"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Cam kết & Mở khóa ngay 🔐</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Author & Actions footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedHintItem(null)}
                  className="bg-slate-900 hover:bg-brand-teal-500 hover:text-slate-900 text-white font-bold py-2 px-5 rounded-xl cursor-pointer hover:scale-101 active:scale-95 transition-transform text-xs"
                >
                  Đồng ý & Đóng 🌸
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* 📚 RECOMMENDATION DEEP LIGHTBOX DIALOG OVERLAY */}
        {selectedRecItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              onClick={() => setSelectedRecItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Lightbox Card layout */}
            <motion.div
              className="bg-white rounded-3xl border-4 border-slate-900 w-full max-w-lg p-6 md:p-8 relative z-10 shadow-2xl flex flex-col justify-between text-slate-800"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                id="btn-close-rec-lightbox"
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer"
                onClick={() => setSelectedRecItem(null)}
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                {/* Big cute visual representation / Image */}
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center text-6xl border-2 border-slate-900 shadow-sm relative overflow-hidden mb-6">
                  {selectedRecItem.imageFile ? (
                    <img 
                      src={selectedRecItem.imageFile} 
                      alt={selectedRecItem.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{selectedRecItem.recIllustration || (selectedRecItem.type === 'Fanfic/Author' ? '📖' : selectedRecItem.type === 'Art/Artist' ? '🎨' : '🩵')}</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-brand-teal-700 bg-brand-teal-50 px-2.5 py-0.5 rounded-full border border-brand-teal-100 font-sans">
                    {selectedRecItem.type === 'Fanfic/Author' ? 'Fanfic' : selectedRecItem.type === 'Art/Artist' ? 'Fanart' : selectedRecItem.type}
                  </span>
                  {selectedRecItem.creator && (
                    <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1 font-sans">
                      🧑‍💻 Tác giả: {selectedRecItem.creator}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-850 mb-2 font-sans">{selectedRecItem.title}</h3>

                {/* Content / Reason */}
                {selectedRecItem.reason && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-72 overflow-y-auto shadow-inner text-xs font-semibold leading-relaxed text-slate-600 font-sans">
                    <div className="markdown-body text-xs break-words">
                      <Markdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-base font-extrabold text-slate-900 mt-3 mb-1.5" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2.5 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2.5 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-extrabold text-slate-950" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-slate-705" {...props} />,
                        }}
                      >
                        {selectedRecItem.reason}
                      </Markdown>
                    </div>
                  </div>
                )}

                {selectedRecItem.url && (
                  <div className="pt-3 font-sans flex flex-wrap gap-2">
                    {selectedRecItem.url.split(/[\s,;]+/).map(u => u.trim()).filter(u => u.startsWith('http')).map((url, uidx, arr) => (
                      <a 
                        key={uidx}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 bg-brand-teal-50 border border-brand-teal-200 text-brand-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-brand-teal-100 transition-colors cursor-pointer"
                      >
                        <span>{arr.length > 1 ? `${selectedRecItem.linkText || 'Xem liên kết'} ${uidx + 1} 🔗` : `${selectedRecItem.linkText || 'Xem liên kết'} 🔗`}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end font-sans">
                <button
                  onClick={() => setSelectedRecItem(null)}
                  className="bg-slate-900 hover:bg-brand-teal-500 hover:text-slate-900 text-white font-bold py-2 px-5 rounded-xl cursor-pointer hover:scale-101 active:scale-95 transition-transform text-xs"
                >
                  Đóng 🌸
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
