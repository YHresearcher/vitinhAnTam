'use client';

import React from 'react';
import Link from 'next/link';
import { useViTinhAnTamStore } from '@/lib/store';
import {
  ShieldCheck,
  Cpu,
  HardDrive,
  Thermometer,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

export default function WhyUsPage() {
  const { currentLang } = useViTinhAnTamStore();
  const isEn = currentLang === 'en';

  return (
    <div className="w-full">
      {/* 1. HERO BANNER: Chân thành, đúng thực tế */}
      <section className="relative bg-gradient-to-b from-[#FDFBF7] via-white to-[#FAF7F2] py-12 sm:py-18 border-b border-[#E8E2D9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBE8DE] text-[#C0392B] border border-[#F2C4B2] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C0392B]" />
            <span>{isEn ? 'SOLD WITH CARE, KEEPING YOU CAREFREE' : 'BÁN BẰNG TÂM ĐỂ BẠN AN TÂM'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1A0F0A] tracking-tight leading-tight">
            {isEn ? 'Why Clients Choose Vi Tinh An Tam' : 'Lý Do Khách Hàng Chọn Vi Tính An Tâm'}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? 'We work with honesty and genuine responsibility. The shop focuses on three things: selling thoroughly tested used machines, upgrades matched to real needs, and licensed software preinstalled — sold in Tay Ninh and Saigon. From machine selection and parts inspection to after-sales support, An Tam keeps your daily work running smoothly.'
              : 'Chúng tôi làm nghề bằng sự trung thực và trách nhiệm. Shop chỉ tập trung ba việc: bán máy cũ đã test kỹ, nâng cấp đúng nhu cầu, cài sẵn phần mềm bản quyền — bán tại Tây Ninh và Sài Gòn. Từ khâu chọn máy, kiểm tra linh kiện đến hỗ trợ sau bán, An Tâm làm sao cho công việc của bạn luôn suôn sẻ.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#san-pham"
              className="px-5 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{isEn ? 'Browse Inventory in Stock' : 'Xem Danh Mục Máy Sẵn Kho'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dat-lich"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C0392B]" />
              <span>{isEn ? 'Schedule Inspection' : 'Đặt Lịch Kiểm Tra Máy'}</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 text-slate-700">
        {/* 2. BỐN ĐIỂM TỰA THỰC TẾ (ĐÚNG NĂNG LỰC & CÁCH LÀM VIỆC) */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold text-[#C0392B] tracking-wider">
              {isEn ? 'HOW WE OPERATE' : 'CÁCH CHÚNG TÔI LÀM VIỆC'}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#1A0F0A]">
              {isEn ? '4 Realistic Pillars That Give You Complete Peace of Mind' : '4 Điểm Tựa Giúp Bạn Yên Tâm Khi Mua & Dùng Máy'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              {isEn
                ? 'No exaggerated claims or unrealistic promises. Here is what An Tam genuinely commits to and delivers every day.'
                : 'Không quảng cáo quá lời hay hứa hẹn viển vông. Dưới đây là những gì An Tâm thực tế cam kết và thực hiện mỗi ngày.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Điểm 1: Bo mạch nguyên bản */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#C0392B]/40 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? '1. Original Motherboards, Never Repaired' : '1. Bo Mạch Nguyên Bản, Chưa Qua Sửa Chữa'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? 'All enterprise desktops and laptops undergo thorough technician inspections before entering our inventory. We strictly prioritize clean, original hardware that has never undergone reballing, soldering repairs, or makeshift board patching.'
                    : 'Vi Tính An Tâm cam kết chỉ cung cấp máy có bo mạch chủ nguyên bản 100%, chưa từng qua sửa chữa hay hàn vá. Tất cả thiết bị đều được kiểm định kỹ càng qua phần mềm đo kiểm chuyên sâu (stress test tải nặng, kiểm tra nhiệt độ, xung nhịp và sức khỏe phần cứng) trước khi tới tay khách hàng.'}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{isEn ? 'Selectively chosen hardware with stable original boards' : 'Máy tuyển chọn kỹ, phần cứng nguyên bản ổn định'}</span>
              </div>
            </div>

            {/* Điểm 2: Linh kiện rõ ràng */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#C0392B]/40 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? '2. Transparent Parts — New is New, Used is Used' : '2. Linh Kiện Rõ Ràng — Mới Báo Mới, Cũ Báo Cũ'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? 'We stock both brand-new retail components with multi-year factory warranties and authentic pulled parts to fit varying budgets. Whether you choose a brand-new boxed SSD or cost-effective pulled memory, we state conditions openly without deceptive marketing.'
                    : 'Cửa hàng có cả linh kiện mới chính hãng lẫn linh kiện cũ tháo máy nguyên zin để bạn lựa chọn theo túi tiền. Dù chọn SSD/RAM mới đập hộp bảo hành hãng 3 năm hay đồ cũ bóc máy zin tiết kiệm chi phí, An Tâm đều công khai rõ ràng tình trạng, bảo hành chu đáo, tuyệt đối không mập mờ.'}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isEn ? 'Clear provenance and honest component conditions' : 'Minh bạch xuất xứ và tình trạng linh kiện'}</span>
              </div>
            </div>

            {/* Điểm 3: Vệ sinh cẩn thận & Chạy thử thực tế */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#C0392B]/40 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                  <Thermometer className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? '3. Careful Dust Removal, Repasting & Practical Load Testing' : '3. Vệ Sinh Cẩn Thận, Thay Keo & Chạy Thử Thực Tế'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? 'Every machine is thoroughly blown clean of dust, repasted with quality thermal compound, and tested under real-world daily workloads before handover. This ensures quiet cooling fans, low operating temperatures, and no overheating freezes.'
                    : 'Mỗi cỗ máy trước khi bàn giao đều được vệ sinh sạch sẽ bụi bẩn, tra keo tản nhiệt mới và cho chạy thử các tác vụ thực tế. Đảm bảo máy vận hành êm ái, quạt mát mẻ, không bị quá nhiệt hay giật lag khi bạn mở phần mềm làm việc.'}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-orange-700">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{isEn ? 'Quiet, cool, and dependable operation under workload' : 'Máy chạy êm, mát và ổn định khi sử dụng'}</span>
              </div>
            </div>

            {/* Điểm 4: Ứng phó nhanh, hỗ trợ tối đa */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#C0392B]/40 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? '4. Swift Response & Maximum Support Within Our Means' : '4. Ứng Phó Nhanh, Hỗ Trợ Tối Đa Trong Khả Năng'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? 'When technical issues arise, our highest priority is keeping your productivity moving. Our technicians offer rapid remote support via UltraViewer or on-site inspections where feasible. Customers in Saigon are supported remotely via UltraViewer and through our hotline and Zalo during the warranty period. Any faulty part under warranty is promptly swapped without dragging delays.'
                    : 'An Tâm cam kết bảo hành nhanh chóng, hỗ trợ kỹ thuật tận nơi trong bán kính < 5km từ cửa hàng. Ngoài phạm vi 5km, cửa hàng tiếp nhận xử lý nhanh tại shop hoặc hỗ trợ trực tiếp từ xa qua UltraViewer / AnyDesk, ưu tiên tối đa để công việc của quý khách không bị gián đoạn. Khách ở Sài Gòn được hỗ trợ từ xa và qua hotline, Zalo trong thời gian bảo hành.'}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-purple-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{isEn ? 'Minimizing downtime is our top operational goal' : 'Ưu tiên hàng đầu là không để công việc của khách bị ngưng trệ'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CAM KẾT 4 "KHÔNG" (MINH BẠCH, THỰC TẾ) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#1C130E] border border-[#332219] text-white space-y-6 shadow-xl">
          <div className="text-center space-y-1.5">
            <span className="text-xs uppercase font-bold text-[#E67E22] tracking-wider">
              {isEn ? 'STORE PRINCIPLES' : 'CAM KẾT CỬA HÀNG'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isEn ? 'Our 4 "NO" Commitments at Vi Tinh An Tam' : 'Cam Kết 4 KHÔNG Tại Vi Tính An Tâm'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isEn ? 'NO repaired or unstable motherboards' : 'KHÔNG bán máy nát, máy sửa main chập chờn'}
                </h4>
                <p className="text-xs text-[#D7CCC8] mt-1 leading-relaxed">
                  {isEn
                    ? 'Only accepting healthy, original systems so our customers can rely on them long-term.'
                    : 'Chỉ nhận máy còn hoạt động tốt, bo mạch nguyên bản để khách hàng yên tâm sử dụng lâu dài.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isEn ? 'NO deceptive labeling of component conditions' : 'KHÔNG mập mờ tình trạng linh kiện'}
                </h4>
                <p className="text-xs text-[#D7CCC8] mt-1 leading-relaxed">
                  {isEn
                    ? 'New is stated as new, used is stated as used. Upfront pricing and accurate quality descriptions.'
                    : 'Hàng mới báo mới, hàng cũ bóc máy báo cũ. Giá cả công khai, đúng linh kiện đúng chất lượng.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isEn ? 'NO inflated diagnostics or surprise hidden fees' : 'KHÔNG "vẽ bệnh" phát sinh chi phí'}
                </h4>
                <p className="text-xs text-[#D7CCC8] mt-1 leading-relaxed">
                  {isEn
                    ? 'Inspections identify real root causes. Transparent quotes upfront before any work begins.'
                    : 'Kiểm tra máy báo đúng lỗi thực tế. Báo giá trước rõ ràng, khách đồng ý mới tiến hành làm.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isEn ? 'NO customer abandonment after purchase' : 'KHÔNG bỏ rơi khách sau khi bán máy'}
                </h4>
                <p className="text-xs text-[#D7CCC8] mt-1 leading-relaxed">
                  {isEn
                    ? 'Ongoing software and setup guidance with active accountability for any technical hiccups.'
                    : 'Hỗ trợ kỹ thuật phần mềm cần thiết, luôn có trách nhiệm giải quyết thắc mắc và sự cố phát sinh.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. QUY TRÌNH MUA & NHẬN MÁY THỰC TẾ */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs uppercase font-bold text-[#C0392B] tracking-wider">
              {isEn ? 'CLEAR & CONVENIENT' : 'RÕ RÀNG & TIỆN LỢI'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A0F0A]">
              {isEn ? '4-Step Buying & Handover Process' : 'Quy Trình Mua & Nhận Máy'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              {isEn
                ? 'Straightforward, transparent steps helping you pick the right machine for your workload and budget.'
                : 'Các bước đơn giản, minh bạch giúp bạn chọn được chiếc máy phù hợp với công việc và ngân sách.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FBE8DE] text-[#C0392B] font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {isEn ? 'Needs Assessment' : 'Tư Vấn Đúng Nhu Cầu'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? 'Understanding your exact tasks (office, point-of-sale, study, graphics) to suggest a balanced, cost-effective setup.'
                  : 'Tìm hiểu công việc cụ thể của bạn (văn phòng, bán hàng, học tập, đồ họa...) để gợi ý cấu hình vừa đủ, tiết kiệm ngân sách.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FBE8DE] text-[#C0392B] font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {isEn ? 'Hands-on Inspection' : 'Kiểm Tra Linh Kiện'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? 'You inspect the real hardware, review drive health, RAM specs, and cosmetic condition prior to committing.'
                  : 'Khách hàng xem máy thực tế, kiểm tra cấu hình, tình trạng ổ cứng, bộ nhớ RAM và ngoại hình máy trước khi quyết định.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FBE8DE] text-[#C0392B] font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {isEn ? 'Clean OS & Setup' : 'Cài Đặt Phần Mềm Sạch'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? 'Deploying a clean, bloatware-free operating system, essential office tools, and network printer connections upon request.'
                  : 'Cài hệ điều hành hoạt động mượt mà, bộ gõ tiếng Việt, phần mềm văn phòng cơ bản và kết nối máy in nếu có yêu cầu.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FBE8DE] text-[#C0392B] font-black text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {isEn ? 'Handover & Warranty' : 'Bàn Giao & Bảo Hành'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? 'Device delivery with a clearly documented warranty slip and prompt technical backup whenever you need it.'
                  : 'Giao máy kèm phiếu bảo hành rõ ràng thời gian và điều kiện. Hỗ trợ kỹ thuật kịp thời khi bạn cần.'}
              </p>
            </div>
          </div>
        </section>

        {/* 5. GÓC TÂM NIỆM LÀM NGHỀ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FBE8DE] text-[#C0392B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A0F0A]">
                {isEn ? 'Our Craftsman Philosophy at Vi Tinh An Tam' : 'Tâm Niệm Làm Nghề Tại Vi Tính An Tâm'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEn ? 'Holding onto sincerity and care in every computer and service' : 'Giữ trọn chữ TÂM trong từng chiếc máy và dịch vụ'}
              </p>
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 pl-0 sm:pl-15">
            <p>
              {isEn
                ? '"Selling a computer or fixing a machine for a client is a relationship built on trust. We believe in honest craftsmanship—diagnosing truthfully, pricing fairly, and representing hardware exactly as it is so that customers can rely on us for years to come."'
                : '"Bán được một cỗ máy hay sửa được một chiếc máy tính cho khách là một cái duyên. Chúng tôi tâm niệm làm nghề tử tế, báo đúng bệnh, lấy đúng giá, máy có sao nói vậy để người dùng tin cậy và gắn bó dài lâu."'}
            </p>
            <p>
              {isEn
                ? '"Client satisfaction and systems that run smoothly each day remain the greatest reward for every technician at Vi Tinh An Tam."'
                : '"Sự hài lòng của khách hàng và những chiếc máy chạy ổn định hàng ngày chính là niềm vui lớn nhất của người làm thợ tại Vi Tính An Tâm."'}
            </p>
          </div>
        </section>

        {/* 6. CALL TO ACTION CUỐI TRANG */}
        <section className="p-8 rounded-3xl bg-white border border-[#E8E2D9] text-center space-y-4 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {isEn ? 'Need Computer Consultation or Technical Support?' : 'Bạn Cần Tư Vấn Máy Tính Hay Cần Hỗ Trợ Kỹ Thuật?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Contact us directly for detailed answers and the best solution tailored to your workflow and budget.'
              : 'Liên hệ trực tiếp với chúng tôi để được giải đáp cụ thể và tư vấn giải pháp phù hợp nhất với nhu cầu của bạn.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/#san-pham"
              className="px-5 py-2.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs shadow-xs transition-colors"
            >
              {isEn ? 'Browse Inventory in Stock' : 'Xem Danh Mục Máy Sẵn Kho'}
            </Link>
            <Link
              href="/dat-lich"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-[#C0392B]" />
              <span>{isEn ? 'Schedule Inspection' : 'Đặt Lịch Kiểm Tra Máy'}</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
