# NetSentinel IDS - Frontend Application

Đây là giao diện Frontend của hệ thống NetSentinel IDS, được xây dựng bằng **Next.js 16**, **React 19**, **Redux Toolkit**, và **shadcn/ui**.

## Yêu cầu môi trường
- **Node.js**: Phiên bản 18.18.0 trở lên (Khuyến nghị dùng bản LTS mới nhất - Node 20+).
- **Trình quản lý gói**: `npm` (hoặc `yarn`, `pnpm`).

---

## 🚀 Hướng Dẫn Cài Đặt Dành Cho Nhóm Backend

Khi bạn clone repo này về máy, hãy làm theo các bước sau để chạy thử Frontend kết nối với Backend Spring Boot:

### Bước 1: Cài đặt thư viện
Mở Terminal, trỏ vào thư mục `frontend` và chạy:
```bash
npm install
```
*(Lệnh này sẽ tải toàn bộ thư viện cần thiết vào thư mục `node_modules`)*.

### Bước 2: Cấu hình biến môi trường (Environment Variables)
Tạo một file có tên `.env.local` ở ngay thư mục gốc của frontend (cùng cấp với `package.json`).
Dán nội dung sau vào file:

```env
# Backend API Configuration
# Sửa lại port nếu Spring Boot của bạn không chạy ở cổng 1010
NEXT_PUBLIC_API_URL=http://localhost:1010
NEXT_PUBLIC_WS_URL=http://localhost:1010/ws
```

### Bước 3: Khởi động giao diện (Dev Mode)
Chạy lệnh sau để bật Server Frontend:
```bash
npm run dev
```

Hệ thống sẽ chạy tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**.
Lúc này, hãy mở trình duyệt lên. Mọi API call từ giao diện (như Đăng nhập, Tạo tài khoản, lấy Logs) sẽ được gọi xuống URL bạn đã cấu hình ở Bước 2.

---

## 🛠 Xử lý lỗi thường gặp (Troubleshooting)

1. **Lỗi `ERR_CONNECTION_REFUSED` khi ấn nút Login**:
   - Backend Spring Boot chưa được bật. Hãy chạy backend trước!
   - Cổng API trong file `.env.local` không khớp với cổng của backend.

2. **Lỗi `CORS (Cross-Origin Request Blocked)`**:
   - Phía Backend Spring Boot chưa cấu hình cho phép tên miền `http://localhost:3000` truy cập vào. Hãy thêm `@CrossOrigin(origins = "http://localhost:3000")` hoặc cấu hình Global CORS bean trong Spring Security.

3. **Giao diện không nhận dữ liệu Realtime (WebSocket)**:
   - Đảm bảo Backend đã config STOMP WebSocket endpoint tại `/ws` và cho phép SockJS/CORS cho Frontend kết nối.
