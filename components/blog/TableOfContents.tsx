'use client';

import React, { useMemo } from 'react';
import { ListOrdered } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ contentHtml }: { contentHtml: string }) {
  const headings = useMemo<TocItem[]>(() => {
    if (!contentHtml) return [];
    const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
    const items: TocItem[] = [];
    let match;

    while ((match = regex.exec(contentHtml)) !== null) {
      const level = parseInt(match[1], 10);
      const rawText = match[2].replace(/<[^>]*>/g, '').trim();
      const id = rawText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      if (rawText) {
        items.push({ id, text: rawText, level });
      }
    }

    return items;
  }, [contentHtml]);

  if (headings.length < 2) return null;

  const scrollToHeading = (id: string, text: string) => {
    // Find heading element by text if ID does not exist directly
    const headingElements = Array.from(document.querySelectorAll('h2, h3'));
    const matched = headingElements.find((el) => el.textContent?.trim() === text);
    if (matched) {
      matched.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold text-sm">
        <ListOrdered className="w-4 h-4 text-blue-600" />
        <span>Mục lục bài viết</span>
      </div>

      <ul className="space-y-2 text-xs">
        {headings.map((item, idx) => (
          <li
            key={idx}
            className={`${item.level === 3 ? 'pl-3 border-l border-slate-200 dark:border-slate-700' : ''}`}
          >
            <button
              type="button"
              onClick={() => scrollToHeading(item.id, item.text)}
              className="text-left text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition leading-snug line-clamp-2"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
