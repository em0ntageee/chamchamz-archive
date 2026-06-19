/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, BookOpen, Quote, Heart, CheckCircle2, LockKeyhole } from 'lucide-react';

export default function About() {
  const [pledgesCount, setPledgesCount] = useState(1324);
  const [hasPledged, setHasPledged] = useState(false);

  useEffect(() => {
    const savedPledge = localStorage.getItem('chamchamz_pledge');
    if (savedPledge === 'true') {
      setHasPledged(true);
      setPledgesCount((prev) => prev + 1);
    }
  }, []);

  const handlePledge = () => {
    if (hasPledged) return;
    localStorage.setItem('chamchamz_pledge', 'true');
    setHasPledged(true);
    setPledgesCount((prev) => prev + 1);
  };

  return (
    <section id="about-section" className="py-16 bg-white rounded-3xl mx-4 my-8 p-6 md:p-12 shadow-xs border border-brand-teal-100">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center justify-center gap-2.5">
            <BookOpen className="w-8 h-8 text-brand-teal-500" />
            <span>Về Chamchamz Archive 🎨</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-brand-cyan-300 to-brand-teal-300 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Story (Col-7) */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>🏰 Câu Chuyện Của Góc Nhỏ</span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Chamchamz Archive ra đời từ ngọn lửa đam mê thuần khiết của một nhóm nhỏ những trái tim yêu thương Chamchamz vô điều kiện. Đúng như tinh thần cốt lõi trong triết lý hoạt động, chúng tôi tạo ra không gian lưu trữ số này để bảo tồn những nét dễ thương nhất, những bí mật ngọt ngào và giai điệu ru êm giấc mơ ban tối.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Website của chúng mình được mô phỏng theo triết lý mỹ thuật tối giản, rực rỡ và đong đầy niềm vui hồn nhiên. Từng chi tiết nhỏ ở đây đều được đục đẽo tỉ mỉ bằng tình cảm chân thành nhất.
              </p>
            </div>

            {/* Credibility Card */}
            <div className="p-4 rounded-2xl bg-brand-cyan-50 border border-brand-cyan-200 mt-4">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-brand-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cyan-800">Độ Tin Cậy Tuyệt Đối</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Mọi tư liệu ảnh, gợi ý sự kiện (hints) hay đề xuất nhạc đăng tải tại đây đều được Ban Quản Trị xác minh kỹ càng từ các nguồn chính thống, bảo vệ lòng tin tuyệt hảo của người hâm mộ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strict Security Rules Block (Col-5) */}
          <div className="md:col-span-5 bg-gradient-to-br from-brand-teal-50/70 to-brand-cyan-50/70 rounded-2xl p-6 border-2 border-brand-teal-200/60 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600 w-fit">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Quy Tắc Tối Thượng 🔐</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                Đây là thư mục lưu giữ thông tin mang tính bảo mật và thân mật của Chamchamz. Do đó, chúng tôi thiết lập quy chuẩn hoạt động nghiêm ngặt:
              </p>
              
              {/* Rules check list */}
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal-500 mt-0.5 flex-shrink-0" />
                  <span>Hoàn toàn <strong>KHÔNG</strong> trích xuất dữ liệu, chụp màn hình hay đem chia sẻ ra trang mạng xã hội công cộng khác.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal-500 mt-0.5 flex-shrink-0" />
                  <span>Bảo toàn không gian an yên tuyệt đối cho Chamchamz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal-500 mt-0.5 flex-shrink-0" />
                  <span>Tôn trọng bản quyền tác giả trong bộ sưu tập.</span>
                </li>
              </ul>
            </div>

            {/* Interactive Pledge Widget */}
            <div className="mt-6 pt-5 border-t border-brand-teal-200/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-bold">Số fan đã thực hiện lời thề:</span>
                <span id="pledge-counter" className="text-xs font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-brand-teal-700">
                  {pledgesCount.toLocaleString()} 🧑‍🚀
                </span>
              </div>

              <motion.button
                id="btn-sign-pledge"
                onClick={handlePledge}
                disabled={hasPledged}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border-2 ${
                  hasPledged
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                    : 'bg-slate-900 border-slate-900 hover:bg-brand-teal-600 hover:border-brand-teal-600 text-white hover:scale-101 active:scale-98'
                }`}
                whileTap={hasPledged ? {} : { scale: 0.95 }}
              >
                {hasPledged ? (
                  <>
                    <LockKeyhole className="w-4 h-4 text-emerald-600" />
                    <span>Đã Ký Thệ Ước Bảo Mật 💖</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Tớ Đồng Ý Bảo Mật Kho Lưu Trữ</span>
                  </>
                )}
              </motion.button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
