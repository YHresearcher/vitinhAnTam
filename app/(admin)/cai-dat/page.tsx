'use client';

import React, { useState, useEffect } from 'react';
import { useViTinhAnTamStore, SystemSettings } from '@/lib/store';
import { FaqItem, CustomerReview } from '@/lib/mockData';
import Link from 'next/link';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Card,
  Tag,
  Space,
} from 'antd';
import { UserAccount } from '@/lib/supabase';
import {
  Upload,
  Image as ImageIcon,
  Globe,
  RotateCcw,
  Trash2,
  Eye,
  Sparkles,
  Palette,
} from 'lucide-react';

const { TextArea } = Input;

const FAVICON_PRESETS = [
  {
    name: 'Mặc định (Khiên An Tâm)',
    desc: 'Biểu tượng khiên bảo hành gốc của Vi Tính An Tâm',
    url: '/favicon.ico',
  },
  {
    name: 'Chữ [AT] Đỏ Gạch',
    desc: 'Monogram tối giản, siêu sắc nét trên thanh tab',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="%23C0392B"/><text x="32" y="42" font-family="sans-serif" font-size="28" font-weight="900" fill="white" text-anchor="middle">AT</text></svg>',
  },
  {
    name: 'Vi Mạch Công Nghệ',
    desc: 'Chipset công nghệ với gam màu Cam Cháy & Đỏ Gạch',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="%231C130E"/><rect x="16" y="16" width="32" height="32" rx="6" fill="%23D9531E"/><rect x="22" y="22" width="20" height="20" rx="3" fill="%23C0392B"/><circle cx="32" cy="32" r="5" fill="white"/></svg>',
  },
];

interface FaqFormValues {
  question: string;
  answer: string;
}

interface ReviewFormValues {
  name: string;
  role: string;
  comment: string;
  service: string;
  location?: string;
  rating?: number;
}

export default function CaiDatPage() {
  const {
    systemSettings,
    updateSystemSettings,
    canAccessSettings,
    faqs,
    addFaq,
    updateFaq,
    deleteFaq,
    reviews,
    addReview,
    deleteReview,
    users,
    changeUserPassword,
  } = useViTinhAnTamStore();

  const [formData, setFormData] = useState<SystemSettings>({
    ...systemSettings,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (systemSettings) {
      setFormData((prev) => ({
        ...prev,
        ...systemSettings,
      }));
    }
  }, [systemSettings]);

  // FAQ Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm] = Form.useForm();

  // Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm] = Form.useForm();

  // Member Password Modal states
  const [memberForPassword, setMemberForPassword] = useState<UserAccount | null>(null);
  const [memberNewPassword, setMemberNewPassword] = useState('');
  const [isChangingMemberPassword, setIsChangingMemberPassword] = useState(false);

  const handleChange = (field: keyof SystemSettings, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'faviconUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
      message.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, SVG, WebP, ICO)!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error('Kích thước ảnh vượt quá 2MB. Vui lòng chọn ảnh dung lượng nhẹ hơn!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({
          ...prev,
          [field]: result,
        }));
        message.success(`Đã tải ảnh ${field === 'logoUrl' ? 'Logo' : 'Favicon'}! Nhấn "Lưu cấu hình" để áp dụng.`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSystemSettings(formData);
    setIsSaving(false);
    message.success('Đã lưu cấu hình thông tin hệ thống thành công!');
  };

  const handleResetDefaults = () => {
    Modal.confirm({
      title: 'Xác nhận đặt lại mặc định',
      content: 'Bạn có chắc chắn muốn đặt lại thông tin hệ thống về mặc định ban đầu?',
      okText: 'Đặt lại',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        const defaultData: SystemSettings = {
          logoUrl: '',
          logoDisplayMode: 'icon_with_text',
          faviconUrl: '',
          brandSlogan: 'Bán bằng tâm để bạn an tâm',
          hotline: '0909.053.058',
          zaloNumber: '0909053058',
          zaloLink: 'https://zalo.me/0909053058',
          whatsappNumber: '0909053058',
          whatsappLink: 'https://wa.me/84909053058',
          email: 'lienhe@vitinhantham.vn',
          address: '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh',
          streetAddress: '52 Nguyễn Cửu Vân',
          district: 'P. Long An',
          city: 'Tây Ninh',
          serviceAreas: 'Tân An, Thủ Thừa, Châu Thành, Tân Trụ',
          workingHoursWeekday: '08h00 - 17h30 (Cứu hộ ưu tiên: 17h30 - 21h00)',
          workingHoursWeekend: '08h00 - 21h00 (Cả ngày)',
          primeHours: '17:30 - 21:00',
          footerAbout: 'Chuyên cung cấp PC/laptop tuyển chọn nồi đồng cối đá Dell, HP, ThinkPad & dịch vụ cứu hộ, bảo hành hỏa tốc trong 2 giờ (<5km Tân An).',
          footerCopyright: `© ${new Date().getFullYear()} Vi Tính An Tâm (vitinhantham.vn) - Bán bằng tâm để bạn an tâm.`,
          storeName: 'Vi Tính An Tâm',
        };
        setFormData(defaultData);
        updateSystemSettings(defaultData);
        message.success('Đã đặt lại cấu hình mặc định!');
      },
    });
  };

  // FAQ handlers
  const handleOpenFaqModal = (faq?: FaqItem) => {
    if (faq) {
      setEditingFaq(faq);
      faqForm.setFieldsValue({
        question: faq.question,
        answer: faq.answer,
      });
    } else {
      setEditingFaq(null);
      faqForm.resetFields();
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (values: FaqFormValues) => {
    if (editingFaq) {
      await updateFaq(editingFaq.id, {
        question: values.question,
        answer: values.answer,
      });
      message.success('Đã cập nhật câu hỏi FAQ!');
    } else {
      await addFaq({
        question: values.question,
        answer: values.answer,
        icon: 'HelpCircle',
      });
      message.success('Đã thêm câu hỏi FAQ mới!');
    }
    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = async (id: string) => {
    await deleteFaq(id);
    message.success('Đã xóa câu hỏi FAQ!');
  };

  // Review handlers
  const handleOpenReviewModal = () => {
    reviewForm.resetFields();
    reviewForm.setFieldsValue({ rating: 5 });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (values: ReviewFormValues) => {
    await addReview({
      name: values.name,
      role: values.role,
      comment: values.comment,
      service: values.service,
      location: values.location || 'Long An - Tây Ninh',
      rating: values.rating || 5,
    });
    message.success('Đã thêm đánh giá khách hàng mới!');
    setIsReviewModalOpen(false);
  };

  const handleSaveMemberPassword = async () => {
    if (!memberForPassword) return;
    if (!memberNewPassword.trim() || memberNewPassword.trim().length < 4) {
      message.error('Mật khẩu phải có tối thiểu 4 ký tự!');
      return;
    }
    setIsChangingMemberPassword(true);
    const ok = await changeUserPassword(memberForPassword.id, memberNewPassword.trim());
    setIsChangingMemberPassword(false);
    if (ok) {
      message.success(`Đã đổi mật khẩu thành công cho ${memberForPassword.name}!`);
      setMemberForPassword(null);
      setMemberNewPassword('');
    } else {
      message.error('Không thể cập nhật mật khẩu.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    await deleteReview(id);
    message.success('Đã xóa phản hồi của khách hàng!');
  };

  if (!canAccessSettings()) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm mt-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-3">
          Bảo Mật Hệ Thống
        </span>
        <h2 className="text-lg font-bold text-slate-900 mb-1">YÊU CẦU QUYỀN QUẢN TRỊ VIÊN (ADMIN)</h2>
        <p className="text-xs text-slate-600 mb-4">
          Chỉ tài khoản Admin mới có quyền điều chỉnh số hotline, thông tin Zalo, quản lý FAQ và đánh giá khách hàng.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
        >
          ← Về Bảng Điều Khiển
        </Link>
      </div>
    );
  }

  // Columns for FAQ Table
  const faqColumns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      render: (text: string) => (
        <span className="font-semibold text-slate-900 text-xs sm:text-sm">{text}</span>
      ),
    },
    {
      title: 'Câu trả lời giải thích',
      dataIndex: 'answer',
      key: 'answer',
      render: (text: string) => (
        <p className="text-xs text-slate-600 max-w-xl line-clamp-3 leading-relaxed">{text}</p>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: FaqItem) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => handleOpenFaqModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa câu hỏi này?"
            onConfirm={() => handleDeleteFaq(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columns for Review Table
  const reviewColumns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, record: CustomerReview) => (
        <div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">{record.name}</div>
          <div className="text-[11px] text-slate-500">{record.role}</div>
          <Tag color="blue" className="mt-1 text-[10px]">
            {record.location}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Dịch vụ / Thiết bị',
      dataIndex: 'service',
      key: 'service',
      render: (text: string) => <span className="text-xs font-semibold text-blue-700">{text}</span>,
    },
    {
      title: 'Nội dung nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      render: (text: string, record: CustomerReview) => (
        <div className="space-y-1">
          <div className="flex items-center gap-0.5 text-amber-500 text-sm">
            {Array.from({ length: record.rating || 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-lg">{text}</p>
        </div>
      ),
    },
    {
      title: 'Xóa',
      key: 'action',
      width: 80,
      render: (_: unknown, record: CustomerReview) => (
        <Popconfirm
          title="Xác nhận xóa"
          description="Bạn có chắc chắn muốn xóa đánh giá này?"
          onConfirm={() => handleDeleteReview(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
        >
          <Button size="small" danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cấu hình hệ thống
          </h1>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs
        defaultActiveKey="branding"
        type="card"
        items={[
          {
            key: 'branding',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-[#C0392B]">
                <Palette className="w-4 h-4 text-[#C0392B]" />
                <span>Nhận Diện (Logo &amp; Favicon)</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs">
                <form onSubmit={handleSubmitSettings} className="space-y-6">
                  {/* PHẦN 1: LIVE PREVIEWS */}
                  <div>
                    <div className="border-b border-slate-100 pb-2 mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#C0392B]" />
                        Xem trước trực quan
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Live Header Preview - Light Mode */}
                      <div className="rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] p-4 flex flex-col justify-between shadow-xs">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5D53] mb-3 flex items-center justify-between">
                          <span>Thanh Điều Hướng Website (Header)</span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#E8E2D9] font-medium text-slate-600">
                            Desktop / Mobile
                          </span>
                        </div>
                        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-[#E8E2D9] flex items-center justify-between shadow-2xs">
                          {/* Live Logo Render */}
                          <div className="flex items-center gap-2.5">
                            {formData.logoUrl ? (
                              formData.logoDisplayMode === 'image_only' ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={formData.logoUrl}
                                  alt="Logo Preview"
                                  className="h-9 w-auto max-h-10 max-w-[190px] object-contain"
                                />
                              ) : (
                                <div className="relative w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0 bg-white/40 p-0.5 border border-[#C0392B]/20 shadow-xs">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={formData.logoUrl}
                                    alt="Logo Preview"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )
                            ) : (
                              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#C0392B] to-[#D9531E] flex items-center justify-center shadow-md shadow-[#C0392B]/20 shrink-0">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="w-5 h-5 text-white"
                                >
                                  <path
                                    d="M12 2l7 3.5v5.5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5.5L12 2z"
                                    fill="currentColor"
                                    fillOpacity="0.15"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M9 12l2 2 4-4"
                                    stroke="currentColor"
                                    strokeWidth="2.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            )}

                            {formData.logoDisplayMode !== 'image_only' && (
                              <div className="flex flex-col leading-none">
                                <div className="flex items-center gap-1">
                                  <span className="font-black text-sm tracking-tight text-[#2B1810]">
                                    {formData.storeName ? formData.storeName.split(' ')[0] : 'VI TÍNH'}
                                  </span>
                                  <span className="font-black text-sm tracking-tight text-[#C0392B]">
                                    {formData.storeName ? formData.storeName.split(' ').slice(1).join(' ') : 'AN TÂM'}
                                  </span>
                                </div>
                                <span className="text-[9px] font-semibold tracking-wider uppercase mt-0.5 text-[#6E5D53]">
                                  {formData.brandSlogan || 'Bán bằng tâm để bạn an tâm'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Demo Nav items */}
                          <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-500">
                            <span className="px-2 py-1 text-[#C0392B] font-bold">Trang chủ</span>
                            <span className="px-2 py-1">Sản phẩm</span>
                            <span className="px-2 py-1">Đặt lịch</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Browser Tab Preview */}
                      <div className="rounded-xl border border-slate-700 bg-[#1E1F22] p-4 flex flex-col justify-between shadow-xs text-white">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                          <span>Tab Trình Duyệt Web (Favicon Browser Tab)</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                            Chrome / Safari / Edge
                          </span>
                        </div>
                        <div className="bg-[#2B2D30] rounded-t-xl px-3 pt-2 pb-1.5 flex items-center gap-2 border-b border-black/40">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1F22] rounded-t-lg text-xs text-slate-200 border-t-2 border-[#C0392B] shadow-inner max-w-xs flex-1 truncate">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.faviconUrl || '/favicon.ico'}
                              alt="Favicon"
                              className="w-4 h-4 object-contain shrink-0 rounded-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/favicon.ico';
                              }}
                            />
                            <span className="truncate text-[11px] font-medium text-slate-200">
                              {formData.storeName || 'Vi tính An Tâm'} - {formData.brandSlogan || 'Bán bằng tâm để bạn an tâm'}
                            </span>
                            <span className="ml-auto text-slate-500 hover:text-white text-xs pl-1 cursor-default">×</span>
                          </div>
                          <span className="text-slate-500 text-xs px-1 cursor-default">+</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PHẦN 2: CẤU HÌNH LOGO */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#C0392B]" />
                      Logo Website
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {/* Upload File Logo */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Tải ảnh từ máy tính
                        </label>
                        <div className="relative border-2 border-dashed border-slate-300 hover:border-[#C0392B] bg-white rounded-xl p-4 text-center transition-colors">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleFileUpload(e, 'logoUrl')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Chọn tệp ảnh logo"
                          />
                          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                            <Upload className="w-5 h-5 text-[#C0392B]" />
                            <span className="text-xs font-bold text-slate-800">
                              Chọn ảnh logo
                            </span>
                            <span className="text-[11px] text-slate-400">
                              PNG, SVG, JPG, WebP (&lt;2MB)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* URL Input & Mode */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Đường dẫn ảnh (URL)
                        </label>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="https://... hoặc /images/..."
                            value={formData.logoUrl || ''}
                            onChange={(e) => handleChange('logoUrl', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#C0392B] bg-white font-mono"
                          />

                          {/* Display Mode */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Kiểu hiển thị:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleChange('logoDisplayMode', 'icon_with_text')}
                                className={`px-3 py-2 text-left rounded-lg border text-xs transition-all ${
                                  formData.logoDisplayMode !== 'image_only'
                                    ? 'border-[#C0392B] bg-red-50/50 text-[#C0392B] font-bold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold">Biểu tượng + Tên &amp; Slogan</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleChange('logoDisplayMode', 'image_only')}
                                className={`px-3 py-2 text-left rounded-lg border text-xs transition-all ${
                                  formData.logoDisplayMode === 'image_only'
                                    ? 'border-[#C0392B] bg-red-50/50 text-[#C0392B] font-bold'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold">Chỉ dùng ảnh Logo đầy đủ</div>
                              </button>
                            </div>
                          </div>

                          {/* Clear Logo button */}
                          {formData.logoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                handleChange('logoUrl', '');
                                message.info('Đã khôi phục biểu tượng Khiên An Tâm gốc.');
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa logo tùy chỉnh, dùng lại biểu tượng gốc</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PHẦN 3: CẤU HÌNH FAVICON */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#C0392B]" />
                      Favicon Trình Duyệt
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {/* Upload File Favicon */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Tải file favicon
                        </label>
                        <div className="relative border-2 border-dashed border-slate-300 hover:border-[#C0392B] bg-white rounded-xl p-4 text-center transition-colors">
                          <input
                            type="file"
                            accept=".ico,image/png,image/svg+xml,image/webp,image/jpeg"
                            onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Chọn file favicon"
                          />
                          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                            <Upload className="w-5 h-5 text-[#C0392B]" />
                            <span className="text-xs font-bold text-slate-800">
                              Chọn file favicon (.ico, .png, .svg)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Chuẩn 32x32px hoặc 64x64px
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* URL Input & Presets */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Đường dẫn URL
                          </label>
                          <input
                            type="text"
                            placeholder="/favicon.ico hoặc URL hình ảnh"
                            value={formData.faviconUrl || ''}
                            onChange={(e) => handleChange('faviconUrl', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#C0392B] bg-white font-mono"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                            Mẫu biểu tượng có sẵn:
                          </label>
                          <div className="space-y-1.5">
                            {FAVICON_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  handleChange('faviconUrl', preset.url);
                                  message.success(`Đã áp dụng mẫu ${preset.name}!`);
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-[#C0392B] hover:bg-red-50/30 text-left transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={preset.url}
                                    alt={preset.name}
                                    className="w-5 h-5 object-contain rounded-xs shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/favicon.ico';
                                    }}
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">{preset.name}</div>
                                  </div>
                                </div>
                                <span className="text-[11px] text-[#C0392B] font-semibold">Chọn</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.faviconUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('faviconUrl', '');
                              message.info('Đã khôi phục Favicon mặc định (/favicon.ico).');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục Favicon mặc định</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PHẦN 4: TÊN THƯƠNG HIỆU & SLOGAN */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C0392B]" />
                      Thông Tin Thương Hiệu
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tên thương hiệu *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.storeName || ''}
                          onChange={(e) => handleChange('storeName', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Khẩu hiệu (Slogan) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.brandSlogan || ''}
                          onChange={(e) => handleChange('brandSlogan', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút lưu */}
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
                    <Button
                      type="default"
                      danger
                      onClick={handleResetDefaults}
                      className="text-xs"
                    >
                      Đặt lại mặc định ban đầu
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold h-10 px-6 rounded-lg text-xs sm:text-sm shadow-md shadow-[#C0392B]/20"
                    >
                      Lưu Cấu Hình Nhận Diện Thương Hiệu
                    </Button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            key: 'contacts',
            label: (
              <span className="font-bold text-xs sm:text-sm">
                Phương Tiện Liên Lạc
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs">
                <form onSubmit={handleSubmitSettings} className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-4">
                      Kênh Liên Hệ Trực Tiếp &amp; Widget
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Hotline */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số Hotline *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.hotline}
                          onChange={(e) => handleChange('hotline', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-[#C0392B] focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email tiếp nhận thông tin *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      {/* Zalo */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại Zalo kết nối *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.zaloNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange('zaloNumber', val);
                            if (val.trim()) {
                              handleChange('zaloLink', `https://zalo.me/${val.trim().replace(/\./g, '')}`);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0068FF] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Đường dẫn kết nối Zalo (Tự động cập nhật)
                        </label>
                        <input
                          type="text"
                          value={formData.zaloLink}
                          onChange={(e) => handleChange('zaloLink', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono text-blue-700 focus:outline-none focus:border-[#0068FF] bg-slate-50 focus:bg-white"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại WhatsApp *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.whatsappNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange('whatsappNumber', val);
                            if (val.trim()) {
                              const clean = val.trim().replace(/\./g, '').replace(/^0/, '84');
                              handleChange('whatsappLink', `https://wa.me/${clean}`);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#25D366] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Đường dẫn WhatsApp Chat (Tự động cập nhật)
                        </label>
                        <input
                          type="text"
                          value={formData.whatsappLink}
                          onChange={(e) => handleChange('whatsappLink', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono text-emerald-700 focus:outline-none focus:border-[#25D366] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 gap-3">
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Đặt lại mặc định
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-lg bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu Phương Tiện Liên Lạc'}
                    </button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            key: 'address',
            label: (
              <span className="font-bold text-xs sm:text-sm">
                Địa Chỉ &amp; Showroom
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs">
                <form onSubmit={handleSubmitSettings} className="space-y-6">
                  {/* Nhóm 1: Địa chỉ chi tiết */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                      Địa Chỉ Showroom &amp; Trạm Kỹ Thuật
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tên thương hiệu / Cơ sở
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.storeName}
                          onChange={(e) => handleChange('storeName', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số nhà &amp; Tên đường (Địa chỉ trụ sở) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.streetAddress}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange('streetAddress', val);
                            handleChange('address', `${val}, ${formData.district}, ${formData.city}`);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Quận / Huyện / Thành Phố Trực Thuộc
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.district}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange('district', val);
                            handleChange('address', `${formData.streetAddress}, ${val}, ${formData.city}`);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tỉnh / Thành phố
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange('city', val);
                            handleChange('address', `${formData.streetAddress}, ${formData.district}, ${val}`);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Địa chỉ đầy đủ hiển thị trên toàn trang web *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#2B1810] focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phạm vi phục vụ
                      </label>
                      <input
                        type="text"
                        value={formData.serviceAreas}
                        onChange={(e) => handleChange('serviceAreas', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Nhóm 2: Giờ phục vụ */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                      Khung Giờ Phục Vụ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Thứ 2 đến Thứ 6 (Giờ hành chính &amp; ca tối)
                        </label>
                        <input
                          type="text"
                          value={formData.workingHoursWeekday}
                          onChange={(e) => handleChange('workingHoursWeekday', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Thứ 7 &amp; Chủ Nhật (Cuối tuần)
                        </label>
                        <input
                          type="text"
                          value={formData.workingHoursWeekend}
                          onChange={(e) => handleChange('workingHoursWeekend', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#D9531E] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 3: Giới thiệu Footer */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Đoạn văn giới thiệu ngắn chân trang (Footer About)
                      </label>
                      <TextArea
                        rows={2}
                        value={formData.footerAbout}
                        onChange={(e) => handleChange('footerAbout', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 gap-3">
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Đặt lại mặc định
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-lg bg-[#D9531E] hover:bg-[#C0392B] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Địa Chỉ'}
                    </button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            key: 'faqs',
            label: (
              <span className="font-bold text-xs sm:text-sm">
                Quản Lý FAQ ({faqs.length})
              </span>
            ),
            children: (
              <Card className="rounded-2xl border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Danh Sách Câu Hỏi Thường Gặp
                    </h3>
                  </div>
                  <Button
                    type="primary"
                    onClick={() => handleOpenFaqModal()}
                    className="bg-blue-600"
                  >
                    + Thêm Câu Hỏi Mới
                  </Button>
                </div>

                <Table
                  dataSource={faqs}
                  columns={faqColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 600 }}
                />
              </Card>
            ),
          },
          {
            key: 'reviews',
            label: (
              <span className="font-bold text-xs sm:text-sm">
                Đánh Giá Khách Hàng ({reviews.length})
              </span>
            ),
            children: (
              <Card className="rounded-2xl border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Đánh Giá Khách Hàng
                    </h3>
                  </div>
                  <Button
                    type="primary"
                    onClick={handleOpenReviewModal}
                    className="bg-purple-600"
                  >
                    + Thêm Đánh Giá Mới
                  </Button>
                </div>

                <Table
                  dataSource={reviews}
                  columns={reviewColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 600 }}
                />
              </Card>
            ),
          },
          {
            key: 'security',
            label: (
              <span className="font-bold text-xs sm:text-sm">
                Bảo Mật &amp; Mật Khẩu
              </span>
            ),
            children: (
              <Card className="rounded-2xl border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Đổi Mật Khẩu Thành Viên</h3>
                  </div>
                  <Link
                    href="/thanh-vien"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 border border-blue-200 transition-colors w-fit"
                  >
                    Quản lý phân quyền chi tiết →
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${u.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">{u.name}</span>
                            <Tag
                              color={
                                u.role === 'admin'
                                    ? 'blue'
                                  : u.role === 'technician'
                                  ? 'green'
                                  : 'purple'
                              }
                              className="text-[10px] m-0 font-bold"
                            >
                              {u.role === 'admin'
                                ? 'ADMIN'
                                : u.role === 'technician'
                                ? 'KỸ THUẬT'
                                : 'KINH DOANH'}
                            </Tag>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>
                              Tên đăng nhập:{' '}
                              <strong className="font-mono text-slate-800">{u.email}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              SĐT: <span className="font-mono text-slate-700">{u.phone}</span>
                            </span>
                            <span>•</span>
                            <span>
                              Mật khẩu: <span className="font-mono text-blue-600 font-bold">••••••</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          onClick={() => {
                            setMemberForPassword(u);
                            setMemberNewPassword('');
                          }}
                          className="text-xs font-semibold hover:border-amber-500 hover:text-amber-600"
                        >
                          Đổi Mật Khẩu
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* Modal Thêm / Sửa FAQ */}
      <Modal
        title={editingFaq ? 'Chỉnh Sửa Câu Hỏi FAQ' : 'Thêm Câu Hỏi FAQ Mới'}
        open={isFaqModalOpen}
        onCancel={() => setIsFaqModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={faqForm} layout="vertical" onFinish={handleSaveFaq}>
          <Form.Item
            name="question"
            label="Tiêu đề câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <Input placeholder="VD: Chính sách kiểm tra bảo hành theo S/N máy ra sao?" />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Nội dung câu trả lời chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập câu trả lời' }]}
          >
            <TextArea rows={4} placeholder="Mô tả cụ thể và thuyết phục..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsFaqModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              Lưu Câu Hỏi
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Thêm Đánh Giá Mới */}
      <Modal
        title="Thêm Phản Hồi Khách Hàng Mới"
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleSaveReview}>
          <Form.Item
            name="name"
            label="Họ tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="VD: Anh Quốc Hoàng" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Chức danh / Nghề nghiệp"
            rules={[{ required: true, message: 'Vui lòng nhập vai trò của khách hàng' }]}
          >
            <Input placeholder="VD: Kế toán trưởng - Cty Vận Tải" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="service"
              label="Dòng máy / Dịch vụ"
              rules={[{ required: true, message: 'Vui lòng nhập dịch vụ' }]}
            >
              <Input placeholder="VD: Dell OptiPlex 7060" />
            </Form.Item>

            <Form.Item name="location" label="Khu vực">
              <Input placeholder="VD: Tân An (Long An)" />
            </Form.Item>
          </div>

          <Form.Item name="rating" label="Số sao đánh giá">
            <InputNumber min={1} max={5} className="w-full" />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Nội dung nhận xét thực tế"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
          >
            <TextArea rows={3} placeholder="Chia sẻ cảm nhận về tốc độ máy, KTV tận nơi..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsReviewModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-purple-600">
              Thêm Đánh Giá
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Đổi Mật Khẩu Thành Viên */}
      <Modal
        title={
          <div className="text-amber-700 font-bold">
            Đổi Mật Khẩu Thành Viên
          </div>
        }
        open={Boolean(memberForPassword)}
        onCancel={() => {
          setMemberForPassword(null);
          setMemberNewPassword('');
        }}
        footer={null}
        destroyOnClose
      >
        {memberForPassword && (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <strong className="text-slate-900">{memberForPassword.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tên đăng nhập (Email):</span>
                <strong className="font-mono text-slate-900">{memberForPassword.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vai trò:</span>
                <strong className="text-blue-700 uppercase">{memberForPassword.role}</strong>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Mật khẩu mới</label>
                <button
                  type="button"
                  onClick={() => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
                    let res = '';
                    for (let i = 0; i < 8; i++) {
                      res += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    setMemberNewPassword(res);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                >
                  Tạo ngẫu nhiên
                </button>
              </div>
              <Input.Password
                value={memberNewPassword}
                onChange={(e) => setMemberNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                className="font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setMemberForPassword(null);
                  setMemberNewPassword('');
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                loading={isChangingMemberPassword}
                onClick={handleSaveMemberPassword}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Cập Nhật Mật Khẩu
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
