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
  const { tickets } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Lọc các máy đang tiếp nhận/sửa chữa/bảo hành và thời gian còn lại < 3 ngày (hoặc đã quá hạn)
  const urgentTickets = useMemo(() => {
    const now = new Date();

    const activeTickets = tickets.filter(
      (t) =>
        t.status !== 'completed' &&
        t.status !== 'delivered' &&
        t.status !== 'cancelled'
    );

    const list: UrgentTicketInfo[] = [];

    activeTickets.forEach((t) => {
      let targetDate: Date;

      if (t.estimated_completion) {
        // Trường hợp format datetime ISO hoặc chuẩn YYYY-MM-DDTHH:mm
        const parsed = new Date(t.estimated_completion);
        if (!isNaN(parsed.getTime())) {
          targetDate = parsed;
        } else {
          // Thử parse các định dạng chuỗi tiếng Việt như "16:00 20/05/2025"
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

      // Tiêu chí: thời gian hoàn thành/bảo hành còn dưới 3 ngày (< 72 giờ)
      if (diffDays < 3) {
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
      }
    });

    // Sắp xếp: máy quá hạn trước, sau đó đến máy còn ít thời gian nhất
    return list.sort((a, b) => a.diffHours - b.diffHours);
  }, [tickets]);

  // Nếu không có máy nào cận hạn (< 3 ngày) hoặc người dùng chủ động tắt
  if (urgentTickets.length === 0 || isDismissed) {
    return null;
  }

  const overdueCount = urgentTickets.filter((item) => item.isOverdue).length;
  const warrantyCount = urgentTickets.filter(
    (item) => item.ticket.service_category === 'bao_hanh'
  ).length;
  const repairCount = urgentTickets.length - warrantyCount;

  return (
    <aside aria-label="Cảnh Báo Hạn Trả" className="fixed bottom-5 right-5 z-50 font-sans">
      {/* 1. MÀN HÌNH CHI TIẾT (KHI MỞ RỘNG) */}
      {isOpen ? (
        <div className="w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <h2 className="text-sm font-bold tracking-tight">
                  Cảnh Báo Hạn Trả Máy (&lt; 3 Ngày)
                </h2>
              </div>
              <p className="text-[11px] text-red-100 mt-0.5 font-medium">
                {overdueCount > 0
                  ? `Có ${overdueCount} máy đã quá hạn, cần xử lý ngay!`
                  : `Có ${urgentTickets.length} máy sắp đến hạn bàn giao.`}
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
              <div className="text-[10px] text-slate-500 font-medium">Tổng Cần Xử Lý</div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {urgentTickets.length}
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-200">
              <div className="text-[10px] text-blue-600 font-medium">Sửa Chữa</div>
              <div className="text-base font-bold text-blue-700 font-mono">
                {repairCount}
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-purple-200">
              <div className="text-[10px] text-purple-600 font-medium">Bảo Hành</div>
              <div className="text-base font-bold text-purple-700 font-mono">
                {warrantyCount}
              </div>
            </div>
          </div>

          {/* List of Urgent Tickets */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 p-2 space-y-1.5 max-h-[50vh]">
            {urgentTickets.map(({ ticket, isOverdue, timeRemainingText }) => {
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
                      href="/phieu-sua-chua"
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Mở Phiếu →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Tự động cập nhật theo thời gian thực
            </span>
            <Link
              href="/phieu-sua-chua"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-800 font-bold text-xs"
            >
              Xem Toàn Bộ Phiếu
            </Link>
          </div>
        </div>
      ) : (
        /* 2. TRẠNG THÁI THU NHỎ (FLOATING BUTTON GÓC PHẢI) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border-2 transition-all active:scale-95 text-left group ${
            overdueCount > 0
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 animate-bounce'
              : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-300'
          }`}
          title="Bấm để xem danh sách máy cận hạn sửa chữa/bảo hành"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
          <div>
            <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>Hạn Trả Máy:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/25 text-white font-mono text-[11px]">
                {urgentTickets.length} máy &lt; 3 ngày
              </span>
            </div>
            {overdueCount > 0 && (
              <div className="text-[10px] text-red-100 font-medium">
                (Có {overdueCount} máy đã quá hạn!)
              </div>
            )}
          </div>
        </button>
      )}
    </aside>
  );
}
