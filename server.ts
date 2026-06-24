/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db_store.json');

interface Comment {
  id: string;
  from: string;
  to: 'James' | 'Juhoon' | 'Chamchamz';
  text: string;
  timestamp: string;
}

interface DBStore {
  visitorCount: number;
  candleCount: number;
  comments: Comment[];
  commentsEnabled?: boolean;
}

// Ensure database file exists with sweet initial seeds
function loadDatabase(): DBStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db_store.json, creating a new one', err);
  }

  // Sweet seed comments in Vietnamese
  const defaultStore: DBStore = {
    visitorCount: 5240,
    candleCount: 1314,
    comments: [
      {
        id: 'seed-1',
        from: 'Momo 🧑‍🚀',
        to: 'Chamchamz',
        text: 'Chúc Chamchamz luôn hạnh phúc lấp lánh và có thật nhiều livestream đôi cùng nhau nha! Yêu hai em rất nhiều 💖',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
      },
      {
        id: 'seed-2',
        from: 'Hami 🌸',
        to: 'James',
        text: 'Bé James cười siêu dễ thương luôn á, mong hai đứa mãi bên nhau như thế này!',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        id: 'seed-3',
        from: 'Komi 🍉',
        to: 'Juhoon',
        text: 'Juhoon à, hãy chăm sóc James thật tốt nha. Thắp nến cầu nguyện cho hai đứa sớm có job đôi tiếp theo nè ✨',
        timestamp: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
      }
    ]
  };

  saveDatabase(defaultStore);
  return defaultStore;
}

function saveDatabase(store: DBStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to db_store.json', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize store
  let db = loadDatabase();

  // API 1: Get global stats
  app.get('/api/stats', (req, res) => {
    db = loadDatabase();
    res.json({
      visitorCount: db.visitorCount,
      candleCount: db.candleCount
    });
  });

  // API 2: Increment website visitor count
  app.post('/api/visitor/increment', (req, res) => {
    db = loadDatabase();
    db.visitorCount += 1;
    saveDatabase(db);
    res.json({ visitorCount: db.visitorCount });
  });

  // API 3: Set website visitor count directly (for Admin panel reset/adjustment)
  app.post('/api/visitor/set', (req, res) => {
    const { count, streamDate, token } = req.body;
    
    // basic password verify
    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
    }

    const parsed = parseInt(count, 10);
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({ error: 'Số lượt truy cập không hợp lệ!' });
    }

    db = loadDatabase();
    db.visitorCount = parsed;
    saveDatabase(db);

    res.json({ success: true, visitorCount: db.visitorCount });
  });

  // API 4: Increment candle count
  app.post('/api/candle/increment', (req, res) => {
    db = loadDatabase();
    db.candleCount += 1;
    saveDatabase(db);
    res.json({ candleCount: db.candleCount });
  });

  // API 5: Get all comments (sorted newest first)
  app.get('/api/comments', (req, res) => {
    db = loadDatabase();
    const sortedComments = [...db.comments].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    res.json(sortedComments);
  });

  // API 5.5: Get comments enabled status
  app.get('/api/comments/status', (req, res) => {
    db = loadDatabase();
    res.json({ commentsEnabled: db.commentsEnabled !== false });
  });

  // API 5.6: Toggle comments enabled status (Admin only)
  app.post('/api/comments/status', (req, res) => {
    const { commentsEnabled, token } = req.body;
    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
    }
    db = loadDatabase();
    db.commentsEnabled = !!commentsEnabled;
    saveDatabase(db);
    res.json({ success: true, commentsEnabled: db.commentsEnabled });
  });

  // API 6: Submit a comment
  app.post('/api/comments', (req, res) => {
    db = loadDatabase();
    if (db.commentsEnabled === false) {
      return res.status(403).json({ error: 'Hệ thống gửi thư hiện đang tạm đóng!' });
    }

    let { from, to, text } = req.body;

    if (!from || !text) {
      return res.status(400).json({ error: 'Vui lòng nhập tên và lời nhắn!' });
    }

    // Standard default
    if (!to || !['James', 'Juhoon', 'Chamchamz'].includes(to)) {
      to = 'Chamchamz';
    }

    // Trim and clean inputs
    const cleanFrom = String(from).trim().substring(0, 50);
    const cleanText = String(text).trim().substring(0, 500);

    const newComment: Comment = {
      id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      from: cleanFrom,
      to,
      text: cleanText,
      timestamp: new Date().toISOString()
    };

    db = loadDatabase();
    db.comments.push(newComment);
    saveDatabase(db);

    res.status(201).json(newComment);
  });

  // API 7: Delete a comment (Admin only, password verified)
  app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    const { token } = req.query;

    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Mật khẩu quản trị không đúng hoặc thiếu!' });
    }

    db = loadDatabase();
    const originalLength = db.comments.length;
    db.comments = db.comments.filter(c => c.id !== id);

    if (db.comments.length === originalLength) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận!' });
    }

    saveDatabase(db);
    res.json({ success: true, message: 'Đã xóa bình luận thành công!' });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
