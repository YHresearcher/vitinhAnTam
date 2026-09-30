import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

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

    // 5. Chuẩn hóa tên thư mục (ngăn chặn Directory Traversal)
    const safeFolder = targetFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'header';
    const uploadDir = join(process.cwd(), 'public', 'img', safeFolder);
    await mkdir(uploadDir, { recursive: true });

    // 6. Tạo tên file an toàn duy nhất
    const sanitizedBase = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const finalExt = ext || 'png';
    const filename = `${sanitizedBase}-${Date.now()}.${finalExt}`;
    const filePath = join(uploadDir, filename);

    // 7. Ghi file vào thư mục public/img/[safeFolder]
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/img/${safeFolder}/${filename}`;

    // 8. Tự động xóa file cũ nếu có để giải phóng dung lượng hosting
    if (oldUrl && oldUrl !== publicUrl) {
      await safelyDeleteFile(oldUrl);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      message: 'Tải lên hình ảnh thành công!',
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
