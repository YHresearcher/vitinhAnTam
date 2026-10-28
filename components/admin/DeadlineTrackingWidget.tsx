'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ServiceTicket } from '@/lib/supabase';

interface UrgentTicketInfo {
  ticket: ServiceTicket;
  targetDate: Date;
  diffHours: number;
  diffDays: number;
  isOverdue: boolean;
  timeRemainingText: string;
}

export function DeadlineTrackingWidget() {
  const { tickets, currentUser, isFieldStaff } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  // Nhân viên hiện trường chỉ thấy phiếu của mình; trang phiếu chung bị chặn
  // với họ nên link "Mở phiếu" phải về trang công việc của họ.
  const fieldStaff = isFieldStaff();
  const jobsHref = fieldStaff ? '/cong-viec-cua-toi' : '/cuu-ho-onsite?tab=counter';

  // Lọc các máy đang tiếp nhận/sửa chữa/bảo hành
  const { urgentTickets, overdueCount, upcomingCount } = useMemo(() => {
    const now = new Date();

    const activeTickets = tickets.filter(
      (t) =>
        t.status !== 'completed' &&
        t.status !== 'delivered' &&
        t.status !== 'cancelled' &&
        (!fieldStaff || !currentUser || t.technician_name === currentUser.name)
    );

    const list: UrgentTicketInfo[] = [];

    activeTickets.forEach((t) => {
      let targetDate: Date;

      if (t.estimated_completion) {
        // Format datetime ISO hoặc chuẩn YYYY-MM-DDTHH:mm
        const parsed = new Date(t.estimated_completion);
        if (!isNaN(parsed.getTime())) {
          targetDate = parsed;
        } else {
          const parts = t.estimated_completion.match(/(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (parts) {
            targetDate = new Date(Number(parts[5]), Number(parts[4]) - 1, Number(parts[3]), Number(parts[1]), Number(parts[2]));
          } else {
            targetDate = new Date(t.created_at || now);
            targetDate.setDate(targetDate.getDate() + 3);
          }
        }
      } else {
        // Mặc định hẹn 3 ngày từ ngày tạo phiếu
        targetDate = new Date(t.created_at || now);
        targetDate.setDate(targetDate.getDate() + 3);
      }

      const diffMs = targetDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffHours / 24;
      const isOverdue = diffHours < 0;

      let timeRemainingText = '';
      if (isOverdue) {
        const absHours = Math.abs(diffHours);
        if (absHours < 24) {
          timeRemainingText = `Quá hạn ${Math.round(absHours)} giờ!`;
        } else {
          timeRemainingText = `Quá hạn ${Math.floor(absHours / 24)} ngày ${Math.round(absHours % 24)} giờ!`;
        }
      } else if (diffHours < 24) {
        const hours = Math.floor(diffHours);
        const minutes = Math.round((diffHours - hours) * 60);
        timeRemainingText = `Còn ${hours}h ${minutes}p`;
      } else {
        const days = Math.floor(diffDays);
        const remainHours = Math.round(diffHours % 24);
        timeRemainingText = `Còn ${days} ngày ${remainHours}h`;
      }

      list.push({
        ticket: t,
        targetDate,
        diffHours,
        diffDays,
        isOverdue,
        timeRemainingText,
      });
    });

    // Sắp xếp: máy quá hạn trước, sau đó đến máy gần hạn nhất
    const sorted = list.sort((a, b) => a.diffHours - b.diffHours);
    const overdue = sorted.filter((item) => item.isOverdue).length;
    const upcoming = sorted.filter((item) => !item.isOverdue).length;

    return {
      urgentTickets: sorted,
      overdueCount: overdue,
      upcomingCount: upcoming,
    };
  }, [tickets, fieldStaff, currentUser]);

  // Nếu người dùng chủ động tắt
  if (isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Cảnh Báo Hạn Trả"
      className={`fixed bottom-6 right-4 font-sans transition-all duration-200 ${
        isOpen ? 'z-[70]' : 'z-40'
      }`}
    >
      {/* 1. MÀN HÌNH CHI TIẾT (KHI MỞ RỘNG) */}
      {isOpen ? (
        <div className="w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <h2 className="text-sm font-bold tracking-tight">
                  Tiến Độ &amp; Hạn Trả Máy
                </h2>
              </div>
              <p className="text-[11px] text-red-100 mt-0.5 font-medium">
                {overdueCount > 0
                  ? `Có ${overdueCount} máy đã quá hạn, cần xử lý ngay!`
                  : `Có ${upcomingCount} máy đang trong tiến độ trả máy.`}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black/30 text-white flex items-center justify-center text-xs font-bold transition-colors"
                title="Thu nhỏ"
                aria-label="Thu nhỏ danh sách cảnh báo"
              >
                —
              </button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="w-7 h-7 rounded-lg bg-black/20 hover:bg-black/30 text-white flex items-center justify-center text-xs font-bold transition-colors"
                title="Đóng cảnh báo"
                aria-label="Đóng cảnh báo hạn trả"
              >
                ✕
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Hạn Trả Máy</div>
              <div className="text-base font-bold text-amber-700 font-mono">
                {upcomingCount}
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-red-200">
              <div className="text-[10px] text-red-600 font-medium">Quá Hạn</div>
              <div className="text-base font-bold text-red-700 font-mono">
                {overdueCount}
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-200">
              <div className="text-[10px] text-blue-600 font-medium">Tổng Phiếu</div>
              <div className="text-base font-bold text-blue-700 font-mono">
                {urgentTickets.length}
              </div>
            </div>
          </div>

          {/* List of Urgent Tickets */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 p-2 space-y-1.5 max-h-[50vh]">
            {urgentTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Hiện tại không có máy nào đang tiếp nhận hoặc quá hạn.
              </div>
            ) : (
              urgentTickets.map(({ ticket, isOverdue, timeRemainingText }) => {
                const isWarranty = ticket.service_category === 'bao_hanh';

                return (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isOverdue
                        ? 'bg-red-50/80 border-red-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {ticket.ticket_code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isWarranty
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isWarranty ? 'Bảo Hành' : 'Sửa Chữa'}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {ticket.device_model || ticket.device_name || 'Thiết bị'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Khách: <span className="font-medium text-slate-700">{ticket.customer_name}</span> ({ticket.customer_phone})
                        </div>
                      </div>

                      {/* Countdown Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold font-mono tracking-tight ${
                            isOverdue
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {timeRemainingText}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          KTV: {ticket.technician_name}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Trạng thái:{' '}
                        <span className="font-semibold text-slate-800">
                          {ticket.status === 'received'
                            ? 'Mới tiếp nhận'
                            : ticket.status === 'in_progress'
                            ? 'Đang xử lý'
                            : ticket.status === 'diagnosing'
                            ? 'Đang test'
                            : 'Chờ giao'}
                        </span>
                      </span>
                      <Link
                        href={fieldStaff ? jobsHref : `/cuu-ho-onsite?tab=counter&ticketId=${ticket.id}`}
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors"
                      >
                        Mở Phiếu →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Tự động cập nhật theo thời gian thực
            </span>
            <Link
              href={jobsHref}
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-800 font-bold text-xs"
            >
              Xem {fieldStaff ? 'Phiếu Của Bạn' : 'Toàn Bộ Phiếu'}
            </Link>
          </div>
        </div>
      ) : (
        /* 2. TRẠNG THÁI THU NHỎ (DẠNG HORIZONTAL PILL SANG TRỌNG TẠI BOTTOM-6 RIGHT-4) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-lg hover:shadow-xl border border-slate-200 bg-white/95 backdrop-blur-xs hover:border-slate-300 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer select-none group"
          title="Bấm để xem chi tiết máy đến hạn / quá hạn"
        >
          {/* Section 1: Hạn trả máy */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 whitespace-nowrap">
              Hạn trả
            </span>
            <span className="text-xs font-black font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
              {upcomingCount}
            </span>
          </div>

          {/* Separator */}
          <div className="w-px h-3.5 bg-slate-200" />

          {/* Section 2: Quá hạn */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                overdueCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span
              className={`text-[11px] font-bold whitespace-nowrap ${
                overdueCount > 0 ? 'text-red-700' : 'text-slate-500'
              }`}
            >
              Quá hạn
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-black font-mono px-1.5 py-0.5 rounded-full border ${
                  overdueCount > 0
                    ? 'text-red-700 bg-red-50 border-red-200'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}
              >
                {overdueCount}
              </span>
              {overdueCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block" />
              )}
            </div>
          </div>
        </button>
      )}
    </aside>
  );
}
