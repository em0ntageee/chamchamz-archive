/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HintItem {
  id: string;
  title: string;
  date: string;
  category: 'sự kiện' | 'bí mật' | 'gợi ý' | 'thông báo';
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
  description: string;
  colorTheme: string; // Pastel tailwind colors
  emoji: string;
  author: string;
}

export interface RecItem {
  id: string;
  title: string;
  creator: string;
  type: 'music' | 'book' | 'movie' | 'quote';
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
