/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileText, X, Check, Eye, HelpCircle, Heart, Star, Sparkles, BookOpen } from 'lucide-react';
import { BLUEPRINT_MARKDOWN } from '../data';

export default function BlueprintDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        id="btn-open-blueprint"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-brand-teal-500 to-brand-cyan-500 text-white font-semibold py-3 px-5 rounded-full shadow-lg hover:shadow-brand-teal-200/50 flex items-center gap-2 cursor-pointer border-2 border-white hover:scale-105 active:scale-95 transition-transform"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ y: -3 }}
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span>Hồ Sơ Thiết Kế 📋</span>
      </motion.button>

      {/* Slide-out Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="blueprint-backdrop"
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              id="blueprint-panel"
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto border-l-4 border-brand-teal-400 p-6 md:p-8 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-teal-100 rounded-xl text-brand-teal-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">HỒ SƠ THIẾT KẾ & BẢN SAO Ý TƯỞNG</h2>
                    <p className="text-xs text-brand-teal-600 font-medium">Chamchamz Archive Blueprint Documents</p>
                  </div>
                </div>
                <button
                  id="btn-close-blueprint"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Blueprint Content Grid */}
              <div className="space-y-6 flex-1 text-slate-700">
                
                {/* Brand Identity Card */}
                <div className="bg-gradient-to-br from-brand-cyan-50 to-brand-teal-50 rounded-2xl p-5 border border-brand-teal-100">
                  <div className="flex items-center gap-2 mb-2 text-brand-teal-700 font-bold">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span>Cam kết Định vị (Brand Positioning)</span>
                  </div>
                  <p className="text-sm italic text-slate-600 leading-relaxed font-medium">
                    "Chamchamz Archive là bảo tàng lưu trữ số độc bản, mang màu sắc trong lành, ấm áp để nâng niu mỗi kỷ niệm đẹp đẽ của Chamchamz. Đây là pháo đài cất giữ kí ức thiêng liêng và bất khả xâm phạm của riêng cộng đồng fan hâm mộ chân chính."
                  </p>
                </div>

                {/* Sơ đồ trang / Sitemap */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-cyan-100 text-brand-cyan-700 text-xs font-bold">1</span>
                    Khuyên dùng Sơ đồ mạng lưới (Sitemap)
                  </h3>
                  <div className="space-y-3 pl-2 border-l-2 border-brand-teal-200">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-teal-600 block">✦ Trang Chủ (Cấp 1)</span>
                      <p className="text-sm text-slate-600 font-semibold pl-3">↳ Khung đầu trang rực rỡ + Thông điệp cảnh báo bảo mật + Câu chuyện thương hiệu (About)</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-teal-600 block">✦ Trung Tâm Tìm Kiếm Lọc (Cấp 2)</span>
                      <ul className="text-sm text-slate-600 pl-3 list-disc list-inside space-y-1">
                        <li><strong>Khám phá manh mối (Hints):</strong> Thẻ thông tin ẩn giấu mở khóa</li>
                        <li><strong>Triển lãm ảnh (Gallery):</strong> Grid ảnh kèm nhãn tìm kiếm linh hoạt + Phóng to (Lightbox)</li>
                        <li><strong>Góc khuyên đọc (Recs):</strong> Máy nghe nhạc retro gợi ý nghệ thuật</li>
                        <li><strong>Hòm thư nặc danh (Contact):</strong> Sân chơi đăng thông điệp lên Fanboard</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-teal-600 block">✦ Chân Trang (Cấp 3)</span>
                      <p className="text-sm text-slate-600 pl-3">↳ Chứng nhận phi thương mại + Nghiêm cấm chia sẻ không chính thống</p>
                    </div>
                  </div>
                </div>

                {/* Tiêu đề & CTAs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-sm">
                      <Sparkles className="w-4 h-4 text-brand-cyan-500" />
                      Gợi ý Tiêu Đề chính:
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                      <li><strong>Mẫu 1 (Trang chủ):</strong> "Chamchamz Archive: Khám Phá Rương Ký Ức Sáng Tạo & Tươi Vui"</li>
                      <li><strong>Mẫu 2:</strong> "Góc nhỏ cất giấu bí mật đáng yêu về Chamchamz"</li>
                      <li><strong>Mẫu 3:</strong> "Dấu vết ngọt ngào từ thế giới Chamchamz"</li>
                    </ul>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-sm">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Biển biến thể kêu gọi (CTA):
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                      <li><strong>Chính:</strong> "Lật mở manh mối ngay"</li>
                      <li><strong>Phụ:</strong> "Đồng ý bảo mật & Khám phá"</li>
                      <li><strong>Giao lưu:</strong> "Gửi lá thư gửi gắm yêu thương"</li>
                    </ul>
                  </div>
                </div>

                {/* SEO Configuration */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-cyan-100 text-brand-cyan-700 text-xs font-bold">2</span>
                    Cấu hình SEO chuẩ n hóa
                  </h3>
                  <div className="space-y-3.5 pl-2 text-sm">
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-bold block">SEO Title Tag</span>
                      <p className="text-brand-cyan-700 font-bold">Chamchamz Archive - Kho Lưu Trữ Ký Ức & Manh Mối Độc Quyền | Sáng Tạo & Bảo Mật</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-bold block">Meta Description Tag</span>
                      <p className="text-slate-600 text-xs">
                        Truy cập Chamchamz Archive để xem các hình ảnh cưng xỉu, gợi ý bí mật và đề xuất âm nhạc yêu thích của Chamchamz. Cam kết lưu trữ nội bộ và bảo mật thông tin tuyệt đối cho cộng đồng fan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phong cách mỹ thuật & Hình ảnh */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-cyan-100 text-brand-cyan-700 text-xs font-bold">3</span>
                    Mỹ thuật & Chỉ dẫn Đồ họa
                  </h3>
                  <ul className="text-sm text-slate-600 pl-4 list-disc space-y-1.5">
                    <li><strong>Màu sắc tươi trẻ:</strong> Ngọc lam pastel (`#A5F3FC`) phối nhịp nhàng với xanh mint của cỏ (`#2DD4BF`) sảng khoái và ngập tràn hơi thở thanh xuân.</li>
                    <li><strong>Phông chữ Quicksand:</strong> Nét chữ tròn lơi nhẹ rực sắc tuổi thơ mang vibe Blippo thịnh hành.</li>
                    <li><strong>Icon đầy sức sống:</strong> Đường viền đậm cá tính, mô tả rõ nét hành vi cọ xát, rung bồng bềnh hay đàn hồi (elastic bouncing).</li>
                  </ul>
                </div>

                {/* Đề xuất tăng tương tác */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-cyan-100 text-brand-cyan-700 text-xs font-bold">4</span>
                    Cơ chế giữ chân người dùng (Engagement)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-600">
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <h5 className="font-bold text-brand-teal-700 mb-1">🎮 Trải nghiệm tò mò</h5>
                      <p>Khơi gợi bản chất mê mạo hiểm của fan bằng các hộp thông tin ẩn dụ, click lật ngược cực thú vị.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <h5 className="font-bold text-brand-teal-700 mb-1">💌 Bức tường ký ức sống</h5>
                      <p>Cho phép người hâm mộ tự biên phản hồi một lời nhắn rực rỡ, trực quan dán băng dính lên tường gỗ ảo.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
                <button
                  id="btn-confirm-read-blueprint"
                  onClick={() => setIsOpen(false)}
                  className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md cursor-pointer flex items-center gap-2 hover:scale-102 transition-transform text-sm"
                >
                  <Check className="w-4 h-4" />
                  Đóng & Khám Phá Tiếp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
