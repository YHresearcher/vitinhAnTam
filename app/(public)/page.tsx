import type { Metadata } from 'next';
import HomePage from './HomeClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Vi Tính An Tâm — Máy Tính Cũ Chuẩn A Tuyển Chọn Tại Tân An, Long An',
  },
  description:
    'PC đồng bộ & laptop doanh nhân tuyển chọn, Win bản quyền, bảo hành 1 đổi 1 hỏa tốc trong 2 giờ (<5km Tân An), hỗ trợ Thủ Thừa, Châu Thành, Tân Trụ. Hotline 0909.053.058.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Vi Tính An Tâm — Máy Tính Cũ Chuẩn A Tuyển Chọn Tại Tân An',
    description:
      'Bảo hành 1 đổi 1 hỏa tốc 2 giờ (<5km Tân An). SSD/RAM mới BH 36 tháng. Hotline: 0909.053.058.',
    url: 'https://vitinhantham.vn',
    images: [
      {
        url: 'https://vitinhantham.vn/anh-that-cua-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Vi Tính An Tâm — Máy Tính Cũ Chuẩn A Tại Tân An Long An',
      },
    ],
  },
};

// FAQPage structured data for rich snippets on Google
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Tại sao máy tính cũ tại Vi Tính An Tâm được gọi là "Chuẩn A Tuyển Chọn"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Toàn bộ máy tại Vi Tính An Tâm đều được tuyển chọn kỹ lưỡng từ các tập đoàn doanh nghiệp, cam kết 100% bo mạch chủ nguyên bản, không sửa chữa chắp vá. Mỗi máy trước khi đến tay khách hàng đều trải qua quy trình kiểm định 24 bước (test RAM, stress test CPU, kiểm tra bad sector SSD 100% health).',
      },
    },
    {
      '@type': 'Question',
      name: 'Chính sách bảo hành 1 đổi 1 tận nơi trong 2 giờ hoạt động như thế nào?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Khi máy gặp bất kỳ sự cố phần cứng nào, quý khách chỉ cần liên hệ hotline kỹ thuật hoặc tra cứu mã S/N trên web. Đội ngũ kỹ thuật sẽ mang linh kiện thay thế trực tiếp đến tận nhà hỗ trợ nhanh chóng tại TP. Tân An (Phường 1 đến Phường 7, Khánh Hậu, Tân Khánh); các khu vực lân cận (Thủ Thừa, Châu Thành, Tân Trụ) hỗ trợ theo lịch hẹn nhanh trong ngày.',
      },
    },
    {
      '@type': 'Question',
      name: 'Windows bản quyền số vĩnh viễn có lợi ích gì cho kế toán và văn phòng?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Máy được kích hoạt bản quyền số Microsoft OEM chính thức theo bo mạch chủ. Hệ thống hoàn toàn sạch, cập nhật bảo mật liên tục từ Microsoft, không chứa mã độc hay công cụ bẻ khóa, an toàn tuyệt đối cho dữ liệu kế toán MISA, hóa đơn điện tử và giao dịch ngân hàng.',
      },
    },
    {
      '@type': 'Question',
      name: 'Tôi có thể nâng cấp RAM hoặc SSD theo nhu cầu riêng được không?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hoàn toàn được. Vi Tính An Tâm luôn sẵn linh kiện RAM Kingston/Samsung và SSD NVMe chính hãng mới 100% bảo hành 36 tháng để nâng cấp theo nhu cầu công việc của quý khách ngay khi bàn giao.',
      },
    },
  ],
};

// WebSite schema with SearchAction for sitelinks search box
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vi Tính An Tâm',
  url: 'https://vitinhantham.vn',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://vitinhantham.vn/tra-cuu-bao-hanh?tag={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function Page() {
  return (
    <>
      {/* FAQPage Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* WebSite + SearchAction Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomePage />
    </>
  );
}
