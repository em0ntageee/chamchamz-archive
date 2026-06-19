/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HintItem {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  isUnlocked: boolean;
  hintKey?: string; // Optional code to unlock if wanted, or simple click-to-reveal
  hintIllustration?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  tags: string[];
  category?: string; // E.g., 'X', 'IG', 'Weverse', 'Nguồn bên ngoài'
  description: string;
  colorTheme: string; // Pastel tailwind colors
  emoji: string;
  author: string;
  images?: { image_file: string; caption?: string }[];
}

export interface RecItem {
  id: string;
  title: string;
  creator: string;
  type: string; // E.g., 'Fanfic/Author', 'Art/Artist', 'Khác' or legacy 'music'/'book'/'movie'
  reason: string;
  linkText?: string;
  url?: string;
}

export interface FanMessage {
  id: string;
  authorName: string;
  createdAt: string;
  sticker: string;
  messageText: string;
}
