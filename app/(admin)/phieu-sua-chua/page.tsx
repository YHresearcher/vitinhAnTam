'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PhieuSuaChuaRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'counter');
    router.replace(`/cuu-ho-onsite?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="p-8 text-center text-slate-500 text-sm animate-pulse">
      Đang chuyển hướng sang Trung Tâm Kỹ Thuật & Cứu Hộ...
    </div>
  );
}

export default function PhieuSuaChuaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Đang tải...</div>}>
      <PhieuSuaChuaRedirect />
    </Suspense>
  );
}
