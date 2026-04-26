# 📝 NetSentinel IDS — Frontend Changelog

> **File này ghi lại toàn bộ lịch sử thay đổi, cập nhật của phần Frontend.**  
> **Format:** Mỗi entry gồm ngày, phiên bản, người thực hiện, và chi tiết thay đổi.

---

## Quy Ước Ghi Chú

- 🆕 **Added** — Tính năng mới
- 🔄 **Changed** — Thay đổi tính năng hiện có
- 🐛 **Fixed** — Sửa lỗi
- 🗑️ **Removed** — Xóa tính năng
- ⚡ **Performance** — Cải thiện hiệu suất
- 🎨 **UI/UX** — Thay đổi giao diện
- 📄 **Docs** — Cập nhật tài liệu
- 🔧 **Config** — Thay đổi cấu hình
- 🔒 **Security** — Cập nhật bảo mật

---

## [v1.2.0] — 2026-04-26

### 🚀 Initial Implementation (Phase 1-4)

**Người thực hiện:** AI Assistant  
**Trạng thái:** ✅ Hoàn thành

#### 🆕 Added
- **Khởi tạo dự án:** Cấu hình Next.js 16 + React 19 + Tailwind CSS v4.
- **Redux Toolkit:** Tạo các slices quản lý trạng thái (`authSlice`, `alertSlice`, `wsSlice`, `dashboardSlice`).
- **Axios & API Services:** Setup `apiClient` với JWT interceptors và auto-refresh token. Cấu trúc các module service (`authService`, `alertService`, `packetService`, v.v.).
- **WebSocket:** Hook `useWebSocket` sử dụng `@stomp/stompjs` + SockJS, kết nối trực tiếp với Redux để push alerts realtime và hiển thị `sonner` toast notification.
- **Layouts & Components:**
  - Cấu hình Global Layout (Sidebar, Header, Theme Toggle).
  - Tích hợp và tùy chỉnh các component từ **shadcn/ui** (`card`, `table`, `badge`, `button`, `select`, `dropdown-menu`, v.v.).
- **Pages (Giao diện chính):**
  - `/(auth)/login` & `/(auth)/register`: Trang đăng nhập/đăng ký tích hợp **React Hook Form** + **Zod**.
  - `/(protected)/dashboard`: Tổng quan hệ thống với biểu đồ **Recharts**.
  - `/(protected)/live-monitor`: Theo dõi gói tin và cảnh báo realtime với tính năng auto-scroll terminal feed.
  - `/(protected)/alerts`: Quản lý các cảnh báo với chức năng update status/delete, filtering và pagination.
  - `/(protected)/packets`: Quản lý lịch sử gói tin mạng.
  - `/(protected)/reports`: Quản lý, tải xuống và sinh báo cáo PDF.
  - `/(protected)/settings`: Cấu hình hệ thống và user profile qua Tabs component.

#### 🔧 Config
- Cấu hình CSS Variables (Theme token) chuẩn cho Tailwind v4.
- Cấu hình `.env` cho Next.js (`NEXT_PUBLIC_API_URL` và `NEXT_PUBLIC_WS_URL`).

---

## [v1.1.1] — 2026-04-26

### Đồng bộ hóa toàn bộ tài liệu theo kiến trúc Redux & shadcn/ui

**Người thực hiện:** AI Assistant  
**Trạng thái:** ✅ Hoàn thành

#### 🔄 Changed
- **FRONTEND_PLAN.md:** Viết lại hoàn toàn — thay thế Context API bằng Redux Toolkit, thay common components bằng shadcn/ui, cập nhật kiến trúc thư mục, authentication flow qua Redux, WebSocket dispatch vào Redux, chi tiết shadcn components cho từng trang.
- **SKILLS.md:** Viết lại đúng format Skills (không phải implementation plan) — thêm Redux Toolkit, shadcn/ui, Zod, React Hook Form, @tanstack/react-table vào skill matrix.
- **TECHSTACK.md:** Loại bỏ wrapper markdown, thêm dependencies mới (react-hook-form, zod, @hookform/resolvers, @tanstack/react-table), thêm sections Forms & Validation, Data Tables, Route Map, Redux Architecture diagram, WebSocket → Redux flow.

#### 🆕 Added
- `FRONTEND_PLAN.md`: Thêm danh sách shadcn CLI commands cho từng component, chi tiết `store.js` configuration, memoized selectors (`createSelector`), Skeleton loading states.
- `TECHSTACK.md`: Thêm dependencies `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-table`.
- `SKILLS.md`: Thêm skills Zod + React Hook Form, @tanstack/react-table, shadcn/ui + Radix UI.

#### 🐛 Fixed
- `SKILLS.md`: Sửa lỗi nội dung bị đổi thành implementation plan thay vì skills document.
- `TECHSTACK.md`: Sửa lỗi bọc trong markdown code fence (` ```markdown `) và fix production URLs bị sai format.
- `CHANGELOG.md`: Sửa lỗi format dòng header bị gộp thành 1 dòng.

---

## [v1.1.0] — 2026-04-26

### Tái cấu trúc kiến trúc (Architectural Refactor): Tích hợp Redux Toolkit & shadcn/ui

**Người thực hiện:** AI Assistant  
**Trạng thái:** ✅ Hoàn thành

#### 🔄 Changed
- **State Management:** Chuyển đổi toàn bộ từ React Context API sang **Redux Toolkit** để tối ưu hóa quản lý luồng dữ liệu thời gian thực có tần suất cao (realtime packets/alerts).
- **Cấu trúc thư mục:** Tổ chức lại kiến trúc `src/`:
  - Thay thế `src/components/common/` bằng `src/components/ui/` để chứa các component sinh ra từ CLI của shadcn.
  - Thay thế `src/context/` bằng `src/store/` (bao gồm `store.js` và thư mục `slices/`).
- **Axios Interceptors:** Chuyển logic lấy và cập nhật JWT từ Context sang Redux Store.

#### 🆕 Added
- Khởi tạo cấu hình hệ thống UI: Thêm `components.json` và file tiện ích `src/lib/utils.js` (hàm `cn` kết hợp `clsx` và `tailwind-merge`).
- Setup Redux Slices: Thêm `authSlice.js`, `alertSlice.js`, và `wsSlice.js` để quản lý logic trạng thái chuyên biệt.
- Cấu hình CSS Variables (Theme token) chuẩn vào file `src/index.css` để hỗ trợ Light/Dark mode động.

#### 🗑️ Removed
- Xóa bỏ hoàn toàn thư mục `src/context/` và các Context Providers (AuthContext, WebSocketContext, ThemeContext).
- Loại bỏ các component tự code thủ công bằng Tailwind thuần trong thư mục `common/`.

#### ⚡ Performance
- Ngăn chặn "Re-render cascade" khi WebSocket nhận alert mới, sử dụng memoized selectors (`useSelector`) của Redux Toolkit.

#### 🎨 UI/UX
- Nâng cấp thư viện giao diện sang **shadcn/ui** (Radix UI primitives), component chuẩn Accessibility (a11y).

#### 📄 Docs
- Cập nhật `FRONTEND_PLAN.md`: Thay đổi cấu trúc thư mục và Phase 1 setup.
- Cập nhật `TECHSTACK.md`: Bổ sung @reduxjs/toolkit, react-redux, shadcn/ui, Radix UI, Node.js v20.x LTS.
- Cập nhật `SKILLS.md`: Thêm yêu cầu kỹ năng RTK (Slices, Thunk) và shadcn/ui.

---

## [v1.0.0] — 2026-04-26

### 📄 Docs — Khởi tạo tài liệu Frontend

**Người thực hiện:** AI Assistant  
**Trạng thái:** ✅ Hoàn thành

#### 🆕 Added
- Tạo file `FRONTEND_PLAN.md` — Kế hoạch triển khai frontend chi tiết
  - Kiến trúc thư mục (folder structure)
  - Chi tiết 10 trang giao diện
  - Mapping đầy đủ API endpoints từ backend
  - WebSocket integration plan
  - Role-Based Access Control (RBAC) matrix
  - Design System (colors, typography, components)
  - Responsive breakpoints
  - State management (AuthContext, WebSocketContext)
  - Implementation phases (5 giai đoạn)
  
- Tạo file `TECHSTACK.md` — Danh sách công nghệ sử dụng
  - Core: React 18 + Vite 5
  - Styling: Tailwind CSS 3
  - HTTP: Axios 1.x
  - WebSocket: @stomp/stompjs 7.x + sockjs-client
  - Charts: Recharts 2.x
  - Routing: React Router DOM 6.x

- Tạo file `SKILLS.md` — Kỹ năng cần thiết
  - Skill matrix với mức độ yêu cầu
  - 4 Critical skills: React, JavaScript, REST API, WebSocket
  - Learning path gợi ý

- Tạo file `CHANGELOG.md` — File ghi lại lịch sử thay đổi (file này)

#### 📝 Notes
- Backend chạy trên port `1010` (không phải 8080)
- WebSocket endpoint: `ws://localhost:1010/ws`
- Refresh token dùng HttpOnly cookie → cần `withCredentials: true`
- Backend đã config CORS cho `localhost:5173` và `localhost:3000`

---

<!--
=== TEMPLATE CHO ENTRY MỚI ===

## [vX.Y.Z] — YYYY-MM-DD

### Mô tả ngắn gọn

**Người thực hiện:** Tên  
**Trạng thái:** ✅ Hoàn thành

#### 🆕 Added
- 

#### 🔄 Changed
- 

#### 🐛 Fixed
- 

#### 🗑️ Removed
- 

#### ⚡ Performance
- 

#### 🎨 UI/UX
- 

#### 📝 Notes
- 

---
-->