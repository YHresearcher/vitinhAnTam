'use client';

import React, { useState, useEffect } from 'react';
import { useViTinhAnTamStore, SystemSettings } from '@/lib/store';
import { FaqItem, CustomerReview } from '@/lib/mockData';
import { PaymentQrSettingsSection } from '@/components/admin/PaymentQrSettingsSection';
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
  QrCode,
  Upload,
  CreditCard,
  Check,
  Mail,
  Key,
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
    keyEmailTemplate,
    updateKeyEmailTemplate,
    faqs,
    addFaq,
    updateFaq,
    deleteFaq,
    reviews,
    addReview,
    deleteReview,
  } = useViTinhAnTamStore();

  // Form cấu hình hệ thống
  const [formDataOverride, setFormDataOverride] = useState<SystemSettings | null>(null);
  const formData = formDataOverride ?? systemSettings;
  const setFormData = (
    next: SystemSettings | ((prev: SystemSettings) => SystemSettings)
  ) =>
    setFormDataOverride((prev) =>
      typeof next === 'function' ? next(prev ?? systemSettings) : next
    );
  const [isSaving, setIsSaving] = useState(false);

  // Email template states (Chuyển từ Kho key bản quyền xuống)
  const [emailForm, setEmailForm] = useState(keyEmailTemplate);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (keyEmailTemplate) {
      setEmailForm(keyEmailTemplate);
    }
  }, [keyEmailTemplate]);

  // FAQ Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm] = Form.useForm();

  // Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm] = Form.useForm();

  // QR Code Upload State
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  const handleUploadQrImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyData = new FormData();
    bodyData.append('file', file);
    bodyData.append('folder', 'payment');
    if (formData.paymentQrUrl) {
      bodyData.append('oldUrl', formData.paymentQrUrl);
    }

    setIsUploadingQr(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        handleChange('paymentQrUrl', json.url);
        message.success('Đã tải lên ảnh mã QR thanh toán thành công!');
      } else {
        message.error(json.message || 'Không thể tải lên hình ảnh.');
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải ảnh lên máy chủ.');
    } finally {
      setIsUploadingQr(false);
      e.target.value = '';
    }
  };

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
    return 'https://vitinhantam.com/api/webhook/zalo';
  };

  const validateBotTokenFormat = (): string | null => {
    const raw = formData.zaloBotToken || '';
    const token = raw.trim();
    if (!token) return null;
    if (/^https?:\/\//i.test(token)) {
      return 'Bạn đang dán cả URL vào ô Token — hãy chỉ dán Token dạng <id>:<secret>.';
    }
    if (token.startsWith('bot') && token.slice(3).includes(':')) {
      return 'Token có tiền tố "bot" ở đầu — hãy bỏ phần "bot", chỉ giữ <id>:<secret>.';
    }
    if (!token.includes(':')) {
      return `Token thiếu dấu ":" (chuỗi ${token.length} ký tự, không có dấu ":") — cần dạng <id>:<secret>.`;
    }
    const pre = token.split(':', 1)[0];
    if (!/^\d+$/.test(pre)) {
      return `Phần trước dấu ":" phải là SỐ (id bot) — hiện tại là "${pre.slice(0, 24)}".`;
    }
    if (/\s/.test(token)) {
      return 'Token có khoảng trắng ở giữa — hãy copy lại cả chuỗi liền mạch.';
    }
    if (/[/?#]/.test(token)) {
      return 'Token chứa ký tự / ? # — sẽ làm hỏng URL gọi API.';
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
      await updateSystemSettings(formData);
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: formData.zaloDefaultChatId?.trim(),
          token: formData.zaloBotToken?.trim(),
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

  const handleCheckWebhook = async () => {
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
      const res = await fetch('/api/webhook/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'info',
          token: formData.zaloBotToken?.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setWebhookInfoData(data.result);
        setWebhookInfoModalOpen(true);
      } else {
        message.error(`Kiểm tra Webhook thất bại: ${data.error}`);
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

    const success = await updateSystemSettings(payload);
    setIsSaving(false);
    if (success) {
      setFormDataOverride(null);
      message.success('Đã lưu cấu hình thương hiệu & Zalo Bot thành công!');
    } else {
      message.error('Lỗi khi lưu cấu hình lên máy chủ/Supabase. Vui lòng kiểm tra lại quyền truy cập!');
    }
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
          email: 'lienhe@vitinhantam.com',
          address: '52 Nguyễn Cửu Vân, P. Long An, tỉnh Tây Ninh',
          streetAddress: '52 Nguyễn Cửu Vân',
          district: 'P. Long An',
          city: 'Tây Ninh',
          serviceAreas: 'Khu vực địa phương & các vùng lân cận',
          workingHoursWeekday: '08h00 - 17h30 (Hỗ trợ linh hoạt: 17h30 - 21h00)',
          workingHoursWeekend: '08h00 - 21h00 (Cả ngày)',
          primeHours: '17:30 - 21:00',
          footerAbout: 'Chuyên cung cấp PC/laptop tuyển chọn Dell, HP, ThinkPad & dịch vụ hỗ trợ kỹ thuật, bảo hành nhanh chóng, tận tâm.',
          footerCopyright: `© ${new Date().getFullYear()} Vi Tính An Tâm (vitinhantam.com) - Bán bằng tâm để bạn an tâm.`,
          storeName: 'Vi Tính An Tâm',
        };
        setFormData(defaultData);
        updateSystemSettings(defaultData);
        message.success('Đã đặt lại cấu hình mặc định!');
      },
    });
  };

  // Email template handlers
  const handleSaveEmailTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      await updateKeyEmailTemplate(emailForm);
      message.success('Đã lưu cấu hình mẫu email gửi key bản quyền thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error('Không thể lưu mẫu email: ' + msg);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      message.error('Vui lòng nhập địa chỉ email hợp lệ để nhận thử nghiệm!');
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);
    try {
      const res = await fetch('/api/send-key-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: testEmailAddress.trim(),
          customer_name: 'Khách Hàng Thử Nghiệm (Test)',
          customer_phone: '0901.234.567',
          category_name: 'WINDOWS 11 PROFESSIONAL (TEST EMAIL)',
          license_code: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
          template: emailForm,
          is_test: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailFeedback(`✅ Đã gửi email thử nghiệm thành công đến: ${testEmailAddress}`);
        message.success(`Đã gửi email thử đến ${testEmailAddress}!`);
      } else {
        setTestEmailFeedback(`❌ Lỗi gửi email: ${data.message || 'Không xác định'}`);
        message.error(data.message || 'Gửi email thử nghiệm thất bại.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestEmailFeedback(`❌ Lỗi kết nối API gửi mail: ${msg}`);
      message.error('Lỗi khi gửi email thử.');
    } finally {
      setIsSendingTestEmail(false);
    }
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
      {/* Header dính (sticky) — nút Lưu cấu hình ở đây là nút lưu DUY NHẤT
          của trang, luôn trong tầm tay khi cuộn qua các mục dài */}
      <div className="sticky top-16 z-30 bg-[#FAF7F2]/95 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cấu hình hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thương hiệu, Zalo Bot, mẫu email bàn giao key bản quyền, FAQ và đánh giá khách hàng.
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

      {/* Tabs Layout tinh giản thành 3 mục rõ ràng */}
      <Tabs
        defaultActiveKey="branding"
        type="card"
        items={[
          // TAB 1: THƯƠNG HIỆU & BOT ZALO (MERGE TOÀN DIỆN)
          {
            key: 'branding',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-[#C0392B]">
                <Sparkles className="w-4 h-4 text-[#C0392B]" />
                <span>Thương Hiệu &amp; Bot Zalo</span>
              </span>
            ),
            children: (
              <Card className="rounded-xl border-slate-200 shadow-xs">
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  {/* PHẦN I: NHẬN DIỆN THƯƠNG HIỆU & SLOGAN */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C0392B] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        I. Nhận Diện Thương Hiệu &amp; Slogan
                      </span>
                    </div>

                    {/* Xem trước Logo & Nhận diện */}
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
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

                  {/* PHẦN II: THÔNG TIN LIÊN HỆ & CƠ SỞ */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-slate-700" />
                        II. Thông Tin Liên Hệ &amp; Cơ Sở Showroom
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          Hotline hỗ trợ kỹ thuật (Nếu có)
                        </label>
                        <input
                          type="text"
                          value={formData.technicalHotline || ''}
                          onChange={(e) => handleChange('technicalHotline', e.target.value)}
                          placeholder="0909.053.058 (Kỹ thuật)"
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại Zalo CSKH *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.zaloNumber}
                          onChange={(e) => handleChange('zaloNumber', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email tiếp nhận hỗ trợ
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Giờ làm việc trong tuần &amp; Cuối tuần
                        </label>
                        <input
                          type="text"
                          value={formData.workingHoursWeekday}
                          onChange={(e) => handleChange('workingHoursWeekday', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Địa chỉ đầy đủ cửa hàng *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Google Maps Embed URL (Iframe nhúng bản đồ)
                        </label>
                        <input
                          type="text"
                          value={formData.googleMapsEmbedUrl || ''}
                          onChange={(e) => handleChange('googleMapsEmbedUrl', e.target.value)}
                          placeholder="https://www.google.com/maps/embed?..."
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#C0392B] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Giới thiệu chân trang */}
                    <div>
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

                    {/* QR Thanh Toán & Tài Khoản Ngân Hàng */}
                    <div className="pt-2">
                      <PaymentQrSettingsSection
                        formData={formData}
                        handleChange={handleChange}
                        isUploadingQr={isUploadingQr}
                        handleUploadQrImage={handleUploadQrImage}
                      />
                    </div>
                  </div>

                  {/* PHẦN III: TÍCH HỢP WEBHOOK & BOT ZALO */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0068FF] flex items-center gap-1.5">
                        <Bot className="w-4 h-4" />
                        III. Cấu Hình Bot Thông Báo Zalo / Telegram
                      </span>
                      <Tag color="blue" className="font-mono text-[11px] m-0">
                        Webhook Receiver Active
                      </Tag>
                    </div>

                    {/* Webhook Endpoint */}
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900">Webhook Receiver URL</span>
                        <Button
                          size="small"
                          icon={<Copy className="w-3 h-3" />}
                          onClick={handleCopyWebhookUrl}
                          className="text-xs font-semibold text-blue-700 border-blue-300 hover:bg-blue-100"
                        >
                          Sao chép URL
                        </Button>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-blue-200 font-mono text-xs text-slate-800 break-all select-all">
                        {getSystemWebhookUrl()}
                      </div>
                    </div>

                    {/* Bot Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Bot Token *
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">Dạng: &lt;id&gt;:&lt;secret&gt;</span>
                        </div>
                        <input
                          type="password"
                          placeholder="VD: 7123456789:AAFxxx... hoặc Token từ Zalo Bot"
                          value={formData.zaloBotToken || ''}
                          onChange={(e) => handleChange('zaloBotToken', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Chat ID Nhận Thông Báo *
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">ID cá nhân hoặc Group</span>
                        </div>
                        <input
                          type="text"
                          placeholder="VD: 123456789 hoặc -1001234567890"
                          value={formData.zaloDefaultChatId || ''}
                          onChange={(e) => handleChange('zaloDefaultChatId', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Secret Token Bảo Mật Webhook (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          placeholder="Chuỗi bảo mật ngẫu nhiên để xác thực webhook"
                          value={formData.zaloBotSecretToken || ''}
                          onChange={(e) => handleChange('zaloBotSecretToken', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Công cụ kiểm tra & thiết lập webhook */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Button
                        type="primary"
                        icon={<Send className="w-3.5 h-3.5" />}
                        loading={isTestingWebhook}
                        onClick={handleTestWebhook}
                        className="bg-blue-600 hover:bg-blue-700 font-bold h-9 text-xs"
                      >
                        Gửi Tin Nhắn Test
                      </Button>

                      <Button
                        icon={<Zap className="w-3.5 h-3.5" />}
                        loading={isSettingWebhook}
                        onClick={handleSetWebhook}
                        className="border-blue-600 text-blue-700 hover:bg-blue-50 font-bold h-9 text-xs"
                      >
                        Đăng Ký Webhook
                      </Button>

                      <Button
                        icon={<RefreshCw className="w-3.5 h-3.5" />}
                        loading={isCheckingWebhook}
                        onClick={handleCheckWebhook}
                        className="font-semibold h-9 text-xs"
                      >
                        Tra Cứu Webhook Info
                      </Button>

                      <Popconfirm
                        title="Xác nhận hủy Webhook"
                        description="Hệ thống sẽ không còn nhận webhook từ Bot Platform nữa."
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
                          Hủy Webhook
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>

                  {/* Không còn nút lưu riêng trong tab — dùng nút "Lưu cấu
                      hình" dính ở đầu trang (cùng một thao tác lưu). */}
                </form>
              </Card>
            ),
          },

          // TAB 2: CẤU HÌNH MẪU EMAIL GỬI KEY (CHUYỂN TỪ KHO KEY XUỐNG)
          {
            key: 'key_email',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-emerald-700">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Cấu Hình Email Gửi Key</span>
              </span>
            ),
            children: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Email Settings Form */}
                  <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
                    <div className="border-b border-[#E8E2D9] pb-3">
                      <h3 className="text-sm font-black text-[#2B1810] uppercase flex items-center gap-2">
                        <span>✉️</span> CẤU HÌNH MẪU EMAIL BÀN GIAO KEY CHO KHÁCH
                      </h3>
                      <p className="text-xs text-[#6E5D53] mt-0.5">
                        Thiết lập tiêu đề, người gửi và nội dung thư tự động gửi kèm mã bản quyền khi xuất kho.
                      </p>
                    </div>

                    <form onSubmit={handleSaveEmailTemplate} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#2B1810] mb-1">
                            TÊN NGƯỜI GỬI (SENDER NAME) *
                          </label>
                          <input
                            type="text"
                            required
                            value={emailForm.sender_name}
                            onChange={(e) => setEmailForm({ ...emailForm, sender_name: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#2B1810] mb-1">
                            EMAIL NGƯỜI GỬI (SENDER EMAIL) *
                          </label>
                          <input
                            type="email"
                            required
                            value={emailForm.sender_email}
                            onChange={(e) => setEmailForm({ ...emailForm, sender_email: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#2B1810] mb-1">
                          TIÊU ĐỀ EMAIL (SUBJECT) *
                        </label>
                        <input
                          type="text"
                          required
                          value={emailForm.subject}
                          onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#2B1810] mb-1">
                            HOTLINE HỖ TRỢ KỸ THUẬT *
                          </label>
                          <input
                            type="text"
                            value={emailForm.support_phone}
                            onChange={(e) => setEmailForm({ ...emailForm, support_phone: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#2B1810] mb-1">
                            ZALO CSKH HỖ TRỢ *
                          </label>
                          <input
                            type="text"
                            value={emailForm.support_zalo}
                            onChange={(e) => setEmailForm({ ...emailForm, support_zalo: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#2B1810] mb-1">
                          NỘI DUNG MẪU EMAIL (TEMPLATE BODY) *
                        </label>
                        <textarea
                          rows={8}
                          required
                          value={emailForm.content_template}
                          onChange={(e) => setEmailForm({ ...emailForm, content_template: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg bg-white text-[#2B1810] focus:ring-2 focus:ring-[#C0392B] focus:outline-none font-mono text-xs leading-relaxed"
                        />
                        <div className="mt-1.5 p-2 bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] text-[11px] text-[#6E5D53] space-y-1">
                          <span className="font-bold text-[#2B1810]">Các biến thay thế tự động có sẵn:</span>
                          <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-[#C0392B]">
                            <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200">{'{TEN_KHACH_HANG}'}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200">{'{TEN_SAN_PHAM}'}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200">{'{MA_KEY}'}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200">{'{HUONG_DAN_KICH_HOAT}'}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200">{'{HOTLINE_HO_TRO}'}</span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-rose-200">{'{ZALO_HO_TRO}'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSavingEmail}
                          className="px-6 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isSavingEmail ? 'Đang lưu...' : 'LƯU CẤU HÌNH MẪU EMAIL'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right: Live Preview Panel */}
                  <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4">
                    <div className="border-b border-[#E8E2D9] pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-[#2B1810]">
                          XEM TRƯỚC GIAO DIỆN EMAIL THỰC TẾ (LIVE PREVIEW)
                        </h3>
                        <p className="text-xs text-[#6E5D53] mt-0.5">
                          Mô phỏng bức thư điện tử hiển thị trong hộp thư đến của khách hàng.
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        CHUẨN HTML RESPONSIVE
                      </span>
                    </div>

                    {/* Email Shell */}
                    <div className="rounded-xl border border-[#E8E2D9] overflow-hidden bg-white shadow-xs font-sans text-xs">
                      {/* Email Client Header */}
                      <div className="bg-[#FAF7F2] p-3 border-b border-[#E8E2D9] space-y-1 text-[11px]">
                        <div>
                          <span className="text-[#6E5D53]">Người gửi: </span>
                          <strong className="text-[#2B1810]">
                            {emailForm.sender_name} &lt;{emailForm.sender_email}&gt;
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#6E5D53]">Tiêu đề: </span>
                          <strong className="text-[#C0392B]">{emailForm.subject}</strong>
                        </div>
                        <div>
                          <span className="text-[#6E5D53]">Người nhận: </span>
                          <strong className="text-[#2B1810]">anh.tuan.kế_toán@gmail.com</strong>
                        </div>
                      </div>

                      {/* Email Client Body */}
                      <div className="p-5 space-y-3 bg-white text-[#2B1810]">
                        {/* Brand Banner */}
                        <div className="p-3.5 rounded-xl bg-[#2B1810] text-white flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-amber-400">
                              BÀN GIAO BẢN QUYỀN CHÍNH HÃNG
                            </div>
                            <div className="text-sm font-black tracking-tight text-white mt-0.5">
                              VI TÍNH AN TÂM
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-white/80">
                            Bảo hành trọn đời
                          </span>
                        </div>

                        {/* Rendered Template */}
                        <div className="whitespace-pre-line leading-relaxed text-[#2B1810] font-sans text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {emailForm.content_template
                            .replace('{TEN_KHACH_HANG}', 'Anh Tuấn')
                            .replace('{TEN_SAN_PHAM}', 'WINDOWS 11 PROFESSIONAL')
                            .replace('{MA_KEY}', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T')
                            .replace(
                              '{HUONG_DAN_KICH_HOAT}',
                              '1. Mở Cài đặt (Settings) -> System -> Activation.\n2. Bấm "Change product key" và dán mã trên vào ô nhập liệu.\n3. Bấm Activate để hoàn tất kích hoạt.'
                            )
                            .replace('{HOTLINE_HO_TRO}', emailForm.support_phone)
                            .replace('{ZALO_HO_TRO}', emailForm.support_zalo)}
                        </div>

                        {/* Footer Signature */}
                        <div className="pt-3 border-t border-[#E8E2D9] text-[11px] text-[#6E5D53] space-y-0.5">
                          <div><strong>TRUNG TÂM MÁY TÍNH VI TÍNH AN TÂM</strong></div>
                          <div>Địa chỉ: {formData.address || '52 Nguyễn Cửu Vân, P. Long An, Tây Ninh'}</div>
                          <div>Hotline hỗ trợ kỹ thuật: {emailForm.support_phone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Test Email Dispatch Box */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                          🚀 GỬI THỬ NGHIỆM EMAIL BÀN GIAO (LIVE TEST)
                        </span>
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                          TEST DISPATCH
                        </span>
                      </div>
                      <p className="text-xs text-[#6E5D53]">
                        Gửi một email mẫu thực tế vào hòm thư của bạn để kiểm tra hiển thị trên Gmail / Outlook.
                      </p>
                      <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <input
                          type="email"
                          required
                          placeholder="Nhập email nhận thử (VD: your.email@gmail.com)"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          className="w-full sm:flex-1 px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white text-[#2B1810] font-mono"
                        />
                        <button
                          type="submit"
                          disabled={isSendingTestEmail}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isSendingTestEmail ? 'Đang gửi test...' : 'GỬI EMAIL THỬ'}
                        </button>
                      </form>
                      {testEmailFeedback && (
                        <div className="text-xs font-bold text-[#2B1810] pt-1">
                          {testEmailFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ),
          },

          // TAB 3: MERGED FAQ & ĐÁNH GIÁ KHÁCH HÀNG
          {
            key: 'faq_reviews',
            label: (
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-blue-700">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>FAQ &amp; Đánh Giá Khách Hàng</span>
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* SECTION 1: CÂU HỎI THƯỜNG GẶP (FAQ) */}
                <Card className="rounded-xl border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        Danh Sách Câu Hỏi Thường Gặp (FAQ) - {faqs.length} mục
                      </h3>
                      <p className="text-xs text-slate-500">
                        Hiển thị tại mục FAQ ở chân trang chủ để giải tỏa lo lắng của khách hàng.
                      </p>
                    </div>
                    <Button
                      type="primary"
                      onClick={() => handleOpenFaqModal()}
                      className="bg-blue-600 hover:bg-blue-700 font-bold"
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

                {/* SECTION 2: ĐÁNH GIÁ & NHẬN XÉT CỦA KHÁCH HÀNG */}
                <Card className="rounded-xl border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquareQuote className="w-4 h-4 text-purple-600" />
                        Đánh Giá &amp; Nhận Xét Của Khách Hàng - {reviews.length} đánh giá
                      </h3>
                      <p className="text-xs text-slate-500">
                        Hiển thị đánh giá thực tế từ khách hàng trải nghiệm dịch vụ trên trang chủ.
                      </p>
                    </div>
                    <Button
                      type="primary"
                      onClick={handleOpenReviewModal}
                      className="bg-purple-600 hover:bg-purple-700 font-bold"
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
              </div>
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
      >
        <Form form={faqForm} layout="vertical" onFinish={handleSaveFaq} className="pt-3">
          <Form.Item
            name="question"
            label="Câu hỏi của khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
          >
            <Input placeholder="VD: Cửa hàng có hỗ trợ cài Win tận nơi không?" />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Câu trả lời giải thích chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập câu trả lời!' }]}
          >
            <TextArea rows={4} placeholder="VD: Có, Vi Tính An Tâm nhận cài đặt tận nhà trong bán kính 10km..." />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsFaqModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-[#C0392B] hover:bg-[#A93226]">
              Lưu Câu Hỏi
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Thêm Đánh Giá Mới */}
      <Modal
        title="Thêm Đánh Giá Khách Hàng Mới"
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        footer={null}
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleSaveReview} className="pt-3">
          <Form.Item
            name="name"
            label="Họ và tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input placeholder="VD: Anh Minh hoặc Chị Mai" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Nghề nghiệp / Đơn vị"
            rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }]}
          >
            <Input placeholder="VD: Kế toán trưởng Cty Xây Dựng Long An" />
          </Form.Item>
          <Form.Item
            name="service"
            label="Thiết bị / Dịch vụ đã sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập dịch vụ!' }]}
          >
            <Input placeholder="VD: Dell OptiPlex 7060 SFF hoặc Sửa nguồn PC" />
          </Form.Item>
          <Form.Item name="location" label="Khu vực sinh sống">
            <Input placeholder="VD: phường Long An hoặc Bến Lức" />
          </Form.Item>
          <Form.Item name="rating" label="Số sao đánh giá (1 - 5)">
            <InputNumber min={1} max={5} className="w-full" />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Nội dung nhận xét"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea rows={3} placeholder="VD: Máy chạy rất êm, nhân viên nhiệt tình hỗ trợ cài lại Win chu đáo..." />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsReviewModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-[#C0392B] hover:bg-[#A93226]">
              Lưu Đánh Giá
            </Button>
          </div>
        </Form>
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
