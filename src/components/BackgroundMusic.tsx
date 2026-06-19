/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, Pause, Volume2, VolumeX, Settings, Sparkles, Sliders, Check, Link, Globe } from 'lucide-react';

interface MusicTrack {
  name: string;
  artist: string;
  url: string;
}

const PRESET_TRACKS: MusicTrack[] = [
  {
    name: "Cozy Stream Lo-Fi",
    artist: "Chilhop Melodies",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    name: "Golden Coffee Hour",
    artist: "Acoustic Ukulele",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    name: "Sunny Sandbox Loop",
    artist: "Fluffy Clouds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  }
];

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tracks, setTracks] = useState<MusicTrack[]>(() => {
    const saved = localStorage.getItem('chamchamz_custom_tracks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return PRESET_TRACKS;
      }
    }
    return PRESET_TRACKS;
  });

  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem('chamchamz_active_track_idx');
    if (savedIndex) {
      const parsed = parseInt(savedIndex, 10);
      if (parsed >= 0 && parsed < PRESET_TRACKS.length) return parsed;
    }
    return 0; // default track 0
  });

  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and play audio
  useEffect(() => {
    // Create new audio element
    const audio = new Audio(tracks[activeTrackIndex].url);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.45;
    audioRef.current = audio;

    // Handles chrome autoplay policies gracefully
    const handleFirstUserInteraction = () => {
      // Prompt user or start stream
      if (isPlaying) {
        audio.play().catch(() => {
          // Autoplay was blocked, reset state 
          setIsPlaying(false);
        });
      }
      cleanupEvents();
    };

    const cleanupEvents = () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('scroll', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('scroll', handleFirstUserInteraction);

    return () => {
      cleanupEvents();
      audio.pause();
      audioRef.current = null;
    };
  }, [activeTrackIndex, tracks]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.log("Audio autoplay prevented. Must tap play first.", err);
          // Let try loading again
          audioRef.current?.load();
          audioRef.current?.play().then(() => setIsPlaying(true));
        });
    }
  };

  // Handle Mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.volume = nextMuted ? 0 : 0.45;
  };

  // Change active music track
  const handleSelectTrack = (index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveTrackIndex(index);
    localStorage.setItem('chamchamz_active_track_idx', String(index));
    setIsPlaying(true);
  };

  // Add custom URL track
  const handleAddCustomTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const name = customName.trim() || `Nhạc Tùy Chọn #${tracks.length + 1}`;
    const newTrack: MusicTrack = {
      name,
      artist: "Liên kết tải lên",
      url: customUrl.trim()
    };

    const updatedTracks = [...tracks, newTrack];
    setTracks(updatedTracks);
    localStorage.setItem('chamchamz_custom_tracks', JSON.stringify(updatedTracks));
    
    // Select the newly added track
    const newIndex = updatedTracks.length - 1;
    setActiveTrackIndex(newIndex);
    localStorage.setItem('chamchamz_active_track_idx', String(newIndex));

    setCustomUrl('');
    setCustomName('');
    setSaveSuccess(true);
    setIsPlaying(true);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const currentTrack = tracks[activeTrackIndex] || PRESET_TRACKS[0];

  return (
    <>
      {/* Invisible HTML5 Audio backer for robust playback */}
      <div className="hidden" aria-hidden="true" />

      {/* Floating Music Controller Center Container */}
      <div className="fixed bottom-6 left-6 z-[45] flex flex-col items-start gap-3">
        
        {/* Expanded Controller Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="bg-music-setup-panel"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-white border-3 border-slate-900 rounded-2xl w-72 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#1e293b]/70 uppercase inline-flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-brand-cyan-500 animate-pulse" /> Audio Settings
                </span>
                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full font-mono">
                  Lofi Player 🧸
                </span>
              </div>

              {/* Current Track information */}
              <div className="p-3 bg-gradient-to-br from-brand-blue-50 to-brand-cyan-50 rounded-xl border border-slate-200 mb-3.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Đang phát</p>
                <p className="text-xs font-extrabold text-slate-800 truncate">{currentTrack.name}</p>
                <p className="text-[10px] text-slate-500 truncate leading-tight font-medium">Bởi: {currentTrack.artist}</p>
                
                {/* Playing status message */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold italic">
                  {isPlaying ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>Nhạc lofi đang du dương...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      <span>Đang tạm dừng phát nhạc.</span>
                    </>
                  )}
                </div>
              </div>

              {/* Presets List */}
              <div className="space-y-1.5 mb-3">
                <label className="text-[9px] font-bold text-[#1e293b]/50 uppercase tracking-widest block mb-1">Thư Viện Âm Nhạc</label>
                <div className="max-h-24 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {tracks.map((track, idx) => (
                    <button
                      id={`btn-select-track-${idx}`}
                      key={idx}
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        activeTrackIndex === idx
                          ? 'bg-brand-cyan-500 border-slate-900 text-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="truncate flex-1 pr-1">{track.name}</span>
                      {activeTrackIndex === idx && <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Track URL Form */}
              <form onSubmit={handleAddCustomTrack} className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-[9px] font-bold text-[#1e293b]/50 uppercase tracking-widest block">Thêm Link Nhạc (MP3)</span>
                
                <input
                  id="input-custom-music-name"
                  type="text"
                  placeholder="Tên bài hát..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono focus:outline-none focus:border-brand-cyan-400 block"
                />

                <div className="relative">
                  <input
                    id="input-custom-music-url"
                    type="url"
                    placeholder="https://domain.com/music.mp3"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 pr-8 text-[11px] font-mono focus:outline-none focus:border-brand-cyan-400 block"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Link className="w-3.5 h-3.5" />
                  </div>
                </div>

                <button
                  id="btn-add-custom-music"
                  type="submit"
                  className="w-full py-1 bg-slate-900 text-white font-bold rounded-lg text-[10px] hover:bg-brand-cyan-500 hover:text-slate-900 cursor-pointer transition-colors block text-center"
                >
                  Tải Lên Máy Phát
                </button>

                {saveSuccess && (
                  <p className="text-[9px] text-emerald-600 font-extrabold text-center">🎉 Đã kích hoạt bài hát của bạn!</p>
                )}
              </form>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Trigger & Floating Widgets Bar */}
        <div className="flex items-center gap-2">
          
          {/* Main Floating Button */}
          <motion.button
            id="btn-toggle-play-music"
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 rounded-full border-3 border-slate-900 flex items-center justify-center cursor-pointer shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] relative transition-all ${
              isPlaying 
                ? 'bg-amber-300 hover:bg-amber-400' 
                : 'bg-white hover:bg-slate-50'
            }`}
            title={isPlaying ? "Dừng Phát" : "Phát Nhạc"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-slate-900 fill-slate-900" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 text-slate-900 fill-slate-950" />
            )}

            {/* Pulsing micro-dot indicator when playing */}
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
              </span>
            )}
          </motion.button>

          {/* Mute Button */}
          <motion.button
            id="btn-toggle-mute-music"
            onClick={toggleMute}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
            title={isMuted ? "Bật Chuông" : "Tắt Chuông"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-700" />
            )}
          </motion.button>

          {/* Equalizer Widget Overlay Effect when playing */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-6 px-1 bg-slate-900 border border-slate-900 rounded-md py-1 translate-y-[-1px] shadow-sm">
              <span className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_alternate]" style={{ height: '30%', animationDelay: '0.1s' }}></span>
              <span className="w-1 bg-pink-400 animate-[bounce_0.8s_infinite_alternate]" style={{ height: '70%', animationDelay: '0.2s' }}></span>
              <span className="w-1 bg-teal-400 animate-[bounce_0.5s_infinite_alternate]" style={{ height: '50%', animationDelay: '0.3s' }}></span>
              <span className="w-1 bg-blue-400 animate-[bounce_0.7s_infinite_alternate]" style={{ height: '90%', animationDelay: '0.4s' }}></span>
            </div>
          )}

          {/* Settings Customiser Trigger */}
          <motion.button
            id="btn-toggle-music-setup"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-colors ${
              isExpanded ? 'bg-brand-cyan-400' : 'bg-white hover:bg-slate-50'
            }`}
            title="Tùy chỉnh Playlist"
          >
            <Settings className={`w-4 h-4 text-slate-700 ${isExpanded ? 'animate-spin-slow' : ''}`} />
          </motion.button>

        </div>

      </div>
    </>
  );
}
