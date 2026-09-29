import React from 'react';
import { Shield, Wrench, BadgeDollarSign, Handshake } from 'lucide-react';
import { RoleCardConfig } from './RoleLoginModal';

export const ROLE_CONFIGS: RoleCardConfig[] = [
  {
    role: 'admin',
    label: 'Quản Trị Viên (Admin)',
    subLabel: 'Toàn quyền cấu hình, quản lý kho, duyệt cấp key & kiểm soát tài chính',
    badge: 'Toàn quyền Quản trị',
    defaultPass: 'admin123',
    Icon: Shield,
    colorScheme: {
      borderHover: 'hover:border-[#C0392B] border-slate-200',
      bgHover: 'hover:bg-red-50/40',
      iconBg: 'bg-gradient-to-tr from-[#C0392B] to-[#E67E22] text-white shadow-red-500/25',
      badgeBg: 'bg-red-50 border-red-200',
      badgeText: 'text-[#C0392B]',
      accentBtn: 'bg-[#C0392B] hover:bg-[#A93226]',
      ringColor: 'focus:ring-[#C0392B]',
    },
  },
  {
    role: 'technician',
    label: 'Kỹ Thuật Viên (Technician)',
    subLabel: 'Tiếp nhận máy, điều phối cứu hộ tận nơi & test key bản quyền',
    badge: 'Kỹ Thuật & Sửa Chữa',
    defaultPass: 'tech123',
    Icon: Wrench,
    colorScheme: {
      borderHover: 'hover:border-emerald-600 border-slate-200',
      bgHover: 'hover:bg-emerald-50/40',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/25',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      accentBtn: 'bg-emerald-600 hover:bg-emerald-700',
      ringColor: 'focus:ring-emerald-600',
    },
  },
  {
    role: 'sales',
    label: 'Kinh Doanh & Sales',
    subLabel: 'Bán hàng, quản lý khách hàng CRM & gửi yêu cầu cấp key',
    badge: 'Bán Hàng & CSKH',
    defaultPass: 'sales123',
    Icon: BadgeDollarSign,
    colorScheme: {
      borderHover: 'hover:border-blue-600 border-slate-200',
      bgHover: 'hover:bg-blue-50/40',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/25',
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-blue-700',
      accentBtn: 'bg-blue-600 hover:bg-blue-700',
      ringColor: 'focus:ring-blue-600',
    },
  },
  {
    role: 'outsourced',
    label: 'KTV Đối Tác Ngoài',
    subLabel: 'Nhận ca sửa chữa ngoại vi & cập nhật tiến độ công việc',
    badge: 'Đối Tác Hiện Trường',
    defaultPass: 'ktv123',
    Icon: Handshake,
    colorScheme: {
      borderHover: 'hover:border-amber-600 border-slate-200',
      bgHover: 'hover:bg-amber-50/40',
      iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-500/25',
      badgeBg: 'bg-amber-50 border-amber-200',
      badgeText: 'text-amber-800',
      accentBtn: 'bg-amber-600 hover:bg-amber-700',
      ringColor: 'focus:ring-amber-600',
    },
  },
];
