/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, deleteDoc } from 'firebase/firestore';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db_store.json');

interface Comment {
  id: string;
  from: string;
  to: 'James' | 'Juhoon' | 'Chamchamz';
  text: string;
  timestamp: string;
  sticker?: string;
}

interface DBStore {
  visitorCount: number;
  candleCount: number;
  pledgeCount?: number;
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
    pledgeCount: 520,
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
    let config: any = null;
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      // Hardcoded fallback specifically for Vercel/Cloud Run environments where static files are not traced/copied
      config = {
        projectId: "intense-quote-95w43",
        appId: "1:258481005612:web:5e9dddf7b6b73d4d98dd89",
        apiKey: "AIzaSyApqYnhyUFdsVNWxbtV1PiECC0DAYku5i0",
        authDomain: "intense-quote-95w43.firebaseapp.com",
        firestoreDatabaseId: "ai-studio-58f91e89-0eda-461d-9604-aaa57592742c",
        storageBucket: "intense-quote-95w43.firebasestorage.app",
        messagingSenderId: "258481005612"
      };
      console.log('Using bundled Firestore configuration fallback in server.ts.');
    }

    if (config) {
      const app = initializeApp({
        projectId: config.projectId,
        appId: config.appId,
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId
      });
      // Force long polling on the server to ensure high reliability in sandboxed/container environments
      firebaseDb = initializeFirestore(app, {
        experimentalForceLongPolling: true
      }, config.firestoreDatabaseId || "ai-studio-58f91e89-0eda-461d-9604-aaa57592742c");
      console.log('Successfully connected to Firebase Firestore (Server Polling).');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase in server:', error);
  }
  return firebaseDb;
}

// Timeout helper to prevent hanging database calls from blocking the Node server
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
  ]);
}

// Shared memory-based cache for lightning-fast responses (0ms lag)
const cachedStats = {
  visitorCount: 1580,
  candleCount: 0,
  pledgeCount: 520,
  commentsEnabled: true
};

// Background synchronization function to pull stats and comments from Firestore
async function syncFromFirestore() {
  const fdb = getFirestoreDb();
  if (!fdb) return;
  
  try {
    // 1. Sync statistics
    const docRef = doc(fdb, 'counters', 'stats');
    const docSnap = await withTimeout(getDoc(docRef), 3500, 'Background Sync stats Timeout');
    if (docSnap.exists()) {
      const data = docSnap.data();
      const local = loadDatabase();
      let changed = false;

      if (data) {
        if (typeof data.visitorCount === 'number' && data.visitorCount > (local.visitorCount || 0)) {
          local.visitorCount = data.visitorCount;
          cachedStats.visitorCount = data.visitorCount;
          changed = true;
        }
        if (typeof data.candleCount === 'number' && data.candleCount > (local.candleCount || 0)) {
          local.candleCount = data.candleCount;
          cachedStats.candleCount = data.candleCount;
          changed = true;
        }
        if (typeof data.pledgeCount === 'number' && data.pledgeCount > (local.pledgeCount || 0)) {
          local.pledgeCount = data.pledgeCount;
          cachedStats.pledgeCount = data.pledgeCount;
          changed = true;
        }
        if (typeof data.commentsEnabled === 'boolean' && data.commentsEnabled !== local.commentsEnabled) {
          local.commentsEnabled = data.commentsEnabled;
          cachedStats.commentsEnabled = data.commentsEnabled;
          changed = true;
        }
      }
      
      if (changed) {
        saveDatabase(local);
      }
    } else {
      // Initialize Firestore document if empty
      const local = loadDatabase();
      await setDoc(docRef, {
        visitorCount: Math.max(local.visitorCount || 0, 1580),
        candleCount: local.candleCount || 0,
        pledgeCount: Math.max(local.pledgeCount || 0, 520),
        commentsEnabled: local.commentsEnabled !== false
      });
    }

    // 2. Sync comments
    const colRef = collection(fdb, 'comments');
    const querySnapshot = await withTimeout(getDocs(colRef), 4000, 'Background Sync comments Timeout');
    const commentsList: Comment[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      commentsList.push({
        id: docSnap.id,
        from: data.from || '',
        to: data.to || 'Chamchamz',
        text: data.text || '',
        timestamp: data.timestamp || new Date().toISOString(),
        sticker: data.sticker || '✨'
      });
    });

    if (commentsList.length > 0) {
      const local = loadDatabase();
      const localMap = new Map(local.comments.map(c => [c.id, c]));
      commentsList.forEach(c => localMap.set(c.id, c));
      local.comments = Array.from(localMap.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      saveDatabase(local);
    }
  } catch (err) {
    console.error('Failed background sync from Firestore:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize store and warm up cache
  const db = loadDatabase();
  cachedStats.visitorCount = Math.max(db.visitorCount || 0, 1580);
  cachedStats.candleCount = db.candleCount || 0;
  cachedStats.pledgeCount = Math.max(db.pledgeCount || 0, 520);
  cachedStats.commentsEnabled = db.commentsEnabled !== false;

  // Run initial sync asynchronously (do not block the main server boot)
  syncFromFirestore().then(() => {
    console.log('Initial background sync complete. Memory cache is warmed up!');
  }).catch(err => {
    console.error('Initial background sync failed:', err);
  });

  // Run background sync periodically every 30 seconds to fetch updates from Firestore
  setInterval(() => {
    syncFromFirestore().catch(err => console.error('Error during automatic background sync:', err));
  }, 30000);

  // API 1: Get global stats (Instantaneous response from memory cache!)
  app.get('/api/stats', (req, res) => {
    res.json({
      visitorCount: cachedStats.visitorCount,
      candleCount: cachedStats.candleCount,
      pledgeCount: cachedStats.pledgeCount
    });
  });

  // API 2: Increment website visitor count (Instant response, async Firestore update!)
  app.post('/api/visitor/increment', (req, res) => {
    cachedStats.visitorCount += 1;
    
    const local = loadDatabase();
    local.visitorCount = cachedStats.visitorCount;
    saveDatabase(local);
    
    res.json({ visitorCount: cachedStats.visitorCount });

    // Background update
    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'counters', 'stats');
      updateDoc(docRef, { visitorCount: increment(1) }).catch(err => {
        console.error('Error incrementing visitor in Firestore background:', err);
      });
    }
  });

  // API 3: Set website visitor count directly (for Admin panel reset/adjustment)
  app.post('/api/visitor/set', (req, res) => {
    const { count, token } = req.body;
    
    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
    }

    const parsed = parseInt(count, 10);
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({ error: 'Số lượt truy cập không hợp lệ!' });
    }

    cachedStats.visitorCount = parsed;
    
    const local = loadDatabase();
    local.visitorCount = parsed;
    saveDatabase(local);

    res.json({ success: true, visitorCount: parsed });

    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'counters', 'stats');
      setDoc(docRef, { visitorCount: parsed }, { merge: true }).catch(err => {
        console.error('Error setting visitor in Firestore background:', err);
      });
    }
  });

  // API 4: Increment candle count (Instant response!)
  app.post('/api/candle/increment', (req, res) => {
    cachedStats.candleCount += 1;
    
    const local = loadDatabase();
    local.candleCount = cachedStats.candleCount;
    saveDatabase(local);

    res.json({ candleCount: cachedStats.candleCount });

    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'counters', 'stats');
      updateDoc(docRef, { candleCount: increment(1) }).catch(err => {
        console.error('Error incrementing candle in Firestore background:', err);
      });
    }
  });

  // API 4.5: Increment secret pledge count (Instant response!)
  app.post('/api/pledge/increment', (req, res) => {
    cachedStats.pledgeCount += 1;
    
    const local = loadDatabase();
    local.pledgeCount = cachedStats.pledgeCount;
    saveDatabase(local);

    res.json({ pledgeCount: cachedStats.pledgeCount });

    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'counters', 'stats');
      updateDoc(docRef, { pledgeCount: increment(1) }).catch(err => {
        console.error('Error incrementing pledge in Firestore background:', err);
      });
    }
  });

  // API 5: Get all comments (Instant response from local database!)
  app.get('/api/comments', (req, res) => {
    const local = loadDatabase();
    const sorted = (local.comments || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(sorted);
  });

  // API 5.5: Get comments enabled status (Instant response!)
  app.get('/api/comments/status', (req, res) => {
    res.json({ commentsEnabled: cachedStats.commentsEnabled !== false });
  });

  // API 5.6: Toggle comments enabled status (Admin only, instant!)
  app.post('/api/comments/status', (req, res) => {
    const { commentsEnabled, token } = req.body;
    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
    }

    cachedStats.commentsEnabled = !!commentsEnabled;

    const local = loadDatabase();
    local.commentsEnabled = !!commentsEnabled;
    saveDatabase(local);

    res.json({ success: true, commentsEnabled: cachedStats.commentsEnabled });

    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'counters', 'stats');
      setDoc(docRef, { commentsEnabled: !!commentsEnabled }, { merge: true }).catch(err => {
        console.error('Error setting comments enabled status in Firestore background:', err);
      });
    }
  });

  // API 6: Submit a comment (Instant response!)
  app.post('/api/comments', (req, res) => {
    if (!cachedStats.commentsEnabled) {
      return res.status(403).json({ error: 'Hệ thống gửi thư hiện đang tạm đóng!' });
    }

    let { from, to, text, sticker } = req.body;

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
    const cleanSticker = sticker ? String(sticker).trim().substring(0, 10) : '✨';

    const newComment: Comment = {
      id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      from: cleanFrom,
      to,
      text: cleanText,
      timestamp: new Date().toISOString(),
      sticker: cleanSticker
    };

    // Save locally
    const local = loadDatabase();
    if (!local.comments) local.comments = [];
    local.comments.push(newComment);
    saveDatabase(local);

    // Return instant success to the client
    res.status(201).json(newComment);

    // Update Firestore in background
    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'comments', newComment.id);
      setDoc(docRef, {
        from: newComment.from,
        to: newComment.to,
        text: newComment.text,
        timestamp: newComment.timestamp,
        sticker: newComment.sticker || '✨'
      }).catch(err => {
        console.error('Error adding comment to Firestore background:', err);
      });
    }
  });

  // API 7: Delete a comment (Admin only, password verified, instant!)
  app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    const { token } = req.query;

    if (token !== 'chamchamz') {
      return res.status(403).json({ error: 'Mật khẩu quản trị không đúng hoặc thiếu!' });
    }

    // Delete locally
    const local = loadDatabase();
    if (!local.comments) local.comments = [];
    local.comments = local.comments.filter(c => c.id !== id);
    saveDatabase(local);

    res.json({ success: true, message: 'Đã xóa bình luận thành công!' });

    // Background delete from Firestore
    const fdb = getFirestoreDb();
    if (fdb) {
      const docRef = doc(fdb, 'comments', id);
      deleteDoc(docRef).catch(err => {
        console.error('Error deleting comment from Firestore background:', err);
      });
    }
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
