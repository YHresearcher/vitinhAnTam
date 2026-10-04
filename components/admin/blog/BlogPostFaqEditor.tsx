'use client';

import React from 'react';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { FaqSchemaItem } from '@/lib/supabase';

interface BlogPostFaqEditorProps {
  faqs: FaqSchemaItem[];
  onChange: (faqs: FaqSchemaItem[]) => void;
}

export default function BlogPostFaqEditor({ faqs, onChange }: BlogPostFaqEditorProps) {
  const handleAdd = () => {
    onChange([...faqs, { question: '', answer: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: 'question' | 'answer', val: string) => {
    const next = [...faqs];
    next[index][field] = val;
    onChange(next);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Câu hỏi thường gặp (FAQ Schema SEO)</h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-xs text-slate-400">
          Chưa có câu hỏi FAQ nào. Thêm câu hỏi giúp xuất hiện Rich Snippets FAQ trên Google Search.
        </p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">FAQ #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Câu hỏi (VD: Vệ sinh laptop mất bao lâu?)"
                value={faq.question}
                onChange={(e) => handleChange(idx, 'question', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
              <textarea
                rows={2}
                placeholder="Câu trả lời chi tiết..."
                value={faq.answer}
                onChange={(e) => handleChange(idx, 'answer', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
