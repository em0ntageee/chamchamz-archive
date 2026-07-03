/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, AlertCircle, Sparkles, Trash2, Heart } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FanMessage } from '../types';
import { INITIAL_MESSAGES } from '../data';

interface ChamchamzMailboxProps {
  isAdmin: boolean;
}

const pastelColors = [
  { bg: 'bg-[#fff1f2]', border: 'border-rose-300', text: 'text-rose-950', accent: 'text-rose-600/70', labelBg: 'bg-rose-100', labelText: 'text-rose-800' },
  { bg: 'bg-[#f0fdf4]', border: 'border-emerald-300', text: 'text-emerald-950', accent: 'text-emerald-600/70', labelBg: 'bg-emerald-100', labelText: 'text-emerald-800' },
  { bg: 'bg-[#eff6ff]', border: 'border-blue-300', text: 'text-blue-950', accent: 'text-blue-600/70', labelBg: 'bg-blue-100', labelText: 'text-blue-800' },
  { bg: 'bg-[#faf5ff]', border: 'border-purple-300', text: 'text-purple-950', accent: 'text-purple-600/70', labelBg: 'bg-purple-100', labelText: 'text-purple-800' },
  { bg: 'bg-[#fefce8]', border: 'border-yellow-300', text: 'text-yellow-950', accent: 'text-yellow-600/70', labelBg: 'bg-yellow-100', labelText: 'text-yellow-800' },
  { bg: 'bg-[#fff7ed]', border: 'border-orange-300', text: 'text-orange-950', accent: 'text-orange-600/70', labelBg: 'bg-orange-100', labelText: 'text-orange-800' },
  { bg: 'bg-[#f0fdfa]', border: 'border-teal-300', text: 'text-teal-950', accent: 'text-teal-600/70', labelBg: 'bg-teal-100', labelText: 'text-teal-800' },
  { bg: 'bg-[#fdf2f8]', border: 'border-pink-300', text: 'text-pink-950', accent: 'text-pink-600/70', labelBg: 'bg-pink-100', labelText: 'text-pink-800' }
];

const getPastelColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
};

export default function ChamchamzMailbox({ isAdmin }: ChamchamzMailboxProps) {
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [targetRecipient, setTargetRecipient] = useState<'Juhoon' | 'James' | 'Chamchamz'>('Chamchamz');
  const [messageText, setMessageText] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  // Load comments enabled status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/comments/status');
        if (res.ok) {
          const data = await res.json();
          setCommentsEnabled(data.commentsEnabled !== false);
        }
      } catch (e) {
        console.warn('Lỗi tải trạng thái hòm thư:', e);
      }
    };
    fetchStatus();
  }, []);

  // Handle toggling mailbox status
  const handleToggleComments = async () => {
    const targetState = !commentsEnabled;
    try {
      const response = await fetch('/api/comments/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentsEnabled: targetState,
          token: 'chamchamz'
        }),
      });
      if (response.ok) {
        setCommentsEnabled(targetState);
      } else {
        const data = await response.json();
        alert(data.error || 'Có lỗi xảy ra khi đổi trạng thái hòm thư.');
      }
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái hòm thư:', err);
      alert('Không kết nối được đến máy chủ.');
    }
  };

  // Load fan letters from Firestore in real-time
  useEffect(() => {
    const commentsCollection = collection(db, 'comments');
    const q = query(commentsCollection, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages: FanMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          authorName: data.from || 'Người hâm mộ',
          recipient: data.to || 'Chamchamz',
          messageText: data.text || '',
          sticker: data.sticker || '✨',
          createdAt: data.timestamp 
            ? new Date(data.timestamp).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''
        };
      });
      setMessages(liveMessages.length > 0 ? liveMessages : INITIAL_MESSAGES);
    }, (error) => {
      console.warn("Lỗi kết nối Firestore real-time comments, dùng dữ liệu mẫu:", error);
      setMessages(INITIAL_MESSAGES);
    });

    return () => unsubscribe();
  }, []);

  // Handle fan letter submission
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('Vui lòng nhập biệt danh của bạn!');
      return;
    }
    if (!messageText.trim() || messageText.length < 5) {
      setFormError('Nội dung phải chứa ít nhất 5 ký tự để gửi đi nhé!');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: authorName.trim(),
          to: targetRecipient,
          text: messageText.trim(),
          sticker: '✨',
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Có lỗi xảy ra khi gửi thư hâm mộ. Vui lòng thử lại!';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (parseErr) {
          try {
            const textData = await response.text();
            if (textData && textData.length < 150 && !textData.includes('<!DOCTYPE')) {
              errorMsg = textData;
            }
          } catch (textErr) {}
        }
        setFormError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      setAuthorName('');
      setMessageText('');
      setFormError('');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err) {
      console.error('Lỗi gửi thư:', err);
      setFormError('Không kết nối được đến máy chủ. Vui lòng thử lại sau!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin delete action
  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lá thư này không?')) return;
    try {
      const response = await fetch(`/api/comments/${id}?token=chamchamz`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        let deleteErrorMsg = 'Không thể xóa thư hâm mộ.';
        try {
          const errorData = await response.json();
          deleteErrorMsg = errorData.error || deleteErrorMsg;
        } catch (parseErr) {
          try {
            const textData = await response.text();
            if (textData && textData.length < 150 && !textData.includes('<!DOCTYPE')) {
              deleteErrorMsg = textData;
            }
          } catch (textErr) {}
        }
        setDeleteError(deleteErrorMsg);
        setTimeout(() => setDeleteError(''), 3000);
      }
    } catch (err) {
      console.error('Lỗi xóa thư:', err);
      setDeleteError('Lỗi kết nối đến máy chủ.');
      setTimeout(() => setDeleteError(''), 3000);
    }
  };

  return (
    <section id="mailbox-section" className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 tracking-tight flex items-center justify-center gap-2">
          <span>˙⋆✮  Chamchamz Mailbox ˙⋆✮</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Form: Write Letter (Col-5) */}
        <div className="md:col-span-5 space-y-4">
          {isAdmin && (
            <div className="bg-amber-50 border-4 border-slate-900 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
                Nhận thư mới: {commentsEnabled ? <span className="text-emerald-600">MỞ 🟢</span> : <span className="text-rose-600">TẠM ĐÓNG 🔴</span>}
              </div>
              <button
                type="button"
                onClick={handleToggleComments}
                className={`px-3 py-2 rounded-2xl border-2 text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                  commentsEnabled
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-slate-900'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white border-slate-900'
                }`}
              >
                {commentsEnabled ? 'Đóng nhận thư' : 'Mở nhận thư'}
              </button>
            </div>
          )}

          {!commentsEnabled ? (
            <div className="bg-[#fefce8] border-4 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center space-y-2">
              <span className="text-3xl block animate-bounce">✉️</span>
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                Hiện tại hòm thư đang tạm ngừng nhận thư mới. Cảm ơn bạn!
              </p>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmitMessage} 
              className="bg-white border-4 border-slate-900 p-6 rounded-3xl space-y-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              {/* From field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-1">
                  From:
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Biệt danh đáng yêu của bạn..."
                  maxLength={50}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:bg-slate-50 transition-colors"
                />
              </div>

              {/* To field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-2">
                  To:
                </label>
                <div className="flex gap-2">
                  {(['Chamchamz', 'Juhoon', 'James'] as const).map((recipient) => (
                    <button
                      key={recipient}
                      type="button"
                      onClick={() => setTargetRecipient(recipient)}
                      className={`flex-1 py-1.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                        targetRecipient === recipient
                          ? 'bg-brand-cyan-300 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-800'
                      }`}
                    >
                      {recipient}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-1">
                  Nội dung:
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhắn gửi đôi lời chân thành..."
                  rows={4}
                  maxLength={500}
                  required
                  className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:bg-slate-50 transition-colors resize-none"
                />
              </div>

              {/* Error Display */}
              {formError && (
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs bg-rose-50 border-2 border-rose-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Success Display */}
              {formSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 border-2 border-emerald-200 p-3 rounded-xl">
                  <Sparkles className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>Đã gửi lá thư thành công đến hộp thư của Chamchamz! 🕊️</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-extrabold py-3 rounded-2xl cursor-pointer active:scale-97 border-2 border-slate-900 uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  formSuccess
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-slate-900 hover:bg-brand-teal-400 hover:text-slate-900'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang gửi...' : formSuccess ? 'Đã gửi ✨' : 'Gửi'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Feed: Letters Display (Col-7) */}
        <div className="md:col-span-7 space-y-4">
          {deleteError && (
            <div className="p-3 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl border border-rose-200">
              {deleteError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => {
                const color = getPastelColor(msg.id);
                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className={`p-5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between space-y-3 relative overflow-hidden ${color.bg}`}
                  >
                    {/* Admin delete button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(msg.id)}
                        className="absolute top-3 right-3 bg-white hover:bg-rose-100 hover:text-rose-600 text-slate-400 p-1.5 rounded-lg border border-slate-900 transition-colors shadow-sm cursor-pointer z-10"
                        title="Xóa lá thư này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-800">
                          From: <span className="font-extrabold">{msg.authorName}</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[9px]">•</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-900 font-mono ${color.labelBg} ${color.labelText}`}>
                          To: {msg.recipient || 'Chamchamz'}
                        </span>
                      </div>
                      
                      <p className={`text-xs font-semibold leading-relaxed whitespace-pre-wrap break-words pr-4 ${color.text}`}>
                        {msg.messageText}
                      </p>
                    </div>

                    <div className={`text-[9px] font-bold font-mono text-right flex items-center justify-end gap-1 ${color.accent}`}>
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{msg.createdAt || 'Mới đây'}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {messages.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                <span className="text-3xl block mb-2">🕊️</span>
                <p className="text-xs text-slate-500 font-bold">Chưa có lá thư nào, hãy gửi đi lời yêu thương đầu tiên!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
