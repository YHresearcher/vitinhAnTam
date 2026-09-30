import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer_email,
      customer_name,
      customer_phone,
      category_name,
      license_code,
      template,
      is_test = false,
    } = body;

    if (!customer_email || !customer_email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email người nhận không hợp lệ!' },
        { status: 400 }
      );
    }

    const senderName = template?.sender_name || 'Vi Tính An Tâm Support';
    const senderEmail = template?.sender_email || 'hotro@vitinhantam.com';
    const supportPhone = template?.support_phone || '0901.234.567';
    const warrantyInfo = template?.warranty_info || 'Bảo hành kích hoạt 1 đổi 1 trọn đời cho 01 thiết bị';
    const customFooter = template?.footer_note || 'Trân trọng cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ tại Vi Tính An Tâm!';

    const subject = is_test
      ? `[TEST EMAIL] [Vi Tính An Tâm] Bàn giao Key Bản Quyền: ${category_name || 'Phần mềm'}`
      : `[Vi Tính An Tâm] Bàn giao Key Bản Quyền Chính Hãng: ${category_name || 'Phần mềm'}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 19px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 22px; }
    .key-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 16px; text-align: center; margin: 18px 0; }
    .key-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #15803d; margin-bottom: 4px; }
    .key-code { font-family: monospace; font-size: 20px; font-weight: 700; color: #166534; letter-spacing: 1.5px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
    .info-table td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
    .info-table td.label { color: #64748b; width: 35%; font-weight: 500; }
    .info-table td.val { color: #0f172a; font-weight: 600; }
    .instruction-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 0 6px 6px 0; margin: 16px 0; font-size: 13px; color: #334155; line-height: 1.5; }
    .footer { background: #f8fafc; padding: 16px 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VI TÍNH AN TÂM</h1>
      <p>Bàn Giao Bản Quyền Phần Mềm Chính Hãng</p>
    </div>
    <div class="content">
      <p>Xin chào <strong>${customer_name || 'Quý khách'}</strong>,</p>
      <p>Vi Tính An Tâm xin gửi đến quý khách thông tin mã bản quyền phần mềm chính hãng đã kích hoạt thành công:</p>
      <div class="key-box">
        <div class="key-label">🔑 MÃ KEY BẢN QUYỀN:</div>
        <div class="key-code">${license_code || 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'}</div>
      </div>
      <table class="info-table">
        <tr><td class="label">Sản phẩm:</td><td class="val">${category_name || 'Bản quyền phần mềm'}</td></tr>
        <tr><td class="label">Khách hàng:</td><td class="val">${customer_name || 'Quý khách'} ${customer_phone ? `(${customer_phone})` : ''}</td></tr>
        <tr><td class="label">Bảo hành:</td><td class="val" style="color: #16a34a;">${warrantyInfo}</td></tr>
        <tr><td class="label">Thời gian cấp:</td><td class="val">${new Date().toLocaleString('vi-VN')}</td></tr>
      </table>
      <div class="instruction-box">
        <strong>📌 LƯU Ý KHI SỬ DỤNG:</strong><br>
        • Vui lòng lưu lại email này để sử dụng làm căn cứ bảo hành.<br>
        • Mỗi mã key chỉ sử dụng cho 01 thiết bị duy nhất.<br>
        • Hotline hỗ trợ kỹ thuật: <strong>${supportPhone}</strong>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">${customFooter}</p>
      <p style="margin: 0;">Người gửi: <strong>${senderName}</strong> (&lt;${senderEmail}&gt;)</p>
    </div>
  </div>
</body>
</html>`;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `${senderName} <${senderEmail.includes('@vitinhantam.com') ? 'onboarding@resend.dev' : senderEmail}>`,
            to: [customer_email],
            subject: subject,
            html: htmlContent,
          }),
        });
      } catch (err) {
        console.warn('Resend API dispatch notice:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi email bàn giao key thành công đến ${customer_email}`,
      preview_html: htmlContent,
      subject: subject,
      recipient: customer_email,
    });
  } catch (error: any) {
    console.error('Error sending key email:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Có lỗi xảy ra khi xử lý gửi email.' },
      { status: 500 }
    );
  }
}
