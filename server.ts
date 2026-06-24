/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

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
    visitorCount: 0,
    candleCount: 0,
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

// Dynamic Firebase Firestore initialization
let firebaseDb: any = null;

function getFirestoreDb(): any {
  if (firebaseDb) return firebaseDb;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const app = initializeApp({
        projectId: config.projectId,
        appId: config.appId,
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId
      });
      firebaseDb = getFirestore(app, config.firestoreDatabaseId || "ai-studio-58f91e89-0eda-461d-9604-aaa57592742c");
      console.log('Successfully connected to Firebase Firestore.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase in server:', error);
  }
  return firebaseDb;
}

async function getFirestoreStats(): Promise<{ visitorCount: number; candleCount: number }> {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    return { visitorCount: local.visitorCount, candleCount: local.candleCount };
  }

  try {
    const docRef = doc(fdb, 'counters', 'stats');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        visitorCount: data && typeof data.visitorCount === 'number' ? data.visitorCount : 1580,
        candleCount: data && typeof data.candleCount === 'number' ? data.candleCount : 0
      };
    } else {
      const local = loadDatabase();
      const visitorBaseline = Math.max(local.visitorCount || 0, 1580);
      const candleBaseline = local.candleCount || 0;
      await setDoc(docRef, {
        visitorCount: visitorBaseline,
        candleCount: candleBaseline
      });
      return { visitorCount: visitorBaseline, candleCount: candleBaseline };
    }
  } catch (error) {
    console.error('Error fetching stats from Firestore:', error);
    const local = loadDatabase();
    return { visitorCount: local.visitorCount, candleCount: local.candleCount };
  }
}

async function incrementFirestoreVisitor(): Promise<number> {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    local.visitorCount += 1;
    saveDatabase(local);
    return local.visitorCount;
  }

  try {
    const docRef = doc(fdb, 'counters', 'stats');
    const stats = await getFirestoreStats();
    const newVisitorCount = stats.visitorCount + 1;
    await updateDoc(docRef, {
      visitorCount: increment(1)
    });
    return newVisitorCount;
  } catch (error) {
    console.error('Error incrementing visitor count in Firestore:', error);
    const local = loadDatabase();
    local.visitorCount += 1;
    saveDatabase(local);
    return local.visitorCount;
  }
}

async function incrementFirestoreCandle(): Promise<number> {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    local.candleCount += 1;
    saveDatabase(local);
    return local.candleCount;
  }

  try {
    const docRef = doc(fdb, 'counters', 'stats');
    const stats = await getFirestoreStats();
    const newCandleCount = stats.candleCount + 1;
    await updateDoc(docRef, {
      candleCount: increment(1)
    });
    return newCandleCount;
  } catch (error) {
    console.error('Error incrementing candle count in Firestore:', error);
    const local = loadDatabase();
    local.candleCount += 1;
    saveDatabase(local);
    return local.candleCount;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize store
  let db = loadDatabase();

  // API 1: Get global stats
  app.get('/api/stats', async (req, res) => {
    const stats = await getFirestoreStats();
    res.json(stats);
  });

  // API 2: Increment website visitor count
  app.post('/api/visitor/increment', async (req, res) => {
    const newCount = await incrementFirestoreVisitor();
    res.json({ visitorCount: newCount });
  });

  // API 3: Set website visitor count directly (for Admin panel reset/adjustment)
  app.post('/api/visitor/set', async (req, res) => {
    const { count, token } = req.body;
    
    // basic password verify
    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
    }

    const parsed = parseInt(count, 10);
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({ error: 'Số lượt truy cập không hợp lệ!' });
    }

    const fdb = getFirestoreDb();
    if (fdb) {
      try {
        const docRef = doc(fdb, 'counters', 'stats');
        await setDoc(docRef, { visitorCount: parsed }, { merge: true });
      } catch (error) {
        console.error('Error setting visitor count in Firestore:', error);
      }
    }

    db = loadDatabase();
    db.visitorCount = parsed;
    saveDatabase(db);

    res.json({ success: true, visitorCount: parsed });
  });

  // API 4: Increment candle count
  app.post('/api/candle/increment', async (req, res) => {
    const newCount = await incrementFirestoreCandle();
    res.json({ candleCount: newCount });
  });


  // API 5: Get all comments (sorted newest first)
  app.get('/api/comments', (req, res) => {
    db = loadDatabase();
    if (!db.comments) db.comments = [];
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
    if (!db.comments) db.comments = [];
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
    if (!db.comments) db.comments = [];
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
