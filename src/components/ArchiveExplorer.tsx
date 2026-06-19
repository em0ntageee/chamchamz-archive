/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, Search, Tag, Play, Pause, Calendar, 
  User, Send, Volume2, Sparkles, AlertCircle, Heart, X, Smile 
} from 'lucide-react';
import { HintItem, GalleryItem, RecItem, FanMessage } from '../types';
import { HINTS_DATA, GALLERY_DATA, RECS_DATA, INITIAL_MESSAGES } from '../data';
import contactData from '../data/contact.json';

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

  // States for Gallery Module
  const [gallerySearch, setGallerySearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  // States for Recommendations Module
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeRecType, setActiveRecType] = useState<string>('all');

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

  // Filter hints
  const filteredHints = useMemo(() => {
    return hints.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(hintSearch.toLowerCase()) || 
                            item.content.toLowerCase().includes(hintSearch.toLowerCase());
      const matchesCategory = selectedHintCategory === 'all' || item.category === selectedHintCategory;
      return matchesSearch && matchesCategory;
    });
  }, [hints, hintSearch, selectedHintCategory]);

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
                            item.tags.some(t => t.toLowerCase().includes(gallerySearch.toLowerCase()));
      const matchesTag = selectedTag === 'all' || item.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [gallerySearch, selectedTag]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return RECS_DATA.filter(item => {
      if (activeRecType === 'all') return true;
      return item.type === activeRecType;
    });
  }, [activeRecType]);

  // STICKERS list for selection
  const stickers = ['✨', '💖', '🍀', '🍑', '🌸', '🍩', '🐾', '🎀'];

  return (
    <div id="archive-explorer" className="max-w-6xl mx-auto px-4 py-8">
      
      {/* 🚀 CATEGORY SELECTOR CARDS SECTION */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <p className="text-brand-teal-600 uppercase text-xs font-bold tracking-wider font-mono">✦ Chọn Thư Mục Phân Loại ✦</p>
          <h2 className="text-2.5xl font-bold text-slate-805 mt-1 font-sans">
            Mở tủ lưu trữ của Chamchamz
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Hints */}
          <button
            id="cat-card-hints"
            onClick={() => handleTabSwitch('hints')}
            className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'hints' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
            }`}
          >
            <div className="text-2xl">🔑</div>
            <div>
              <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">Trang #01</span>
              <h3 className="text-base font-bold mt-1">Hộp Manh Mối</h3>
              <p className="text-[11px] opacity-70 mt-1 line-clamp-1">Khám phá bí mật, sự kiện đoán trước...</p>
            </div>
            {activeTab === 'hints' && <div className="absolute right-2.5 top-2.5 text-xs bg-brand-teal-400 text-slate-900 font-bold px-2 py-0.5 rounded-full font-mono">Lọt</div>}
          </button>

          {/* Card 2: Gallery */}
          <button
            id="cat-card-gallery"
            onClick={() => handleTabSwitch('gallery')}
            className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'gallery' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
            }`}
          >
            <div className="text-2xl">📸</div>
            <div>
              <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">Trang #02</span>
              <h3 className="text-base font-bold mt-1">Triển Lãm Ảnh</h3>
              <p className="text-[11px] opacity-70 mt-1 line-clamp-1">Nụ cười tươi sáng, nét bút nguệch ngoạc...</p>
            </div>
            {activeTab === 'gallery' && <div className="absolute right-2.5 top-2.5 text-xs bg-brand-teal-400 text-slate-900 font-bold px-2 py-0.5 rounded-full font-mono">Lọt</div>}
          </button>

          {/* Card 3: Recs */}
          <button
            id="cat-card-recs"
            onClick={() => handleTabSwitch('recs')}
            className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'recs' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
            }`}
          >
            <div className="text-2xl">🎵</div>
            <div>
              <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">Trang #03</span>
              <h3 className="text-base font-bold mt-1">Đề Xuất Chọn Lọc</h3>
              <p className="text-[11px] opacity-70 mt-1 line-clamp-1">Bài hát ru hồn, sách truyện dịu ngọt...</p>
            </div>
            {activeTab === 'recs' && <div className="absolute right-2.5 top-2.5 text-xs bg-brand-teal-400 text-slate-900 font-bold px-2 py-0.5 rounded-full font-mono">Lọt</div>}
          </button>

          {/* Card 4: Contact */}
          <button
            id="cat-card-contact"
            onClick={() => handleTabSwitch('contact')}
            className={`p-5 rounded-2xl border-2 text-left flex flex-col justify-between h-40 transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'contact' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-brand-teal-200 text-slate-800 hover:border-brand-teal-400 hover:scale-101'
            }`}
          >
            <div className="text-2xl">✉️</div>
            <div>
              <span className="text-xs font-bold font-mono tracking-wide opacity-80 uppercase block">Trang #04</span>
              <h3 className="text-base font-bold mt-1">Hòm Thư Kỷ Niệm</h3>
              <p className="text-[11px] opacity-70 mt-1 line-clamp-1">Viết lời chào gửi trực tiếp lên bức tường...</p>
            </div>
            {activeTab === 'contact' && <div className="absolute right-2.5 top-2.5 text-xs bg-brand-teal-400 text-slate-900 font-bold px-2 py-0.5 rounded-full font-mono">Lọt</div>}
          </button>
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
          <div className="px-3.5 py-1 bg-white border-2 border-slate-900 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1">
            <span>Quốc gia: 🇻🇳</span>
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
              {/* Header inside tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Cất Giữ Manh Mối Bí Mật 🔑</h3>
                  <p className="text-xs text-slate-500 font-semibold">Cung cấp manh mối gợi ý về Chamchamz. Tránh rò rỉ ra ngoài.</p>
                </div>
                {/* Search / Filter bar for Hints */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative">
                    <input
                      id="input-search-hints"
                      type="text"
                      className="w-full sm:w-44 bg-white border-2 border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold focus:outline-none focus:border-brand-teal-500"
                      placeholder="Tìm manh mối..."
                      value={hintSearch}
                      onChange={(e) => setHintSearch(e.target.value)}
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Category buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'gợi ý', 'bí mật', 'sự kiện', 'thông báo'].map((catName) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedHintCategory(catName)}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold border-2 capitalize cursor-pointer transition-transform hover:scale-101 active:scale-95 ${
                      selectedHintCategory === catName 
                        ? 'bg-brand-teal-400 border-slate-900 text-slate-900 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {catName === 'all' ? 'Tất cả 🧭' : catName}
                  </button>
                ))}
              </div>

              {/* Hints list view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHints.map((hint) => (
                  <div 
                    key={hint.id} 
                    className={`border-2 border-slate-900 rounded-2xl p-5 bg-white relative shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col justify-between min-h-48`}
                  >
                    {/* Header line on hint card */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-slate-200 mb-3.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-brand-teal-700 bg-brand-teal-50 px-2.5 py-0.5 rounded-full border border-brand-teal-100">
                        {hint.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {hint.date}
                      </span>
                    </div>

                    {/* Unlocked / Locked display logic */}
                    {hint.isUnlocked ? (
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm mb-2">{hint.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">{hint.content}</p>
                        </div>
                        {/* Illustration description decorator */}
                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>Trạng thái: Hoàn toàn công khai cho fan</span>
                          <span className="text-base text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{hint.hintIllustration}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between text-center py-4 bg-slate-50 rounded-xl border border-slate-200/60 border-dashed">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center border-2 border-slate-905 text-amber-600">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-700 text-xs">Manh Mối Này Đang Bị Khóa</h4>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-xs px-4 font-semibold">Để bảo vệ thông tin mật, hãy nhấp chuột để lật mở thủ công dưới sự cam kết tuyệt đối.</p>
                          </div>
                        </div>

                        <button 
                          id={`btn-unlock-${hint.id}`}
                          onClick={() => unlockHint(hint.id)}
                          className="mt-3.5 mx-auto bg-slate-900 text-white font-bold text-xs py-1.5 px-4 rounded-lg cursor-pointer hover:bg-brand-teal-500 hover:text-slate-900 flex items-center gap-1 hover:scale-102 active:scale-95 transition-all"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Lập tức Cam kết & Mở khóa 🔑</span>
                        </button>
                      </div>
                    )}

                    {/* Temporary flash banner after unlock action */}
                    {unlockMessageId === hint.id && (
                      <div className="absolute inset-x-0 bottom-0 bg-brand-teal-500 text-slate-905 text-[10px] font-bold text-center py-1 border-t border-slate-900 animate-slide-up">
                        Chúc mừng! Hướng thệ ước đã bảo hộ thành công 🔐✨
                      </div>
                    )}
                  </div>
                ))}

                {filteredHints.length === 0 && (
                  <div className="md:col-span-2 text-center py-12 bg-white rounded-2xl border-2 border-slate-900 border-dashed">
                    <span className="text-2xl block mb-2">🔎</span>
                    <p className="text-sm text-slate-500 font-semibold">Không tìm thấy manh mối nào khớp với yêu cầu!</p>
                  </div>
                )}
              </div>
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
              {/* Header inside Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Tuyệt tác Triển Lãm Ảnh 📷</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Khung hình nghệ thuật tươi trẻ, nhí nhảnh từ cuộc sống ngọt lịm của Chamchamz.</p>
                </div>

                {/* Grid Search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      id="input-search-gallery"
                      type="text"
                      className="w-full sm:w-44 bg-white border-2 border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold focus:outline-none focus:border-brand-teal-500"
                      placeholder="Tìm thẻ ảnh..."
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Tag filters */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                    selectedTag === 'all'
                      ? 'bg-brand-cyan-500 border-brand-cyan-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả Thẻ 🏷️
                </button>
                {allGalleryTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                      selectedTag === tag
                        ? 'bg-brand-cyan-500 border-brand-cyan-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {filteredGallery.map((item) => (
                  <motion.div
                    key={item.id}
                    id={`gallery-item-${item.id}`}
                    onClick={() => setSelectedGalleryItem(item)}
                    className={`group bg-gradient-to-br ${item.colorTheme} rounded-2xl border-2 border-slate-900 p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] transition-all cursor-zoom-in hover:-translate-y-0.5 flex flex-col justify-between h-56`}
                    layoutId={`gallery-anim-${item.id}`}
                  >
                    <div>
                      {/* Emoji Illustration Showcase */}
                      <div className="h-14 w-14 bg-white/90 border border-slate-900 rounded-xl flex items-center justify-center text-2.5xl mb-3 shadow-xs">
                        {item.emoji}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed font-semibold">
                        {item.description}
                      </p>
                    </div>

                    {/* Metadata Footer bar */}
                    <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between text-[9px] font-bold font-mono">
                      <span className="opacity-75">Tác giả: {item.author}</span>
                      <span className="opacity-50">{item.date}</span>
                    </div>
                  </motion.div>
                ))}

                {filteredGallery.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-slate-900 border-dashed">
                    <span className="text-2xl block mb-2">📸</span>
                    <p className="text-sm text-slate-500 font-semibold">Chưa có tác phẩm ảnh cúc hoa nào khớp với bộ lọc!</p>
                  </div>
                )}
              </div>
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
              {/* Header inside Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Không Gian Đề Xuất Nghệ Thuật 🎵</h3>
                  <p className="text-xs text-slate-500 font-semibold">Tổng hợp sở thích đáng yêu như sách quý, bài hát chill được yêu thích từ lòng Chamchamz.</p>
                </div>

                {/* Filter buttons */}
                <div className="flex gap-1.5 self-start">
                  {['all', 'music', 'book', 'movie'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveRecType(type)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border capitalize cursor-pointer transition-colors ${
                        activeRecType === type
                          ? 'bg-brand-teal-500 border-brand-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'all' ? 'Tất cả 📚' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Retro Music Tape Interactive Player / Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Simulated Vinyl/Cassette Deck Panel (Col-5) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-800 to-slate-900 text-slate-200 rounded-3xl p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between min-h-64 relative overflow-hidden">
                  {/* Speaker mesh design element */}
                  <div className="absolute right-3 top-3 opacity-15 text-[9px] font-mono leading-none tracking-tighter select-none">
                    :::: :::: ::::<br />
                    :::: :::: ::::<br />
                    :::: :::: ::::
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-brand-teal-400 font-bold tracking-widest uppercase block">★ Retrowave Player UI ★</span>
                    
                    {/* Vinyl Record rotation component */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-slate-950 border-4 border-slate-700 flex items-center justify-center relative ${playingId ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                          <div className="w-6 h-6 rounded-full bg-brand-cyan-300 border-2 border-slate-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          </div>
                        </div>
                        {/* Needle pin arm */}
                        <div className={`absolute -top-1 right-0 w-8 h-8 pointer-events-none origin-top-left transition-transform duration-500 ${playingId ? 'rotate-12' : 'rotate-0'}`}>
                          💬
                        </div>
                      </div>

                      {/* Song Details inside tape deck */}
                      <div>
                        {playingId ? (
                          (() => {
                            const current = RECS_DATA.find(x => x.id === playingId);
                            return (
                              <div className="animate-pulse">
                                <h4 className="text-xs font-bold text-brand-cyan-300 line-clamp-1">{current?.title}</h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">by {current?.creator}</p>
                                <span className="inline-flex mt-1.5 px-2 py-0.5 bg-brand-teal-900/50 text-brand-teal-400 text-[8px] uppercase font-bold rounded">Đang Phát</span>
                              </div>
                            );
                          })()
                        ) : (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400">Tape Deck Offline</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Chọn phím Play ở thẻ bên cạnh</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Web Soundwave line simulation */}
                    <div className="h-6 flex items-end gap-1 px-1 justify-center bg-slate-950/80 rounded-lg p-1.5">
                      {Array.from({ length: 18 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="w-1 bg-brand-teal-400 rounded-full transition-all"
                          style={{
                            height: playingId ? `${Math.floor(Math.random() * 80) + 10}%` : '20%',
                            transitionDuration: playingId ? '0.15s' : '0.4s'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tape controls */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    <div className="flex gap-1.5">
                      <button 
                        id="btn-tape-stop"
                        onClick={() => setPlayingId(null)}
                        disabled={!playingId}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded border border-slate-700 text-[10px] font-bold text-rose-400 font-mono cursor-pointer"
                      >
                        STOP
                      </button>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold">192KBPS STEREO CASSETTE</span>
                  </div>
                </div>

                {/* Recommendations specific items list grid (Col-7) */}
                <div className="lg:col-span-7 space-y-4">
                  {filteredRecs.map((rec) => (
                    <div 
                      key={rec.id}
                      className="bg-white border-2 border-slate-900 p-4.5 rounded-2xl shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-start gap-4"
                    >
                      {/* Media type icon column */}
                      <div className="text-2.5xl flex-shrink-0 mt-0.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        {rec.type === 'music' ? '🎵' : rec.type === 'book' ? '📖' : rec.type === 'movie' ? '🎬' : '💬'}
                      </div>

                      {/* Detail Column */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-850 text-sm inline-block mr-1.5">{rec.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400 italic">({rec.creator})</span>
                          </div>
                          
                          {/* Play button specifically for audio files */}
                          {rec.type === 'music' && (
                            <button
                              id={`btn-play-rec-${rec.id}`}
                              onClick={() => setPlayingId(playingId === rec.id ? null : rec.id)}
                              className={`p-1.5 rounded-lg border-2 cursor-pointer transition-colors ${
                                playingId === rec.id
                                  ? 'bg-rose-100 border-rose-300 text-rose-800'
                                  : 'bg-brand-cyan-100 border-slate-900 text-slate-900 hover:bg-brand-cyan-200'
                              }`}
                            >
                              {playingId === rec.id ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {rec.reason}
                        </p>
                        
                        {/* Optional Reference button */}
                        {rec.url && (
                          <a
                            id={`link-rec-${rec.id}`}
                            href={rec.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-brand-teal-600 font-bold hover:underline"
                          >
                            <span>{rec.linkText || 'Xem chi tiết'} ↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
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
              className="space-y-8"
            >
              {/* Header inside Tab */}
              <div>
                <h3 className="text-xl font-bold text-slate-800">{contactData.title || "Lá Thư Gửi Gắm Tình Yêu ✉️"}</h3>
                <p className="text-xs text-slate-500 font-semibold">{contactData.description || "Không quản ngại khoảng cách, viết đôi lời nhắn nhủ chân thành đến Chamchamz. Đính kèm một nhãn dán dễ thương!"}</p>
              </div>

              {/* Form and Board Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form column (Col-5) */}
                <form 
                  id="fan-letter-form"
                  onSubmit={handleSubmitMessage} 
                  className="lg:col-span-4 bg-white border-2 border-slate-900 p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4"
                >
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-brand-teal-700 flex items-center gap-1.5">
                    <Smile className="w-4 h-4" />
                    <span>Viết thư của bạn</span>
                  </h4>
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Biệt danh cưng xỉu của bạn:</label>
                    <input
                      id="input-letter-author"
                      type="text"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-brand-teal-500"
                      placeholder="Mochi Heo Con, Trà Sữa..."
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      maxLength={25}
                    />
                  </div>

                  {/* Sticker selector wrapper */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Lựa chọn nhãn dán đính kèm:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {stickers.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSticker(s)}
                          className={`text-sm w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-transform ${
                            selectedSticker === s
                              ? 'bg-brand-cyan-100 border-brand-cyan-400 scale-110'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Nội dung bức thư:</label>
                    <textarea
                      id="input-letter-text"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-brand-teal-500 h-28 resize-none"
                      placeholder="Viết thư tại đây... (Nội dung sưởi ấm tâm hồn bé Chamchamz)"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      maxLength={200}
                    />
                    <div className="text-right text-[9px] text-slate-400 font-mono">
                      {messageText.length}/200
                    </div>
                  </div>

                  {/* Status labels */}
                  {formError && (
                    <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 p-2 rounded-lg border border-emerald-105">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{contactData.success_msg || "Lá thư đã bay vút vào rương bảo mật!"}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    id="btn-submit-letter"
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-brand-teal-500 hover:text-slate-900 border-2 border-slate-900 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-101 active:scale-97 transition-all"
                  >
                    <span>Gửi Lá Thư Ngọt Ngào</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>

                {/* Interactive fan board (Col-8) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">💌 Bức Tường Lá Thư Hâm Mộ ({messages.length})</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">Lưu giữ vĩnh hằng trong rương</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2 pb-4 scrollbar-thin">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          className="bg-gradient-to-br from-brand-teal-50 to-white border-2 border-slate-900 rounded-2xl p-4.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] relative flex flex-col justify-between"
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: 'spring', damping: 15 }}
                        >
                          {/* Sticker on note pin layout */}
                          <div className="absolute -top-2.5 -right-1 text-2xl select-none animate-pulse">
                            {msg.sticker}
                          </div>

                          <div>
                            {/* Author name & Date */}
                            <div className="border-b border-dashed border-slate-200 pb-2 mb-2">
                              <span className="text-xs font-bold text-brand-teal-800">
                                🕵️ {msg.authorName}
                              </span>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{msg.createdAt}</p>
                            </div>
                            
                            {/* Message text */}
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                              "{msg.messageText}"
                            </p>
                          </div>

                          {/* Safe metadata confirmation */}
                          <div className="pt-2 mt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-brand-cyan-700 font-bold uppercase font-mono">
                            <span>Sự Riêng Tư Tuyệt Đối</span>
                            <span>🔐 Fan-Only</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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
                      <div className="absolute bottom-2 right-2 bg-white/90 border border-slate-900 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono z-10">
                        Watermarked 🚫
                      </div>
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
                    <div className="absolute bottom-2 right-2 bg-white/90 border border-slate-900 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                      Watermarked 🚫
                    </div>
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
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {selectedGalleryItem.description}
                </p>

                {/* Download alert notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-start mt-5">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                    <strong>Lưu ý quan trọng:</strong> Bức ảnh này đã được cấp mã số bản quyền tác giả trong Chamchamz Archive. Tuyệt đối nghiêm cấm việc lưu về máy và tái đăng tải ra thế giới bên ngoài. Tận hưởng khoảnh khắc ngọt ngào một cách văn minh nhất!
                  </p>
                </div>
              </div>

              {/* Author & Actions footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-slate-400">Ghi danh: {selectedGalleryItem.author}</span>
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
      </AnimatePresence>

    </div>
  );
}
