import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/server/supabaseAdmin';
import { rateLimit } from '@/lib/server/rateLimit';

// Catalog key bản quyền CÔNG KHAI cho trang chủ — chỉ gồm thông tin
// tổng hợp theo phân loại (tên, mô tả, giá bán, số lượng còn). Tuyệt
// đối không trả mã key hay bất kỳ dữ liệu khách hàng nào; mã key chỉ
// nhân viên mới xem được qua /api/keys (yêu cầu session).
export async function GET(request: NextRequest) {
  if (!rateLimit(request, 'keys-public-catalog', 60, 60 * 1000)) {
    return NextResponse.json({ success: false, categories: [] }, { status: 429 });
  }

  const db = getServerSupabase();
  if (!db) {
    return NextResponse.json({ success: false, categories: [] });
  }

  const [catResult, keyResult] = await Promise.all([
    db
      .from('key_categories')
      .select('id, name, type, description, default_unit_price')
      .order('created_at', { ascending: true }),
    db.from('license_keys').select('category_id, unit_price').eq('status', 'available'),
  ]);

  if (catResult.error || !catResult.data) {
    return NextResponse.json({ success: false, categories: [] });
  }

  const availableByCategory = new Map<string, { count: number; firstPrice: number | null }>();
  for (const key of keyResult.data || []) {
    const entry = availableByCategory.get(key.category_id) || { count: 0, firstPrice: null };
    entry.count += 1;
    if (entry.firstPrice === null && typeof key.unit_price === 'number' && key.unit_price > 0) {
      entry.firstPrice = key.unit_price;
    }
    availableByCategory.set(key.category_id, entry);
  }

  const categories = catResult.data
    .map((cat) => {
      const availability = availableByCategory.get(cat.id) || { count: 0, firstPrice: null };
      return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        description: cat.description || '',
        availableStock: availability.count,
        // Giá hiển thị: mặc định phân loại > 0, else giá bán đầu tiên > 0,
        // else 0 — giao diện tự hiển thị "Liên hệ" cho giá 0 (không tự
        // bịa giá tham chiếu như trước).
        price:
          (typeof cat.default_unit_price === 'number' && cat.default_unit_price > 0
            ? cat.default_unit_price
            : null) ??
          availability.firstPrice ??
          0,
      };
    })
    .filter((cat) => cat.availableStock > 0);

  return NextResponse.json(
    { success: true, categories },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
  );
}
