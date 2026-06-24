import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "intense-quote-95w43",
  appId: "1:258481005612:web:5e9dddf7b6b73d4d98dd89",
  apiKey: "AIzaSyApqYnhyUFdsVNWxbtV1PiECC0DAYku5i0",
  authDomain: "intense-quote-95w43.firebaseapp.com",
  storageBucket: "intense-quote-95w43.firebasestorage.app",
  messagingSenderId: "258481005612"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from firebase-applet-config.json
export const db = getFirestore(app, "ai-studio-58f91e89-0eda-461d-9604-aaa57592742c");
