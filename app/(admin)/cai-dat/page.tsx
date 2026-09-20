'use client';

import React, { useState } from 'react';
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
import {
  Settings,
  HelpCircle,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Lock,
  ArrowLeft,
  RotateCcw,
  Save,
  CheckCircle2,
  Phone,
  Clock,
  MapPin,
  Star,
} from 'lucide-react';

const { TextArea } = Input;

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
  } = useViTinhAnTamStore();

  const [formData, setFormData] = useState<SystemSettings>({
    ...systemSettings,
  });
  const [isSaving, setIsSaving] = useState(false);

  // FAQ Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm] = Form.useForm();

  // Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm] = Form.useForm();

  const handleChange = (field: keyof SystemSettings, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
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
          hotline: '0909.053.058',
          zaloNumber: '0909053058',
          zaloLink: 'https://zalo.me/0909053058',
          address: 'Long An - Tây Ninh',
          serviceAreas: 'Long An - Tây Ninh',
          workingHoursWeekday: '08h00 - 17h30 (Cứu hộ ưu tiên: 17h30 - 21h00)',
          workingHoursWeekend: '08h00 - 21h00 (Trọn ngày)',
          primeHours: '17:30 - 21:00',
          footerAbout: 'Chuyên cung cấp PC/laptop nồi đồng cối đá Dell, HP, IBM & dịch vụ xử lý tận nơi trong 2 giờ tại Long An - Tây Ninh.',
          footerCopyright: '© 2026 Vi Tính An Tâm (vitinhantam.vn) - Giữ trọn chữ tín, an tâm sử dụng.',
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

  const handleSaveFaq = async (values: any) => {
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

  const handleSaveReview = async (values: any) => {
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

  const handleDeleteReview = async (id: string) => {
    await deleteReview(id);
    message.success('Đã xóa phản hồi của khách hàng!');
  };

  if (!canAccessSettings()) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm mt-12">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">YÊU CẦU QUYỀN QUẢN TRỊ VIÊN (ADMIN)</h2>
        <p className="text-xs text-slate-600 mb-4">
          Chỉ tài khoản Admin mới có quyền điều chỉnh số hotline, thông tin Zalo, quản lý FAQ và đánh giá khách hàng.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Bảng Điều Khiển</span>
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
      render: (_: any, record: FaqItem) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Edit2 className="w-3.5 h-3.5" />}
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
            <Button size="small" danger icon={<Trash2 className="w-3.5 h-3.5" />} />
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
      render: (_: any, record: CustomerReview) => (
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
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: record.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
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
      render: (_: any, record: CustomerReview) => (
        <Popconfirm
          title="Xác nhận xóa"
          description="Bạn có chắc chắn muốn xóa đánh giá này?"
          onConfirm={() => handleDeleteReview(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
        >
          <Button size="small" danger icon={<Trash2 className="w-3.5 h-3.5" />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Quản trị hệ thống &amp; Nội dung
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CẤU HÌNH DOANH NGHIỆP &amp; NỘI DUNG WEB
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật tức thì thông tin liên hệ, hotline, giờ cứu hộ 2H, câu hỏi FAQ và phản hồi khách hàng hiển thị trên website.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs
        defaultActiveKey="general"
        type="card"
        items={[
          {
            key: 'general',
            label: (
              <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Thông Tin Chung &amp; Giờ Phục Vụ</span>
              </span>
            ),
            children: (
              <Card className="rounded-2xl border-slate-200 shadow-xs">
                <form onSubmit={handleSubmitSettings} className="space-y-6">
                  {/* Nhóm 1: Liên hệ hotline */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>1. Kênh Liên Hệ Trực Tiếp (Hotline &amp; Zalo)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số Hotline hiển thị trên web *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.hotline}
                          onChange={(e) => handleChange('hotline', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-blue-700 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại Zalo kết nối *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.zaloNumber}
                          onChange={(e) => handleChange('zaloNumber', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 2: Địa chỉ và khu vực */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>2. Địa Chỉ &amp; Phạm Vi Phục Vụ 10KM</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Trụ sở &amp; Trạm Kỹ Thuật chính
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Khu vực phục vụ cứu hộ nhanh
                        </label>
                        <input
                          type="text"
                          value={formData.serviceAreas}
                          onChange={(e) => handleChange('serviceAreas', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 3: Giờ phục vụ */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>3. Khung Giờ Phục Vụ &amp; Cứu Hộ Ưu Tiên 2H</span>
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
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
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
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 gap-3">
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Đặt lại mặc định</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Cấu Hình'}</span>
                    </button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            key: 'faqs',
            label: (
              <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Quản Lý Câu Hỏi FAQ ({faqs.length})</span>
              </span>
            ),
            children: (
              <Card className="rounded-2xl border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Danh Sách Câu Hỏi Thường Gặp Hiển Thị Trang Chủ
                    </h3>
                    <p className="text-xs text-slate-500">
                      Các câu hỏi giúp giải tỏa mối bận tâm về kiểm tra theo S/N máy, bảo hành 1 đổi 1 và cứu hộ tận nơi.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenFaqModal()}
                    className="bg-blue-600"
                  >
                    Thêm Câu Hỏi Mới
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
              <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Quản Lý Đánh Giá Khách Hàng ({reviews.length})</span>
              </span>
            ),
            children: (
              <Card className="rounded-2xl border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Phản Hồi &amp; Nhận Xét Của Khách Hàng Địa Phương
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hiển thị trực quan trên Trang chủ để tăng độ tin cậy và tỷ lệ chuyển đổi.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleOpenReviewModal}
                    className="bg-purple-600"
                  >
                    Thêm Đánh Giá Mới
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
    </div>
  );
}
