'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Table as TableExtension } from '@tiptap/extension-table';
import { TableRow as TableRowExtension } from '@tiptap/extension-table-row';
import { TableHeader as TableHeaderExtension } from '@tiptap/extension-table-header';
import { TableCell as TableCellExtension } from '@tiptap/extension-table-cell';
import YoutubeExtension from '@tiptap/extension-youtube';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import { Clock, Sparkles } from 'lucide-react';

import EditorToolbar from './EditorToolbar';
import { calculateReadingTime } from '@/lib/reading-time';

interface BlogEditorProps {
  content: string;
  onChange: (html: string, json?: Record<string, unknown>, readingTimeMinutes?: number, wordCount?: number) => void;
  placeholder?: string;
}

export default function BlogEditor({
  content,
  onChange,
  placeholder = 'Bắt đầu viết nội dung bài viết kỹ thuật, hướng dẫn hoặc đánh giá sản phẩm...',
}: BlogEditorProps) {
  const [stats, setStats] = useState(() => calculateReadingTime(content));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      UnderlineExtension,
      PlaceholderExtension.configure({ placeholder }),
      TextAlignExtension.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-medium hover:text-blue-800 transition-colors',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-md border border-slate-200 dark:border-slate-800 my-4 max-w-full h-auto',
        },
      }),
      YoutubeExtension.configure({
        width: 840,
        height: 480,
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 my-6 mx-auto',
        },
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border border-slate-200 dark:border-slate-800 text-sm',
        },
      }),
      TableRowExtension,
      TableHeaderExtension.configure({
        HTMLAttributes: {
          class: 'border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 font-semibold p-3 text-left',
        },
      }),
      TableCellExtension.configure({
        HTMLAttributes: {
          class: 'border border-slate-200 dark:border-slate-800 p-3 align-top',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none min-h-[380px] focus:outline-none p-6 text-slate-800 dark:text-slate-100 leading-relaxed text-base',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON() as Record<string, unknown>;
      const computedStats = calculateReadingTime(html);
      setStats(computedStats);
      onChange(html, json, computedStats.minutes, computedStats.words);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      if (editor.isEmpty) {
        editor.commands.setContent(content);
        setStats(calculateReadingTime(content));
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 text-center text-slate-500 animate-pulse">
        Đang khởi tạo trình soạn thảo thông minh...
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="flex-1 bg-white dark:bg-slate-900 min-h-[380px]">
        <EditorContent editor={editor} />
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Tự động tính độ dài bài viết chuẩn SEO
          </span>
          {stats.imagesCount > 0 && <span>• {stats.imagesCount} hình ảnh</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {stats.words.toLocaleString()} từ
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
            <Clock className="w-3 h-3" />
            {stats.text}
          </span>
        </div>
      </div>
    </div>
  );
}
