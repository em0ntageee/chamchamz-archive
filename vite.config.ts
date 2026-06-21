import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Dynamic HTML/SEO/OpenGraph Injection Plugin for Crawler Bots (Threads, Twitter, Meta, etc.)
const seoInjectPlugin = () => {
  return {
    name: 'html-seo-inject',
    transformIndexHtml(html: string) {
      try {
        const configPath = path.resolve(process.cwd(), 'src/data/config.json');
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          
          const shareTitle = config.shareTitle || config.siteTitle || "Chamchamz Archive - Vùng Bảo Mật Fan-Only 🐾";
          const shareDesc = config.shareDescription || config.heroDescription || "Nơi cất giữ báu vật rực rỡ và những hạt giống niềm vui của bé Chamchamz. Xem ngay album manh mối, triển lãm ảnh và đề xuất sách nhạc dễ thương!";
          let shareImage = config.shareImage || "/chamchamz_social_cover.jpg";
          
          // Clean up public folder prefixes in case DeCap CMS prepends 'public/'
          if (shareImage.startsWith('public/')) {
            shareImage = shareImage.replace(/^public/, '');
          }
          if (!shareImage.startsWith('/') && !shareImage.startsWith('http')) {
            shareImage = '/' + shareImage;
          }

          let modifiedHtml = html;
          
          // Replace <title>
          modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/gi, `<title>${shareTitle}</title>`);
          
          // Replace meta name="title"
          modifiedHtml = modifiedHtml.replace(/<meta name="title" content=".*?" \/>/gi, `<meta name="title" content="${shareTitle}" />`);
          
          // Replace og:title
          modifiedHtml = modifiedHtml.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${shareTitle}" />`);
          
          // Replace twitter:title
          modifiedHtml = modifiedHtml.replace(/<meta property="twitter:title" content=".*?" \/>/gi, `<meta property="twitter:title" content="${shareTitle}" />`);
          
          // Replace meta name="description"
          modifiedHtml = modifiedHtml.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${shareDesc}" />`);
          
          // Replace og:description
          modifiedHtml = modifiedHtml.replace(/<meta property="og:description" content=".*?" \/>/gi, `<meta property="og:description" content="${shareDesc}" />`);
          
          // Replace twitter:description
          modifiedHtml = modifiedHtml.replace(/<meta property="twitter:description" content=".*?" \/>/gi, `<meta property="twitter:description" content="${shareDesc}" />`);
          
          // Replace og:image (using absolute URL fallback if needed)
          const absoluteImgUrl = shareImage.startsWith('http') ? shareImage : `https://chamchamz-archive.vercel.app${shareImage}`;
          modifiedHtml = modifiedHtml.replace(/<meta property="og:image" content=".*?" \/>/gi, `<meta property="og:image" content="${absoluteImgUrl}" />`);
          
          // Replace twitter:image
          modifiedHtml = modifiedHtml.replace(/<meta property="twitter:image" content=".*?" \/>/gi, `<meta property="twitter:image" content="${absoluteImgUrl}" />`);

          // Replace fb:app_id
          const fbAppId = config.fbAppId || "";
          modifiedHtml = modifiedHtml.replace(/<meta property="fb:app_id" content=".*?" \/>/gi, `<meta property="fb:app_id" content="${fbAppId}" />`);

          return modifiedHtml;
        }
      } catch (err) {
        console.error("Error inserting SEO meta tags in plugin:", err);
      }
      return html;
    }
  };
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), seoInjectPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
