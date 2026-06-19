/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HintItem, GalleryItem, RecItem, FanMessage } from './types';

export const HINTS_DATA: HintItem[] = [
  {
    id: 'hint-1',
    title: 'Gợi ý về chiếc mũ len màu cam đào 🍑',
    date: '18/06/2026',
    category: 'gợi ý',
    content: 'Chamchamz dạo gần đây cực kỳ thích đội chiếc mũ len đính kèm chiếc lá nhỏ ở đỉnh đầu. Một nguồn tin đáng tin cậy cho biết, đây là món quà tự làm từ một người bạn rất thân của bé!',
    isUnlocked: false,
    hintIllustration: '🎨🎨'
  },
  {
    id: 'hint-2',
    title: 'Địa điểm chụp hình bí mật của bộ ảnh Mùa Đông ❄️',
    date: '15/06/2026',
    category: 'bí mật',
    content: 'Những bức ảnh tuyết trắng mộng mơ thực ra không phải chụp ở nước ngoài đâu nha! Nó được chụp tại một studio thiết kế mang phong cách Bắc Âu nằm sâu trong một con hẻm nhỏ tại trung tâm thành phố.',
    isUnlocked: true,
    hintIllustration: '📸🏰'
  },
  {
    id: 'hint-3',
    title: 'Dự đoán bài hát chủ đề cho Radio Sắp Tới 🎵',
    date: '10/06/2026',
    category: 'sự kiện',
    content: 'Giai điệu mào đầu có nhịp 3/4, tiếng piano nhẹ nhàng và có tiếng chim hót ở đầu bản thu. Khả năng cao đây sẽ là một bản Acoustic Ballad cực kỳ ấm lòng dành riêng cho fan mùa đông!',
    isUnlocked: false,
    hintIllustration: '🎹🎧'
  },
  {
    id: 'hint-4',
    title: 'Thông báo: Tạm khóa bình luận bài đăng số #12 🔐',
    date: '05/06/2026',
    category: 'thông báo',
    content: 'Để bảo vệ tính riêng tư của thông tin nội bộ, bài đăng số #12 sẽ được chuyển sang chế độ lưu trữ chỉ đọc từ hôm nay. Các bạn hãy tiếp tục thảo luận ở hòm thư chung nhé!',
    isUnlocked: true,
    hintIllustration: '🔒📄'
  }
];

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Nụ cười buổi ban mai',
    date: '18/06/2026',
    tags: ['Nụ Cười', 'Mùa Hè', 'Chân Dung'],
    description: 'Khoảnh khắc rực rỡ nhất khi nắng chớm rọi qua khung cửa sổ phòng Chamchamz. Đôi mắt cười long lanh như chứa tinh tú gieo niềm mong mỏi.',
    colorTheme: 'from-amber-100 to-orange-100 border-amber-300 text-amber-800',
    emoji: '☀️',
    author: 'Krystal Blue'
  },
  {
    id: 'gal-2',
    title: 'Trà sữa dâu tây sánh mịn',
    date: '14/06/2026',
    tags: ['Đồ Ăn', 'Màu Hồng', 'Cưng chiều'],
    description: 'Món nước yêu thích của Chamchamz tuần này! Lớp foam phô mai dày béo ngậy kèm mứt dâu tươi đỏ mọng ngập tràn vị ngọt hạnh phúc.',
    colorTheme: 'from-pink-100 to-rose-100 border-pink-300 text-pink-800',
    emoji: '🥤🍓',
    author: 'BerryLover'
  },
  {
    id: 'gal-3',
    title: 'Chiếc tai nghe retro màu sữa',
    date: '12/06/2026',
    tags: ['Đồ dùng', 'Retro', 'Giai điệu'],
    description: 'Người bạn đồng hành quen thuộc trong mọi chuyến đi bus chiều. Chiếc tai nghe kiểu cổ điển mang lại nguồn cảm hứng âm nhạc vô hạn của Chamchamz.',
    colorTheme: 'from-cyan-100 to-teal-100 border-cyan-300 text-cyan-800',
    emoji: '🎧🥖',
    author: 'ChamFan'
  },
  {
    id: 'gal-4',
    title: 'Dấu chân nhỏ trên tuyết mềm',
    date: '08/06/2026',
    tags: ['Mùa Đông', 'Phong Cảnh', 'Dấu Vết'],
    description: 'Bức ảnh chụp góc cận khi tuyết đầu mùa rơi xuống. Từng chi tiết nhỏ bé đáng sưởi ấm cho cả trái tim khô cằn.',
    colorTheme: 'from-sky-100 to-blue-100 border-sky-300 text-sky-800',
    emoji: '🐾❄️',
    author: 'SilverBell'
  },
  {
    id: 'gal-5',
    title: 'Phông nền bong bóng pastel',
    date: '01/06/2026',
    tags: ['Màu Sắc', 'Bong Bóng', 'Tươi Sáng'],
    description: 'Setup chuẩn chuẩn bị cho tiệc trà kỷ niệm của Chamchamz cùng đội ngũ thiết kế. Sự hòa quyện lung linh của sắc hồng, xanh ngọc và lục bảo.',
    colorTheme: 'from-teal-100 to-emerald-100 border-teal-300 text-teal-800',
    emoji: '🎈🫧',
    author: 'Lollipop'
  },
  {
    id: 'gal-6',
    title: 'Cuốn nhật ký bìa hoa cúc',
    date: '28/05/2026',
    tags: ['Sức Khỏe', 'Nhật Ký', 'Viết lách'],
    description: 'Nơi cất giấu những ý tưởng vẽ vời linh tinh bằng nét vẽ tay nguệch ngoạc nhưng vô cùng sinh động của bé Chamchamz.',
    colorTheme: 'from-yellow-100 to-lime-100 border-yellow-300 text-yellow-800',
    emoji: '📔🌼',
    author: 'SunnyDay'
  }
];

export const RECS_DATA: RecItem[] = [
  {
    id: 'rec-1',
    title: 'Ditto',
    creator: 'NewJeans',
    type: 'music',
    reason: 'Giai điệu hoài niệm, nhịp trống lo-fi lôi cuốn mang đậm ký ức mùa đông của tuổi trẻ. Rất thích hợp để đeo tai nghe vừa nghe vừa lật xem thư viện ảnh cũ.',
    linkText: 'Nghe trên Youtube Music',
    url: 'https://music.youtube.com'
  },
  {
    id: 'rec-2',
    title: 'Hoàng Tử Bé (The Little Prince)',
    creator: 'Antoine de Saint-Exupéry',
    type: 'book',
    reason: '“Người ta chỉ nhìn thấy thật rõ ràng bằng trái tim mình. Những điều cốt lõi thì mắt thường không nhìn thấy được”. Cuốn sách nuôi dưỡng sự hồn nhiên của Chamchamz.',
    linkText: 'Tìm đọc tại thư viện',
    url: 'https://wikipedia.org/wiki/The_Little_Prince'
  },
  {
    id: 'rec-3',
    title: 'My Neighbor Totoro',
    creator: 'Studio Ghibli / Hayao Miyazaki',
    type: 'movie',
    reason: 'Bộ phim hoạt hình huyền thoại ấm áp đưa bạn trở về với thiên nhiên trong trẻo, những chuyến xe bus mèo nhiệm màu và lòng tin thuần khiết.',
    linkText: 'Xem thông tin phim',
    url: 'https://www.imdb.com'
  },
  {
    id: 'rec-4',
    title: 'Through the Night (Đêm nay)',
    creator: 'IU',
    type: 'music',
    reason: '“Giống như những chữ viết trên cát dưới sóng biển cuốn đi, tôi viết cho bạn một bức thư từ tận sâu trái tim mình”. Giai điệu mộc mạc ru êm dịu giấc mơ mỗi đêm.',
    linkText: 'Xem MV chính thức',
    url: 'https://youtube.com'
  }
];

export const INITIAL_MESSAGES: FanMessage[] = [
  {
    id: 'msg-1',
    authorName: 'Mochi Đáng Yêu',
    createdAt: '18/06/2026 19:15',
    sticker: '🎀',
    messageText: 'Chào Chamchamz Archive! Mình đã tìm kiếm một không gian xinh đẹp như thế này từ rất lâu rồi. Cảm ơn admin vì đã thiết thực lưu giữ từng khoảnh khắc siêu dễ thương nha!'
  },
  {
    id: 'msg-2',
    authorName: 'Sóc Con Tinh Nghịch',
    createdAt: '18/06/2026 18:32',
    sticker: '✨',
    messageText: 'Yêu quí nhất luật ngầm của chúng mình: "Bảo mật tuyệt đối thông tin, không mang ra ngoài!". Hứa sẽ luôn tuân thủ để giữ gìn bình yên cho góc nhỏ này nè.'
  },
  {
    id: 'msg-3',
    authorName: 'Trà Sữa Matcha',
    createdAt: '17/06/2026 14:02',
    sticker: '🍀',
    messageText: 'Những gợi ý (hints) của admin kích thích sự tò mò thực sự á. Không biết bao giờ chiếc mũ len cam đào của Chamchamz mới được mở khóa chi tiết đây ta?'
  }
];

// Content for the Blueprint panel requested by the user
export const BLUEPRINT_MARKDOWN = `
# PHƯƠNG ÁN THIẾT KẾ VÀ BLUEPRINT NỘI DUNG

Kính gửi người dùng, dưới đây là chi tiết bộ tài liệu thiết kế bản quyền dành riêng cho thương hiệu **Chamchamz Archive** nhằm đáp ứng toàn bộ các yêu cầu khắt khe của bạn.

---

### 🗺️ 1. SƠ ĐỒ TRANG CỦA WEBSITE (RECOMMENDED SITEMAP)
Website được triển khai dưới cấu trúc **Single-Page Application (SPA)** thông minh với thanh định hướng mượt mà, bao quát trọn vẹn trải nghiệm người dùng:
1. **TRANG CHỦ (Home Grid)**:
   - **Hero Banner**: Điểm tiếp nhận chú ý bước đầu với hình hiệu động bồng bềnh.
   - **Thanh đo bảo mật (Security Alert banner)**: Nhấn mạnh thông điệp bản quyền cốt lõi.
   - **About Section**: Trình bày câu chuyện của Archive.
2. **KHO LƯU TRỮ PHÂN LOẠI (Interactive Explorer)** (Chuyển đổi trạng thái Tab dạng Smooth Transition):
   - **Tab 1: Hints (Manh mối)**: Chứa các thẻ gợi ý lật mở lôi cuốn có bộ lọc danh mục.
   - **Tab 2: Gallery (Triển lãm)**: Trưng bày bộ ảnh mini rực rỡ với tính năng tìm kiếm theo thẻ (tags) và xem phóng to (lightbox).
   - **Tab 3: Recs (Gợi ý)**: Góc chia sẻ danh sách phim, sách, bài hát chân thật kèm theo chức năng chơi nhạc mô phỏng.
   - **Tab 4: Contact (Hộp thư)**: Nơi fan gửi thư nặc danh đính Sticker dễ thương và đăng trực tiếp lên "Bức tường Kỷ niệm".
3. **CHÂN TRANG (Footer)**: Thông tin bản quyền chống sao chép và thông tin liên hệ bảo mật.

---

### ✍️ 2. GỢI Ý CÁC TIÊU ĐỀ BẮT MẮT (SUGGESTED HEADLINE OPTIONS)
- **Tùy chọn 1 (Gốc - Được chọn)**: *"Chamchamz Archive: Khám Phá Rương Ký Ức Sáng Tạo & Tươi Vui"*
- **Tùy chọn 2 (Thân mật)**: *"Góc Nhỏ Cất Giấu Bí Mật Đáng Yêu Về Chamchamz"*
- **Tùy chọn 3 (Kỳ bí)**: *"Những Manh Mối Nhỏ, Những Niềm Vui To - Chỉ Có Tại Đây"*

---

### 🎯 3. BIẾN THỂ KÊU GỌI HÀNH ĐỘNG (CTA VARIATIONS)
- **Primary CTA (Dành cho Fan hâm mộ)**: *"Lật mở Manh Mốis ngay"* (Khám phá bí mật ẩn giấu)
- **Secondary CTA (Dành cho việc bảo vệ cộng đồng)**: *"Cam kết bảo mật & Khám phá"*
- **Interactive Action**: *"Gửi lá thư cảm ơn mộc mạc gửi đến Chamchamv"*

---

### ĐỊNH VỊ THƯƠNG HIỆU & SỨ MỆNH
**"Chamchamz Archive là bảo tàng lưu trữ số độc bản, mang màu sắc trong lành, ấm áp để nâng niu mỗi kỷ niệm đẹp đẽ của Chamchamz. Đây là pháo đài kiến thức bất khả xâm phạm của cộng đồng fan chân chính."**

---

### 🌐 4. TỐI ƯU HÓA TÌM KIẾM (SEO METADATA)
- **SEO Title**: \`Chamchamz Archive - Kho Lưu Trữ Ký Ức & Manh Mối Độc Quyền | Sáng Tạo & Bảo Mật\`
- **Meta Description**: \`Truy cập Chamchamz Archive để xem các hình ảnh cưng xỉu, gợi ý bí mật và đề xuất âm nhạc yêu thích của Chamchamz. Cam kết lưu trữ nội bộ và bảo mật thông tin tuyệt đối cho cộng đồng fan.\`

---

### 🎨 5. PHONG CÁCH HÌNH ẢNH & BIỂU TƯỢNG (IMAGES & ICONS STYLE)
- **Màu sắc chủ đạo**: Pastel ngọc lam thanh mát kết hợp với pastel lục bảo, điểm xuyết nền trắng sữa tinh khôi để tránh mệt mỏi thị giác khi lướt đọc thông tin.
- **Biểu tượng (Icon style)**: Các nét vẽ tròn trịa với viền đậm theo trường phái **Blippo** & **Neo-brutalist ngọt ngào**, tạo cho người xem cảm giác an toàn, vui tươi và tràn đầy năng lượng thơ ngây.
- **Trạng thái động**: Hiệu ứng đàn hồi (elastic bouncing), hiệu ứng nhấp nháy phát sáng nhẹ khi di chuột tạo lực hút giác quan mạnh mẽ.

---

### 💡 6. ĐỀ XUẤT TĂNG TƯƠNG TÁC (ENGAGEMENT RECOMMENDATIONS)
1. **Lật thẻ bí mật (Unlocking Mystery Cards)**: Người dùng có thể nhấn khóa để tự do tò mò khám phá nội dung bên trong thay vì hiển thị đơn điệu.
2. **Ủng hộ tin tức bảo mật**: Người dùng biểu thị sự đồng tình với nguyên tắc chống rò rỉ tin tức bằng cách nhấp biểu tượng trái tim bảo mật.
3. **Gửi sticker kỷ niệm**: Cho phép người hâm mộ tự tay đút một chiếc sticker ảo kèm lời tâm sự chân thành vào hòm thư, viết nên một bức tường rực rỡ sắc màu được cập nhật thời gian thực.
`;
