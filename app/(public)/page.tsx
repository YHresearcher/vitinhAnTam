import type { Metadata } from 'next';
import HomePage from './HomeClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Vi Tính An Tâm — Máy Tính Cũ Bảo Hành 6 Tháng, Test Kỹ Từng Máy — Tây Ninh & Sài Gòn',
  },
  description:
    'Máy tính cũ đã test kỹ từng máy, bảo hành 6 tháng nguyên máy. Nâng cấp RAM, SSD đúng nhu cầu, phần mềm bản quyền cài sẵn, mua về dùng ngay. Bán tại Tây Ninh và Sài Gòn. Hotline 0909.053.058.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Vi Tính An Tâm — Máy Tính Cũ Bảo Hành 6 Tháng, Test Kỹ Từng Máy',
    description:
      'Máy tính cũ đã test kỹ, bảo hành 6 tháng nguyên máy. Nâng cấp đúng nhu cầu, phần mềm bản quyền cài sẵn. Bán tại Tây Ninh và Sài Gòn. Hotline: 0909.053.058.',
    url: 'https://www.vitinhantam.com',
    images: [
      {
        url: 'https://www.vitinhantam.com/images/hero-laptop-windows.webp',
        width: 1200,
        height: 630,
        alt: 'Vi Tính An Tâm — Máy Tính Đồng Bộ & Laptop Tuyển Chọn',
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
      name: 'Máy tính tại Vi Tính An Tâm được kiểm tra và tuyển chọn như thế nào?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Toàn bộ máy tại Vi Tính An Tâm đều được tuyển chọn kỹ lưỡng, ưu tiên các dòng máy đồng bộ và laptop doanh nghiệp có bo mạch nguyên bản, chưa qua sửa chữa chắp vá. Trước khi giao, máy được vệ sinh sạch sẽ bụi bẩn, tra keo tản nhiệt và chạy thử các tác vụ thực tế để đảm bảo hoạt động êm ái, mát mẻ.',
      },
    },
    {
      '@type': 'Question',
      name: 'Máy tính cũ tại Vi Tính An Tâm được bảo hành bao lâu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mọi máy tính cũ tại Vi Tính An Tâm — PC đồng bộ và laptop doanh nghiệp — đều được bảo hành đồng loạt 6 tháng toàn bộ máy (thân máy, mainboard, CPU, RAM, ổ cứng, nguồn), không phân biệt dòng máy hay giá bán. Trong thời gian bảo hành, lỗi phần cứng được sửa chữa hoặc thay linh kiện tương đương miễn phí. Quý khách tra cứu thời hạn bảo hành bằng số S/N ngay trên website hoặc gọi hotline kỹ thuật 0909.053.058; cửa hàng hỗ trợ xử lý từ xa qua UltraViewer hoặc đến tận nơi kiểm tra trong khả năng.',
      },
    },
    {
      '@type': 'Question',
      name: 'Windows bản quyền số có lợi ích gì cho công việc văn phòng và doanh nghiệp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Máy được kích hoạt bản quyền số Microsoft theo máy. Hệ thống sạch sẽ, bảo mật tốt, không chứa mã độc hay công cụ bẻ khóa, an toàn cho dữ liệu công việc, hóa đơn điện tử và giao dịch ngân hàng.',
      },
    },
    {
      '@type': 'Question',
      name: 'Tôi có thể nâng cấp RAM hoặc SSD theo nhu cầu riêng được không?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hoàn toàn được. Cửa hàng có sẵn cả linh kiện mới chính hãng bảo hành dài hạn lẫn linh kiện cũ tháo máy chất lượng tốt. An Tâm luôn tư vấn rõ ràng tình trạng (mới báo mới, cũ báo cũ) để quý khách an tâm lựa chọn theo ngân sách.',
      },
    },
  ],
};

// WebSite schema with SearchAction for sitelinks search box
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vi Tính An Tâm',
  url: 'https://www.vitinhantam.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.vitinhantam.com/tra-cuu-bao-hanh?tag={search_term_string}',
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
