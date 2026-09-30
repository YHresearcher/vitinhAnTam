"use client";

import React, { useState, useMemo } from "react";
import { useViTinhAnTamStore } from "@/lib/store";
import { FinanceWarrantyCharts } from "./FinanceWarrantyCharts";

export function FinanceWarrantyFundTab() {
  const {
    currentUser,
    warrantyProvisions,
    approveWarrantyProvision,
    unlockMaturedWarrantyProvisions,
    settleUnlockedWarrantyProvisionsYearEnd,
  } = useViTinhAnTamStore();

  const isAdmin = currentUser.role === "admin";
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_approval" | "locked" | "unlocked" | "settled">("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Auto-sync mature provisions on button or state
  const handleCheckMature = async () => {
    setIsProcessing(true);
    const res = await unlockMaturedWarrantyProvisions();
    setIsProcessing(false);
    if (res.unlockedCount > 0) {
      setActionNotice(`Đã giải tỏa ${res.unlockedCount} khoản bảo hành hết hạn (${res.unlockedTotal.toLocaleString("vi-VN")}₫)!`);
    } else {
      setActionNotice("Tất cả các máy đều đang trong thời hạn bảo hành chuẩn.");
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleApprove = async (id: string) => {
    const res = await approveWarrantyProvision(id);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleYearEndSettlement = async () => {
    if (!confirm("Xác nhận tất toán cuối năm (31/12): Toàn bộ số tiền bảo hành ĐÃ GIẢI TỎA sẽ được kết chuyển gộp vào Lợi Nhuận Ròng Năm của doanh nghiệp?")) {
      return;
    }
    setIsProcessing(true);
    const res = await settleUnlockedWarrantyProvisionsYearEnd();
    setIsProcessing(false);
    setActionNotice(`Tất toán thành công: Đã kết chuyển ${res.settledTotal.toLocaleString("vi-VN")}₫ từ ${res.settledCount} khoản bảo hành đã hết hạn vào Lợi Nhuận Ròng Năm!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Calculations
  const stats = useMemo(() => {
    const lockedTotal = warrantyProvisions
      .filter((p) => p.status === "locked")
      .reduce((sum, p) => sum + p.provision_amount, 0);

    const unlockedTotal = warrantyProvisions
      .filter((p) => p.status === "unlocked")
      .reduce((sum, p) => sum + p.provision_amount, 0);

    const pendingTotal = warrantyProvisions
      .filter((p) => p.status === "pending_approval")
      .reduce((sum, p) => sum + p.provision_amount, 0);

    const settledTotal = warrantyProvisions
      .filter((p) => p.status === "settled")
      .reduce((sum, p) => sum + p.provision_amount, 0);

    const activeFundTotal = lockedTotal + unlockedTotal;
    const lockedPercent = activeFundTotal > 0 ? Math.round((lockedTotal / activeFundTotal) * 100) : 0;
    const unlockedPercent = activeFundTotal > 0 ? 100 - lockedPercent : 0;

    return {
      lockedTotal,
      unlockedTotal,
      pendingTotal,
      settledTotal,
      activeFundTotal,
      lockedPercent,
      unlockedPercent,
      lockedCount: warrantyProvisions.filter((p) => p.status === "locked").length,
      unlockedCount: warrantyProvisions.filter((p) => p.status === "unlocked").length,
      pendingCount: warrantyProvisions.filter((p) => p.status === "pending_approval").length,
      settledCount: warrantyProvisions.filter((p) => p.status === "settled").length,
    };
  }, [warrantyProvisions]);

  const monthlyTrendData = useMemo(() => {
    const map: Record<string, { provisioned: number; unlocked: number }> = {};
    warrantyProvisions.forEach((p) => {
      const d = new Date(p.created_at || new Date());
      if (isNaN(d.getTime())) return;
      const key = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
      if (!map[key]) map[key] = { provisioned: 0, unlocked: 0 };
      map[key].provisioned += p.provision_amount;
      if (p.status === "unlocked" || p.status === "settled") {
        map[key].unlocked += p.provision_amount;
      }
    });
    return Object.entries(map).map(([month, val]) => ({
      month,
      provisioned: val.provisioned,
      unlocked: val.unlocked,
    }));
  }, [warrantyProvisions]);

  const filteredList = useMemo(() => {
    return warrantyProvisions.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [warrantyProvisions, statusFilter]);

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base">✓</span>
            <span>{actionNotice}</span>
          </div>
          <button type="button" onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            ✕
          </button>
        </div>
      )}

      {/* Admin Suggestion Notice Banner for Matured Warranties */}
      {stats.unlockedTotal > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border-2 border-emerald-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              💡
            </div>
            <div className="text-xs text-emerald-950 space-y-1">
              <div className="font-black text-sm text-emerald-900">
                THÔNG BÁO GIẢI TỎA QUỸ BẢO HÀNH (HẾT HẠN BẢO HÀNH)
              </div>
              <p className="leading-relaxed">
                Chúng ta có số tiền <strong className="text-emerald-800 font-mono text-sm font-black">{stats.unlockedTotal.toLocaleString("vi-VN")}₫</strong> từ <strong className="font-bold">{stats.unlockedCount} thiết bị</strong> đã hết thời hạn bảo hành. Tuy nhiên số tiền này <em>không được cộng ngay vào doanh thu tháng</em> mà được phong tỏa chờ giải tỏa tất toán gộp vào lợi nhuận cuối năm (31/12).
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={handleYearEndSettlement}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black tracking-wide whitespace-nowrap shadow-md transition-all cursor-pointer shrink-0"
            >
              ⚡ Tất Toán Kết Chuyển 31/12 →
            </button>
          )}
        </div>
      )}

      {/* VISUAL CHARTS: DONUT STATUS BREAKDOWN & MONTHLY TREND */}
      <FinanceWarrantyCharts stats={stats} monthlyTrend={monthlyTrendData} />

      {/* STATS & LIFECYCLE INFO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-12 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>1. Tỷ lệ trích lập</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">5% Lãi Ròng</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {stats.activeFundTotal.toLocaleString("vi-VN")}₫
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tự động trích 5% từ lãi gộp mỗi máy bán ra để đảm bảo ngân sách bảo hành chu đáo cho khách.
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>2. Kết chuyển 31/12</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">Cuối Năm</span>
              </div>
              <div className="text-xl font-black text-purple-900 font-mono">
                {stats.settledTotal.toLocaleString("vi-VN")}₫
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sau ngày 31/12, các khoản hết hạn bảo hành được giải tỏa gộp thẳng vào lợi nhuận ròng năm và reset = 0.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm">Vòng Đời Quỹ Bảo Hành 5%</h4>
                <p className="text-xs text-slate-400 mt-0.5">Quy trình tự động hóa minh bạch tài chính</p>
              </div>
              <button
                type="button"
                onClick={handleCheckMature}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isProcessing ? "Đang quét..." : "🔄 Quét Hạn BH Ngay"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-amber-400 font-bold font-mono">Bước 1: Trích 5%</div>
                <div className="text-[10px] text-slate-400 mt-1">Admin duyệt hoặc tự động phong tỏa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-teal-400 font-bold font-mono">Bước 2: Hết Hạn BH</div>
                <div className="text-[10px] text-slate-400 mt-1">Tự động chuyển sang Đã giải tỏa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-emerald-400 font-bold font-mono">Bước 3: 31/12</div>
                <div className="text-[10px] text-slate-400 mt-1">Gộp vào lợi nhuận ròng năm & reset</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & TABLE OF WARRANTY PROVISIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Danh Sách Khoản Trích Lập Quỹ Bảo Hành 5%
            </h3>
            <p className="text-xs text-slate-500">Đối chiếu chi tiết từng máy và tiến độ giải tỏa quỹ</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
            {[
              { id: "all", label: "Tất cả" },
              { id: "locked", label: "🔒 Đang phong tỏa" },
              { id: "unlocked", label: "🔓 Đã giải tỏa" },
              { id: "pending_approval", label: "⏳ Chờ duyệt" },
              { id: "settled", label: "✓ Đã tất toán" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={"px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer " + (statusFilter === tab.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Thiết Bị / Mã S/N</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Ngày Bán & Hạn BH</th>
                <th className="py-3 px-4 text-right">Doanh Thu</th>
                <th className="py-3 px-4 text-right">Lãi Gộp</th>
                <th className="py-3 px-4 text-right">Quỹ 5% Trích</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Không có khoản trích lập bảo hành nào trong mục này.
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => {
                  const isLocked = p.status === "locked";
                  const isUnlocked = p.status === "unlocked";
                  const isPending = p.status === "pending_approval";
                  const isSettled = p.status === "settled";

                  const saleDate = p.sale_date ? new Date(p.sale_date).toLocaleDateString("vi-VN") : "—";
                  const expiryDate = p.warranty_expiry_date ? new Date(p.warranty_expiry_date).toLocaleDateString("vi-VN") : "—";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.item_title}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          S/N: <span className="font-bold text-slate-700">{p.serial_number || "—"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{p.customer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {p.customer_code ? `#${p.customer_code} • ` : ""}{p.customer_phone || "—"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div>Bán: {saleDate}</div>
                        <div className="text-[11px] text-slate-400">Hết BH: {expiryDate} ({p.warranty_months}T)</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {p.sale_price.toLocaleString("vi-VN")}₫
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        +{p.net_profit.toLocaleString("vi-VN")}₫
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-purple-700">
                        {p.provision_amount.toLocaleString("vi-VN")}₫
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isLocked && (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                            🔒 Đang phong tỏa
                          </span>
                        )}
                        {isUnlocked && (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] animate-pulse">
                            🔓 Đã giải tỏa
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px]">
                            ⏳ Chờ Admin duyệt
                          </span>
                        )}
                        {isSettled && (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">
                            ✓ Đã kết chuyển năm
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isPending && isAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleApprove(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Duyệt trích
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {p.approved_by ? `Duyệt: ${p.approved_by}` : "Tự động"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
