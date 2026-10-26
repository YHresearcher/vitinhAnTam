import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Tối ưu ảnh khi tải lên (2026-10-26): ảnh chụp/thiết bị thường từ điện
// thoại (3000–4000px, vài MB) rất nặng cho hệ thống. Ảnh raster
// (png/jpeg/webp) được tự động: xoay đúng chiều EXIF, thu về tối đa
// 1600px cạnh dài (không phóng to ảnh nhỏ), nén JPEG/WebP quality 80.
// PNG không có kênh alpha → chuyển sang JPEG cho nhẹ; PNG có alpha
// (logo, ảnh nền trong suốt) giữ nguyên PNG nén lossless. SVG/ICO không
// đụng tới (vector/icon, nén lại không có ý nghĩa). Nếu bản nén ra nặng
// hơn bản gốc (ảnh nhỏ, ảnh đã nén kỹ) thì giữ nguyên bản gốc. Lỗi nén
// không làm hỏng upload: fallback về file gốc.

// MIME types được phép upload
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'ico']);

/**
 * Kiểm tra nội dung file thật bằng magic bytes / cấu trúc — không tin
 * MIME type và đuôi file do client khai. Trả về họ định dạng nhận diện
 * được ('png' | 'jpeg' | 'webp' | 'ico' | 'svg') hoặc null nếu không
 * khớp bất kỳ định dạng ảnh nào được phép.
 * SVG là XML text: bắt buộc bắt đầu bằng thẻ <svg (sau prolog/BOM) và
 * tuyệt đối không chứa script, event handler hay javascript: URL —
 * SVG độc được phục vụ cùng origin sẽ chạy script trong ngữ cảnh site.
 */
function sniffImageKind(buffer: Buffer): 'png' | 'jpeg' | 'webp' | 'ico' | 'svg' | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x00 && buffer[1] === 0x00 &&
    (buffer[2] === 0x01 || buffer[2] === 0x02) && buffer[3] === 0x00
  ) {
    return 'ico';
  }
  const text = buffer.toString('utf8');
  const stripped = text.replace(/^﻿/, '').trimStart()
    .replace(/^<\?xml[^>]*\?>/i, '').trimStart()
    .replace(/^<!DOCTYPE[^>]*>/i, '').trimStart();
  if (/^<svg[\s>]/i.test(stripped)) {
    if (/<script|<foreignObject|<iframe|<embed|<object|javascript:|on\w+\s*=/i.test(text)) {
      return null; // SVG có nội dung chủ động — từ chối
    }
    return 'svg';
  }
  return null;
}

/**
 * Xóa an toàn file ảnh cũ trên máy chủ (chỉ xóa trong /public/img/ hoặc /public/uploads/)
 */
async function safelyDeleteFile(url?: string | null) {
  if (!url || typeof url !== 'string') return;
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const normalized = cleanUrl.replace(/\\/g, '/').trim();
    if (!normalized.startsWith('/img/') && !normalized.startsWith('/uploads/')) return;

    // Ngăn chặn Directory Traversal
    const relativePath = normalized.replace(/^\/+/, '');
    if (relativePath.includes('..')) return;

    const fullPath = join(process.cwd(), 'public', relativePath);
    await unlink(fullPath);
  } catch (err: unknown) {
    // Bỏ qua lỗi nếu file không tồn tại (ENOENT)
    const code = (err as { code?: string })?.code;
    if (code !== 'ENOENT') {
      console.warn('Lỗi khi xóa file cũ:', err);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Kiểm tra session Admin / Quyền quản trị
    const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session || (session.role !== 'admin' && !session.canManageUsers)) {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền tải lên file hệ thống.' },
        { status: 403 }
      );
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetFolder = (formData.get('folder') as string) || 'header';
    const oldUrl = formData.get('oldUrl') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tệp đính kèm.' },
        { status: 400 }
      );
    }

    // 3. Kiểm tra dung lượng (tối đa 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Kích thước tệp quá lớn (tối đa 4MB).' },
        { status: 400 }
      );
    }

    // 4. Kiểm tra loại MIME & phần mở rộng
    const originalName = file.name || 'image';
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, message: 'Định dạng tệp không được hỗ trợ (chỉ chấp nhận PNG, JPG, WebP, SVG, ICO).' },
        { status: 400 }
      );
    }

    // 4b. Kiểm tra nội dung thật (magic bytes): đuôi file/MIME khai báo
    // phải khớp định dạng nhận diện được từ dữ liệu.
    const rawBytes = await file.arrayBuffer();
    const buffer = Buffer.from(rawBytes);
    const sniffed = sniffImageKind(buffer);
    const extKind = ext === 'jpg' ? 'jpeg' : ext;
    if (!sniffed || (ext && extKind !== sniffed)) {
      return NextResponse.json(
        { success: false, message: 'Nội dung tệp không khớp định dạng ảnh khai báo hoặc chứa nội dung không an toàn.' },
        { status: 400 }
      );
    }

    // 5. Nén/tối ưu ảnh raster trước khi lưu (xem ghi chú đầu file).
    //    SVG/ICO đi thẳng xuống bước lưu, không qua sharp.
    let outBuffer = buffer;
    let outKind: 'png' | 'jpeg' | 'webp' | 'ico' | 'svg' = sniffed;
    let optimized = false;
    if (sniffed === 'png' || sniffed === 'jpeg' || sniffed === 'webp') {
      try {
        const image = sharp(buffer).rotate();
        const meta = await image.metadata();
        const resized = image.resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        });
        let candidate: Buffer;
        let candidateKind: 'png' | 'jpeg' | 'webp';
        if (sniffed === 'jpeg') {
          candidate = await resized.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
          candidateKind = 'jpeg';
        } else if (sniffed === 'webp') {
          candidate = await resized.webp({ quality: 80 }).toBuffer();
          candidateKind = 'webp';
        } else if (meta.hasAlpha) {
          candidate = await resized.png({ compressionLevel: 9 }).toBuffer();
          candidateKind = 'png';
        } else {
          candidate = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
          candidateKind = 'jpeg';
        }
        // Chỉ nhận bản nén khi nó thực sự nhẹ hơn bản gốc.
        if (candidate.length < buffer.length) {
          outBuffer = candidate;
          outKind = candidateKind;
          optimized = true;
        }
      } catch (err) {
        console.warn('Nén ảnh thất bại, giữ file gốc:', err);
      }
    }

    // 6. Chuẩn hóa tên thư mục (ngăn chặn Directory Traversal)
    const safeFolder = targetFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'header';
    const uploadDir = join(process.cwd(), 'public', 'img', safeFolder);
    await mkdir(uploadDir, { recursive: true });

    // 7. Tạo tên file an toàn duy nhất (đuôi theo định dạng SAU tối ưu)
    const sanitizedBase = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const finalExt = outKind === 'jpeg' ? 'jpg' : outKind;
    const filename = `${sanitizedBase}-${Date.now()}.${finalExt}`;
    const filePath = join(uploadDir, filename);

    // 8. Ghi file vào thư mục public/img/[safeFolder]
    await writeFile(filePath, outBuffer);

    const publicUrl = `/img/${safeFolder}/${filename}`;

    // 9. Tự động xóa file cũ nếu có để giải phóng dung lượng hosting
    if (oldUrl && oldUrl !== publicUrl) {
      await safelyDeleteFile(oldUrl);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      message: optimized
        ? `Tải lên hình ảnh thành công! Đã tự nén từ ${(buffer.length / 1024).toFixed(0)}KB xuống ${(outBuffer.length / 1024).toFixed(0)}KB.`
        : 'Tải lên hình ảnh thành công!',
      optimized,
      originalSize: buffer.length,
      size: outBuffer.length,
    });
  } catch (error) {
    console.error('Lỗi khi upload file:', error);
    return NextResponse.json(
      { success: false, message: 'Xảy ra lỗi trong quá trình lưu trữ file.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Kiểm tra session Admin / Quyền quản trị
    const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session || (session.role !== 'admin' && !session.canManageUsers)) {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền xóa file hệ thống.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const url = body.url as string | undefined;

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy URL file cần xóa.' },
        { status: 400 }
      );
    }

    await safelyDeleteFile(url);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa file ảnh thành công!',
    });
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
    return NextResponse.json(
      { success: false, message: 'Xảy ra lỗi khi xóa file.' },
      { status: 500 }
    );
  }
}
