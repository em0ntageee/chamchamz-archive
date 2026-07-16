/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HintItem, GalleryItem, RecItem, FanMessage, ProjectItem } from './types';
import configData from './data/config.json';

export const SITE_CONFIG = configData;

// --- DYNAMIC INTEGRATION WITH DECAP CMS (VITE METADATA GLOB) ---
const hintsGlob = (import.meta as any).glob('/src/data/hints/*.json', { eager: true });
const galleryGlob = (import.meta as any).glob('/src/data/gallery/*.json', { eager: true });
const recsGlob = (import.meta as any).glob('/src/data/recs/*.json', { eager: true });
const projectsGlob = (import.meta as any).glob('/src/data/projects/*.json', { eager: true });

export function mapProjectCategory(cat: string): 'gift support' | 'led' | 'ads' | 'event' | 'others' {
  const norm = String(cat || '').trim().toLowerCase();
  if (norm === 'gift support' || norm === 'gift') return 'gift support';
  if (norm === 'led') return 'led';
  if (norm === 'ads') return 'ads';
  if (norm === 'event') return 'event';
  return 'others';
}

// Helpers to map legacy categories to new requested format
export function mapHintCategory(cat: string): string {
  const norm = String(cat || 'gợi ý').trim().toLowerCase();
  if (norm === 'gợi ý' || norm === 'gói ý' || norm === 'livestream') return 'Livestream';
  if (norm === 'bí mật' || norm === 'youtube') return 'Youtube';
  if (norm === 'sự kiện' || norm === 'phỏng vấn') return 'Phỏng vấn';
  if (norm === 'thông báo' || norm === 'kênh bên ngoài') return 'Kênh bên ngoài';
  return cat || 'Livestream';
}

export function mapRecType(type: string): string {
  const norm = String(type || 'music').trim().toLowerCase();
  if (norm === 'music' || norm === 'khác') return 'Khác';
  if (norm === 'book' || norm === 'fanfic/author') return 'Fanfic/Author';
  if (norm === 'movie' || norm === 'art/artist') return 'Art/Artist';
  return type || 'Khác';
}

export function mapGalleryCategory(cat: string): string {
  const norm = String(cat || '').trim().toLowerCase();
  
  if (norm === 'ig' || norm === 'instagram') return 'IG';
  if (norm === 'weverse') return 'Weverse';
  if (norm === 'reels/challenge' || norm === 'reels' || norm === 'challenge') return 'Reels/Challenge';
  if (norm === 'nguồn bên ngoài' || norm === 'nguon ben ngoai' || norm === 'external') return 'Nguồn bên ngoài';
  
  // Since X is removed, map existing posts of type X or empty to 'Nguồn bên ngoài'
  return 'Nguồn bên ngoài';
}

// 1. Process CMS Hints
const cmsHintsList: HintItem[] = [];
try {
  Object.entries(hintsGlob).forEach(([path, module]: [string, any]) => {
    const raw = module.default || module;
    if (raw && raw.id) {
      cmsHintsList.push({
        id: raw.id,
        title: raw.title || "",
        date: raw.date || "",
        category: mapHintCategory(raw.category),
        content: raw.content || "",
        isUnlocked: typeof raw.isUnlocked === 'boolean' ? raw.isUnlocked : false,
        hintIllustration: raw.hintIllustration || "🔑",
        sourceUrl: raw.sourceUrl || "",
        imageFile: raw.imageFile || "",
        isHidden: typeof raw.isHidden === 'boolean' ? raw.isHidden : false
      });
    }
  });
} catch (e) {
  console.warn("Lỗi phân tích CMS hints: ", e);
}

// 2. Process CMS Gallery Items
const cmsGalleryList: GalleryItem[] = [];
try {
  Object.entries(galleryGlob).forEach(([path, module]: [string, any]) => {
    const raw = module.default || module;
    if (raw && raw.id) {
      let parsedTags: string[] = [];
      if (Array.isArray(raw.tags)) {
        parsedTags = raw.tags.map((t: any) => {
          if (typeof t === 'string') return t;
          if (t && typeof t === 'object' && t.tag) return t.tag;
          return "";
        }).filter(Boolean);
      }

      let parsedImages: { image_file: string; caption?: string }[] = [];
      if (Array.isArray(raw.images)) {
        parsedImages = raw.images.map((img: any) => {
          if (img && typeof img === 'object') {
            return {
              image_file: img.image_file || "",
              caption: img.caption || ""
            };
          }
          return null;
        }).filter(Boolean) as any;
      }

      cmsGalleryList.push({
        id: raw.id,
        title: raw.title || "",
        date: raw.date || "",
        tags: parsedTags,
        category: mapGalleryCategory(raw.category),
        description: raw.description || "",
        colorTheme: raw.colorTheme || "from-sky-100 to-cyan-100 border-sky-305 text-sky-800",
        emoji: raw.emoji || "🖼️",
        author: raw.author || "Chamchamz Fanart",
        images: parsedImages.length > 0 ? parsedImages : undefined,
        sourceUrl: raw.sourceUrl || "",
        isHidden: typeof raw.isHidden === 'boolean' ? raw.isHidden : false
      });
    }
  });
} catch (e) {
  console.warn("Lỗi phân tích CMS gallery items: ", e);
}

// 3. Process CMS Recommendations Items
const cmsRecsList: RecItem[] = [];
try {
  Object.entries(recsGlob).forEach(([path, module]: [string, any]) => {
    const raw = module.default || module;
    if (raw && raw.id) {
      cmsRecsList.push({
        id: raw.id,
        title: raw.title || "",
        creator: raw.creator || "",
        type: mapRecType(raw.type || "music"),
        reason: raw.reason || "",
        linkText: raw.linkText || "",
        url: raw.url || "",
        imageFile: raw.imageFile || "",
        isHidden: typeof raw.isHidden === 'boolean' ? raw.isHidden : false
      });
    }
  });
} catch (e) {
  console.warn("Lỗi phân tích CMS recommendations: ", e);
}

// 4. Process CMS Projects Items
const cmsProjectsList: ProjectItem[] = [];
try {
  Object.entries(projectsGlob).forEach(([path, module]: [string, any]) => {
    const raw = module.default || module;
    if (raw && raw.id) {
      cmsProjectsList.push({
        id: raw.id,
        title: raw.title || "",
        imageFile: raw.imageFile || "",
        category: mapProjectCategory(raw.category),
        sourceUrl: raw.sourceUrl || "",
        caption: raw.caption || "",
        date: raw.date || "",
        isHidden: typeof raw.isHidden === 'boolean' ? raw.isHidden : false
      });
    }
  });
} catch (e) {
  console.warn("Lỗi phân tích CMS projects: ", e);
}

const DEFAULT_HINTS: HintItem[] = [
  {
    id: 'hint-1',
    title: 'Gợi ý về chiếc mũ len màu cam đào 🍑',
    date: '18/06/2026',
    category: 'Livestream',
    content: 'Chamchamz dạo gần đây cực kỳ thích đội chiếc mũ len đính kèm chiếc lá nhỏ ở đỉnh đầu. Một nguồn tin đáng tin cậy cho biết, đây là món quà tự làm từ một người bạn rất thân của bé!',
    isUnlocked: false,
    hintIllustration: '🎨🎨'
  },
  {
    id: 'hint-2',
    title: 'Địa điểm chụp hình bí mật của bộ ảnh Mùa Đông ❄️',
    date: '15/06/2026',
    category: 'Youtube',
    content: 'Những bức ảnh tuyết trắng mộng mơ thực ra không phải chụp ở nước ngoài đâu nha! Nó được chụp tại một studio thiết kế mang phong cách Bắc Âu nằm sâu trong một con hẻm nhỏ tại trung tâm thành phố.',
    isUnlocked: true,
    hintIllustration: '📸🏰'
  },
  {
    id: 'hint-3',
    title: 'Dự đoán bài hát chủ đề cho Radio Sắp Tới 🎵',
    date: '10/06/2026',
    category: 'Phỏng vấn',
    content: 'Giai điệu mào đầu có nhịp 3/4, tiếng piano nhẹ nhàng và có tiếng chim hót ở đầu bản thu. Khả năng cao đây sẽ là một bản Acoustic Ballad cực kỳ ấm lòng dành riêng cho fan mùa đông!',
    isUnlocked: false,
    hintIllustration: '🎹🎧'
  },
  {
    id: 'hint-4',
    title: 'Thông báo: Tạm khóa bình luận bài đăng số #12 🔐',
    date: '05/06/2026',
    category: 'Kênh bên ngoài',
    content: 'Để bảo vệ tính riêng tư của thông tin nội bộ, bài đăng số #12 sẽ được chuyển sang chế độ lưu trữ chỉ đọc từ hôm nay. Các bạn hãy tiếp tục thảo luận ở hòm thư chung nhé!',
    isUnlocked: true,
    hintIllustration: '🔒📄'
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Nụ cười buổi ban mai',
    date: '18/06/2026',
    tags: ['Nụ Cười', 'Mùa Hè', 'Chân Dung'],
    category: 'IG',
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
    category: 'IG',
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
    category: 'Weverse',
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
    category: 'X',
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
    category: 'Nguồn bên ngoài',
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
    category: 'X',
    description: 'Nơi cất giấu những ý tưởng vẽ vời linh tinh bằng nét vẽ tay nguệch ngoạc nhưng vô cùng sinh động của bé Chamchamz.',
    colorTheme: 'from-yellow-101 to-lime-100 border-yellow-300 text-yellow-850',
    emoji: '📔🌼',
    author: 'SunnyDay'
  }
];

const DEFAULT_RECS: RecItem[] = [
  {
    id: 'rec-1',
    title: 'Ditto',
    creator: 'NewJeans',
    type: 'Khác',
    reason: 'Giai điệu hoài niệm, nhịp trống lo-fi lôi cuốn mang đậm ký ức mùa đông của tuổi trẻ. Rất thích hợp để đeo tai nghe vừa nghe vừa lật xem thư viện ảnh cũ.',
    linkText: 'Nghe trên Youtube Music',
    url: 'https://music.youtube.com'
  },
  {
    id: 'rec-2',
    title: 'Hoàng Tử Bé (The Little Prince)',
    creator: 'Antoine de Saint-Exupéry',
    type: 'Fanfic/Author',
    reason: '“Người ta chỉ nhìn thấy thật rõ ràng bằng trái tim mình. Những điều cốt lõi thì mắt thường không nhìn thấy được”. Cuốn sách nuôi dưỡng sự hồn nhiên của Chamchamz.',
    linkText: 'Tìm đọc tại thư viện',
    url: 'https://wikipedia.org/wiki/The_Little_Prince'
  },
  {
    id: 'rec-3',
    title: 'My Neighbor Totoro',
    creator: 'Studio Ghibli / Hayao Miyazaki',
    type: 'Khác',
    reason: 'Bộ phim hoạt hình huyền thoại ấm áp đưa bạn trở về với thiên nhiên trong trẻo, những chuyến xe bus mèo nhiệm màu và lòng tin thuần khiết.',
    linkText: 'Xem thông tin phim',
    url: 'https://www.imdb.com'
  },
  {
    id: 'rec-4',
    title: 'Through the Night (Đêm nay)',
    creator: 'IU',
    type: 'Khác',
    reason: '“Giống như những chữ viết trên cát dưới sóng biển cuốn đi, tôi viết cho bạn một bức thư từ tận sâu trái tim mình”. Giai điệu mộc mạc ru êm dịu giấc mơ mỗi đêm.',
    linkText: 'Xem MV chính thức',
    url: 'https://youtube.com'
  }
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'project-1',
    title: 'Hộp Quà Mùa Đông Ấm Áp Cho Cặp Đôi 🎁',
    category: 'gift support',
    imageFile: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://facebook.com/chamchamz',
    caption: 'Dự án gửi tặng những món quà len tự đan, album ảnh kỷ niệm và trà sữa ấm áp đến studio nhân ngày ghi hình radio đặc biệt.',
    date: '2026-07-15',
    isHidden: false
  },
  {
    id: 'project-2',
    title: 'Bảng Đèn LED Kỷ Niệm 100 Ngày Tại Ngã Tư Trung Tâm 🌟',
    category: 'led',
    imageFile: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://threads.net/@chamchamz',
    caption: 'Màn hình LED lớn phát sóng các khoảnh khắc livestream đôi đáng nhớ của hai đứa trong suốt một tuần lễ ngọt ngào.',
    date: '2026-07-12',
    isHidden: false
  },
  {
    id: 'project-3',
    title: 'Chiến Dịch Quảng Cáo Bus Shelter Tuyến 02 🚌',
    category: 'ads',
    imageFile: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://instagram.com',
    caption: 'Poster quảng bá phủ sóng tại 5 trạm xe buýt chính quanh khu vực trường đại học lớn, lan tỏa nụ cười rạng rỡ của Chamchamz.',
    date: '2026-07-08',
    isHidden: false
  },
  {
    id: 'project-4',
    title: 'Sự Kiện Trà Chiều \'Bong Bóng Ngọc Bích\' 🫧',
    category: 'event',
    imageFile: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://youtube.com',
    caption: 'Buổi họp mặt offline nhỏ của đại gia đình Fan Chamchamz, cùng ngắm nhìn tranh triển lãm, ký thệ ước bảo mật và uống trà dâu.',
    date: '2026-07-01',
    isHidden: false
  },
  {
    id: 'project-5',
    title: 'Hỗ Trợ Thực Đơn Dinh Dưỡng Cho Ekip Quay Challenge 🍱',
    category: 'gift support',
    imageFile: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://threads.net/@chamchamz',
    caption: 'Gửi tặng 30 phần cơm bento đặc biệt, trái cây tươi và nước ép dâu tây nguyên chất tiếp sức cho đoàn quay phim.',
    date: '2026-06-25',
    isHidden: false
  },
  {
    id: 'project-6',
    title: 'Phát Sóng Clip Ngắn Trên Màn Hình LED Phố Đi Bộ 🎬',
    category: 'led',
    imageFile: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://facebook.com',
    caption: 'Clip tổng hợp nét vẽ dễ thương và lời chúc tốt đẹp nhất được trình chiếu 120 lần/ngày tại khu vực sầm uất nhất.',
    date: '2026-06-20',
    isHidden: false
  },
  {
    id: 'project-7',
    title: 'Ủng Hộ Quỹ Cây Xanh Mang Tên Chamchamz 🌳',
    category: 'others',
    imageFile: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://wikipedia.org',
    caption: 'Đóng góp 500 cây xanh vào dự án phục hồi rừng đầu nguồn, mang lại mảng xanh may mắn dồi dào giống như tinh thần của bé.',
    date: '2026-06-15',
    isHidden: false
  },
  {
    id: 'project-8',
    title: 'Trang Trí Cup Holder Tại 3 Tiệm Cà Phê Đồng Hành ☕',
    category: 'event',
    imageFile: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    sourceUrl: 'https://instagram.com',
    caption: 'Phát tặng miễn phí 1000 cup holder kèm card bo góc nhám mờ phiên bản giới hạn cho các fan đến uống trà sữa dâu ủng hộ.',
    date: '2026-06-10',
    isHidden: false
  }
];

// Helper to merge CMS list and hardcoded fallback by ID (using CMS as full authority if populated to allow deletes)
const computedHints = cmsHintsList.length > 0 ? cmsHintsList : DEFAULT_HINTS;
const computedGallery = cmsGalleryList.length > 0 ? cmsGalleryList : DEFAULT_GALLERY;
const computedRecs = cmsRecsList.length > 0 ? cmsRecsList : DEFAULT_RECS;
const computedProjects = cmsProjectsList.length > 0 ? cmsProjectsList : DEFAULT_PROJECTS;

export const HINTS_DATA = computedHints.filter(item => !item.isHidden);
export const GALLERY_DATA = computedGallery.filter(item => !item.isHidden);
export const RECS_DATA = computedRecs.filter(item => !item.isHidden);
export const PROJECTS_DATA = computedProjects.filter(item => !item.isHidden);

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

### 4. TỐI ƯU HÓA TÌM KIẾM (SEO METADATA)
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
