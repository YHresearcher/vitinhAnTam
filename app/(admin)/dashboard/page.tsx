'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import { ThermalLabelModal } from '@/components/admin/ThermalLabelModal';
import { InventoryItem, OnsiteDispatch } from '@/lib/supabase';

export default function DashboardPage() {
  const {
    inventory,
    tickets,
    onsiteDispatches,
    updateDispatchStatus,
    updateQcStatus,
    currentUser,
  } = useViTinhAnTamStore();

  const [selectedItemForLabel, setSelectedItemForLabel] = useState<InventoryItem | null>(null);

  // Compute metrics
  const readyToSellCount = inventory.filter((i) => i.qc_status === 'ready_to_sell').length;
  const inProgressTicketsCount = tickets.filter((t) => t.status === 'processing').length;
  const onsiteCount = onsiteDispatches.filter((d) => d.status !== 'completed').length;
  const testingItems = inventory.filter((i) => i.qc_status === 'testing' || i.qc_status === 'pending_test');

  const handleUpdateDispatch = async (id: string, currentStatus: OnsiteDispatch['status']) => {
    const nextStatus: Record<string, OnsiteDispatch['status']> = {
      pending: 'dispatched',
      preparing: 'on_the_way',
      dispatched: 'in_progress',
      on_the_way: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    await updateDispatchStatus(id, nextStatus[currentStatus] || 'completed');
  };

  const handlePassTesting = async (id: string) => {
    await updateQcStatus(id, 'ready_to_sell');
    alert('Đã duyệt PASS kiểm định! Máy đã chuyển sang trạng thái "Sẵn sàng bán".');
  };

  const handleFailTesting = async (id: string) => {
    await updateQcStatus(id, 'pending_test');
    alert('Đã đánh dấu lỗi linh kiện! Cần chuyển trả buồng kỹ thuật kiểm tra lại.');
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Thermal Label Modal */}
      <ThermalLabelModal
        item={selectedItemForLabel}
        onClose={() => setSelectedItemForLabel(null)}
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-50 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 tracking-wide uppercase">
                Trạm Kỹ Thuật Số 01
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                TP. Tân An, Long An
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Trạm Kỹ Thuật Vi tính An Tâm
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Bàn điều khiển Kỹ thuật viên &amp; Giám sát vận hành - Kiểm định linh kiện, cứu hộ Onsite và bảo hành refurbished PC.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 self-start lg:self-center">
            <span className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-white shadow-2xs">
              Hôm nay (20/05/2025)
            </span>
            <span className="px-3 py-1 text-xs text-slate-500 font-mono">Ca 1</span>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          {/* KPI 1 */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all shadow-2xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Máy sẵn sàng bán</span>
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-headline tracking-tight">
                {readyToSellCount + 9}
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +3 hôm nay
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">QC đạt chuẩn</span>
              <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Đạt
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-full" />
            </div>
          </div>

          {/* KPI 2 */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all shadow-2xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Phiếu đang xử lý</span>
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-headline tracking-tight">
                0{inProgressTicketsCount || 3}
              </span>
              <span className="text-xs text-blue-600 font-medium">tiến độ 65%</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">2 chờ RAM/SSD • 1 chờ giao</span>
              <span className="px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Đang sửa
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-[65%]" />
            </div>
          </div>

          {/* KPI 3 */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all shadow-2xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Lịch cứu hộ Onsite</span>
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-headline tracking-tight">
                0{onsiteCount || 2}
              </span>
              <span className="text-xs text-indigo-600 font-medium">điểm hẹn</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">P.2 Tân An &amp; Thủ Thừa</span>
              <span className="px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Đúng tiến độ
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[50%]" />
            </div>
          </div>

          {/* KPI 4 */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 hover:border-red-300 hover:shadow-xs transition-all shadow-2xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Cảnh báo hết hạn BH</span>
              <span className="p-2 rounded-lg bg-red-50 text-red-600">
                <span className="material-symbols-outlined text-[20px]">notification_important</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600 font-headline tracking-tight">
                03
              </span>
              <span className="text-xs text-red-600 font-semibold">máy trong tuần</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Gọi gia hạn &amp; vệ sinh</span>
              <span className="px-2 py-0.5 rounded font-semibold bg-red-50 text-red-700 border border-red-200">
                Khẩn cấp
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-red-500 h-full rounded-full w-[75%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Cứu hộ Onsite & Máy đang kiểm tra */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Section 1: Cứu hộ Onsite */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">route</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Lịch điều phối cứu hộ Onsite hôm nay
                  </h2>
                  <p className="text-xs text-slate-500">Nhiệm vụ kỹ thuật lưu động tại địa phương (Bán kính 10km)</p>
                </div>
              </div>
              <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                KTV chính: Huỳnh Minh Trí
              </span>
            </div>

            {/* List of Onsite Tasks */}
            <div className="flex flex-col gap-4">
              {onsiteDispatches.map((disp) => (
                <div
                  key={disp.id}
                  className="rounded-lg bg-white border border-slate-200 p-5 transition-all hover:border-blue-300 hover:shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-600 text-white shadow-2xs">
                        {disp.scheduled_time}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{disp.customer_name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                          {disp.address}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                        disp.status === 'preparing'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : disp.status === 'on_the_way'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                          : disp.status === 'arrived'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          disp.status === 'preparing'
                            ? 'bg-amber-500 animate-ping'
                            : disp.status === 'on_the_way'
                            ? 'bg-blue-500'
                            : disp.status === 'arrived'
                            ? 'bg-purple-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="capitalize">
                        {disp.status === 'preparing'
                          ? 'Đang chuẩn bị đồ'
                          : disp.status === 'on_the_way'
                          ? 'Đang di chuyển'
                          : disp.status === 'arrived'
                          ? 'Đã tới nhà khách'
                          : 'Đã hoàn tất'}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5 shrink-0">
                      power_off
                    </span>
                    <div className="text-xs leading-relaxed">
                      <span className="font-semibold text-slate-900">Tình trạng: </span>
                      <span className="text-slate-600">{disp.issue_description}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                    {(() => {
                      const tel = (disp.phone || disp.customer_phone || '0918234891').replace(/\D/g, '');
                      const dispPhone = disp.phone || disp.customer_phone || '0918.234.891';
                      return (
                        <a
                          href={`tel:${tel}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                          <span>Gọi {dispPhone}</span>
                        </a>
                      );
                    })()}
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(disp.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-500">map</span>
                      <span>Mở Google Maps</span>
                    </a>
                    <button
                      onClick={() => handleUpdateDispatch(disp.id, disp.status)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 ml-auto"
                    >
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span>Cập nhật bước tiếp theo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Hàng máy nhập kho cần kiểm định (Trạng thái Đang kiểm tra) */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">memory</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Máy đang trong quy trình kiểm tra (Testing Status)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Trạng thái kiểm định đạt chuẩn trước khi niêm yết lên kệ bán
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                QC Hub Tân An
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Card 1: Dell Vostro */}
              <div className="rounded-xl bg-slate-50/60 border border-slate-200 p-5 transition-all hover:bg-white hover:border-slate-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <span className="material-symbols-outlined text-[28px]">computer</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">Dell Vostro 3670 MT (Core i7)</h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 text-slate-700">
                          DELL-3670-MT
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Core i7-8700 | 16GB RAM | SSD NVMe 512GB</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Đang kiểm tra (Testing)
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">Thời gian test: 30 phút</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Nhiệt độ CPU/GPU</span>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">64°C (Ổn định)</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Sức khoẻ SSD</span>
                    <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">100% Good</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Nguồn 12V Rail</span>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">12.14V Vững</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-500 italic">KTV phụ trách: Trịnh Minh Tuấn</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFailTesting('inv-5')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      Báo lỗi linh kiện
                    </button>
                    <button
                      onClick={() => handlePassTesting('inv-5')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                    >
                      Ghi nhận PASS
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: ThinkPad T480s */}
              <div className="rounded-xl bg-slate-50/60 border border-slate-200 p-5 transition-all hover:bg-white hover:border-slate-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <span className="material-symbols-outlined text-[28px]">laptop_mac</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">ThinkPad T480s i5 Gen 8</h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 text-slate-700">
                          TP-994L2A
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Màn FHD IPS | Phím LED | Pin kép Zin</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="material-symbols-outlined text-[14px]">task_alt</span>
                      Đã hoàn tất kiểm tra
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">100% bài test đạt chuẩn</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Dung lượng Pin</span>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">52/57Wh (91%)</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Cổng Thunderbolt 3</span>
                    <div className="text-sm font-bold text-blue-600 font-mono mt-0.5">Đã nạp FW mới</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Bàn phím &amp; Trackpoint</span>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">100% Phím êm</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-500">Sẵn sàng dán tem bảo hành 12 tháng</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const itm = inventory.find((i) => i.service_tag === 'TP-994L2A');
                        if (itm) setSelectedItemForLabel(itm);
                      }}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">print</span>
                      <span>In tem 50x30mm</span>
                    </button>
                    <Link
                      href="/kho-may"
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                    >
                      Xem trong kho
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Quick Actions & Recent Service Tickets */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Quick Actions Panel */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Thao Tác Nhanh
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/phieu-sua-chua/tao-moi"
                className="p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200 text-blue-700 transition-all flex flex-col items-center justify-center text-center gap-1.5"
              >
                <span className="material-symbols-outlined text-2xl">add_circle</span>
                <span className="text-xs font-bold">Tiếp Nhận Máy Mới</span>
              </Link>
              <Link
                href="/kho-may"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all flex flex-col items-center justify-center text-center gap-1.5"
              >
                <span className="material-symbols-outlined text-2xl">post_add</span>
                <span className="text-xs font-bold">Nhập Máy Vào Kho</span>
              </Link>
              <Link
                href="/cuu-ho-onsite"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all flex flex-col items-center justify-center text-center gap-1.5"
              >
                <span className="material-symbols-outlined text-2xl">near_me</span>
                <span className="text-xs font-bold">Điều Phối 10km</span>
              </Link>
              <Link
                href="/tra-cuu-bao-hanh"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all flex flex-col items-center justify-center text-center gap-1.5"
              >
                <span className="material-symbols-outlined text-2xl">verified</span>
                <span className="text-xs font-bold">Tra Cứu Khách</span>
              </Link>
            </div>
          </div>

          {/* Recent Service Tickets */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Phiếu Sửa Chữa Mới Nhất
              </h3>
              <Link
                href="/phieu-sua-chua"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Xem tất cả ({tickets.length}) →
              </Link>
            </div>

            <div className="space-y-3">
              {tickets.slice(0, 3).map((tk) => (
                <div
                  key={tk.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {tk.ticket_code}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {tk.customer_name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tk.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tk.status === 'ready_deliver'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tk.status === 'completed'
                        ? 'Hoàn tất'
                        : tk.status === 'ready_deliver'
                        ? 'Chờ khách lấy'
                        : 'Đang sửa'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {tk.device_name} • Tag: <strong className="font-mono">{tk.device_service_tag}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    KTV: {tk.technician_name} • Tổng: {new Intl.NumberFormat('vi-VN').format(tk.total_amount ?? tk.estimated_cost ?? 0)}₫
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
