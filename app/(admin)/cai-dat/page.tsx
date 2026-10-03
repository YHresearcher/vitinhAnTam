'use client';

import React, { useState } from 'react';
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
  Switch,
} from 'antd';

import {
  Sparkles,
  PhoneCall,
  HelpCircle,
  MessageSquareQuote,
  Save,
  Bot,
  Send,
  Radio,
  RefreshCw,
  Trash2,
  Copy,
  Bell,
  Zap,
} from 'lucide-react';

const { TextArea } = Input;

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

  // Form cấu hình hệ thống — suy ra từ store, state chỉ ghi đè khi user sửa form
  // (thay cho useEffect setState vốn gây cascading render)
  const [formDataOverride, setFormDataOverride] = useState<SystemSettings | null>(null);
  const formData = formDataOverride ?? systemSettings;
  const setFormData = (
    next: SystemSettings | ((prev: SystemSettings) => SystemSettings)
  ) =>
    setFormDataOverride((prev) =>
      typeof next === 'function' ? next(prev ?? systemSettings) : next
    );
  const [isSaving, setIsSaving] = useState(false);

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

  // Webhook & Zalo Bot states
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [isCheckingWebhook, setIsCheckingWebhook] = useState(false);
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false);
  const [webhookInfoModalOpen, setWebhookInfoModalOpen] = useState(false);
  const [webhookInfoData, setWebhookInfoData] = useState<unknown>(null);

  const getSystemWebhookUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/webhook/zalo`;
    }
    return 'https://vitinhantham.vn/api/webhook/zalo';
  };

  // Kiểm tra & chẩn đoán chi tiết Zalo Bot Token (định dạng <id>:<secret>)
  const validateBotTokenFormat = (): string | null => {
    const raw = formData.zaloBotToken || '';
    const token = raw.trim();
    if (!token) return null;
    if (/^https?:\/\//i.test(token)) {
      return 'Bạn đang dán cả URL vào ô Token — hãy chỉ dán Token dạng <id>:<secret> (xem tại bot.zapps.vn/docs/create-bot/).';
    }
    if (token.startsWith('bot') && token.slice(3).includes(':')) {
      return 'Token có tiền tố "bot" ở đầu — hãy bỏ phần "bot", chỉ giữ <id>:<secret>.';
    }
    if (!token.includes(':')) {
      return `Token thiếu dấu ":" (chuỗi ${token.length} ký tự, không có dấu ":") — cần dạng <id>:<secret>. Copy lại toàn bộ Token từ trang tạo bot.`;
    }
    const pre = token.split(':', 1)[0];
    if (!/^\d+$/.test(pre)) {
      return `Phần trước dấu ":" phải là SỐ (id bot) — hiện tại là "${pre.slice(0, 24)}". Copy lại đúng Token từ trang tạo bot.`;
    }
    if (/\s/.test(token)) {
      return 'Token có khoảng trắng ở giữa — hãy copy lại cả chuỗi liền mạch.';
    }
    if (/[/?#]/.test(token)) {
      return 'Token chứa ký tự / ? # — sẽ làm hỏng URL gọi API. Hãy lấy lại Token từ trang tạo bot.';
    }
    return null;
  };

  const handleCopyWebhookUrl = () => {
    const url = getSystemWebhookUrl();
    navigator.clipboard.writeText(url);
    message.success('Đã sao chép Webhook URL vào bộ nhớ tạm!');
  };

  const handleTestWebhook = async () => {
    if (!formData.zaloBotToken?.trim()) {
      message.error('Vui lòng nhập Zalo Bot Token trước khi gửi thử nghiệm!');
      return;
    }
    if (!formData.zaloDefaultChatId?.trim()) {
      message.error('Vui lòng nhập Chat ID nhận tin nhắn!');
      return;
    }
    const tokenFormatError = validateBotTokenFormat();
    if (tokenFormatError) {
      message.error(tokenFormatError);
      return;
    }

    setIsTestingWebhook(true);
    try {
      // Tự động lưu cấu hình trước khi test
      await updateSystemSettings(formData);
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: formData.zaloDefaultChatId?.trim(),
          token: formData.zaloBotToken?.trim(),
          apiBaseUrl: formData.botApiBaseUrl?.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        message.success('Đã gửi tin nhắn thử nghiệm thành công! Vui lòng kiểm tra tin nhắn Bot.');
      } else {
        message.error(`Gửi tin nhắn thất bại: ${data.error || 'Vui lòng kiểm tra lại Token & Chat ID'}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      message.error(`Lỗi khi gửi test: ${errMsg}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSetWebhook = async () => {
    if (!formData.zaloBotToken?.trim()) {
      message.error('Vui lòng nhập Bot Token!');
      return;
    }
    const tokenFormatError = validateBotTokenFormat();
    if (tokenFormatError) {
      message.error(tokenFormatError);
      return;
    }
    setIsSettingWebhook(true);
    try {
      await updateSystemSettings(formData);
      const webhookUrl = getSystemWebhookUrl();
      const res = await fetch('/api/webhook/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          webhookUrl,
          secretToken: formData.zaloBotSecretToken?.trim(),
          token: formData.zaloBotToken?.trim(),
          apiBaseUrl: formData.botApiBaseUrl?.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        message.success('Đã đăng ký Webhook URL với Bot Platform thành công!');
      } else {
        message.error(`Đăng ký Webhook thất bại: ${data.error}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      message.error(`Lỗi thiết lập: ${errMsg}`);
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleGetWebhookInfo = async () => {
    if (!formData.zaloBotToken?.trim()) {
      message.error('Vui lòng nhập Bot Token!');
      return;
    }
    const tokenFormatError = validateBotTokenFormat();
    if (tokenFormatError) {
      message.error(tokenFormatError);
      return;
    }
    setIsCheckingWebhook(true);
    try {
      await updateSystemSettings(formData);
      const res = await fetch('/api/webhook/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'info',
          token: formData.zaloBotToken?.trim(),
          apiBaseUrl: formData.botApiBaseUrl?.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setWebhookInfoData(data.info);
        setWebhookInfoModalOpen(true);
      } else {
        message.error(`Không thể lấy thông tin Webhook: ${data.error}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      message.error(`Lỗi kiểm tra: ${errMsg}`);
    } finally {
      setIsCheckingWebhook(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!formData.zaloBotToken?.trim()) {
      message.error('Vui lòng nhập Bot Token!');
      return;
    }
    const tokenFormatError = validateBotTokenFormat();
    if (tokenFormatError) {
      message.error(tokenFormatError);
      return;
    }
    setIsDeletingWebhook(true);
    try {
      const res = await fetch('/api/webhook/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          token: formData.zaloBotToken?.trim(),
          apiBaseUrl: formData.botApiBaseUrl?.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        message.success('Đã hủy đăng ký Webhook trên Bot Platform!');
      } else {
        message.error(`Hủy Webhook thất bại: ${data.error}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      message.error(`Lỗi hủy: ${errMsg}`);
    } finally {
      setIsDeletingWebhook(false);
    }
  };


  const handleChange = (field: keyof SystemSettings, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
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
          // TAB 1: THƯƠNG HIỆU & SLOGAN
          {
            key: 'branding',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-[#C0392B]">
                <Sparkles className="w-4 h-4 text-[#C0392B]" />
                <span>Thương Hiệu &amp; Slogan</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Xem trước Logo & Nhận diện */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6E5D53] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#C0392B]" />
                        Xem trước Nhận diện Thương hiệu
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-[#E8E2D9] flex items-center justify-center min-h-[90px]">
                      <div className="flex items-center gap-3.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/header/logo.png"
                          alt="Logo Vi Tính An Tâm"
                          className="h-14 sm:h-18 w-auto max-h-20 max-w-[120px] sm:max-w-[160px] object-contain"
                        />
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

                  {/* Nút lưu riêng của tab */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold h-9 px-6 rounded-lg text-xs"
                    >
                      Lưu Cấu Hình Thương Hiệu
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
                          Số điện thoại Zalo chính (Hotline) *
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

                  
                  {/* QUẢN LÝ 3 SỐ ĐIỆN THOẠI WIDGET NHẮN ZALO */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0068FF] flex items-center gap-1.5">
                          <span>3 SỐ ĐIỆN THOẠI WIDGET NHẮN ZALO TRÊN TRANG CHỦ</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Khi khách hàng bấm vào nút Zalo tròn trên website, hệ thống sẽ mở danh sách 3 số này để khách chọn người hỗ trợ.
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Admin tùy chỉnh
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {([0, 1, 2]).map((idx) => {
                        const contacts = formData.zaloContacts || [
                          { id: 'zalo-1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng & cấu hình máy' },
                          { id: 'zalo-2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng & bảo hành' },
                          { id: 'zalo-3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ khẩn cấp & key bản quyền' },
                        ];
                        const contact = contacts[idx] || { id: `zalo-${idx+1}`, name: `Kỹ Thuật ${idx+1}`, phone: '', role: '' };

                        return (
                          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-[#0068FF] uppercase">
                                Hotline Zalo #{idx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                zalo.me/{contact.phone || '...'}
                              </span>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Số điện thoại Zalo *
                              </label>
                              <input
                                type="text"
                                required
                                value={contact.phone}
                                onChange={(e) => {
                                  const newPhone = e.target.value.trim();
                                  const nextContacts = [...(formData.zaloContacts || [
                                    { id: 'zalo-1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng & cấu hình máy' },
                                    { id: 'zalo-2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng & bảo hành' },
                                    { id: 'zalo-3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ khẩn cấp & key bản quyền' },
                                  ])];
                                  nextContacts[idx] = { ...contact, phone: newPhone };
                                  setFormData((prev) => ({ ...prev, zaloContacts: nextContacts }));
                                }}
                                placeholder="VD: 123456..."
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#0068FF] focus:outline-none focus:border-[#0068FF] bg-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Tên hiển thị
                              </label>
                              <input
                                type="text"
                                value={contact.name}
                                onChange={(e) => {
                                  const nextContacts = [...(formData.zaloContacts || [
                                    { id: 'zalo-1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng & cấu hình máy' },
                                    { id: 'zalo-2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng & bảo hành' },
                                    { id: 'zalo-3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ khẩn cấp & key bản quyền' },
                                  ])];
                                  nextContacts[idx] = { ...contact, name: e.target.value };
                                  setFormData((prev) => ({ ...prev, zaloContacts: nextContacts }));
                                }}
                                placeholder="VD: Kỹ Thuật 1"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0068FF] bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Phụ trách / Nhiệm vụ
                              </label>
                              <input
                                type="text"
                                value={contact.role || ''}
                                onChange={(e) => {
                                  const nextContacts = [...(formData.zaloContacts || [
                                    { id: 'zalo-1', name: 'Kỹ Thuật 1', phone: '123456', role: 'Tư vấn bán hàng & cấu hình máy' },
                                    { id: 'zalo-2', name: 'Kỹ Thuật 2', phone: '345678', role: 'Hỗ trợ phần cứng & bảo hành' },
                                    { id: 'zalo-3', name: 'Kỹ Thuật 3', phone: '678910', role: 'Cứu hộ khẩn cấp & key bản quyền' },
                                  ])];
                                  nextContacts[idx] = { ...contact, role: e.target.value };
                                  setFormData((prev) => ({ ...prev, zaloContacts: nextContacts }));
                                }}
                                placeholder="VD: Tư vấn bán hàng..."
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-[#0068FF] bg-white"
                              />
                            </div>
                          </div>
                        );
                      })}
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
          // TAB: TÍCH HỢP WEBHOOK & ZALO BOT
          {
            key: 'webhook_zalo',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-[#0068FF]">
                <Bot className="w-4 h-4 text-[#0068FF]" />
                <span>Tích Hợp Webhook &amp; Zalo Bot</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs space-y-6">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Mục 1: Webhook Endpoint URL của hệ thống */}
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                        <h3 className="text-xs sm:text-sm font-bold text-blue-900 uppercase">
                          Webhook Receiver Endpoint (Điểm Tiếp Nhận Sự Kiện)
                        </h3>
                      </div>
                      <Tag color="blue" className="font-mono text-[11px] w-fit">
                        Sẵn sàng nhận HTTP POST
                      </Tag>
                    </div>

                    <p className="text-xs text-blue-800 leading-relaxed">
                      Sử dụng URL này để dán vào cấu hình Webhook trên <strong>Zalo Bot Platform</strong>, <strong>Zalo OA</strong> hoặc hệ thống webhook bên thứ ba (n8n, Zapier, Make).
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <div className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 flex items-center justify-between overflow-x-auto shadow-inner">
                        <span>{getSystemWebhookUrl()}</span>
                      </div>
                      <Button
                        type="primary"
                        icon={<Copy className="w-3.5 h-3.5" />}
                        onClick={handleCopyWebhookUrl}
                        className="bg-[#0068FF] hover:bg-[#0052cc] text-white font-semibold text-xs h-9 px-4 shrink-0"
                      >
                        Sao chép Webhook URL
                      </Button>
                    </div>
                  </div>

                  {/* Mục 2: Cấu hình Bot API Provider & Xác thực */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#0068FF]" />
                      1. Cấu Hình Nền Tảng Bot & Xác Thực
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nền tảng Zalo Bot (duy nhất) */}
                      <div className="sm:col-span-2 p-3.5 bg-[#0068FF]/5 border border-[#0068FF]/20 rounded-xl">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nền Tảng Bot: Zalo Bot API (bot-api.zapps.me)
                        </label>
                        <span className="text-[11px] text-slate-600 block leading-relaxed">
                          Hệ thống chỉ tích hợp Zalo Bot (theo SDK python-zalo-bot). Tạo bot & lấy Token tại{' '}
                          <a
                            href="https://bot.zapps.vn/docs/create-bot/"
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-[#0068FF] font-semibold"
                          >
                            bot.zapps.vn/docs/create-bot
                          </a>
                          . Các API sử dụng: sendMessage, setWebhook, getWebhookInfo, deleteWebhook.
                        </span>
                      </div>

                      {/* Bot Token / Access Token */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Zalo Bot Token *
                        </label>
                        <Input.Password
                          value={formData.zaloBotToken || ''}
                          onChange={(e) => handleChange('zaloBotToken', e.target.value)}
                          placeholder="VD: 1234567890123:AbCdEf..."
                          className="w-full rounded-lg text-xs font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Lấy Zalo Bot Token tại https://bot.zapps.vn/docs/create-bot/ — định dạng &lt;id&gt;:&lt;secret&gt;.
                        </span>
                      </div>

                      {/* Chat ID / User ID */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Chat ID nhận tin nhắn *
                        </label>
                        <Input
                          value={formData.zaloDefaultChatId || ''}
                          onChange={(e) => handleChange('zaloDefaultChatId', e.target.value)}
                          placeholder="VD: 1234567890123"
                          className="w-full rounded-lg text-xs font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          ID người/nhóm nhận thông báo — lấy từ update.message.chat.id khi nhắn cho bot, hoặc lệnh /id.
                        </span>
                      </div>

                      {/* Zalo Bot API Base URL */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Zalo Bot API Base URL (để trống = bot-api.zapps.me)
                        </label>
                        <Input
                          value={formData.botApiBaseUrl || ''}
                          onChange={(e) => handleChange('botApiBaseUrl', e.target.value)}
                          placeholder="https://bot-api.zapps.me"
                          className="w-full rounded-lg text-xs font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Chỉ chỉnh khi Zalo thay đổi endpoint hoặc bạn dùng proxy riêng.
                        </span>
                      </div>

                      {/* Secret Token */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Secret Token Bảo Vệ Webhook
                        </label>
                        <Input
                          value={formData.zaloBotSecretToken || ''}
                          onChange={(e) => handleChange('zaloBotSecretToken', e.target.value)}
                          placeholder="VD: an_tam_secret_key_2026"
                          className="w-full rounded-lg text-xs font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Khớp với header bảo mật <code>X-Telegram-Bot-Api-Secret-Token</code> (hoặc <code>X-Bot-Token</code>) khi Zalo gửi webhook.
                        </span>
                      </div>

                      {/* Custom Webhook URL */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Custom Webhook Song Song (n8n, Zapier, Discord, Make)
                        </label>
                        <Input
                          value={formData.customWebhookUrl || ''}
                          onChange={(e) => handleChange('customWebhookUrl', e.target.value)}
                          placeholder="VD: https://n8n.example.com/webhook/vitinh-antam"
                          className="w-full rounded-lg text-xs font-mono"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Tự động bắn JSON sự kiện đến hệ thống thứ 2 nếu có.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mục 3: Bộ công tắc kích hoạt sự kiện tự động (Triggers) */}
                  <div className="pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      2. Kích Hoạt Thông Báo Tự Động (Event Triggers)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">🚨 Đặt lịch dịch vụ tận nơi mới</div>
                          <div className="text-[11px] text-slate-500">Khách gửi form đặt lịch từ trang /dat-lich</div>
                        </div>
                        <Switch
                          checked={formData.notifyOnNewBooking !== false}
                          onChange={(checked) => setFormData((prev) => ({ ...prev, notifyOnNewBooking: checked }))}
                        />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">🛒 Đơn hàng website mới</div>
                          <div className="text-[11px] text-slate-500">Khách đặt hàng sản phẩm online</div>
                        </div>
                        <Switch
                          checked={formData.notifyOnNewOrder !== false}
                          onChange={(checked) => setFormData((prev) => ({ ...prev, notifyOnNewOrder: checked }))}
                        />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">🛠️ Phiếu sửa chữa mới</div>
                          <div className="text-[11px] text-slate-500">Tiếp nhận máy sửa chữa tại quầy</div>
                        </div>
                        <Switch
                          checked={formData.notifyOnNewTicket !== false}
                          onChange={(checked) => setFormData((prev) => ({ ...prev, notifyOnNewTicket: checked }))}
                        />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">🔑 Yêu cầu cấp key bản quyền</div>
                          <div className="text-[11px] text-slate-500">Nhân viên gửi yêu cầu cấp license key</div>
                        </div>
                        <Switch
                          checked={formData.notifyOnKeyRequest !== false}
                          onChange={(checked) => setFormData((prev) => ({ ...prev, notifyOnKeyRequest: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mục 4: Bảng thao tác nhanh & Kiểm tra kết nối Zalo Bot */}
                  <div className="pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      3. Bảng Điều Khiển Hành Động Nhanh (Bot Action Center)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <Button
                        type="primary"
                        icon={<Send className="w-3.5 h-3.5" />}
                        loading={isTestingWebhook}
                        onClick={handleTestWebhook}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                      >
                        Gửi Tin Nhắn Test
                      </Button>

                      <Button
                        icon={<Zap className="w-3.5 h-3.5 text-blue-600" />}
                        loading={isSettingWebhook}
                        onClick={handleSetWebhook}
                        className="font-semibold h-9 text-xs border-blue-300 text-blue-700 hover:border-blue-500"
                      >
                        Đăng Ký setWebhook
                      </Button>

                      <Button
                        icon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
                        loading={isCheckingWebhook}
                        onClick={handleGetWebhookInfo}
                        className="font-semibold h-9 text-xs border-slate-300 text-slate-700 hover:border-slate-500"
                      >
                        Xem Trạng Thái Info
                      </Button>

                      <Popconfirm
                        title="Hủy đăng ký Webhook"
                        description="Bạn có chắc chắn muốn hủy đăng ký Webhook trên Bot Platform?"
                        onConfirm={handleDeleteWebhook}
                        okText="Hủy Webhook"
                        cancelText="Đóng"
                        okType="danger"
                      >
                        <Button
                          danger
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          loading={isDeletingWebhook}
                          className="font-semibold h-9 text-xs"
                        >
                          Hủy deleteWebhook
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>

                  {/* Hộp hướng dẫn lấy Token & Chat ID siêu tốc */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>💡 Hướng dẫn tạo Bot nhận thông báo tức thì trong 1 phút (Miễn phí 100%):</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900 pl-1 leading-relaxed">
                      <li>
                        <strong>Bước 1 (Lấy Bot Token):</strong> Mở app Telegram, tìm kiếm <code>@BotFather</code> &rarr; Gửi <code>/newbot</code> &rarr; Làm theo hướng dẫn để đặt tên bot &rarr; Copy chuỗi Token có dạng <code>7123456789:AA...</code> dán vào ô <strong>Token</strong> ở trên.
                      </li>
                      <li>
                        <strong>Bước 2 (Lấy Chat ID cá nhân / nhóm):</strong> Tìm kiếm <code>@userinfobot</code> trên Telegram &rarr; Gửi tin nhắn bất kỳ &rarr; Bot sẽ trả về <strong>Id</strong> của bạn (VD: <code>123456789</code>). Dán số này vào ô <strong>Chat ID</strong>.
                      </li>
                      <li>
                        <strong>Bước 3 (Nhận tin nhắn):</strong> Mở cuộc trò chuyện với Bot của bạn trên Telegram và nhấn nút <strong>Start</strong> (bắt buộc để bot có quyền gửi tin).
                      </li>
                      <li>
                        <strong>Bước 4 (Thử nghiệm):</strong> Bấm nút <strong>&quot;Gửi Tin Nhắn Test&quot;</strong> ở trên để xác nhận thông báo hoạt động thành công!
                      </li>
                    </ul>
                  </div>

                  {/* Nút lưu cấu hình */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSaving}
                      className="bg-[#0068FF] hover:bg-[#0052cc] text-white font-bold h-9 px-6 rounded-lg text-xs shadow-sm shadow-blue-500/20"
                    >
                      Lưu Cấu Hình Bot &amp; Webhook
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
                                  : u.role === 'outsourced'
                                  ? 'orange'
                                  : 'purple'
                              }
                              className="text-[10px] m-0 font-bold"
                            >
                              {u.role === 'admin'
                                ? 'ADMIN'
                                : u.role === 'technician'
                                ? 'KỸ THUẬT'
                                : u.role === 'outsourced'
                                ? 'THUÊ NGOÀI'
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
              <Input placeholder="VD: Quản lý văn phòng" />
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

      {/* Modal Xem Trạng Thái Webhook Info */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>Thông Tin Trạng Thái Webhook Từ Zalo Bot</span>
          </div>
        }
        open={webhookInfoModalOpen}
        onCancel={() => setWebhookInfoModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setWebhookInfoModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div className="pt-2 space-y-3">
          <p className="text-xs text-slate-600">
            Dữ liệu phản hồi trực tiếp từ Zalo Bot Platform API (<code>getWebhookInfo</code>):
          </p>
          <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-72 whitespace-pre-wrap">
            {JSON.stringify(webhookInfoData, null, 2)}
          </pre>
        </div>
      </Modal>

    </div>
  );
}
