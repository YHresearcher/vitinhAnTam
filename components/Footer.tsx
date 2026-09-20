'use client';

import React from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { MapPin, Send, Clock, ShieldCheck, CheckCircle, Lock } from 'lucide-react';

export function Footer() {
  const { currentLang, setLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-10 pb-10 text-slate-600 mt-16 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 text-sm">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
              <span>HUB KỸ THUẬT TP. TÂN AN</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">45 Nguyễn Huệ, Phường 1, TP. Tân An, Tỉnh Long An</p>
            <div className="pt-1 space-y-1.5 text-xs text-slate-600">
              <p><strong className="text-slate-900 font-bold">Hotline / Zalo:</strong> <span className="text-blue-700 font-bold">0909.053.058</span></p>
              <p><strong className="text-slate-900 font-bold">Hỗ trợ kỹ thuật:</strong> 24/7 trực ca tiếp nhận</p>
              <p><strong className="text-slate-900 font-bold">Email:</strong> lienhe@vitinhantham.vn</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-blue-700 shrink-0" />
              <span>RANH GIỚI DỊCH VỤ (10KM)</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Đội cơ động tiếp nhận kiểm tra &amp; sửa chữa tận nơi có mặt trong 2 giờ:
            </p>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>Thành phố Tân An (nội thành &amp; ngoại thành)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>Huyện Thủ Thừa (thị trấn &amp; xã liền kề)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>Huyện Châu Thành (bán kính kết nối)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                <span>Huyện Tân Trụ (khu vực lân cận)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700 shrink-0" />
              <span>GIỜ PHỤC VỤ LINH HOẠT</span>
            </h3>
            <div className="text-xs space-y-2 text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 font-bold block mb-0.5">Thứ 2 - Thứ 6:</strong>
                <span>thời gian tiếp nhận thông tin: 08h00 - 17h30</span><br />
                <span className="text-blue-700 font-semibold">Cứu hộ tận nơi ưu tiên: 17h30 - 21h00</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 font-bold block mb-0.5">Thứ 7 &amp; Chủ Nhật:</strong>
                <span>Phục vụ trọn ngày: 08h00 - 21h00</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>CHÍNH SÁCH &amp; ĐIỀU LỆ</span>
            </h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Chính sách 1 đổi 1 tận nơi nhanh chóng</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Cam kết tuyệt đối bảo mật dữ liệu khách hàng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 Vi Tính An Tâm (vitinhantham.vn) - Tận tâm trao chất lượng.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a className="hover:text-blue-700 transition-colors font-medium" href="#chinh-sach">
              Quy định bảo hành
            </a>
            <Link className="hover:text-blue-700 transition-colors flex items-center gap-1.5 font-medium" href="/login">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>Đăng nhập nội bộ</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
