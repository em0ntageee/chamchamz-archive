/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, getDocs, deleteDoc } from 'firebase/firestore';

const app = express();
app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'db_store.json');

// Memory fallback to prevent Vercel read-only filesystem crash
let memoryDb = null;

function loadDatabase() {
  if (memoryDb) return memoryDb;
  
  // Try reading from file first
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw);
      return memoryDb;
    }
  } catch (err) {
    console.error('Error reading db_store.json:', err);
  }

  // Fallback default seeds
  memoryDb = {
    visitorCount: 1580,
    candleCount: 120,
    pledgeCount: 520,
    comments: [
      {
        id: 'seed-1',
        from: 'Momo 🧑‍🚀',
        to: 'Chamchamz',
        text: 'Chúc Chamchamz luôn hạnh phúc lấp lánh và có thật nhiều livestream đôi cùng nhau nha! Yêu hai em rất nhiều 💖',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'seed-2',
        from: 'Hami 🌸',
        to: 'James',
        text: 'Bé James cười siêu dễ thương luôn á, mong hai đứa mãi bên nhau như thế này!',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'seed-3',
        from: 'Komi 🍉',
        to: 'Juhoon',
        text: 'Juhoon à, hãy chăm sóc James thật tốt nha. Thắp nến cầu nguyện for hai đứa sớm có job đôi tiếp theo nè ✨',
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ],
    commentsEnabled: true
  };

  return memoryDb;
}

function saveDatabase(store) {
  memoryDb = store;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    // Expected on Vercel's read-only filesystem, silent warning
    console.warn('Vercel filesystem is read-only, saving to memory instead.');
  }
}

// Dynamic Firebase Firestore initialization
let firebaseDb = null;

function getFirestoreDb() {
  if (firebaseDb) return firebaseDb;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const fbApp = initializeApp({
        projectId: config.projectId,
        appId: config.appId,
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId
      });
      firebaseDb = getFirestore(fbApp, config.firestoreDatabaseId || "ai-studio-58f91e89-0eda-461d-9604-aaa57592742c");
      console.log('API Index: Successfully connected to Firebase Firestore.');
    } else {
      console.warn('API Index: firebase-applet-config.json not found in cwd.');
    }
  } catch (error) {
    console.error('API Index: Failed to initialize Firebase:', error);
  }
  return firebaseDb;
}

async function getFirestoreStats() {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    return {
      visitorCount: local.visitorCount || 1580,
      candleCount: local.candleCount || 120,
      pledgeCount: local.pledgeCount || 520
    };
  }

  try {
    const docRef = doc(fdb, 'counters', 'stats');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        visitorCount: data && typeof data.visitorCount === 'number' ? data.visitorCount : 1580,
        candleCount: data && typeof data.candleCount === 'number' ? data.candleCount : 120,
        pledgeCount: data && typeof data.pledgeCount === 'number' ? data.pledgeCount : 520
      };
    } else {
      const local = loadDatabase();
      const visitorBaseline = Math.max(local.visitorCount || 0, 1580);
      const candleBaseline = Math.max(local.candleCount || 0, 120);
      const pledgeBaseline = Math.max(local.pledgeCount || 0, 520);
      await setDoc(docRef, {
        visitorCount: visitorBaseline,
        candleCount: candleBaseline,
        pledgeCount: pledgeBaseline
      });
      return { visitorCount: visitorBaseline, candleCount: candleBaseline, pledgeCount: pledgeBaseline };
    }
  } catch (error) {
    console.error('Error fetching stats from Firestore:', error);
    const local = loadDatabase();
    return {
      visitorCount: local.visitorCount || 1580,
      candleCount: local.candleCount || 120,
      pledgeCount: local.pledgeCount || 520
    };
  }
}

async function incrementFirestoreVisitor() {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    local.visitorCount = (local.visitorCount || 1580) + 1;
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
    local.visitorCount = (local.visitorCount || 1580) + 1;
    saveDatabase(local);
    return local.visitorCount;
  }
}

async function incrementFirestoreCandle() {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    local.candleCount = (local.candleCount || 120) + 1;
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
    local.candleCount = (local.candleCount || 120) + 1;
    saveDatabase(local);
    return local.candleCount;
  }
}

async function incrementFirestorePledge() {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    const nextPledge = (local.pledgeCount || 520) + 1;
    local.pledgeCount = nextPledge;
    saveDatabase(local);
    return nextPledge;
  }

  try {
    const docRef = doc(fdb, 'counters', 'stats');
    const stats = await getFirestoreStats();
    const newPledgeCount = stats.pledgeCount + 1;
    await updateDoc(docRef, {
      pledgeCount: increment(1)
    });
    return newPledgeCount;
  } catch (error) {
    console.error('Error incrementing pledge count in Firestore:', error);
    const local = loadDatabase();
    const nextPledge = (local.pledgeCount || 520) + 1;
    local.pledgeCount = nextPledge;
    saveDatabase(local);
    return nextPledge;
  }
}

async function getFirestoreComments() {
  const fdb = getFirestoreDb();
  if (!fdb) {
    const local = loadDatabase();
    return local.comments || [];
  }
  try {
    const colRef = collection(fdb, 'comments');
    const querySnapshot = await getDocs(colRef);
    const commentsList = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      commentsList.push({
        id: docSnap.id,
        from: data.from || '',
        to: data.to || 'Chamchamz',
        text: data.text || '',
        timestamp: data.timestamp || new Date().toISOString()
      });
    });

    if (commentsList.length === 0) {
      // Seed default comments into Firestore
      const local = loadDatabase();
      const seeds = local.comments || [];
      for (const s of seeds) {
        const docRef = doc(fdb, 'comments', s.id);
        await setDoc(docRef, {
          from: s.from,
          to: s.to,
          text: s.text,
          timestamp: s.timestamp
        });
        commentsList.push(s);
      }
    }

    return commentsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching comments from Firestore:', error);
    const local = loadDatabase();
    return local.comments || [];
  }
}

async function addFirestoreComment(comment) {
  const fdb = getFirestoreDb();
  if (!fdb) return false;
  try {
    const docRef = doc(fdb, 'comments', comment.id);
    await setDoc(docRef, {
      from: comment.from,
      to: comment.to,
      text: comment.text,
      timestamp: comment.timestamp
    });
    return true;
  } catch (error) {
    console.error('Error adding comment to Firestore:', error);
    return false;
  }
}

async function deleteFirestoreComment(id) {
  const fdb = getFirestoreDb();
  if (!fdb) return false;
  try {
    const docRef = doc(fdb, 'comments', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting comment from Firestore:', error);
    return false;
  }
}

// REGISTER ALL ROUTES FOR VERCEL SERVERLESS SUPPORT

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

// API 3: Set website visitor count directly
app.post('/api/visitor/set', async (req, res) => {
  const { count, token } = req.body;
  if (token !== 'chamchamz') {
    return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
  }

  const parsed = parseInt(count, 10);
  if (isNaN(parsed)) {
    return res.status(400).json({ error: 'Số lượng không hợp lệ!' });
  }

  const fdb = getFirestoreDb();
  if (fdb) {
    try {
      const docRef = doc(fdb, 'counters', 'stats');
      await updateDoc(docRef, { visitorCount: parsed });
    } catch (e) {
      console.error(e);
    }
  }
  const local = loadDatabase();
  local.visitorCount = parsed;
  saveDatabase(local);
  res.json({ visitorCount: parsed });
});

// API 4: Increment lit candle count
app.post('/api/candle/increment', async (req, res) => {
  const newCount = await incrementFirestoreCandle();
  res.json({ candleCount: newCount });
});

// API 4.1: Set lit candle count directly
app.post('/api/candle/set', async (req, res) => {
  const { count, token } = req.body;
  if (token !== 'chamchamz') {
    return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
  }

  const parsed = parseInt(count, 10);
  if (isNaN(parsed)) {
    return res.status(400).json({ error: 'Số lượng không hợp lệ!' });
  }

  const fdb = getFirestoreDb();
  if (fdb) {
    try {
      const docRef = doc(fdb, 'counters', 'stats');
      await updateDoc(docRef, { candleCount: parsed });
    } catch (e) {
      console.error(e);
    }
  }
  const local = loadDatabase();
  local.candleCount = parsed;
  saveDatabase(local);
  res.json({ candleCount: parsed });
});

// API 4.5: Increment secret pledge count
app.post('/api/pledge/increment', async (req, res) => {
  const newCount = await incrementFirestorePledge();
  res.json({ pledgeCount: newCount });
});

// API 5: Get all comments
app.get('/api/comments', async (req, res) => {
  const sortedComments = await getFirestoreComments();
  res.json(sortedComments);
});

// API 5.5: Get comments enabled status
app.get('/api/comments/status', async (req, res) => {
  const fdb = getFirestoreDb();
  if (fdb) {
    try {
      const docRef = doc(fdb, 'counters', 'stats');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data.commentsEnabled === 'boolean') {
          return res.json({ commentsEnabled: data.commentsEnabled });
        }
      }
    } catch (e) {
      console.error('Error fetching comments status from Firestore:', e);
    }
  }
  const local = loadDatabase();
  res.json({ commentsEnabled: local.commentsEnabled !== false });
});

// API 5.6: Toggle comments enabled status (Admin only)
app.post('/api/comments/status', async (req, res) => {
  const { commentsEnabled, token } = req.body;
  if (token !== 'chamchamz') {
    return res.status(403).json({ error: 'Sai mật khẩu quản trị!' });
  }

  const fdb = getFirestoreDb();
  if (fdb) {
    try {
      const docRef = doc(fdb, 'counters', 'stats');
      await setDoc(docRef, { commentsEnabled: !!commentsEnabled }, { merge: true });
    } catch (e) {
      console.error('Error setting comments status in Firestore:', e);
    }
  }
  const local = loadDatabase();
  local.commentsEnabled = !!commentsEnabled;
  saveDatabase(local);
  res.json({ commentsEnabled: !!commentsEnabled });
});

// API 6: Submit a comment
app.post('/api/comments', async (req, res) => {
  let isEnabled = true;
  const fdb = getFirestoreDb();
  if (fdb) {
    try {
      const docRef = doc(fdb, 'counters', 'stats');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data.commentsEnabled === 'boolean') {
          isEnabled = data.commentsEnabled;
        }
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    const local = loadDatabase();
    isEnabled = local.commentsEnabled !== false;
  }

  if (!isEnabled) {
    return res.status(403).json({ error: 'Hệ thống gửi thư hiện đang tạm đóng!' });
  }

  let { from, to, text } = req.body;
  if (!from || !text) {
    return res.status(400).json({ error: 'Vui lòng nhập tên và lời nhắn!' });
  }

  if (!to || !['James', 'Juhoon', 'Chamchamz'].includes(to)) {
    to = 'Chamchamz';
  }

  const cleanFrom = String(from).trim().substring(0, 50);
  const cleanText = String(text).trim().substring(0, 500);

  const newComment = {
    id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    from: cleanFrom,
    to,
    text: cleanText,
    timestamp: new Date().toISOString()
  };

  if (fdb) {
    await addFirestoreComment(newComment);
  }

  const local = loadDatabase();
  if (!local.comments) local.comments = [];
  local.comments.push(newComment);
  saveDatabase(local);

  res.status(201).json(newComment);
});

// API 7: Delete a comment (Admin only, password verified)
app.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  if (token !== 'chamchamz') {
    return res.status(403).json({ error: 'Mật khẩu quản trị không đúng hoặc thiếu!' });
  }

  const fdb = getFirestoreDb();
  if (fdb) {
    await deleteFirestoreComment(id);
  }

  const local = loadDatabase();
  if (!local.comments) local.comments = [];
  local.comments = local.comments.filter(c => c.id !== id);
  saveDatabase(local);
  res.json({ success: true, message: 'Đã xóa bình luận thành công!' });
});

export default app;
