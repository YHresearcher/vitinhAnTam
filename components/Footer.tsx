'use client';

import { useViTinhAnTamStore } from '@/lib/store';
import React from 'react';
import Link from 'next/link';

export function Footer() {
  const { currentLang, setLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';
  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-16 pb-10 text-slate-600 mt-16 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="pb-10 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                      <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Vi Tính An Tâm</h2>
                      <p className="text-xs text-slate-500 font-medium">Bán bằng tâm để bạn an tâm • TP. Tân An, Long An</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                      <span className="material-symbols-outlined text-blue-700 text-base">verified_user</span>
                      <span>100% Win bản quyền sạch</span>
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                      <span className="material-symbols-outlined text-blue-700 text-base">sync</span>
                      <span>Bảo hành 1 đổi 1 trong 15 phút</span>
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                      <span className="material-symbols-outlined text-blue-700 text-base">memory</span>
                      <span>SSD/RAM mới bảo hành 36T</span>
                    </div>
                  </div>
                </div>
              </div>
    
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 text-sm">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">home_pin</span>
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
                    <span className="material-symbols-outlined text-base">near_me</span>
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
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>GIỜ PHỤC VỤ LINH HOẠT</span>
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <strong className="text-slate-900 font-bold block mb-0.5">Thứ 2 - Thứ 6:</strong>
                      <span>Tiếp khách văn phòng: 08h00 - 17h30</span><br />
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
                    <span className="material-symbols-outlined text-base">policy</span>
                    <span>CHÍNH SÁCH &amp; ĐIỀU LỆ</span>
                  </h3>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0 mt-0.5">check_circle</span>
                      <span>Chính sách 1 đổi 1 tận nơi nhanh chóng</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0 mt-0.5">check_circle</span>
                      <span>Cam kết tuyệt đối bảo mật dữ liệu khách hàng</span>
                    </li>
                    <li className="flex items-start gap-1.5 text-rose-600 font-medium">
                      <span className="material-symbols-outlined text-rose-600 text-sm shrink-0 mt-0.5">cancel</span>
                      <span>Lưu ý: Không cung cấp dịch vụ cho thuê</span>
                    </li>
                    <li className="flex items-start gap-1.5 text-rose-600 font-medium">
                      <span className="material-symbols-outlined text-rose-600 text-sm shrink-0 mt-0.5">cancel</span>
                      <span>Lưu ý: Không nhận cứu dữ liệu phòng lab</span>
                    </li>
                  </ul>
                </div>
              </div>
    
              <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>© 2025 Vi Tính An Tâm (vitinhantham.vn) - Tận tâm trao chất lượng.</p>
                <div className="flex flex-wrap items-center gap-5">
                  {/* Language Switcher Vi / En */}
                  <div className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLang('vi')}
                      className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                        !isEn
                          ? "bg-blue-700 text-white shadow-xs"
                          : "text-slate-600 hover:text-blue-700"
                      }`}
                      title="Tiếng Việt (Mặc định)"
                    >
                      <span>🇻🇳</span>
                      <span>VI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                        isEn
                          ? "bg-blue-700 text-white shadow-xs"
                          : "text-slate-600 hover:text-blue-700"
                      }`}
                      title="English"
                    >
                      <span>🇬🇧</span>
                      <span>EN</span>
                    </button>
                  </div>
                  <a className="hover:text-blue-700 transition-colors font-medium" href="#chinh-sach">
                    Quy định bảo hành
                  </a>
                  <Link className="hover:text-blue-700 transition-colors flex items-center gap-1 font-medium" href="/login">
                    <span className="material-symbols-outlined text-sm text-blue-700">lock</span>
                    <span>Đăng nhập nội bộ</span>
                  </Link>
                </div>
              </div>
            </div>
          </footer>
  );
}
