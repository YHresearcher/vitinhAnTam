import { Suspense } from 'react';
import MuaHangClient from './MuaHangClient';

export const metadata = {
  title: 'Mua Máy | Vi Tính An Tâm',
  description: 'Đặt mua máy tính tuyển chọn tại Vi Tính An Tâm. Thanh toán chuyển khoản QR Code hoặc tiền mặt, nhận hàng tại cửa hàng hoặc giao tận nơi.',
};

export default function MuaHangPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#C0392B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <MuaHangClient />
    </Suspense>
  );
}
