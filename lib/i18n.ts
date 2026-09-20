export type Language = 'vi' | 'en';

export interface Translations {
  nav: {
    home: string;
    whyUs: string;
    products: string;
    services: string;
    contact: string;
    signIn: string;
    dashboard: string;
    signOut: string;
    hotline247: string;
  };
  hero: {
    badgePre: string;
    title: string;
    badgeWin: string;
    badge2h: string;
    desc: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    quickSearchTitle: string;
    quickSearchPlaceholder: string;
    quickSearchBtn: string;
    viewInventoryBtn: string;
    bookServiceBtn: string;
  };
  products: {
    preHeader: string;
    title: string;
    subtitle: string;
    filterAll: string;
    filterOffice: string;
    filterMini: string;
    filterLaptop: string;
    filterWorkstation: string;
    badgeInstock: string;
    badgeOriginal: string;
    badgeCleanOs: string;
    viewQcBtn: string;
    bookNowBtn: string;
    learnMoreBtn: string;
    emptyFilter: string;
    qcModalTitle: string;
    qcModalSubtitle: string;
    qcPassSummary: string;
    closeBtn: string;
    qcModalHeader: string;
    qcSnTag: string;
    qcListedPrice: string;
    qcCpuRamTitle: string;
    qcPrime95: string;
    qcStorageTitle: string;
    qcCrystalDisk: string;
    qcWarehouseTitle: string;
    qcStockCount: (count: number) => string;
    qcShelf: string;
    qcBurnIn: string;
    qcLicense: string;
    qcPolicy: string;
    qcBookDelivery: string;
    qcChatZalo: string;
  };
  services: {
    preHeader: string;
    title: string;
    subtitle: string;
    pkg1Badge: string;
    pkg1Title: string;
    pkg1Desc: string;
    pkg2Badge: string;
    pkg2Title: string;
    pkg2Desc: string;
    pkg3Badge: string;
    pkg3Title: string;
    pkg3Desc: string;
    bookServiceBtn: string;
    quoteBtn: string;
    viewProcessBtn: string;
    ctaBannerTitle: string;
    ctaBannerSubtitle: string;
    ctaActionBtn: string;
  };
  warrantyBanner: {
    preHeader: string;
    title: string;
    desc: string;
    inputPlaceholder: string;
    lookupBtn: string;
    tagExample: string;
  };
  inspection: {
    preHeader: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  reviews: {
    preHeader: string;
    title: string;
    subtitle: string;
    starRating: string;
    verifiedBuyer: string;
  };
  faq: {
    preHeader: string;
    title: string;
    subtitle: string;
    stillQuestions: string;
    callNow: string;
  };
  coverage: {
    preHeader: string;
    title: string;
    subtitle: string;
    hubAddressTitle: string;
    hubAddressVal: string;
    networkRadiusTitle: string;
    networkRadiusVal: string;
    goldenHoursTitle: string;
    goldenHoursVal: string;
    emergencyCallBtn: string;
    bookTechBtn: string;
  };
  floating: {
    warrantyLookup: string;
    hotline: string;
    zaloTech: string;
    scrollToTop: string;
  };
  footer: {
    brandTagline: string;
    hubTitle: string;
    hubAddress: string;
    hotlineZalo: string;
    supportHours: string;
    email: string;
    serviceRadiusTitle: string;
    serviceRadiusDesc: string;
    radius1: string;
    radius2: string;
    radius3: string;
    radius4: string;
    coverageTitle: string;
    coverageDesc: string;
    headquartersTitle: string;
    address: string;
    hotline: string;
    hoursTitle: string;
    weekdays: string;
    weekdaysReception: string;
    weekdaysPriority: string;
    weekends: string;
    weekendsFull: string;
    policyTitle: string;
    policy1: string;
    policy2: string;
    copyright: string;
    warrantyTerms: string;
    adminLogin: string;
  };
  whyUsPage: {
    preHeader: string;
    title: string;
    subtitle: string;
    matrixTag: string;
    matrixTitle: string;
    comparisonItems: Array<{
      tag: string;
      riskTitle: string;
      riskDesc: string;
      resultTitle: string;
      resultDesc: string;
    }>;
    segmentsTitle: string;
    segmentsSubtitle: string;
    tabAll: string;
    tabAccountant: string;
    tabStudent: string;
    tabOffice: string;
    overviewAccountant: {
      problem: string;
      result: string;
      device: string;
    };
    overviewStudent: {
      problem: string;
      result: string;
      device: string;
    };
    overviewOffice: {
      problem: string;
      result: string;
      device: string;
    };
    detailSubtitle: string;
    concernLabel: string;
    solutionLabel: string;
    recommendedLabel: string;
    bookViewBtn: string;
    accountantDetails: {
      label: string;
      problem: string;
      solution: string;
      recommendedDevice: string;
      priceRange: string;
    };
    studentDetails: {
      label: string;
      problem: string;
      solution: string;
      recommendedDevice: string;
      priceRange: string;
    };
    officeDetails: {
      label: string;
      problem: string;
      solution: string;
      recommendedDevice: string;
      priceRange: string;
    };
    standardsTitle: string;
    standardsDesc: string;
    s1: { title: string; desc: string };
    s2: { title: string; desc: string };
    s3: { title: string; desc: string };
    s4: { title: string; desc: string };
    tableTitle: string;
    colCriteria: string;
    colAnTam: string;
    colTraditional: string;
    row1: { crit: string; anTam: string; other: string };
    row2: { crit: string; anTam: string; other: string };
    row3: { crit: string; anTam: string; other: string };
    row4: { crit: string; anTam: string; other: string };
    row5: { crit: string; anTam: string; other: string };
    ctaTitle: string;
    ctaDesc: string;
    ctaBtnInventory: string;
    ctaBtnPhone: string;
    ctaBtnBooking: string;
  };
  bookingPage: {
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    badge2h: string;
    title: string;
    subtitle: string;
    modeTitle: string;
    modeOnsiteTitle: string;
    modeOnsiteDesc: string;
    modeCounterTitle: string;
    modeCounterDesc: string;
    clientInfoTitle: string;
    clientNameLabel: string;
    clientNamePlaceholder: string;
    clientPhoneLabel: string;
    clientPhonePlaceholder: string;
    clientAddressLabel: string;
    clientAddressPlaceholder: string;
    serviceTitle: string;
    deviceModelLabel: string;
    deviceModelPlaceholder: string;
    quickSelectPrompt: string;
    quickServices: string[];
    issueDescPlaceholder: string;
    timeSelectTitle: string;
    dateLabel: string;
    timeSlots: Array<{ label: string; desc: string; icon: string }>;
    submitBtn: string;
    submittingBtn: string;
    reassuranceNote: string;
    successTitle: string;
    successSubtitle: (name: string) => string;
    ticketLabel: string;
    customerLabel: string;
    serviceLabel: string;
    appointmentLabel: string;
    locationLabel: string;
    sendZaloBtn: string;
    bookAnotherBtn: string;
    backHomeBtn: string;
    validationError: string;
    addressError: string;
  };
  warrantyPage: {
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    toastEnterQuery: string;
    toastFound: string;
    toastNotFound: (query: string) => string;
    badgePre: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    searchPlaceholder: string;
    searchBtn: string;
    searchingBtn: string;
    presetPrompt: string;
    tagDellLabel: string;
    tagThinkPadLabel: string;
    tagPhoneLabel: string;
    deviceSelectedBadge: string;
    snLabel: string;
    customerLabel: string;
    handoverDateLabel: string;
    statusActiveBadge: string;
    authSubtitle: string;
    ribbonPackage: string;
    ribbonSsd: string;
    ribbonOs: string;
    ribbonPrivilege: string;
    multiTierTitle: string;
    multiTierSubtitle: string;
    multiTierBadge: string;
    tier1Title: string;
    tier1Remaining: string;
    tier1Note: string;
    tier2Title: string;
    tier2Remaining: string;
    tier2Note: string;
    tier3Title: string;
    tier3Remaining: string;
    tier3Note: string;
    techLeaderLabel: string;
    zaloTechBtn: string;
    bookServiceBtn: string;
    emptyTitle: (query: string) => string;
    emptyDesc: string;
    callHotlineBtn: string;
    supportZaloBtn: string;
  };
}

export const translations: Record<'vi' | 'en', Translations> = {
  vi: {
    nav: {
      home: 'Trang chủ',
      whyUs: 'Vì sao chọn An Tâm',
      products: 'Sản phẩm',
      services: 'Dịch vụ tận nơi',
      contact: 'Liên hệ',
      signIn: 'Đăng nhập',
      dashboard: 'Vào hệ thống quản trị (Dashboard)',
      signOut: 'Đăng xuất',
      hotline247: 'Hotline: 0909.053.058 (24/7)',
    },
    hero: {
      badgePre: 'VI TÍNH AN TÂM • CHUYÊN NGHIỆP & TẬN TÂM',
      title: 'MÁY TÍNH CŨ TUYỂN CHỌN LOẠI 1',
      badgeWin: 'WINDOWS BẢN QUYỀN',
      badge2h: 'DỊCH VỤ XỬ LÝ TẬN NƠI TRONG 2 GIỜ',
      desc: 'Chuyên cung cấp PC/laptop nồi đồng cối đá Dell, HP, ThinkPad nguyên bản loại A, kiểm định 24 bước kỹ thuật nghiêm ngặt.',
      pillar1Title: 'DELL, HP, IBM NGUYÊN BẢN',
      pillar1Desc: 'Ngoại hình đẹp >95%, bo mạch nguyên bản, kiểm định 24 bước kỹ thuật nghiêm ngặt.',
      pillar2Title: 'WINDOWS BẢN QUYỀN',
      pillar2Desc: 'Kích hoạt kỹ thuật số sạch vĩnh viễn, an toàn dữ liệu thuế và kế toán MISA.',
      pillar3Title: 'XỬ LÝ TẬN NƠI TRONG 2 GIỜ',
      pillar3Desc: 'Đổi mới linh kiện tại chỗ, ưu tiên khung giờ vàng 17:30 – 21:00 các ngày trong tuần.',
      quickSearchTitle: 'Tra Cứu Nhanh S/N:',
      quickSearchPlaceholder: 'Nhập Service Tag dập trên thân máy (VD: ST-8F4K92X, HP-400G5M) hoặc SĐT...',
      quickSearchBtn: 'Tra Cứu Hồ Sơ',
      viewInventoryBtn: 'Xem Danh Mục Máy Tuyển Chọn',
      bookServiceBtn: 'Đặt Lịch Kỹ Thuật Tận Nơi',
    },
    products: {
      preHeader: 'THIẾT BỊ NGUYÊN BẢN LOẠI 1',
      title: 'KHO MÁY ĐỒNG BỘ & LAPTOP DOANH NHÂN',
      subtitle: 'Mỗi máy đều vượt qua quy trình kiểm định 24 bước kỹ thuật (Stress-test nhiệt độ, CrystalDiskInfo, Prime95) trước khi bàn giao.',
      filterAll: 'Tất cả thiết bị',
      filterOffice: 'PC Văn phòng & Kế toán',
      filterMini: 'Mini PC 1L tiết kiệm điện',
      filterLaptop: 'Laptop Doanh nhân / Sinh viên',
      filterWorkstation: 'Máy Trạm Đồ họa & Kỹ thuật',
      badgeInstock: 'Có sẵn tại Hub',
      badgeOriginal: 'Nguyên Bản Loại A',
      badgeCleanOs: 'Win Kỹ Thuật Số Sạch',
      viewQcBtn: 'Xem Báo Cáo QC 24 Bước',
      bookNowBtn: 'Đặt Lịch Xem / Giao Tận Nơi',
      learnMoreBtn: 'Xem Chi Tiết Cấu Hình',
      emptyFilter: 'Không tìm thấy thiết bị phù hợp với bộ lọc hiện tại.',
      qcModalTitle: 'BIÊN BẢN KIỂM ĐỊNH KỸ THUẬT 24 BƯỚC',
      qcModalSubtitle: 'Kiểm định độc lập bởi Đội Kỹ Thuật Vi Tính An Tâm trước khi xuất xưởng',
      qcPassSummary: '24/24 Tiêu chuẩn ĐẠT CHUẨN LOẠI A (>95%)',
      closeBtn: 'Đóng Cửa Sổ',
      qcModalHeader: 'ĐẠT CHUẨN LOẠI A (>95%)',
      qcSnTag: 'Số Serial / Service Tag:',
      qcListedPrice: 'Giá niêm yết công khai',
      qcCpuRamTitle: 'CPU & Bộ Nhớ RAM Tuyển Chọn',
      qcPrime95: 'Prime95 Stress Test: Điện áp ổn định, không sụt áp',
      qcStorageTitle: 'Ổ Cứng SSD Mới 100% Chính Hãng',
      qcCrystalDisk: 'CrystalDiskInfo: 100% Good, 0 Giờ chạy, Tốc độ cao',
      qcWarehouseTitle: 'Thông Tin Quản Lý Kho & Xuất Xưởng',
      qcStockCount: (count: number) => `Còn ${count} máy sẵn tại Hub`,
      qcShelf: 'Vị trí kệ kho:',
      qcBurnIn: 'Burn-in tải tối đa:',
      qcLicense: 'Bản quyền hệ điều hành:',
      qcPolicy: 'Chính sách bảo hành:',
      qcBookDelivery: 'Đặt Lịch Xem / Giao Máy Tận Nơi 2H',
      qcChatZalo: 'Chat Zalo Tư Vấn Máy Này',
    },
    services: {
      preHeader: 'DỊCH VỤ LƯU ĐỘNG CHUYÊN NGHIỆP',
      title: 'CỨU HỘ & NÂNG CẤP MÁY TÍNH TẬN NƠI TRONG 2H',
      subtitle: 'Đội ngũ kỹ thuật viên mang sẵn linh kiện mới chính hãng đến tận nhà hoặc cơ quan tại Long An - Tây Ninh. Xem trực tiếp, lấy liền, tuyệt đối minh bạch.',
      pkg1Badge: 'PHỔ BIẾN NHẤT',
      pkg1Title: 'Gói Hồi Sinh Máy Cũ Chạy Như Máy Mới',
      pkg1Desc: 'Nâng cấp SSD NVMe Kingston + Clone nguyên vẹn Windows & dữ liệu phần mềm kế toán MISA, chữ ký số.',
      pkg2Badge: 'HẠ NHIỆT 20°C',
      pkg2Title: 'Spa Làm Mát Sâu & Tra Keo Gốm Xịn',
      pkg2Desc: 'Vệ sinh cánh quạt, buồng gió bằng máy chuyên dụng, tra keo gốm Thermalright TF7 / Arctic MX4 mát lạnh.',
      pkg3Badge: 'BẢN QUYỀN SẠCH',
      pkg3Title: 'Cài Đặt Windows & Phần Mềm Chuẩn',
      pkg3Desc: 'Cài đặt Windows 10/11 Pro sạch không mã độc, bản quyền kỹ thuật số vĩnh viễn, diệt tận gốc virus quảng cáo.',
      bookServiceBtn: 'Đặt Lịch Tiếp Nhận',
      quoteBtn: 'Báo Giá Minh Bạch',
      viewProcessBtn: 'Quy Trình Thực Hiện',
      ctaBannerTitle: 'Cần hỗ trợ máy tính gấp trong hôm nay?',
      ctaBannerSubtitle: 'Kỹ thuật viên lưu động sẵn sàng di chuyển trong vòng 15 phút sau khi tiếp nhận thông tin.',
      ctaActionBtn: 'Gọi Ngay Kỹ Thuật Viên: 0909.053.058',
    },
    warrantyBanner: {
      preHeader: 'BẢO HÀNH MINH BẠCH BẰNG S/N THỰC TẾ',
      title: 'TRA CỨU HẠN BẢO HÀNH ĐIỆN TỬ',
      desc: 'Mọi thiết bị bán ra hay dịch vụ sửa chữa đều được ghi nhận trực tiếp theo Số Serial (S/N) dập trên máy. Không lo mất phiếu giấy hay tem dán rách.',
      inputPlaceholder: 'Nhập S/N (VD: ST-8F4K92X) hoặc Số điện thoại mua hàng...',
      lookupBtn: 'Tra Cứu Ngay',
      tagExample: 'Ví dụ mẫu: ST-8F4K92X, TP-994L2A, hoặc 0918234891',
    },
    inspection: {
      preHeader: 'QUY TRÌNH KIỂM SOÁT NGHIÊM NGẶT',
      title: 'TIÊU CHUẨN 4 TẦNG TRƯỚC KHI XUẤT XƯỞNG',
      subtitle: 'Cam kết chất lượng đo lường bằng thông số kỹ thuật thực tế, không nói suông.',
      step1Title: '1. Kiểm tra Nguồn & Bo mạch',
      step1Desc: 'Đo điện áp tải thực tế, kiểm tra tụ điện bo mạch đảm bảo không phù tụ, không chập chờn.',
      step2Title: '2. Tản nhiệt & Vệ sinh buồng gió',
      step2Desc: 'Vệ sinh quạt gió, tra keo tản nhiệt gốm Thermalright TF7, chạy thử FurMark/Prime95 nhiệt dưới 68°C.',
      step3Title: '3. Ổ cứng SSD Mới 100% Nguyên Hộp',
      step3Desc: 'Nói không với ổ cứng cũ nát. 100% ổ SSD lắp mới chính hãng Kingston, sức khỏe 100% Good.',
      step4Title: '4. Đổi mới tận nơi trong 2 Giờ',
      step4Desc: 'Nếu có lỗi phần cứng trong thời gian bảo hành, KTV mang linh kiện mới đến thay tận nhà trong 2 giờ.',
    },
    reviews: {
      preHeader: 'KHÁCH HÀNG THỰC TẾ',
      title: 'ĐÁNH GIÁ TỪ DOANH NGHIỆP & NGƯỜI DÙNG TẠI ĐỊA PHƯƠNG',
      subtitle: 'Hơn 500+ khách hàng tại Long An - Tây Ninh đã tin tưởng sử dụng dịch vụ và máy tính của Vi Tính An Tâm.',
      starRating: '5.0 / 5.0 Sự Hài Lòng',
      verifiedBuyer: 'Khách hàng xác thực tại địa phương',
    },
    faq: {
      preHeader: 'GIẢI ĐÁP THẮC MẮC',
      title: 'CÂU HỎI THƯỜNG GẶP',
      subtitle: 'Tổng hợp các câu hỏi khách hàng thường quan tâm khi mua máy tính cũ và sử dụng dịch vụ tận nơi.',
      stillQuestions: 'Bạn vẫn còn thắc mắc chưa được giải đáp?',
      callNow: 'Liên hệ tư vấn trực tiếp: 0909.053.058',
    },
    coverage: {
      preHeader: 'MẠNG LƯỚI KỸ THUẬT LƯU ĐỘNG',
      title: 'PHẠM VI PHỤC VỤ TẬN NƠI TẠI LONG AN - TÂY NINH',
      subtitle: 'Đội kỹ thuật lưu động thường trực hỗ trợ nhanh chóng trong bán kính 10km quanh TP. Tân An.',
      hubAddressTitle: 'Trụ sở chính & Phòng Kỹ Thuật:',
      hubAddressVal: '45 Nguyễn Huệ, Phường 1, TP. Tân An, Long An - Tây Ninh',
      networkRadiusTitle: 'Bán kính tiếp nhận cứu hộ tận nơi (10km):',
      networkRadiusVal: 'TP. Tân An, Châu Thành, Thủ Thừa, Tân Trụ, Bến Lức lân cận.',
      goldenHoursTitle: 'Khung giờ vàng ưu tiên (Sau giờ làm việc):',
      goldenHoursVal: '17:30 - 21:00 các ngày trong tuần (Không tính thêm phụ phí ngoài giờ).',
      emergencyCallBtn: 'Gọi Cứu Hộ Khẩn Cấp',
      bookTechBtn: 'Đặt Hẹn Giờ Vàng',
    },
    floating: {
      warrantyLookup: 'Tra cứu bảo hành S/N',
      hotline: 'Hotline: 0909.053.058',
      zaloTech: 'Chat Zalo Kỹ Thuật',
      scrollToTop: 'Lên đầu trang',
    },
    footer: {
      brandTagline: 'Máy Tính Tuyển Chọn Loại 1 & Dịch Vụ Cứu Hộ Tận Nơi Trong 2 Giờ tại Long An - Tây Ninh.',
      hubTitle: 'TRỤ SỞ & PHÒNG KỸ THUẬT',
      hubAddress: '45 Nguyễn Huệ, Phường 1, TP. Tân An, Long An - Tây Ninh',
      hotlineZalo: 'Hotline / Zalo: 0909.053.058 (Trực 24/7)',
      supportHours: 'Giờ phục vụ: 08:00 - 21:00 (Cả T7 & CN)',
      email: 'Email kỹ thuật: hotro@vitinhantham.vn',
      serviceRadiusTitle: 'PHẠM VI PHỤC VỤ TẬN NƠI (10KM)',
      serviceRadiusDesc: 'Kỹ thuật viên lưu động tiếp nhận cứu hộ và giao máy trong vòng 2 giờ tại các khu vực:',
      radius1: 'TP. Tân An (Tất cả các phường/xã)',
      radius2: 'Huyện Thủ Thừa (Thị trấn Thủ Thừa, Nhị Thành...)',
      radius3: 'Huyện Châu Thành (Tầm Vu, Hiệp Thạnh...)',
      radius4: 'Huyện Tân Trụ & Giáp ranh Bến Lức',
      coverageTitle: 'PHẠM VI PHỤC VỤ TẬN NƠI (10KM)',
      coverageDesc: 'Kỹ thuật viên lưu động có mặt trong 2 giờ tại: TP. Tân An, Huyện Thủ Thừa, Huyện Châu Thành, Huyện Tân Trụ và các khu vực lân cận Bến Lức.',
      headquartersTitle: 'TRỤ SỞ & PHÒNG KỸ THUẬT',
      address: '45 Nguyễn Huệ, Phường 1, TP. Tân An, Long An - Tây Ninh',
      hotline: 'Hotline / Zalo: 0909.053.058 (Trực kỹ thuật 24/7)',
      hoursTitle: 'GIỜ PHỤC VỤ LINH HOẠT',
      weekdays: 'Thứ 2 - Thứ 6:',
      weekdaysReception: 'thời gian tiếp nhận thông tin: 08h00 - 17h30',
      weekdaysPriority: 'Cứu hộ tận nơi ưu tiên: 17h30 - 21h00',
      weekends: 'Thứ 7 & Chủ Nhật:',
      weekendsFull: 'Phục vụ trọn ngày: 08h00 - 21h00',
      policyTitle: 'CHÍNH SÁCH & ĐIỀU LỆ',
      policy1: 'Chính sách 1 đổi 1 tận nơi nhanh chóng',
      policy2: 'Cam kết tuyệt đối bảo mật dữ liệu khách hàng',
      copyright: '© 2025 Vi Tính An Tâm (vitinhantham.vn) - Tận tâm trao chất lượng.',
      warrantyTerms: 'Quy định bảo hành',
      adminLogin: 'Đăng nhập nội bộ',
    },
    whyUsPage: {
      preHeader: 'RÕ RÀNG • MINH BẠCH • KẾT QUẢ THỰC TẾ',
      title: 'VÌ SAO KHÁCH HÀNG LỰA CHỌN VI TÍNH AN TÂM?',
      subtitle: 'Giải quyết trực tiếp mọi mối lo máy tính bằng cam kết đo lường được: 100% SSD mới, Windows bản quyền số vĩnh viễn, kiểm tra theo S/N máy và cứu hộ tận nơi trong 2 giờ.',
      matrixTag: 'SO SÁNH MINH BẠCH',
      matrixTitle: 'Mối Lo Thường Gặp & Giải Pháp Thực Tế Tại An Tâm',
      comparisonItems: [
        {
          tag: 'SSD / RAM MỚI 100%',
          riskTitle: 'Mua máy cũ sợ linh kiện nát, hỏng vặt',
          riskDesc: 'Sợ mua nhầm máy chắp vá, SSD cũ sắp chết làm mất dữ liệu, vừa mua vài tháng đã phải tốn tiền sửa.',
          resultTitle: '100% SSD/RAM MỚI • BAO DÙNG THỬ 30 NGÀY',
          resultDesc: 'Lắp ráp ổ SSD & RAM chính hãng mới 100% nguyên hộp bảo hành 36 tháng. Thân máy nguyên bản được bao dùng thử 30 ngày 1 đổi 1.',
        },
        {
          tag: 'WIN BẢN QUYỀN SỐ',
          riskTitle: 'Win lậu gây đơ máy, dính virus tống tiền',
          riskDesc: 'Bản Ghost lậu dính mã độc tống tiền Ransomware, bị ngắt giữa chừng khi xuất hóa đơn hay khai thuế kế toán MISA.',
          resultTitle: '100% WINDOWS PRO BẢN QUYỀN SỐ VĨNH VIỄN',
          resultDesc: 'Kích hoạt bản quyền gốc theo máy, tuyệt đối không dùng tool crack lậu. Hệ điều hành sạch giúp máy chạy siêu mượt và an toàn dữ liệu.',
        },
        {
          tag: 'KỸ THUẬT MINH BẠCH',
          riskTitle: 'E ngại bị "luộc đồ" khi để máy lại tiệm',
          riskDesc: 'Tâm lý lo lắng bị tráo đổi linh kiện zin hoặc bị nâng giá khi phải gửi máy qua đêm để sửa chữa.',
          resultTitle: 'KỸ THUẬT MỞ: XEM TRỰC TIẾP LẤY LIỀN 20 PHÚT',
          resultDesc: 'Kỹ thuật viên thao tác minh bạch ngay trước mắt bạn. Nâng cấp, vệ sinh xong lấy ngay trong 20–30 phút, không giữ máy ngâm đồ.',
        },
        {
          tag: 'CỨU HỘ TẬN NƠI 2H',
          riskTitle: 'Bận giờ làm việc, bảo hành chờ cả tuần',
          riskDesc: 'Không thể mang máy đi tiệm trong giờ hành chính; khi bị lỗi phải gửi chành xe chờ đợi gián đoạn công việc.',
          resultTitle: 'XỬ LÝ TẬN NƠI 2H • PHỤC VỤ KHUNG 17:30 - 21:00',
          resultDesc: 'Đội kỹ thuật hỗ trợ giao máy, thay thế linh kiện tận nơi trong 2h tại Long An - Tây Ninh. Phục vụ chiều tối và trọn ngày cuối tuần.',
        },
      ],
      segmentsTitle: 'GIẢI PHÁP ĐÚNG NHU CẦU - TIẾT KIỆM CHI PHÍ',
      segmentsSubtitle: 'Chọn nhóm đối tượng bên dưới để xem cấu hình và giải pháp tối ưu nhất cho bạn:',
      tabAll: 'Tất cả giải pháp',
      tabAccountant: 'Hộ Kinh Doanh & Kế Toán',
      tabStudent: 'Học Sinh & Phụ Huynh',
      tabOffice: 'Cán Bộ & Nhân Viên Văn Phòng',
      overviewAccountant: {
        problem: 'Treo máy lúc xuất hóa đơn thuế.',
        result: 'PC Dell/HP đồng bộ + Win bản quyền số ➔ Chạy 24/7 ổn định.',
        device: 'Cấu hình: Dell OptiPlex Core i5',
      },
      overviewStudent: {
        problem: 'Máy mới quá đắt tiền.',
        result: 'ThinkPad T480s nồi đồng cối đá dưới 6 triệu ➔ Bền 3-5 năm.',
        device: 'Cấu hình: ThinkPad T480s Carbon',
      },
      overviewOffice: {
        problem: 'Bận không mang máy đi tiệm được.',
        result: 'KTV ghé tận nhà ngoài giờ hành chính ➔ Xử lý tại chỗ 20 phút.',
        device: 'Cấu hình: HP ProDesk Mini 1L',
      },
      detailSubtitle: 'Giải pháp chuyên biệt cho nhu cầu của bạn',
      concernLabel: 'Mối bận tâm chính:',
      solutionLabel: 'Kết quả thực tế tại An Tâm:',
      recommendedLabel: 'Dòng máy đề xuất:',
      bookViewBtn: 'Đặt lịch xem máy',
      accountantDetails: {
        label: 'Hộ Kinh Doanh & Kế Toán',
        problem: 'Máy tính bị treo đơ lúc đang xuất hóa đơn điện tử hoặc tính tiền cho khách.',
        solution: 'PC Dell/HP đồng bộ siêu bền + Win bản quyền số ➔ Chạy mượt 24/7, xuất hóa đơn xèo xèo, hỗ trợ kỹ thuật cài máy in tận nơi.',
        recommendedDevice: 'Dell OptiPlex 7060 SFF (Core i5, 16GB RAM, SSD 256GB NVMe)',
        priceRange: '4.950.000₫',
      },
      studentDetails: {
        label: 'Học Sinh & Phụ Huynh',
        problem: 'Máy tính mới chính hãng quá đắt đỏ trong khi nhu cầu chỉ học tập và tin học văn phòng.',
        solution: 'Laptop Dell, ThinkPad vỏ carbon nồi đồng cối đá dưới 6 triệu ➔ Tiết kiệm 50% ngân sách, bàn phím gõ êm, dùng bền 3-5 năm.',
        recommendedDevice: 'ThinkPad T480s (Core i5, 16GB RAM, Màn 14" FHD chống chói)',
        priceRange: '6.200.000₫',
      },
      officeDetails: {
        label: 'Cán Bộ & Nhân Viên Văn Phòng',
        problem: 'Bận rộn giờ hành chính không thể mang máy ra tiệm sửa chữa hay cài đặt.',
        solution: 'Kỹ thuật viên ghé tận nhà ngoài giờ hành chính (17h30 - 21h00) hoặc xử lý qua Ultraviewer trong 15 phút.',
        recommendedDevice: 'HP ProDesk 400 G5 Mini (Gắn lưng màn hình, siêu tiết kiệm điện)',
        priceRange: '3.400.000₫',
      },
      standardsTitle: 'TIÊU CHUẨN KIỂM ĐỊNH KHÁC BIỆT',
      standardsDesc: 'Mỗi chiếc máy bán ra đều trải qua quy trình kiểm tra 24 bước kỹ thuật.',
      s1: { title: 'Nguồn & Tụ Bo Mạch', desc: 'Kiểm tra tụ điện, đo điện áp tải thực tế bằng đồng hồ chuyên dụng.' },
      s2: { title: 'Keo Tản Nhiệt Xịn', desc: 'Vệ sinh sạch buồng tản, tra keo gốm Thermalright TF7 / Arctic MX4 mát lạnh.' },
      s3: { title: 'Burn-in Test 45 Phút', desc: 'Chạy Full-load CPU & GPU để đảm bảo máy không bao giờ sập nguồn đột ngột.' },
      s4: { title: 'Định Danh Bằng S/N', desc: 'Tra cứu hạn bảo hành điện tử minh bạch trên website theo Service Tag máy.' },
      tableTitle: 'BẢNG SO SÁNH GIÁ TRỊ THỰC TẾ',
      colCriteria: 'Tiêu Chí Đánh Giá',
      colAnTam: 'Vi Tính An Tâm',
      colTraditional: 'Cửa Hàng Máy Tính Cũ Truyền Thống',
      row1: { crit: 'Nguồn gốc & Bo mạch', anTam: 'Hàng đồng bộ Dell/HP nguyên bản Loại A (>95%)', other: 'Máy lắp ráp chắp vá, linh kiện trôi nổi' },
      row2: { crit: 'Ổ cứng lưu trữ', anTam: 'SSD NVMe mới 100% Kingston chính hãng (BH 36T)', other: 'Thường tận dụng SSD cũ chạy nhiều năm' },
      row3: { crit: 'Thời gian bảo hành tận nơi', anTam: 'Đổi mới tại chỗ trong 2 giờ (bán kính 10km)', other: 'Phải tự chở máy đến tiệm, ngâm 3-7 ngày' },
      row4: { crit: 'Phục vụ ngoài giờ', anTam: 'Khung giờ vàng 17:30 - 21:00 (không phụ thu)', other: 'Chỉ làm việc giờ hành chính' },
      row5: { crit: 'Bảo mật dữ liệu sổ sách', anTam: 'Ký cam kết bảo mật & Clone nguyên trạng', other: 'Dễ bị cài lại trắng mất dữ liệu kế toán' },
      ctaTitle: 'SẴN SÀNG TRẢI NGHIỆM SỰ AN TÂM TRỌN VẸN?',
      ctaDesc: 'Liên hệ ngay với Vi Tính An Tâm để được tư vấn cấu hình máy nồi đồng cối đá Dell, HP, ThinkPad vừa vặn nhất với nhu cầu của bạn.',
      ctaBtnInventory: 'Xem Danh Mục PC / Laptop',
      ctaBtnPhone: 'Hotline / Zalo: 0909.053.058',
      ctaBtnBooking: 'Đặt Lịch Kỹ Thuật Tận Nơi',
    },
    bookingPage: {
      breadcrumbHome: 'Trang chủ',
      breadcrumbCurrent: 'Đặt lịch dịch vụ',
      badge2h: 'Cứu Hộ Tận Nơi Trong 2 Giờ (Bán Kính 10KM)',
      title: 'Đặt Lịch Sửa Chữa & Nâng Cấp Máy Tính',
      subtitle: 'Kỹ thuật viên An Tâm mang đầy đủ trang thiết bị chuyên dụng đến kiểm tra, bảo dưỡng và xử lý trực tiếp trước sự giám sát của quý khách.',
      modeTitle: '1. Chọn hình thức phục vụ',
      modeOnsiteTitle: 'KTV Đến Tận Nơi (Trong 2 Giờ)',
      modeOnsiteDesc: 'Phục vụ tận nhà/văn phòng tại Tân An và bán kính 10km (Long An - Tây Ninh)',
      modeCounterTitle: 'Mang Máy Đến Cửa Hàng',
      modeCounterDesc: '45 Nguyễn Huệ, P.1, Tân An (Có chỗ đỗ xe, kiểm tra & lấy ngay sau 30 phút)',
      clientInfoTitle: '2. Thông tin khách hàng',
      clientNameLabel: 'Họ và tên *',
      clientNamePlaceholder: 'VD: Nguyễn Văn An',
      clientPhoneLabel: 'Số điện thoại / Zalo *',
      clientPhonePlaceholder: 'VD: 0909053058',
      clientAddressLabel: 'Địa chỉ tiếp nhận tận nơi *',
      clientAddressPlaceholder: 'Số nhà, tên đường, phường/xã (VD: 42 Hùng Vương, P.2, Tân An)',
      serviceTitle: '3. Nhu cầu sửa chữa / Nâng cấp',
      deviceModelLabel: 'Dòng máy / Thiết bị',
      deviceModelPlaceholder: 'VD: PC Dell OptiPlex 7060, ThinkPad T480s, Laptop HP...',
      quickSelectPrompt: 'Bấm chọn nhanh gói dịch vụ:',
      quickServices: [
        'Nâng cấp SSD NVMe Kingston 256GB (Tăng tốc x5)',
        'Spa làm mát tra keo Thermalright TF7 (Hạ 15-20°C)',
        'Cài lại Windows 10/11 Pro sạch không crack',
        'Máy tính bật không lên nguồn / Kêu tít tít',
        'Khắc phục máy chậm, đơ khi mở phần mềm MISA/Excel',
      ],
      issueDescPlaceholder: 'Mô tả cụ thể hiện trạng máy (VD: Máy đang chạy chậm, cần nâng SSD 256GB và cài Win sạch)...',
      timeSelectTitle: '4. Chọn ngày & khung giờ tiếp nhận',
      dateLabel: 'Ngày hẹn',
      timeSlots: [
        { label: 'Sáng (08:00 - 11:30)', desc: 'Tiếp nhận giờ hành chính', icon: '🌅' },
        { label: 'Chiều (13:30 - 17:30)', desc: 'Xử lý trong ngày', icon: '🌤️' },
        { label: 'Khung giờ vàng (17:30 - 21:00)', desc: 'Ưu tiên cứu hộ sau giờ làm (Không phụ thu)', icon: '⚡' },
        { label: 'Cứu hộ khẩn cấp (Trong 60 phút)', desc: 'Đội cơ động xuất phát ngay', icon: '🚨' },
      ],
      submitBtn: 'Xác Nhận Đặt Lịch Hẹn Ngay',
      submittingBtn: 'Đang gửi yêu cầu tiếp nhận...',
      reassuranceNote: 'Cam kết: Kỹ thuật viên có mặt đúng hẹn • Minh bạch linh kiện • Báo giá trước khi thực hiện.',
      successTitle: 'Đặt Lịch Thành Công!',
      successSubtitle: (name: string) => `Cảm ơn ${name}, kỹ thuật viên trực ca sẽ liên hệ xác nhận trong vòng 10 phút.`,
      ticketLabel: 'Mã phiếu tiếp nhận:',
      customerLabel: 'Khách hàng:',
      serviceLabel: 'Dịch vụ yêu cầu:',
      appointmentLabel: 'Thời gian hẹn:',
      locationLabel: 'Địa điểm:',
      sendZaloBtn: 'Gửi Xác Nhận Qua Zalo Kỹ Thuật',
      bookAnotherBtn: 'Đặt thêm lịch khác',
      backHomeBtn: 'Về trang chủ',
      validationError: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nhu cầu dịch vụ!',
      addressError: 'Vui lòng nhập địa chỉ cụ thể tại Tân An hoặc các huyện lân cận (Long An - Tây Ninh)!',
    },
    warrantyPage: {
      breadcrumbHome: 'Trang chủ',
      breadcrumbCurrent: 'Tra cứu bảo hành',
      toastEnterQuery: 'Vui lòng nhập Số Serial (S/N) dập trên máy hoặc Số điện thoại!',
      toastFound: 'Tìm thấy hồ sơ thiết bị thành công!',
      toastNotFound: (q: string) => `Không tìm thấy hồ sơ cho "${q}". Vui lòng kiểm tra lại S/N hoặc SĐT!`,
      badgePre: 'CỔNG BẢO HÀNH ĐIỆN TỬ THEO SỐ SERIAL (S/N)',
      title: 'TRA CỨU BẢO HÀNH &',
      titleHighlight: 'LỊCH SỬ THIẾT BỊ',
      subtitle: 'Không cần giữ phiếu giấy hay tem dán rách. Hệ thống đối chiếu trực tiếp theo Số Serial (S/N) dập sẵn trên thân máy hoặc Số điện thoại mua hàng.',
      searchPlaceholder: 'Nhập S/N dập trên máy (VD: ST-8F4K92X) hoặc SĐT (0918...)',
      searchBtn: 'Kiểm Tra Ngay',
      searchingBtn: 'Đang kiểm tra...',
      presetPrompt: 'Thử nhanh mẫu S/N:',
      tagDellLabel: 'ST-8F4K92X (Dell OptiPlex)',
      tagThinkPadLabel: 'TP-994L2A (ThinkPad T480s)',
      tagPhoneLabel: '0918234891 (SĐT khách)',
      deviceSelectedBadge: 'Nguyên bản tuyển chọn',
      snLabel: 'Số Serial (S/N):',
      customerLabel: 'Khách hàng cá nhân',
      handoverDateLabel: 'Bàn giao:',
      statusActiveBadge: 'Đang trong thời hạn bảo hành chính thức',
      authSubtitle: 'Xác thực hệ thống Vi Tính An Tâm • 1 Đổi 1 Tận Nơi 2H',
      ribbonPackage: 'Gói dịch vụ',
      ribbonSsd: 'Sức khỏe Ổ cứng SSD',
      ribbonOs: 'Bản quyền Hệ điều hành',
      ribbonPrivilege: 'Chính sách đặc quyền',
      multiTierTitle: 'CHI TIẾT THỜI HẠN BẢO HÀNH ĐA TẦNG (Multi-tier Warranty)',
      multiTierSubtitle: 'Bảo hành độc lập theo từng linh kiện, đối chiếu theo S/N máy mà không làm gián đoạn công việc',
      multiTierBadge: '3 Tầng Bảo Hành',
      tier1Title: 'Thân máy, Mainboard & Nguồn CST',
      tier1Remaining: 'Còn 115 ngày bảo hành',
      tier1Note: '* Hỗ trợ đổi ngay bo mạch hoặc nguồn trong 15 phút tại quầy hoặc trong 2 giờ tận nơi tại Tân An.',
      tier2Title: 'Ổ cứng SSD NVMe & RAM Mới 100%',
      tier2Remaining: 'Bảo hành hãng 36 tháng',
      tier2Note: '* Bảo hành đổi mới 100% nguyên hộp bởi nhà phân phối chính hãng.',
      tier3Title: 'Hỗ trợ Kỹ thuật & Phần mềm Ultraviewer',
      tier3Remaining: 'Trực ca 24/7 (30 ngày miễn phí)',
      tier3Note: '* Hỗ trợ cài máy in hoá đơn, chữ ký số thuế, MISA và xử lý lỗi phát sinh qua mạng.',
      techLeaderLabel: 'Kỹ thuật viên phụ trách:',
      zaloTechBtn: 'Nhắn Zalo Kỹ thuật',
      bookServiceBtn: 'Đặt Lịch Bảo Dưỡng / Sửa Chữa',
      emptyTitle: (q: string) => `Không Tìm Thấy Thông Tin Cho "${q}"`,
      emptyDesc: 'Bạn có thể tìm Số Serial (S/N) hoặc Service Tag in trên nhãn dập ở mặt đáy laptop hoặc mặt sau/hông thùng máy PC (Dell: tem Service Tag 7 ký tự; ThinkPad: Serial Number; HP: S/N).',
      callHotlineBtn: 'Gọi Hotline Kỹ Thuật: 0909.053.058',
      supportZaloBtn: 'Hỗ trợ qua Zalo',
    },
  },
  en: {
    nav: {
      home: 'Home',
      whyUs: 'Why Choose Us',
      products: 'Certified Inventory',
      services: 'On-Site Services',
      contact: 'Service Coverage',
      signIn: 'Staff Login',
      dashboard: 'Admin Dashboard',
      signOut: 'Sign Out',
      hotline247: 'Hotline: +84 909.053.058 (24/7)',
    },
    hero: {
      badgePre: 'VI TINH AN TAM • DEDICATED IT EXCELLENCE',
      title: 'GRADE-A CERTIFIED REFURBISHED WORKSTATIONS',
      badgeWin: 'GENUINE DIGITAL OS LICENSE',
      badge2h: '2-HOUR ON-SITE DISPATCH GUARANTEE',
      desc: 'Specializing in enterprise-grade Dell, HP, and ThinkPad systems with authentic motherboards, certified via rigorous 24-step technical stress tests.',
      pillar1Title: 'AUTHENTIC DELL, HP, IBM',
      pillar1Desc: 'Pristine aesthetic condition (>95%), untouched factory motherboards, verified through 24 rigorous QC checkpoints.',
      pillar2Title: 'GENUINE DIGITAL LICENSE',
      pillar2Desc: 'Permanent digital Windows Pro activation, safeguarding corporate tax data and MISA accounting software.',
      pillar3Title: '2-HOUR ON-SITE RESPONSE',
      pillar3Desc: 'Direct component swap on-site, with priority Golden Hours (17:30 – 21:00) during weekdays without surcharge.',
      quickSearchTitle: 'Instant S/N Warranty Lookup:',
      quickSearchPlaceholder: 'Enter physical chassis Service Tag (e.g., ST-8F4K92X, HP-400G5M) or phone number...',
      quickSearchBtn: 'Check Warranty',
      viewInventoryBtn: 'Explore Certified Workstations',
      bookServiceBtn: 'Schedule On-Site Technician',
    },
    products: {
      preHeader: 'ORIGINAL GRADE-A HARDWARE',
      title: 'ENTERPRISE DESKTOPS & BUSINESS LAPTOPS',
      subtitle: 'Every unit passes our exhaustive 24-step technical stress test (thermal load, CrystalDiskInfo, Prime95) before customer handover.',
      filterAll: 'All Devices',
      filterOffice: 'Office & Accounting PCs',
      filterMini: 'Ultra-Compact Mini PCs (1L)',
      filterLaptop: 'Business & Student Laptops',
      filterWorkstation: 'CAD & Rendering Workstations',
      badgeInstock: 'Ready at Hub',
      badgeOriginal: 'Grade-A Authentic',
      badgeCleanOs: 'Clean Digital OS',
      viewQcBtn: 'Inspect 24-Step QC Report',
      bookNowBtn: 'Book Inspection / Dispatch',
      learnMoreBtn: 'View Detailed Specs',
      emptyFilter: 'No certified units found matching selected filter criteria.',
      qcModalTitle: '24-STEP HARDWARE CERTIFICATION REPORT',
      qcModalSubtitle: 'Independently audited by Vi Tính An Tâm Engineering Lab prior to dispatch',
      qcPassSummary: '24/24 Metrics CERTIFIED GRADE-A (>95%)',
      closeBtn: 'Close Report',
      qcModalHeader: 'CERTIFIED GRADE-A (>95%)',
      qcSnTag: 'Serial Number / Service Tag:',
      qcListedPrice: 'Official Listed Price',
      qcCpuRamTitle: 'Selected Enterprise CPU & RAM',
      qcPrime95: 'Prime95 Stress Test: Steady voltage, zero throttling',
      qcStorageTitle: '100% Brand-New Factory SSD',
      qcCrystalDisk: 'CrystalDiskInfo: 100% Good, 0 Power-On Hours',
      qcWarehouseTitle: 'Inventory Management & Dispatch',
      qcStockCount: (count: number) => `Ready: ${count} in stock at Hub`,
      qcShelf: 'Warehouse shelf:',
      qcBurnIn: 'Burn-in stress duration:',
      qcLicense: 'Operating system license:',
      qcPolicy: 'Warranty coverage:',
      qcBookDelivery: 'Book On-Site Inspection / 2-Hour Dispatch',
      qcChatZalo: 'Consult via Technician Zalo',
    },
    services: {
      preHeader: 'RAPID MOBILE IT SERVICES',
      title: '2-HOUR ON-SITE PC RESCUE & UPGRADES',
      subtitle: 'Equipped mobile technicians carry brand-new components directly to your premises in Long An - Tay Ninh. Live inspection, instant turnaround, 100% transparency.',
      pkg1Badge: 'MOST POPULAR',
      pkg1Title: 'Complete Workstation Rejuvenation Spa',
      pkg1Desc: 'Kingston NVMe SSD upgrade + byte-for-byte exact migration of Windows, MISA accounting database, and digital signatures.',
      pkg2Badge: 'DROP 20°C',
      pkg2Title: 'Deep Thermal Spa & Ceramic Paste Treatment',
      pkg2Desc: 'Industrial dust evacuation, fan bearing lubrication, and Thermalright TF7 / Arctic MX4 ceramic thermal compound application.',
      pkg3Badge: 'CLEAN SYSTEM',
      pkg3Title: 'Clean OS Installation & Security Purge',
      pkg3Desc: 'Clean Windows 10/11 Pro OEM installation, permanent digital license, complete eradication of intrusive malware and adware.',
      bookServiceBtn: 'Schedule Service',
      quoteBtn: 'Transparent Pricing',
      viewProcessBtn: 'Standard Protocol',
      ctaBannerTitle: 'Experiencing urgent computer downtime today?',
      ctaBannerSubtitle: 'Our mobile technical unit dispatches within 15 minutes of request confirmation.',
      ctaActionBtn: 'Call On-Duty Tech: +84 909.053.058',
    },
    warrantyBanner: {
      preHeader: 'TRANSPARENT S/N-BASED WARRANTY',
      title: 'ONLINE ELECTRONIC WARRANTY LOOKUP',
      desc: 'All hardware and repair tickets are linked directly to the physical factory Serial Number (S/N) stamped on the chassis. Never worry about lost receipts or torn stickers.',
      inputPlaceholder: 'Enter Service Tag (e.g. ST-8F4K92X) or registered phone number...',
      lookupBtn: 'Verify Status',
      tagExample: 'Sample demo tags: ST-8F4K92X, TP-994L2A, or 0918234891',
    },
    inspection: {
      preHeader: 'RIGOROUS QUALITY ASSURANCE',
      title: '4-LAYER PRE-DELIVERY CERTIFICATION PROTOCOL',
      subtitle: 'Engineering excellence verified with empirical data, not marketing claims.',
      step1Title: '1. Power Supply & Motherboard Stress Test',
      step1Desc: 'Real-load voltage multimeter verification, capacitor inspection ensuring zero swelling or current leakage.',
      step2Title: '2. Thermal Dissipation & Dust Evacuation',
      step2Desc: 'Deep airflow cleaning, Thermalright TF7 ceramic paste, continuous FurMark/Prime95 burn-in below 68°C.',
      step3Title: '3. 100% Brand-New Factory-Sealed SSD',
      step3Desc: 'Zero refurbished or degraded drives. 100% brand-new Kingston SSDs backed by 36-month official warranty.',
      step4Title: '4. 2-Hour Rapid On-Site Replacement',
      step4Desc: 'In case of hardware failure during the warranty window, an engineer arrives with brand-new replacement parts in 2 hours.',
    },
    reviews: {
      preHeader: 'CLIENT TESTIMONIALS',
      title: 'TRUSTED BY CORPORATIONS & PROFESSIONALS',
      subtitle: 'Over 500+ businesses and local organizations in Long An - Tay Ninh rely on Vi Tính An Tâm.',
      starRating: '5.0 / 5.0 Customer Satisfaction',
      verifiedBuyer: 'Verified Local Enterprise Client',
    },
    faq: {
      preHeader: 'FREQUENTLY ASKED QUESTIONS',
      title: 'EVERYTHING YOU NEED TO KNOW',
      subtitle: 'Comprehensive answers regarding our certified computers, testing protocol, and 2-hour on-site warranty.',
      stillQuestions: 'Have additional technical inquiries?',
      callNow: 'Direct Engineering Consultation: +84 909.053.058',
    },
    coverage: {
      preHeader: 'MOBILE TECHNICAL NETWORK',
      title: 'ON-SITE SERVICE COVERAGE IN LONG AN - TAY NINH',
      subtitle: 'Rapid deployment mobile teams stationed within a 10km radius of Tan An City Hub.',
      hubAddressTitle: 'Headquarters & Technical Hub:',
      hubAddressVal: '45 Nguyen Hue, Ward 1, Tan An City, Long An - Tay Ninh',
      networkRadiusTitle: 'On-site emergency dispatch radius (10km):',
      networkRadiusVal: 'Tan An City, Chau Thanh, Thu Thua, Tan Tru, and adjacent Ben Luc districts.',
      goldenHoursTitle: 'Priority Golden Hours (Post-Work Schedule):',
      goldenHoursVal: '17:30 - 21:00 on weekdays (Zero additional after-hours surcharge).',
      emergencyCallBtn: 'Emergency Dispatch',
      bookTechBtn: 'Book Golden Hours',
    },
    floating: {
      warrantyLookup: 'S/N Warranty Check',
      hotline: 'Hotline: 0909.053.058',
      zaloTech: 'Zalo Technical Chat',
      scrollToTop: 'Back to Top',
    },
    footer: {
      brandTagline: 'Grade-A Certified Business Hardware & 2-Hour On-Site Rapid Dispatch in Long An - Tay Ninh.',
      hubTitle: 'TECHNICAL HEADQUARTERS',
      hubAddress: '45 Nguyen Hue, Ward 1, Tan An City, Long An - Tay Ninh',
      hotlineZalo: 'Hotline / Zalo: +84 909.053.058 (24/7 Desk)',
      supportHours: 'Operating Hours: 08:00 - 21:00 (Daily)',
      email: 'Technical Desk: hotro@vitinhantham.vn',
      serviceRadiusTitle: 'ON-SITE COVERAGE RADIUS (10KM)',
      serviceRadiusDesc: 'Mobile engineers arrive within 2 hours across Tan An City and surrounding districts:',
      radius1: 'Tan An City (All wards & communes)',
      radius2: 'Thu Thua District (Thu Thua town, Nhi Thanh...)',
      radius3: 'Chau Thanh District (Tam Vu, Hiep Thanh...)',
      radius4: 'Tan Tru District & Ben Luc boundaries',
      coverageTitle: 'ON-SITE COVERAGE RADIUS (10KM)',
      coverageDesc: 'Mobile engineers arrive within 2 hours across Tan An City, Thu Thua District, Chau Thanh District, Tan Tru District, and neighboring Ben Luc boundaries.',
      headquartersTitle: 'TECHNICAL HEADQUARTERS',
      address: '45 Nguyen Hue, Ward 1, Tan An City, Long An - Tay Ninh',
      hotline: 'Hotline / Zalo: +84 909.053.058 (24/7 Technical Desk)',
      hoursTitle: 'FLEXIBLE SERVICE HOURS',
      weekdays: 'Monday - Friday:',
      weekdaysReception: 'Office & diagnostic reception: 08:00 - 17:30',
      weekdaysPriority: 'Priority on-site dispatch: 17:30 - 21:00',
      weekends: 'Saturday & Sunday:',
      weekendsFull: 'Full-day service: 08:00 - 21:00',
      policyTitle: 'GOVERNANCE & POLICIES',
      policy1: 'Expedited 2-hour on-site 1-to-1 swap policy',
      policy2: 'Strict non-disclosure & customer data integrity guarantee',
      copyright: '© 2025 Vi Tính An Tâm (vitinhantham.vn) - Dedicated to Genuine Quality.',
      warrantyTerms: 'Warranty Policy',
      adminLogin: 'Internal Portal',
    },
    whyUsPage: {
      preHeader: 'CLEAR • TRANSPARENT • MEASURABLE RESULTS',
      title: 'WHY DO CLIENTS CHOOSE VI TINH AN TAM?',
      subtitle: 'Eliminating every computer worry with measurable guarantees: 100% brand-new SSDs, permanent digital Windows licenses, S/N verification, and 2-hour on-site rapid dispatch.',
      matrixTag: 'TRANSPARENT COMPARISON',
      matrixTitle: 'Common Industry Worries vs. Concrete Realities at An Tam',
      comparisonItems: [
        {
          tag: '100% BRAND-NEW SSD / RAM',
          riskTitle: 'Fear of worn components & sudden data loss',
          riskDesc: 'Anxiety over patched secondhand PCs, dying drives causing critical data loss, and unexpected repair expenses shortly after purchase.',
          resultTitle: '100% BRAND-NEW SSD/RAM • 30-DAY RISK-FREE TRIAL',
          resultDesc: 'Pre-assembled with factory-sealed Kingston SSD & RAM backed by a 36-month warranty. Original chassis covered by an immediate 30-day 1-to-1 replacement guarantee.',
        },
        {
          tag: 'GENUINE DIGITAL LICENSE',
          riskTitle: 'Pirated OS causing freezing & ransomware risks',
          riskDesc: 'Cracked ghost builds carrying ransomware, crashing midway during tax filings or MISA electronic invoicing.',
          resultTitle: '100% PERMANENT DIGITAL WINDOWS PRO',
          resultDesc: 'OEM digital license permanently attached to hardware, zero crack tools. Clean OS ensures top responsiveness and corporate data safety.',
        },
        {
          tag: 'TRANSPARENT OPEN BENCH',
          riskTitle: 'Fear of swapped parts when leaving PC at shops',
          riskDesc: 'Anxiety over swapped original components or inflated repair bills when forced to leave machines overnight.',
          resultTitle: 'OPEN BENCH: WATCH IN PERSON, 20-MIN TURNAROUND',
          resultDesc: 'Technicians operate in plain sight. Upgrades and thermal servicing completed in 20-30 minutes, no overnight holding.',
        },
        {
          tag: '2-HOUR ON-SITE DISPATCH',
          riskTitle: 'Busy work hours, waiting a whole week for warranty',
          riskDesc: 'Unable to transport heavy desktops during office hours; waiting for interprovincial shipping disrupts workflow.',
          resultTitle: '2H ON-SITE RESPONSE • EVENING HOURS 17:30 - 21:00',
          resultDesc: 'Mobile engineering dispatch for on-site delivery and part replacement within 2 hours across Long An - Tay Ninh. Available evenings and weekends.',
        },
      ],
      segmentsTitle: 'OPTIMAL SOLUTIONS TAILORED TO YOUR EXACT WORKLOAD',
      segmentsSubtitle: 'Select your user category below to view our best-fitting configuration and recommendations:',
      tabAll: 'All Solutions',
      tabAccountant: 'Accountants & Small Businesses',
      tabStudent: 'Students & Parents',
      tabOffice: 'Corporate & Office Staff',
      overviewAccountant: {
        problem: 'System freeze during tax invoice issuance.',
        result: 'Dell/HP enterprise PC + Genuine OS ➔ 24/7 continuous stability.',
        device: 'Recommended: Dell OptiPlex Core i5',
      },
      overviewStudent: {
        problem: 'Brand-new retail laptops are excessively expensive.',
        result: 'Rugged ThinkPad T480s under $250 ➔ 3-5 years of study durability.',
        device: 'Recommended: ThinkPad T480s Carbon',
      },
      overviewOffice: {
        problem: 'Too busy during business hours to visit repair shops.',
        result: 'Technician visits after hours ➔ 20-minute on-site resolution.',
        device: 'Recommended: HP ProDesk Mini 1L',
      },
      detailSubtitle: 'Specialized solution tailored to your operational requirements',
      concernLabel: 'Core Concern & Bottleneck:',
      solutionLabel: 'Verified Solution at An Tam:',
      recommendedLabel: 'Recommended System:',
      bookViewBtn: 'Schedule Live Inspection',
      accountantDetails: {
        label: 'Accountants & Small Businesses',
        problem: 'Computer hangs or crashes while issuing official e-invoices or calculating sales transactions.',
        solution: 'Dell/HP enterprise desktops + permanent digital Windows Pro ➔ Smooth 24/7 operation, rapid invoicing, full on-site printer & network setup.',
        recommendedDevice: 'Dell OptiPlex 7060 SFF (Core i5, 16GB RAM, 256GB NVMe SSD)',
        priceRange: '4,950,000₫',
      },
      studentDetails: {
        label: 'Students & Parents',
        problem: 'Brand-new laptops at commercial retailers are overly costly for standard coursework and office tasks.',
        solution: 'Carbon-fiber ThinkPad or Dell Latitude under 6 million VND ➔ Save 50% budget, comfortable ergonomic keyboard, durable for 3-5 years.',
        recommendedDevice: 'ThinkPad T480s (Core i5, 16GB RAM, 14" FHD Anti-Glare)',
        priceRange: '6,200,000₫',
      },
      officeDetails: {
        label: 'Corporate & Office Staff',
        problem: 'Fully occupied during office hours, making it impossible to bring computers to repair shops.',
        solution: 'Technicians visit your residence during Golden Hours (17:30 - 21:00) or handle software remotely via UltraViewer within 15 minutes.',
        recommendedDevice: 'HP ProDesk 400 G5 Mini (Mountable behind monitor, ultra power-efficient)',
        priceRange: '3,400,000₫',
      },
      standardsTitle: 'RIGOROUS CERTIFICATION STANDARDS',
      standardsDesc: 'Every single workstation delivered undergoes our comprehensive 24-step technical protocol.',
      s1: { title: 'Power & Motherboard Capacitors', desc: 'Capacitor inspection and real-load voltage measurement using precision multimeters.' },
      s2: { title: 'Premium Ceramic Thermal Paste', desc: 'Chamber cleaning and application of Thermalright TF7 / Arctic MX4 ceramic compound.' },
      s3: { title: '45-Minute Burn-In Stress Test', desc: 'Continuous 100% full CPU & GPU loads ensuring machines never freeze or shut down unexpectedly.' },
      s4: { title: 'Hardware S/N Cataloging', desc: 'Transparent electronic warranty tracking directly linked to the chassis Service Tag.' },
      tableTitle: 'COMPREHENSIVE VALUE COMPARISON MATRIX',
      colCriteria: 'Evaluation Metric',
      colAnTam: 'Vi Tính An Tâm',
      colTraditional: 'Conventional Second-Hand Stores',
      row1: { crit: 'Hardware Origin & Motherboard', anTam: 'Grade-A authentic Dell/HP (>95%) factory condition', other: 'Patched motherboards, mismatched components' },
      row2: { crit: 'Storage Reliability', anTam: 'Brand-new Kingston NVMe SSD (36-month warranty)', other: 'Used worn-out SSDs with thousands of power-on hours' },
      row3: { crit: 'On-Site Warranty Response', anTam: 'Direct on-site swap within 2 hours (10km radius)', other: 'Customer must bring machine to shop, waiting 3-7 days' },
      row4: { crit: 'After-Hours Availability', anTam: 'Golden Hours 17:30 - 21:00 (no extra fee)', other: 'Strict office hours only' },
      row5: { crit: 'Data & Security Safeguards', anTam: 'Confidentiality agreement & byte-for-byte cloning', other: 'Prone to careless wiping of accounting records' },
      ctaTitle: 'READY TO EXPERIENCE COMPLETE PEACE OF MIND?',
      ctaDesc: 'Connect with our engineering team today to receive tailored hardware recommendations for your exact operational workload.',
      ctaBtnInventory: 'View Certified PC / Laptop Inventory',
      ctaBtnPhone: 'Hotline / Zalo: 0909.053.058',
      ctaBtnBooking: 'Schedule On-Site Technician',
    },
    bookingPage: {
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Book Service Appointment',
      badge2h: '2-Hour On-Site Dispatch (10KM Radius)',
      title: 'Schedule Computer Repair & Upgrade Service',
      subtitle: 'An Tam certified technicians arrive with specialized diagnostic tools to inspect, service, and repair hardware under your direct supervision.',
      modeTitle: '1. Select Service Method',
      modeOnsiteTitle: 'On-Site Technician (Within 2 Hours)',
      modeOnsiteDesc: 'Direct service at your home or office in Tan An and within 10km radius (Long An - Tay Ninh)',
      modeCounterTitle: 'Visit Service Center in Person',
      modeCounterDesc: '45 Nguyen Hue, Ward 1, Tan An (Free parking, live inspection & 30-min turnaround)',
      clientInfoTitle: '2. Contact Information',
      clientNameLabel: 'Full Name *',
      clientNamePlaceholder: 'e.g., Mr. David Nguyen',
      clientPhoneLabel: 'Phone Number / Zalo *',
      clientPhonePlaceholder: 'e.g., 0909053058',
      clientAddressLabel: 'On-Site Service Address *',
      clientAddressPlaceholder: 'Street address, ward/commune (e.g., 42 Hung Vuong, Ward 2, Tan An)',
      serviceTitle: '3. Repair & Upgrade Requirements',
      deviceModelLabel: 'Computer Model / Specifications',
      deviceModelPlaceholder: 'e.g., Dell OptiPlex 7060, ThinkPad T480s, HP Laptop...',
      quickSelectPrompt: 'Quick service selection:',
      quickServices: [
        'Kingston 256GB NVMe SSD Upgrade (5x Speed Boost)',
        'Thermal Spa & Thermalright TF7 Paste (Drop 15-20°C)',
        'Clean Genuine Windows 10/11 Pro (Uncracked)',
        'Power failure / Continuous warning beeps',
        'Resolve lag & freeze on MISA or Excel spreadsheets',
      ],
      issueDescPlaceholder: 'Describe the current computer problem (e.g., running slow, needs 256GB SSD upgrade and clean OS)...',
      timeSelectTitle: '4. Select Date & Appointment Window',
      dateLabel: 'Appointment Date',
      timeSlots: [
        { label: 'Morning (08:00 - 11:30)', desc: 'Standard business hours', icon: '🌅' },
        { label: 'Afternoon (13:30 - 17:30)', desc: 'Same-day resolution', icon: '🌤️' },
        { label: 'Golden Hours (17:30 - 21:00)', desc: 'Priority after-hours rescue (Zero surcharge)', icon: '⚡' },
        { label: 'Emergency Rescue (Within 60 mins)', desc: 'Mobile emergency team dispatches immediately', icon: '🚨' },
      ],
      submitBtn: 'Confirm & Book Appointment Now',
      submittingBtn: 'Submitting booking request...',
      reassuranceNote: 'Guarantees: On-time arrival • Transparent components • Clear quote before proceeding.',
      successTitle: 'Appointment Booked Successfully!',
      successSubtitle: (name: string) => `Thank you ${name}, our on-duty technician will contact you within 10 minutes to confirm.`,
      ticketLabel: 'Ticket ID:',
      customerLabel: 'Customer:',
      serviceLabel: 'Requested Service:',
      appointmentLabel: 'Appointment Window:',
      locationLabel: 'Location:',
      sendZaloBtn: 'Send Confirmation via Technician Zalo',
      bookAnotherBtn: 'Book Another Service',
      backHomeBtn: 'Back to Homepage',
      validationError: 'Please provide your Full Name, Phone Number, and Service Requirements!',
      addressError: 'Please enter your specific on-site address in Tan An or neighboring districts!',
    },
    warrantyPage: {
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Warranty Lookup',
      toastEnterQuery: 'Please enter the Serial Number (S/N) stamped on the machine or your phone number!',
      toastFound: 'Hardware warranty record retrieved successfully!',
      toastNotFound: (q: string) => `No record found for "${q}". Please verify the physical S/N or phone number!`,
      badgePre: 'PHYSICAL HARDWARE S/N ELECTRONIC PORTAL',
      title: 'WARRANTY VERIFICATION &',
      titleHighlight: 'HARDWARE RECORD',
      subtitle: 'No paper slips or fragile stickers required. Records are validated directly via the physical factory Serial Number (S/N) stamped on the chassis or registered phone number.',
      searchPlaceholder: 'Enter chassis S/N (e.g. ST-8F4K92X) or phone number (0918...)',
      searchBtn: 'Check Warranty',
      searchingBtn: 'Verifying...',
      presetPrompt: 'Try sample S/N tags:',
      tagDellLabel: 'ST-8F4K92X (Dell OptiPlex)',
      tagThinkPadLabel: 'TP-994L2A (ThinkPad T480s)',
      tagPhoneLabel: '0918234891 (Customer Phone)',
      deviceSelectedBadge: 'Grade-A Certified Hardware',
      snLabel: 'Serial Number (S/N):',
      customerLabel: 'Individual Client',
      handoverDateLabel: 'Handover Date:',
      statusActiveBadge: 'Active Official Warranty Coverage',
      authSubtitle: 'Authenticated by Vi Tính An Tâm System • 2-Hour 1-to-1 On-Site Swap',
      ribbonPackage: 'Service Plan',
      ribbonSsd: 'SSD Drive Health',
      ribbonOs: 'Operating System License',
      ribbonPrivilege: 'Exclusive Privilege',
      multiTierTitle: 'DETAILED MULTI-TIER HARDWARE WARRANTY',
      multiTierSubtitle: 'Independent warranty by component, indexed by machine S/N to prevent business disruption',
      multiTierBadge: '3 Warranty Tiers',
      tier1Title: 'Chassis, Motherboard & True-Power PSU',
      tier1Remaining: '115 days of warranty remaining',
      tier1Note: '* Instant swap of motherboard or PSU within 15 minutes at counter or 2 hours on-site in Tan An.',
      tier2Title: '100% Brand-New NVMe SSD & RAM',
      tier2Remaining: '36-month official manufacturer warranty',
      tier2Note: '* 100% brand-new replacement in original retail box by official distributor.',
      tier3Title: 'Technical Support & UltraViewer Remote Assistance',
      tier3Remaining: '24/7 On-Duty Desk (30 days free)',
      tier3Note: '* Full assistance with receipt printer configuration, tax digital signatures, MISA, and network glitches.',
      techLeaderLabel: 'Assigned Lead Engineer:',
      zaloTechBtn: 'Message Technician on Zalo',
      bookServiceBtn: 'Schedule Maintenance / Repair',
      emptyTitle: (q: string) => `No Records Found For "${q}"`,
      emptyDesc: 'You can locate the Serial Number (S/N) or Service Tag on the physical label at the bottom of your laptop or on the back/side of your PC desktop chassis (Dell: 7-character Service Tag; ThinkPad: Serial Number; HP: S/N).',
      callHotlineBtn: 'Call Technical Hotline: 0909.053.058',
      supportZaloBtn: 'Support via Zalo',
    },
  },
};
