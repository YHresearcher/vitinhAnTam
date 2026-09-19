This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---

## 6. Cập Nhật Mới: Hợp Nhất Đăng Nhập & Loại Bỏ Giá Dịch Vụ (Commit `575441a`)

### A. Gom 2 Mục Login Thành 1 Mục Duy Nhất & Phân Quyền Theo Tài Khoản
- **Trước đây:** Trên website có 2 nút riêng biệt là "KTV Login" (ở banner trên) và "Admin CRM" (ở góc phải navbar), gây phân mảnh và nhầm lẫn.
- **Hiện tại:**
  1. **Đã loại bỏ hoàn toàn** 2 nút riêng lẻ trên.
  2. **Thêm 1 nút đăng nhập duy nhất:**
     - Khi chưa đăng nhập: Hiển thị nút **"Đăng Nhập"** dẫn tới trang đăng nhập tập trung [`/login`](http://localhost:3000/login).
     - Khi đã đăng nhập: Hiển thị thanh thông tin nhân viên (Avatar theo màu vai trò, Tên nhân viên, Huy hiệu vai trò: `Admin` / `KTV` / `Sales`, Nút vào hệ thống và Nút Đăng xuất).
  3. **Trang Đăng Nhập Tập Trung (`/login`):**
     - Cho phép đăng nhập 1-click nhanh hoặc nhập mật khẩu theo 3 nhóm tài khoản phân quyền:
       - **Quản Trị Viên (Admin - Nguyễn Văn An):** Toàn quyền hệ thống, sửa số lượng kho, duyệt lương & tiền công ca làm.
       - **Kỹ Thuật Viên (Technician - Trịnh Minh Tuấn):** Chẩn đoán, kiểm định QC, đổi trạng thái phiếu, nhập máy mới vào kho (khóa quyền sửa số lượng tồn).
       - **Nhân Viên Kinh Doanh (Sales - Lê Thu Hà):** Tra cứu kho, lập phiếu tiếp nhận mới (khóa quyền sửa số lượng tồn và khóa sửa trạng thái kỹ thuật).

### B. Loại Bỏ Hoàn Toàn Giá Dịch Vụ Sửa Chữa & Spa
- Toàn bộ các mức giá dịch vụ hiển thị công khai trên trang chủ (khối `#dich-vu-spa`) đã được gỡ bỏ triệt để:
  - **Gói Hồi Sinh Máy Cũ:** Gỡ giá `550.000₫`, thay thế bằng *"Chi phí dịch vụ: Báo giá minh bạch sau kiểm tra (Tư vấn nâng cấp đúng nhu cầu, không vẽ bệnh)"*.
  - **Gói Spa Làm Mát Chuyên Sâu:** Gỡ giá `200.000₫ / 150.000₫`, thay thế bằng *"Chi phí dịch vụ: Báo giá tận nơi theo dòng máy (Kiểm tra nhiệt độ CPU & cánh quạt miễn phí)"*.
  - **Gói Tối Ưu Windows Bản Quyền:** Gỡ giá `120.000₫ - 180.000₫`, thay thế bằng *"Chi phí dịch vụ: Báo giá theo nhu cầu cài đặt (Hỗ trợ phần mềm văn phòng & kết nối máy in)"*.
- Giá các dòng máy bán (Dell OptiPlex, HP ProDesk, ThinkPad, Laptop) vẫn được giữ nguyên đầy đủ để phục vụ khách hàng mua sắm.
