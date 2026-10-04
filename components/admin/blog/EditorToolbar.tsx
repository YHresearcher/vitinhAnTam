'use client';

import React, { useState, useRef } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code2,
  Table as TableIcon,
  Image as ImageIcon,
  Video,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Laptop,
  Wrench,
} from 'lucide-react';
import { useViTinhAnTamStore } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function EditorToolbar({ editor }: { editor: Editor }) {
  const { inventory } = useViTinhAnTamStore();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCtaModal, setShowCtaModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Nhập địa chỉ liên kết (URL):', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('Nhập URL YouTube:');
    if (url) editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isSupabaseConfigured() && supabase) {
      setIsUploadingImage(true);
      try {
        const ext = file.name.split('.').pop();
        const fn = `blog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`;
        const path = `posts/${fn}`;
        const { error } = await supabase.storage.from('blog-images').upload(path, file, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
          if (data?.publicUrl) editor.chain().focus().setImage({ src: data.publicUrl }).run();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingImage(false);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertProduct = (item: (typeof inventory)[0]) => {
    const price = item.retail_price
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.retail_price)
      : 'Liên hệ';
    const cpu = item.specs?.cpu || item.cpu || '';
    const ram = item.specs?.ram || item.ram || '';
    const ssd = item.specs?.ssd || item.ssd_capacity || '';

    const html = `
      <div class="not-prose my-6 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white">${item.brand}</span>
            <span class="text-xs text-blue-700 dark:text-blue-300">Tag: ${item.service_tag}</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">${item.device_model || item.model || 'Laptop / PC'}</h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${cpu} • ${ram} • ${ssd}</p>
          <div class="mt-2 text-base font-extrabold text-red-600">${price}</div>
        </div>
        <div class="flex gap-2">
          <a href="/tra-cuu-bao-hanh?tag=${encodeURIComponent(item.service_tag)}" target="_blank" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs">Chi tiết</a>
          <a href="https://zalo.me/0909053058" target="_blank" class="px-4 py-2 rounded-xl border border-blue-300 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">Tư vấn Zalo</a>
        </div>
      </div>
      <p></p>
    `;
    editor.chain().focus().insertContent(html).run();
    setShowProductModal(false);
  };

  const insertCta = (type: 'spa' | 'win' | 'repair') => {
    let title = 'Đặt lịch Vệ sinh Tra keo tản nhiệt Laptop';
    let desc = 'Quy trình 12 bước với keo tản nhiệt Noctua / MX-4 xịn, giảm ngay 15-25°C!';
    let price = '150.000đ - 250.000đ';
    let btn = 'Đặt Spa Laptop';

    if (type === 'win') {
      title = 'Dịch vụ Cài Windows & Phần mềm Bản quyền';
      desc = 'Bản Windows sạch, Office chuẩn, tối ưu hóa chạy mượt mà trên máy tính.';
      price = '100.000đ - 150.000đ';
      btn = 'Cài Win 30 phút';
    } else if (type === 'repair') {
      title = 'Khám & Sửa chữa Phần cứng Lấy liền';
      desc = 'Chẩn đoán chính xác bằng thiết bị chuyên dụng trực tiếp trước mặt quý khách.';
      price = 'Miễn phí kiểm tra';
      btn = 'Tư vấn Kỹ thuật';
    }

    const html = `
      <div class="not-prose my-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">⭐ Vi Tính An Tâm Service</div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">${title}</h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">${desc}</p>
          <div class="mt-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">${price}</div>
        </div>
        <a href="tel:0909053058" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm">${btn} (0909.053.058)</a>
      </div>
      <p></p>
    `;
    editor.chain().focus().insertContent(html).run();
    setShowCtaModal(false);
  };
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-2.5 flex flex-wrap items-center gap-1 sticky top-0 z-20 backdrop-blur">
      <input type="file" ref={fileInputRef} onChange={handleImage} accept="image/*" className="hidden" />

      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-40"><Undo2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg disabled:opacity-40"><Redo2 className="w-4 h-4" /></button>
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded-lg font-bold text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Heading2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded-lg font-bold text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Heading3 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={`p-1.5 rounded-lg font-bold text-xs ${editor.isActive('heading', { level: 4 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Heading4 className="w-4 h-4" /></button>
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded-lg ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-lg ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Italic className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded-lg ${editor.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Underline className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded-lg ${editor.isActive('strike') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Strikethrough className="w-4 h-4" /></button>
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />


      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded-lg ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded-lg ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded-lg ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><AlignRight className="w-4 h-4" /></button>
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded-lg ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><List className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded-lg ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><ListOrdered className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded-lg ${editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Quote className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-1.5 rounded-lg ${editor.isActive('codeBlock') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Code2 className="w-4 h-4" /></button>
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

      <button type="button" onClick={setLink} className={`p-1.5 rounded-lg ${editor.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}><Link2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"><ImageIcon className="w-4 h-4 text-emerald-600" />{isUploadingImage && <span className="text-[10px]">Tải...</span>}</button>
      <button type="button" onClick={addYoutube} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"><Video className="w-4 h-4 text-red-500" /></button>
      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"><TableIcon className="w-4 h-4 text-purple-600" /></button>
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

      <button type="button" onClick={() => setShowProductModal(true)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"><Laptop className="w-3.5 h-3.5" /><span>+ Gắn SP Kho</span></button>
      <button type="button" onClick={() => setShowCtaModal(true)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100"><Wrench className="w-3.5 h-3.5" /><span>+ Thẻ CTA</span></button>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Laptop className="w-4 h-4 text-blue-600" />Chọn Sản Phẩm Gắn Kèm Bài Viết</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {inventory.length === 0 ? (<p className="text-center py-6 text-xs text-slate-400">Chưa có sản phẩm trong kho.</p>) : (
                inventory.map((item) => (
                  <div key={item.id} onClick={() => insertProduct(item)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5"><span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{item.brand}</span><h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.device_model || item.model || 'Laptop / PC'}</h4></div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Tag: {item.service_tag}</p>
                    </div>
                    <div className="text-right"><div className="text-xs font-bold text-red-600">{item.retail_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.retail_price) : 'Liên hệ'}</div><span className="text-[10px] text-blue-600 font-medium">+ Chèn</span></div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end"><button type="button" onClick={() => setShowProductModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">Đóng</button></div>
          </div>
        </div>
      )}

      {/* CTA Modal */}
      {showCtaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Wrench className="w-4 h-4 text-emerald-600" />Chèn Khung Kêu Gọi Dịch Vụ (CTA)</h3>
            <div className="space-y-2 mt-3">
              <button type="button" onClick={() => insertCta('spa')} className="w-full text-left p-3 rounded-xl border border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Spa & Vệ sinh Laptop 12 bước</h4>
                <p className="text-[11px] text-slate-500">Tra keo Noctua/MX-4, giảm 15-25°C</p>
              </button>
              <button type="button" onClick={() => insertCta('win')} className="w-full text-left p-3 rounded-xl border border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Cài Windows & Bản quyền</h4>
                <p className="text-[11px] text-slate-500">Windows chuẩn, Office sạch, máy chạy êm</p>
              </button>
              <button type="button" onClick={() => insertCta('repair')} className="w-full text-left p-3 rounded-xl border border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Khám & Sửa Phần Cứng Lấy Liền</h4>
                <p className="text-[11px] text-slate-500">Đo nguồn trực tiếp trước mặt khách</p>
              </button>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end"><button type="button" onClick={() => setShowCtaModal(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">Hủy</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
