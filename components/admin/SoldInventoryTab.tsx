"use client";

import React, { useState, useMemo } from "react";
import { InventoryItem } from "@/lib/supabase";

interface Props {
  soldMachines: InventoryItem[];
  onPrintLabel: (item: InventoryItem) => void;
  getRealtimeWarrantyStatus: (d?: string, m?: number) => {
    isExpired: boolean;
    isNearExpiry: boolean;
    remainingText: string;
    badgeClass: string;
    percentElapsed: number;
  };
}

export function SoldInventoryTab({ soldMachines, onPrintLabel, getRealtimeWarrantyStatus }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "near_expiry" | "expired">("all");

  const filtered = useMemo(() => {
    return soldMachines.filter((item) => {
      const st = getRealtimeWarrantyStatus(item.handover_date, item.warranty_months);
      if (filter === "active" && st.isExpired) return false;
      if (filter === "near_expiry" && (!st.isNearExpiry || st.isExpired)) return false;
      if (filter === "expired" && !st.isExpired) return false;

      if (q.trim()) {
        const query = q.trim().toLowerCase();
        const m = (item.device_model || item.model || "").toLowerCase().includes(query);
        const sn = (item.serial_number || item.service_tag || "").toLowerCase().includes(query);
        const c = (item.customer_name || "").toLowerCase().includes(query);
        const cc = (item.customer_code || "").toLowerCase().includes(query);
        const p = (item.customer_phone || "").toLowerCase().includes(query);
        const s = (item.sold_by || "").toLowerCase().includes(query);
        if (!m && !sn && !c && !cc && !p && !s) return false;
      }
      return true;
    });
  }, [soldMachines, filter, q, getRealtimeWarrantyStatus]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo Tên máy, S/N, Khách hàng, Mã KH..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "✓ Còn BH" },
            { id: "near_expiry", label: "⚠️ Sắp hết hạn" },
            { id: "expired", label: "✕ Đã hết hạn" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as "all" | "active" | "near_expiry" | "expired")}
              className={"px-3 py-1.5 rounded-lg transition-colors cursor-pointer " + (filter === tab.id ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Tên Máy & Cấu Hình</th>
                <th className="py-3 px-4">Số Serial (S/N)</th>
                <th className="py-3 px-4">Người Bán</th>
                <th className="py-3 px-4">Khách Hàng & Mã KH</th>
                <th className="py-3 px-4">Ngày Bán</th>
                <th className="py-3 px-4">Bảo Hành Còn Lại (Realtime)</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4 text-center">In Tem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    Không tìm thấy máy đã bán nào.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const w = getRealtimeWarrantyStatus(item.handover_date, item.warranty_months);
                  const dateStr = item.handover_date ? new Date(item.handover_date).toLocaleDateString("vi-VN") : "—";
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.device_model || item.model}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.specs?.cpu || item.cpu || (item.brand + " " + item.form_factor)} • {item.specs?.ram || item.ram}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 select-all">
                        {item.serial_number || item.service_tag}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.sold_by || "Võ Minh Tâm (Admin)"}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.customer_name || "Khách vãng lai"}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          {item.customer_code && <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">#{item.customer_code}</span>}
                          <span>{item.customer_phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{dateStr}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-[180px]">
                          <span className={"inline-block px-2 py-0.5 rounded-full text-[11px] border " + w.badgeClass}>
                            {w.remainingText}
                          </span>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: w.percentElapsed + "%" }}
                              className={"h-full " + (w.isExpired ? "bg-red-500" : w.isNearExpiry ? "bg-amber-500" : "bg-emerald-500")}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {(item.retail_price || item.price || 0).toLocaleString("vi-VN")}₫
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onPrintLabel(item)}
                          className="px-2.5 py-1 text-purple-700 hover:bg-purple-100 rounded-lg font-bold border border-purple-200 bg-purple-50 cursor-pointer"
                        >
                          In tem
                        </button>
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
