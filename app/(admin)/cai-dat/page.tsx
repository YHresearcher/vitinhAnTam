'use client';

import React, { useState, useEffect } from 'react';
import { useViTinhAnTamStore, SystemSettings } from '@/lib/store';
import { FaqItem, CustomerReview } from '@/lib/mockData';
import { UserAccount } from '@/lib/supabase';
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
import {
  Upload,
  Globe,
  RotateCcw,
  Trash2,
  Eye,
  Sparkles,
  Palette,
  PhoneCall,
  HelpCircle,
  MessageSquareQuote,
  Save,
  CheckCircle2,
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
    desc: 'Monogram tối giản, sắc nét trên thanh tab',
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
    users,
    changeUserPassword,
    faqs,
    addFaq,
    updateFaq,
    deleteFaq,
    reviews,
    addReview,
    deleteReview,
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

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const cleanZalo = formData.zaloNumber?.trim() || '';
    const cleanWhatsapp = formData.whatsappNumber?.trim() || '';

    const payload: SystemSettings = {
      ...formData,
      zaloLink: cleanZalo ? `https://zalo.me/${cleanZalo.replace(/\./g, '')}` : formData.zaloLink,
      whatsappLink: cleanWhatsapp
        ? `https://wa.me/${cleanWhatsapp.replace(/\./g, '').replace(/^0/, '84')}`
        : formData.whatsappLink,
    };

    await updateSystemSettings(payload);
    setIsSaving(false);
    message.success('Đã lưu cấu hình hệ thống thành công!');
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
          serviceAreas: 'Khu vực địa phương & các vùng lân cận',
          workingHoursWeekday: '08h00 - 17h30 (Hỗ trợ linh hoạt: 17h30 - 21h00)',
          workingHoursWeekend: '08h00 - 21h00 (Cả ngày)',
          primeHours: '17:30 - 21:00',
          footerAbout: 'Chuyên cung cấp PC/laptop tuyển chọn Dell, HP, ThinkPad & dịch vụ hỗ trợ kỹ thuật, bảo hành nhanh chóng, tận tâm.',
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
      location: values.location || 'Địa phương',
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
    message.success('Đã xóa đánh giá!');
  };

  if (!canAccessSettings) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 mt-12 shadow-sm">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-3">
          Bảo Mật Hệ Thống
        </span>
        <h2 className="text-lg font-bold text-slate-900 mb-1">YÊU CẦU QUYỀN QUẢN TRỊ VIÊN (ADMIN)</h2>
        <p className="text-xs text-slate-600 mb-4">
          Chỉ tài khoản Admin mới có quyền điều chỉnh thông tin thương hiệu, số hotline và cấu hình hệ thống.
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
      width: '35%',
      render: (text: string) => (
        <span className="font-semibold text-slate-900 text-xs sm:text-sm">{text}</span>
      ),
    },
    {
      title: 'Câu trả lời giải thích',
      dataIndex: 'answer',
      key: 'answer',
      render: (text: string) => (
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{text}</p>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 130,
      render: (_: unknown, record: FaqItem) => (
        <Space size="small">
          <Button size="small" onClick={() => handleOpenFaqModal(record)}>
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
      width: '25%',
      render: (_: unknown, record: CustomerReview) => (
        <div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">{record.name}</div>
          <div className="text-[11px] text-slate-500">{record.role}</div>
          <Tag color="orange" className="mt-1 text-[10px]">
            {record.location}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Dịch vụ / Thiết bị',
      dataIndex: 'service',
      key: 'service',
      width: '20%',
      render: (text: string) => <span className="text-xs font-semibold text-[#C0392B]">{text}</span>,
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
          <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
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
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header gọn gàng với nút Lưu nhanh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cấu hình hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý nhận diện thương hiệu, thông tin liên hệ, câu hỏi thường gặp và phản hồi khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleResetDefaults} danger className="text-xs">
            Đặt lại mặc định
          </Button>
          <Button
            type="primary"
            icon={<Save className="w-3.5 h-3.5" />}
            loading={isSaving}
            onClick={() => handleSaveSettings()}
            className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold h-9 px-4 rounded-lg text-xs shadow-sm shadow-[#C0392B]/20"
          >
            Lưu cấu hình
          </Button>
        </div>
      </div>

      {/* Tabs Layout tinh giản thành 4 mục rõ ràng */}
      <Tabs
        defaultActiveKey="branding"
        type="card"
        items={[
          // TAB 1: NHẬN DIỆN THƯƠNG HIỆU
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
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Xem trước Logo x2 */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#C0392B]" />
                        Xem trước Logo (Hiển thị kích thước thực x2)
                      </span>
                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('logoUrl', '');
                            message.info('Đã chuyển về biểu tượng Khiên An Tâm gốc.');
                          }}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Dùng khiên gốc</span>
                        </button>
                      )}
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-[#E8E2D9] flex items-center justify-center min-h-[90px]">
                      {formData.logoDisplayMode === 'image_only' && formData.logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={formData.logoUrl}
                          alt="Logo Preview"
                          className="h-16 sm:h-20 max-h-24 w-auto max-w-[360px] sm:max-w-[480px] object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-3.5">
                          {formData.logoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={formData.logoUrl}
                              alt="Logo Icon"
                              className="h-14 sm:h-18 w-auto max-h-20 max-w-[120px] sm:max-w-[160px] object-contain"
                            />
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#C0392B] to-[#D9531E] flex items-center justify-center shadow-lg shadow-[#C0392B]/25 shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-8 h-8 sm:w-9 sm:h-9 text-white"
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
                          <div className="flex flex-col leading-none">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xl sm:text-2xl text-[#2B1810]">
                                {formData.storeName ? formData.storeName.split(' ')[0] : 'VI TÍNH'}
                              </span>
                              <span className="font-black text-xl sm:text-2xl text-[#C0392B]">
                                {formData.storeName ? formData.storeName.split(' ').slice(1).join(' ') : 'AN TÂM'}
                              </span>
                            </div>
                            <span className="text-xs sm:text-[13px] font-semibold text-[#6E5D53] tracking-wider uppercase mt-1">
                              {formData.brandSlogan || 'Bán bằng tâm để bạn an tâm'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cấu hình Logo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Tải ảnh Logo (PNG, JPG, SVG, WebP)
                      </label>
                      <div className="relative border-2 border-dashed border-slate-300 hover:border-[#C0392B] bg-slate-50/50 hover:bg-red-50/20 rounded-xl p-4 text-center transition-colors">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Chọn file ảnh logo"
                        />
                        <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                          <Upload className="w-5 h-5 text-[#C0392B]" />
                          <span className="text-xs font-bold text-slate-800">Chọn file ảnh từ máy tính</span>
                          <span className="text-[11px] text-slate-500">Hỗ trợ ảnh trong suốt PNG/SVG (tối đa 2MB)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Hoặc dán URL ảnh Logo
                        </label>
                        <input
                          type="text"
                          placeholder="https://... hoặc /images/..."
                          value={formData.logoUrl || ''}
                          onChange={(e) => handleChange('logoUrl', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Kiểu hiển thị Logo:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleChange('logoDisplayMode', 'icon_with_text')}
                            className={`p-2 text-center rounded-lg border text-xs transition-all ${
                              formData.logoDisplayMode !== 'image_only'
                                ? 'border-[#C0392B] bg-red-50/50 text-[#C0392B] font-bold'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            Biểu tượng + Tên &amp; Slogan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('logoDisplayMode', 'image_only')}
                            className={`p-2 text-center rounded-lg border text-xs transition-all ${
                              formData.logoDisplayMode === 'image_only'
                                ? 'border-[#C0392B] bg-red-50/50 text-[#C0392B] font-bold'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            Chỉ dùng hình ảnh Logo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tên thương hiệu & Slogan */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C0392B]" />
                      Tên Thương Hiệu &amp; Slogan
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
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
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
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cấu hình Favicon */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#C0392B]" />
                      Favicon Tab Trình Duyệt
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Tải file favicon (.ico, .png, .svg)
                        </label>
                        <div className="relative border-2 border-dashed border-slate-300 hover:border-[#C0392B] bg-slate-50/50 hover:bg-red-50/20 rounded-xl p-4 text-center transition-colors">
                          <input
                            type="file"
                            accept=".ico,image/png,image/svg+xml,image/webp"
                            onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Chọn file favicon"
                          />
                          <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                            <Upload className="w-5 h-5 text-[#C0392B]" />
                            <span className="text-xs font-bold text-slate-800">Chọn file favicon</span>
                            <span className="text-[11px] text-slate-500">Chuẩn 32x32px hoặc 64x64px</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Chọn mẫu có sẵn:
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
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-[#C0392B] hover:bg-red-50/20 text-left transition-colors cursor-pointer"
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
                                <div className="text-xs font-bold text-slate-800">{preset.name}</div>
                              </div>
                              <span className="text-xs text-[#C0392B] font-semibold">Chọn</span>
                            </button>
                          ))}
                        </div>
                        {formData.faviconUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('faviconUrl', '');
                              message.info('Đã khôi phục Favicon mặc định (/favicon.ico).');
                            }}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium mt-2 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục Favicon mặc định</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút lưu riêng của tab */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold h-9 px-6 rounded-lg text-xs"
                    >
                      Lưu Nhận Diện Thương Hiệu
                    </Button>
                  </div>
                </form>
              </Card>
            ),
          },

          // TAB 2: THÔNG TIN LIÊN HỆ & CỬA HÀNG (HỢP NHẤT GỌN GÀNG)
          {
            key: 'contact_store',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-slate-800">
                <PhoneCall className="w-4 h-4 text-slate-700" />
                <span>Liên Hệ &amp; Cơ Sở</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Nhóm 1: Hotline, Email, Zalo, WhatsApp */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">
                      1. Kênh Liên Lạc Trực Tiếp
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số Hotline tư vấn *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.hotline}
                          onChange={(e) => handleChange('hotline', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-bold text-[#C0392B] focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email tiếp nhận *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại Zalo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.zaloNumber}
                          onChange={(e) => handleChange('zaloNumber', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0068FF] bg-slate-50 focus:bg-white font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Tự động kết nối link chat: zalo.me/{formData.zaloNumber?.replace(/\./g, '')}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại WhatsApp
                        </label>
                        <input
                          type="text"
                          value={formData.whatsappNumber}
                          onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#25D366] bg-slate-50 focus:bg-white font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Tự động kết nối link chat: wa.me/84...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 2: Địa chỉ & Phạm vi */}
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">
                      2. Địa Chỉ &amp; Phạm Vi Phục Vụ
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Địa chỉ showroom / trạm kỹ thuật (Hiển thị website) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phạm vi hỗ trợ &amp; phục vụ
                        </label>
                        <input
                          type="text"
                          value={formData.serviceAreas}
                          onChange={(e) => handleChange('serviceAreas', e.target.value)}
                          placeholder="VD: Khu vực địa phương & các vùng lân cận"
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 3: Giờ làm việc & Giới thiệu Chân trang */}
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">
                      3. Thời Gian Làm Việc &amp; Thông Tin Chân Trang
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Thứ 2 đến Thứ 6
                        </label>
                        <input
                          type="text"
                          value={formData.workingHoursWeekday}
                          onChange={(e) => handleChange('workingHoursWeekday', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Thứ 7 &amp; Chủ Nhật
                        </label>
                        <input
                          type="text"
                          value={formData.workingHoursWeekend}
                          onChange={(e) => handleChange('workingHoursWeekend', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Đoạn giới thiệu ngắn ở chân trang (Footer About)
                        </label>
                        <TextArea
                          rows={2}
                          value={formData.footerAbout}
                          onChange={(e) => handleChange('footerAbout', e.target.value)}
                          className="rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút lưu */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold h-9 px-6 rounded-lg text-xs"
                    >
                      Lưu Thông Tin Liên Hệ &amp; Cơ Sở
                    </Button>
                  </div>
                </form>
              </Card>
            ),
          },

          // TAB 3: QUẢN LÝ FAQ
          {
            key: 'faqs',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-slate-800">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Câu Hỏi FAQ ({faqs.length})</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Danh Sách Câu Hỏi Thường Gặp
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hiển thị tại mục FAQ ở chân trang chủ để giải tỏa lo lắng của khách hàng.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    onClick={() => handleOpenFaqModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    + Thêm Câu Hỏi Mới
                  </Button>
                </div>

                <Table
                  dataSource={faqs}
                  columns={faqColumns}
                  rowKey="id"
                  pagination={{ pageSize: 6 }}
                  scroll={{ x: 600 }}
                />
              </Card>
            ),
          },

          // TAB 4: ĐÁNH GIÁ KHÁCH HÀNG
          {
            key: 'reviews',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-slate-800">
                <MessageSquareQuote className="w-4 h-4 text-purple-600" />
                <span>Đánh Giá Khách Hàng ({reviews.length})</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Đánh Giá &amp; Nhận Xét Của Khách Hàng
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hiển thị đánh giá thực tế từ người dùng trên trang chủ.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    onClick={handleOpenReviewModal}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    + Thêm Đánh Giá Mới
                  </Button>
                </div>

                <Table
                  dataSource={reviews}
                  columns={reviewColumns}
                  rowKey="id"
                  pagination={{ pageSize: 6 }}
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
                    <h3 className="text-sm font-bold text-slate-900">Quản Lý &amp; Đổi Mật Khẩu Thành Viên</h3>
                    <p className="text-xs text-slate-500">
                      Quản trị viên có quyền sửa đổi mật khẩu đăng nhập của tất cả nhân sự trong hệ thống.
                    </p>
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
          {
            key: 'key-email',
            label: (
              <span className="font-bold text-xs sm:text-sm">
                Mẫu Email Gửi Key
              </span>
            ),
            children: (
              <Card className="rounded-xl border-[#E8E2D9] shadow-xs bg-[#FFFDF9]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E8E2D9]">
                  <div>
                    <h3 className="text-sm font-black text-[#2B1810] uppercase">
                      CẤU HÌNH MẪU EMAIL BÀN GIAO KEY CHO KHÁCH
                    </h3>
                    <p className="text-xs text-[#6E5D53] mt-0.5">
                      Chỉnh sửa nội dung thư, thông tin liên hệ và xem trước giao diện thư thực tế gửi đến email khách hàng.
                    </p>
                  </div>
                  <Link
                    href="/quan-ly-key"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-bold transition-all shadow-xs w-fit uppercase"
                  >
                    ĐẾN TRANG QUẢN LÝ KHO KEY &amp; MẪU EMAIL →
                  </Link>
                </div>
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] text-xs text-[#6E5D53] leading-relaxed">
                  Hệ thống quản lý kho key và mẫu email đã được tích hợp đồng bộ tại mục <strong>Kho Key Bản Quyền</strong>. Bạn có thể chỉnh sửa nội dung mẫu, thiết lập người gửi và xem trước trực tiếp tại đó.
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
        <Form form={faqForm} layout="vertical" onFinish={handleSaveFaq} className="pt-2">
          <Form.Item
            name="question"
            label="Câu hỏi của khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi' }]}
          >
            <Input placeholder="VD: Khi máy tính gặp sự cố, An Tâm hỗ trợ kỹ thuật như thế nào?" />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Câu trả lời giải thích chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập câu trả lời' }]}
          >
            <TextArea rows={4} placeholder="Nhập câu trả lời rõ ràng, minh bạch..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsFaqModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              {editingFaq ? 'Cập Nhật' : 'Thêm Mới'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Thêm Đánh Giá Khách Hàng */}
      <Modal
        title="Thêm Đánh Giá Khách Hàng Mới"
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleSaveReview} className="pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="name"
              label="Tên khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input placeholder="VD: Anh Minh Tuấn" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Nghề nghiệp / Đơn vị"
              rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}
            >
              <Input placeholder="VD: Kế toán trưởng" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="service"
              label="Dịch vụ / Thiết bị mua"
              rules={[{ required: true, message: 'Vui lòng nhập dịch vụ' }]}
            >
              <Input placeholder="VD: Dell OptiPlex 7060" />
            </Form.Item>

            <Form.Item name="location" label="Khu vực">
              <Input placeholder="VD: Tại địa phương" />
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
            <TextArea rows={3} placeholder="Chia sẻ cảm nhận về tốc độ máy, kỹ thuật hỗ trợ..." />
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
        title="Đổi Mật Khẩu Thành Viên"
        open={Boolean(memberForPassword)}
        onCancel={() => {
          setMemberForPassword(null);
          setMemberNewPassword('');
        }}
        onOk={handleSaveMemberPassword}
        confirmLoading={isChangingMemberPassword}
        okText="Lưu Mật Khẩu Mới"
        cancelText="Hủy"
      >
        {memberForPassword && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>Thành viên: <strong className="text-slate-900">{memberForPassword.name}</strong></div>
              <div>Tên đăng nhập: <strong className="font-mono text-slate-900">{memberForPassword.email}</strong></div>
              <div>Vai trò: <strong className="text-blue-700 uppercase">{memberForPassword.role}</strong></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
              <Input.Password
                value={memberNewPassword}
                onChange={(e) => setMemberNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
