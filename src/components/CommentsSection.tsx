/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, Trash2, ShieldCheck, Sparkles, MessageSquareHeart } from 'lucide-react';

interface Comment {
  id: string;
  from: string;
  to: 'James' | 'Juhoon' | 'Chamchamz';
  text: string;
  timestamp: string;
}

export default function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [fromName, setFromName] = useState('');
  const [toRecipient, setToRecipient] = useState<'James' | 'Juhoon' | 'Chamchamz'>('Chamchamz');
  const [commentText, setCommentText] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Admin state checking
  const [isAdmin, setIsAdmin] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Check if admin is unlocked in localStorage
  useEffect(() => {
    const checkAdmin = () => {
      const saved = localStorage.getItem('chamchamz_admin_unlocked');
      setIsAdmin(saved === 'true');
    };
    
    checkAdmin();
    // Listen for changes (e.g., when unlocked from the counters admin modal)
    window.addEventListener('storage', checkAdmin);
    
    // Also poll/check occasionally in case of internal updates
    const interval = setInterval(checkAdmin, 2000);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      clearInterval(interval);
    };
  }, []);

  // Fetch comments
  const fetchComments = () => {
    fetch('/api/comments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComments(data);
        }
      })
      .catch(err => console.error('Error fetching comments:', err));

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
    fetchComments();
    
    // Listen for custom trigger or storage updates to refresh status
    window.addEventListener('storage', fetchComments);

    // Poll for new comments every 12 seconds
    const interval = setInterval(fetchComments, 12000);
    return () => {
      window.removeEventListener('storage', fetchComments);
      clearInterval(interval);
    };
  }, []);

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fromName.trim()) {
      setError('Cậu ơi, vui lòng nhập tên (from:) nha!');
      return;
    }
    if (!commentText.trim()) {
      setError('Cậu ơi, vui lòng viết lời nhắn gửi Chamchamz nhé!');
      return;
    }
    if (commentText.length > 500) {
      setError('Lời nhắn tối đa là 500 ký tự thôi nè!');
      return;
    }

    setLoading(true);

    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromName.trim(),
        to: toRecipient,
        text: commentText.trim()
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gửi lời nhắn thất bại!');
        }
        return data;
      })
      .then(newComment => {
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        setFromName('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(err => {
        setError(err.message || 'Có lỗi xảy ra, thử lại nhé!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle Delete (Admin only)
  const handleDeleteComment = (id: string) => {
    if (!window.confirm('Cậu có chắc chắn muốn xóa lời yêu thương này không? Action này không thể hoàn tác!')) {
      return;
    }

    fetch(`/api/comments/${id}?token=chamchamz`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setComments(prev => prev.filter(c => c.id !== id));
        } else {
          alert(data.error || 'Xóa thất bại!');
        }
      })
      .catch(err => {
        console.error('Error deleting comment:', err);
        alert('Lỗi kết nối server!');
      });
  };

  // Human friendly relative time formatter
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Gần đây';
    }
  };

  // Pastel styles mapping based on recipient
  const getRecipientStyles = (to: 'James' | 'Juhoon' | 'Chamchamz') => {
    switch (to) {
      case 'James':
        return {
          cardBg: 'bg-amber-50 border-amber-200 hover:bg-amber-100/50',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          emoji: '🐈‍⬛',
          toLabel: 'to: James'
        };
      case 'Juhoon':
        return {
          cardBg: 'bg-sky-50 border-sky-200 hover:bg-sky-100/50',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          emoji: '🐢',
          toLabel: 'to: Juhoon'
        };
      case 'Chamchamz':
      default:
        return {
          cardBg: 'bg-rose-50 border-rose-200 hover:bg-rose-100/50',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          emoji: '💖',
          toLabel: 'to: Chamchamz'
        };
    }
  };

  return (
    <section id="comments-section" className="max-w-5xl mx-auto px-4 py-8 font-sans">
      
      {/* Title block */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-1">
          <span>˙⋆✮ Lời yêu gửi Chamchamz ˙⋆✮</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Post form (Col 5) */}
        {commentsEnabled ? (
          <div className="lg:col-span-5 bg-white rounded-3xl border-4 border-slate-900 p-6 shadow-[5px_5px_0px_rgba(15,23,42,1)] relative">
            
            <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-rose-400 border-2 border-slate-900 text-slate-900 font-bold text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full z-10">
              Write message ✏️
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-1.5">
              <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
              <span>Chamchamz Mailbox</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Sender From Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1">
                  <span>from: (Tên người gửi)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  maxLength={50}
                  placeholder="Tên của cậu..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none focus:border-rose-400 placeholder-slate-400 text-slate-800 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Recipient Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1">
                  <span>to: (Gửi đến)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Chamchamz', 'James', 'Juhoon'] as const).map((r) => {
                    const isActive = toRecipient === r;
                    let colorClass = '';
                    if (r === 'James') colorClass = isActive ? 'bg-amber-400 text-slate-900 border-slate-900' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800';
                    else if (r === 'Juhoon') colorClass = isActive ? 'bg-sky-400 text-slate-900 border-slate-900' : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800';
                    else colorClass = isActive ? 'bg-rose-400 text-slate-900 border-slate-900' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800';

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setToRecipient(r)}
                        disabled={loading}
                        className={`py-2 px-1 text-center rounded-xl font-bold text-[10px] border-2 transition-all cursor-pointer ${colorClass} ${isActive ? 'scale-102 font-extrabold' : ''}`}
                      >
                        {r === 'James' ? '🐈‍⬛ James' : r === 'Juhoon' ? '🐢 Juhoon' : '💖 Cả hai'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-extrabold text-slate-500 flex items-center gap-1">
                    <span>Nội dung:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[9px] font-bold ${commentText.length > 450 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {commentText.length}/500
                  </span>
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Cùng viết lời thỏ thẻ dễ thương gửi James & Juhoon nha..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-rose-400 placeholder-slate-400 text-slate-800 resize-none transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-[10px] font-bold text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100 text-center animate-shake">
                  ⚠️ {error}
                </p>
              )}

              {/* Success message */}
              {success && (
                <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                  <span>Đã gửi lời yêu thương thành công!</span>
                </p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 border-2 border-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-rose-400 hover:text-slate-900 hover:border-slate-900 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                whileTap={{ scale: 0.95 }}
              >
                <Send className={`w-3.5 h-3.5 ${loading ? 'animate-bounce' : ''}`} />
                <span>{loading ? 'Đang gửi...' : 'Gửi'}</span>
              </motion.button>
            </form>

            {isAdmin && (
              <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200 flex items-center justify-center gap-1 text-[10px] text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Chế độ Admin đang bật (bạn có quyền xóa trực tiếp bình luận)</span>
              </div>
            )}

          </div>
        ) : null}

        {/* Right Column: Scrollable comment Board (Col 7 / 12) */}
        <div className={`bg-white rounded-3xl border-4 border-slate-900 p-6 shadow-[5px_5px_0px_rgba(15,23,42,1)] relative flex flex-col h-[460px] ${commentsEnabled ? 'lg:col-span-7' : 'lg:col-span-12'}`}>

          <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-1.5">
            <span>ε(´｡•᎑•`)っ 💕</span>
          </h3>

          {/* Comments board wall */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
            <AnimatePresence initial={false}>
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
                  <Heart className="w-10 h-10 text-slate-200 animate-pulse" />
                  <p className="text-xs font-bold text-slate-400">Chưa có lời yêu thương nào được treo.</p>
                  <p className="text-[10px] text-slate-400">Hãy là người đầu tiên gửi gắm tình cảm nhé!</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const style = getRecipientStyles(comment.to);
                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`p-4 rounded-2xl border-2 border-slate-950/80 shadow-[3px_3px_0px_rgba(15,23,42,0.15)] flex flex-col justify-between relative transition-all ${style.cardBg}`}
                    >
                      {/* Top bar with From and To Badge */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-extrabold font-mono text-slate-400 flex-shrink-0">from:</span>
                          <span className="text-xs font-extrabold text-slate-800 truncate">{comment.from}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border-1.5 border-slate-950/50 ${style.badgeBg}`}>
                            {style.emoji} {style.toLabel}
                          </span>
                          
                          {/* Trash button for Admin direct delete */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              title="Xóa bình luận"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment text body */}
                      <p className="text-xs text-slate-700 font-medium leading-relaxed break-words whitespace-pre-wrap flex-1 my-1">
                        {comment.text}
                      </p>

                      {/* Footer time */}
                      <div className="text-[9px] text-slate-400 font-bold font-mono text-right mt-1.5">
                        {formatTimeAgo(comment.timestamp)}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            <div ref={commentsEndRef} />
          </div>

        </div>

      </div>

    </section>
  );
}
