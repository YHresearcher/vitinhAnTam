import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const nextDir = join(process.cwd(), '.next');
const MAX_ALLOWED_MB = 1000; // Ngưỡng dung lượng tối đa (1GB)

function getDirSizeInMB(dirPath) {
  try {
    // Trên macOS/Linux: dùng `du -sk` (kilobytes) để tính chuẩn xác
    const output = execSync(`du -sk "${dirPath}" 2>/dev/null`).toString().trim();
    const sizeInKB = parseInt(output.split(/\s+/)[0], 10);
    return Math.round(sizeInKB / 1024);
  } catch {
    return 0;
  }
}

function cleanCacheIfHeavy() {
  if (!existsSync(nextDir)) {
    return;
  }

  const sizeMB = getDirSizeInMB(nextDir);
  if (sizeMB >= MAX_ALLOWED_MB) {
    console.log(`\n🧹 [Auto Clean] Thư mục .next đang chiếm ${sizeMB} MB (vượt quá ngưỡng ${MAX_ALLOWED_MB} MB).`);
    console.log(`⏳ Đang tự động dọn dẹp thư mục .next để giải phóng ổ cứng...`);
    try {
      rmSync(nextDir, { recursive: true, force: true });
      console.log(`✅ Đã giải phóng thành công ${sizeMB} MB! Khởi động lại với môi trường sạch.\n`);
    } catch (err) {
      console.warn(`⚠️ Không thể xóa thư mục .next tự động:`, err.message);
    }
  } else {
    console.log(`⚡ [Cache Check] Thư mục .next hiện tại: ${sizeMB} MB (dưới ngưỡng ${MAX_ALLOWED_MB} MB - giữ cache để tối ưu tốc độ).`);
  }
}

cleanCacheIfHeavy();
