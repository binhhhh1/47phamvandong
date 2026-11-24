# HOTEL PMS 216 - Hệ thống Quản lý Khách sạn (216 Phòng)

Hệ thống quản lý khách sạn (Property Management System) quy mô 216 phòng (4 tầng x 54 phòng: 101-154, 201-254, 301-354, 401-454).

## Tính năng chính
- **Tổng quan (Dashboard):** Thống kê theo thời gian thực (công suất, doanh thu, khách lưu trú) & biểu đồ trực quan.
- **Sơ đồ 216 phòng:** Lọc theo tầng, loại phòng, trạng thái; cập nhật trạng thái/giá trực tiếp.
- **Đặt phòng (Booking):** Chống trùng lịch, quản lý nguồn khách (Walk-in, Booking.com, Agoda, Traveloka...), đặt cọc.
- **Check-in / Check-out:** Quy trình nhận/trả phòng chuẩn nghiệp vụ, tự động tính hóa đơn & trừ tiền cọc, hỗ trợ in hóa đơn.
- **Khách hàng, Dịch vụ, Buồng phòng (Housekeeping), Bảo trì, Tài chính, Báo cáo, Phân quyền RBAC (7 vai trò) & Audit Log.**

## Cài đặt & Chạy local
```bash
npm install
npm run dev
```

## Build & Deploy lên Vercel
```bash
npm run build
```
Đẩy thư mục này lên GitHub (bỏ qua `node_modules`) và Import trực tiếp vào [Vercel](https://vercel.com).
