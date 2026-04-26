# 📋 NetSentinel IDS — Frontend Implementation Plan

> **Dự án:** Hệ thống phát hiện xâm nhập mạng (IDS) — Phần giao diện Frontend  
> **Ngày tạo:** 2026-04-26  
> **Phiên bản:** v1.1.0 (Kiến trúc Redux & shadcn/ui)  
> **Trạng thái:** 📝 Planning

---

## 📖 Tổng Quan

Frontend cho hệ thống NetSentinel IDS, xây dựng giao diện quản trị trực quan cho việc giám sát network traffic, quản lý alerts real-time, xem thống kê dashboard, và xuất báo cáo. Giao diện sử dụng **Redux Toolkit** để tối ưu quản lý luồng dữ liệu realtime khối lượng lớn và **shadcn/ui** để xây dựng hệ thống component chuẩn accessibility, chuyên nghiệp.

---

## 🏗️ Kiến Trúc Tổng Quan Frontend

```text
frontend/
├── components.json              # File cấu hình của shadcn/ui
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                  # Icons, images, fonts
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # shadcn/ui generated (button, table, dialog, badge...)
│   │   ├── charts/              # Chart wrappers (Recharts)
│   │   ├── layout/              # Sidebar, Header, Footer, MainLayout
│   │   └── alerts/              # AlertCard, AlertBadge, AlertNotification
│   ├── store/                   # Redux Toolkit (State Management)
│   │   ├── store.js             # Redux Store chính
│   │   └── slices/              # Redux Slices
│   │       ├── authSlice.js     # JWT auth, user info
│   │       ├── alertSlice.js    # Alert list, filters, pagination, unread count
│   │       ├── packetSlice.js   # Packet list, filters
│   │       ├── dashboardSlice.js# Dashboard stats cache
│   │       └── wsSlice.js       # WebSocket connection status
│   ├── lib/                     # Tiện ích core
│   │   └── utils.js             # Hàm `cn` (clsx + tailwind-merge)
│   ├── hooks/                   # Custom hooks
│   │   ├── useAppDispatch.js    # Typed Redux dispatch
│   │   ├── useAppSelector.js    # Typed Redux selector
│   │   └── useWebSocket.js      # STOMP connect & dispatch to Redux
│   ├── pages/                   # Route-level page components
│   │   ├── LoginPage.jsx        # Đăng nhập
│   │   ├── RegisterPage.jsx     # Đăng ký
│   │   ├── DashboardPage.jsx    # Tổng quan hệ thống
│   │   ├── LiveMonitorPage.jsx  # Giám sát real-time
│   │   ├── AlertsPage.jsx       # Quản lý cảnh báo
│   │   ├── AlertDetailPage.jsx  # Chi tiết 1 cảnh báo
│   │   ├── PacketsPage.jsx      # Danh sách packets
│   │   ├── PacketDetailPage.jsx # Chi tiết 1 packet
│   │   ├── ReportsPage.jsx      # Quản lý báo cáo
│   │   ├── ReportDetailPage.jsx # Chi tiết báo cáo
│   │   ├── SettingsPage.jsx     # Cài đặt hệ thống
│   │   └── NotFoundPage.jsx     # 404 Page
│   ├── services/                # API client layer
│   │   ├── api.js               # Axios instance + interceptors (JWT from Redux)
│   │   ├── authService.js       # /api/auth/* calls
│   │   ├── alertService.js      # /api/alerts/* calls
│   │   ├── packetService.js     # /api/packets/* calls
│   │   ├── dashboardService.js  # /api/dashboard/* calls
│   │   └── reportService.js     # /api/reports/* calls
│   ├── utils/                   # Helper functions
│   │   ├── formatters.js        # Date, number formatting
│   │   ├── constants.js         # App-wide constants
│   │   └── validators.js        # Zod schemas for form validation
│   ├── router/
│   │   └── AppRouter.jsx        # React Router v6 configuration
│   ├── App.jsx
│   ├── main.jsx                 # Bọc App bằng <Provider store={store}>
│   └── index.css                # Global styles + shadcn CSS variables
├── .env                         # VITE_API_URL, VITE_WS_URL
├── .env.example
├── package.json
├── tailwind.config.js           # Tailwind + shadcn theme config
├── postcss.config.js
├── vite.config.js
└── index.html
```

---

## 📄 Chi Tiết Từng Trang (Pages)

### 1. 🔐 Trang Đăng Nhập (`/login`)

**API:** `POST /api/auth/login`

| Thành phần | Mô tả |
|------------|--------|
| Form đăng nhập | shadcn `Input` + `Button` — Username + Password |
| Validation | Zod schema + React Hook Form |
| Nút "Đăng nhập" | Dispatch `loginThunk` → Redux authSlice |
| Link "Đăng ký" | Navigate đến `/register` |
| Error handling | shadcn `Toast` hiển thị lỗi |
| Token storage | Access token → Redux store (memory), Refresh → HttpOnly cookie (auto) |
| Auto-redirect | Nếu `isAuthenticated` trong Redux → redirect `/dashboard` |

**UI Design:**
- Centered card layout (`shadcn Card`) với glassmorphism effect
- Background gradient animated
- Logo NetSentinel phía trên form
- Loading spinner trên button khi đang xử lý

---

### 2. 📝 Trang Đăng Ký (`/register`)

**API:** `POST /api/auth/register`

| Thành phần | Mô tả |
|------------|--------|
| Form đăng ký | Username, Email, Password, Confirm Password |
| Validation | Zod: email format, password min 6, username 3-50 chars |
| Đăng ký thành công | Redirect `/login` + shadcn `Toast` success |
| Error handling | Username/email đã tồn tại → Toast error |

---

### 3. 📊 Trang Dashboard (`/dashboard`) — **TRANG CHÍNH**

**APIs:**
- `GET /api/dashboard/stats` — Thống kê tổng quan
- `GET /api/dashboard/stats?from=...&to=...` — Thống kê theo khoảng thời gian
- WebSocket: `/topic/alerts` — Real-time alert count (dispatch vào Redux)

| Thành phần | Mô tả |
|------------|--------|
| **Stat Cards** (4 cards) | shadcn `Card` — Total Packets, Total Alerts, Open Alerts, Resolved Alerts |
| **System Status Badge** | shadcn `Badge` — NORMAL / WARNING / CRITICAL (color coded) |
| **Biểu đồ Pie/Donut** | Recharts `PieChart` — Alerts by Attack Type (DoS, Probe, R2L, U2R) |
| **Biểu đồ Bar** | Recharts `BarChart` — Alerts by Severity (CRITICAL, HIGH, MEDIUM) |
| **Biểu đồ Line** | Recharts `AreaChart` — Alert Timeline (7-30 ngày) |
| **Date Range Picker** | shadcn `DatePicker` — Lọc thống kê |
| **Recent Alerts Table** | shadcn `Table` — 5 alerts mới nhất |
| **Real-time Counter** | Lấy `unreadCount` từ Redux `alertSlice` — animation pulse |

**UI Design:**
- CSS Grid responsive: 4 stat cards trên cùng
- Charts: 2 columns (Pie + Bar)
- Timeline chart: full width
- Dark theme gradient background
- Count-up animation cho stat numbers
- System status color coding (success/warning/destructive)

---

### 4. ⚡ Trang Giám Sát Real-time (`/live-monitor`)

**APIs:**
- `POST /api/packets` — Gửi packet để ML phân tích
- WebSocket: `/topic/alerts` — Nhận alert real-time → Redux `alertSlice`

| Thành phần | Mô tả |
|------------|--------|
| **Live Feed** | Scrollable feed — packets + alerts real-time từ Redux store |
| **WebSocket Status** | `wsSlice.connectionStatus` → Badge (Connected/Disconnected/Reconnecting) |
| **Alert Toast** | shadcn `Toast` — pop-up khi Redux nhận alert mới |
| **Sound Alert** | Âm thanh khi CRITICAL alert |
| **Packet Form** | shadcn `Dialog` + `Form` — gửi packet thủ công |
| **Auto-scroll Toggle** | shadcn `Switch` |
| **Filter** | shadcn `Select` — label (normal/attack) hoặc attack type |
| **Connection Stats** | Packets/s, Alerts/min realtime counter |

**UI Design:**
- Terminal-style dark theme cho live feed
- Color coding: Green=normal, Yellow=warning, Red=critical
- WebSocket indicator nhấp nháy khi active
- Toast notification slide-in từ góc phải

---

### 5. 🚨 Trang Quản Lý Cảnh Báo (`/alerts`)

**APIs:**
- `GET /api/alerts?page=&size=&status=&alertType=` — Danh sách
- `PATCH /api/alerts/{id}/status` — Cập nhật status
- `DELETE /api/alerts/{id}` — Xóa (ADMIN)
- `GET /api/alerts/stats/overview` — Thống kê nhanh
- `GET /api/alerts/count/{status}` — Đếm theo status
- `GET /api/alerts/by-type` — Nhóm theo type
- `GET /api/alerts/timeline?days=7` — Timeline

| Thành phần | Mô tả |
|------------|--------|
| **Stats Summary Bar** | shadcn `Card` — Open / Resolved / Ignored counts |
| **Filter Bar** | shadcn `Select` — Status, Attack Type |
| **Search** | shadcn `Input` — search message, ID |
| **Data Table** | `@tanstack/react-table` + shadcn `Table` — sorting, filtering |
| **Columns** | ID, Attack Type, Severity (Badge), Status (Badge), Message, Created At, Actions |
| **Actions** | `DropdownMenu` — View Detail, Mark Resolved, Mark Ignored, Delete (ADMIN) |
| **Pagination** | shadcn pagination component |
| **Bulk Actions** | Checkbox select → bulk resolve/ignore |

**Alert Status Flow:**
```
OPEN → RESOLVED (by any user)
OPEN → IGNORED (by any user)
```

**Severity Color Mapping (shadcn Badge variants):**
| Severity | Badge Variant | Effect |
|----------|---------------|--------|
| CRITICAL | `destructive` | Pulsing animation |
| HIGH | `warning` (custom) | Bold |
| MEDIUM | `secondary` | Normal |
| LOW | `outline` | Subtle |

---

### 6. 🔍 Trang Chi Tiết Cảnh Báo (`/alerts/:id`)

**API:** `GET /api/alerts/{id}`

| Thành phần | Mô tả |
|------------|--------|
| **Alert Info Card** | shadcn `Card` — Type, Severity, Status, Message, Timestamps |
| **Linked Packet Info** | Source IP, Dest IP, Protocol, Size, Label, Confidence |
| **Timeline** | Created → Resolved/Ignored visual timeline |
| **Action Buttons** | shadcn `Button` — Resolve, Ignore, Delete (ADMIN) |
| **Back Button** | Return to alerts list |

---

### 7. 📦 Trang Quản Lý Packets (`/packets`)

**APIs:**
- `GET /api/packets?page=&size=&label=` — Danh sách
- `GET /api/packets/{id}` — Chi tiết
- `POST /api/packets` — Tạo mới
- `DELETE /api/packets/{id}` — Xóa (ADMIN)

| Thành phần | Mô tả |
|------------|--------|
| **Data Table** | `@tanstack/react-table` — ID, Source IP, Dest IP, Protocol, Size, Label, Attack Type, Confidence, Captured At |
| **Filter Bar** | shadcn `Select` — Label (normal, attack, all) |
| **Add Packet** | shadcn `Dialog` + `Form` — modal form nhập packet |
| **Row Click** | Navigate → packet detail |
| **Delete** | Chỉ hiện cho ADMIN role |
| **Pagination** | Standard |
| **Confidence Badge** | Color gradient: High (success) → Low (destructive) |

---

### 8. 📦 Trang Chi Tiết Packet (`/packets/:id`)

**API:** `GET /api/packets/{id}`

| Thành phần | Mô tả |
|------------|--------|
| **Packet Info** | shadcn `Card` — full packet details |
| **ML Result** | Label, Attack Type, Confidence progress bar |
| **Related Alerts** | Alerts liên kết |
| **Metadata** | Timestamp, size, protocol trong `Card` layout |

---

### 9. 📄 Trang Báo Cáo (`/reports`)

**APIs:**
- `POST /api/reports` — Tạo (ADMIN)
- `GET /api/reports?page=&size=` — Danh sách
- `GET /api/reports/{id}` — Chi tiết
- `DELETE /api/reports/{id}` — Xóa (ADMIN)

| Thành phần | Mô tả |
|------------|--------|
| **Generate Button** | shadcn `Dialog` + `Form` — Title, From/To Date |
| **Reports Table** | shadcn `Table` — ID, Title, Generated By, Date Range, Created At |
| **Report Detail** | shadcn `Card` — content + stats (totalPackets, totalAlerts, alertsByType) |
| **Delete** | ADMIN only |
| **Date Validation** | Zod: toDate >= fromDate, max 31 days |

---

### 10. ⚙️ Trang Cài Đặt (`/settings`)

| Thành phần | Mô tả |
|------------|--------|
| **User Profile** | shadcn `Card` — username, role từ Redux `authSlice` |
| **Theme Toggle** | shadcn `Switch` — Dark/Light mode |
| **Notifications** | shadcn `Switch` — sound alert, desktop notification |
| **System Health** | shadcn `Badge` — ML Service status, Backend status |
| **Logout** | shadcn `Button` variant `destructive` → dispatch logout → redirect |

---

## 🔌 Tích Hợp API Chi Tiết

### Authentication Flow (Redux)

```
1. User submit login form
2. Dispatch loginThunk(credentials) → Redux authSlice
3. POST /api/auth/login { username, password }
4. Response: { token: "jwt..." } + Set-Cookie: refresh_token (HttpOnly)
5. Store access token trong Redux authSlice (memory)
6. Axios interceptor lấy token từ store.getState().auth.accessToken
7. Khi 401 → Interceptor dispatch refreshTokenThunk() → /api/auth/refresh
8. Nhận token mới → update Redux authSlice
9. Logout → dispatch logoutThunk() → POST /api/auth/logout → clear Redux + cookie
```

### WebSocket Integration (Redux)

```javascript
// useWebSocket.js hook
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAppDispatch } from './useAppDispatch';
import { addRealtimeAlert } from '../store/slices/alertSlice';
import { setConnected, setDisconnected } from '../store/slices/wsSlice';

export function useWebSocket() {
  const dispatch = useAppDispatch();

  const connect = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:1010/ws'),
      onConnect: () => {
        dispatch(setConnected());
        client.subscribe('/topic/alerts', (message) => {
          const alert = JSON.parse(message.body);
          dispatch(addRealtimeAlert(alert)); // → Redux alertSlice
        });
      },
      onDisconnect: () => dispatch(setDisconnected()),
      reconnectDelay: 5000,
    });
    client.activate();
    return client;
  };

  return { connect };
}
```

### API Endpoints Mapping

| Frontend Feature | Backend API | Method |
|-----------------|-------------|--------|
| Login | `/api/auth/login` | POST |
| Register | `/api/auth/register` | POST |
| Get Current User | `/api/auth/me` | GET |
| Refresh Token | `/api/auth/refresh` | POST |
| Logout | `/api/auth/logout` | POST |
| Dashboard Stats | `/api/dashboard/stats` | GET |
| Dashboard Stats (range) | `/api/dashboard/stats?from=&to=` | GET |
| List Alerts | `/api/alerts?page=&size=&status=&alertType=` | GET |
| Get Alert | `/api/alerts/{id}` | GET |
| Update Alert Status | `/api/alerts/{id}/status` | PATCH |
| Delete Alert | `/api/alerts/{id}` | DELETE |
| Alert Stats | `/api/alerts/stats/overview` | GET |
| Alert Count by Status | `/api/alerts/count/{status}` | GET |
| Alert Timeline | `/api/alerts/timeline?days=` | GET |
| Alerts by Type | `/api/alerts/by-type` | GET |
| List Packets | `/api/packets?page=&size=&label=` | GET |
| Get Packet | `/api/packets/{id}` | GET |
| Create Packet | `/api/packets` | POST |
| Delete Packet | `/api/packets/{id}` | DELETE |
| List Reports | `/api/reports?page=&size=` | GET |
| Get Report | `/api/reports/{id}` | GET |
| Generate Report | `/api/reports` | POST |
| Delete Report | `/api/reports/{id}` | DELETE |
| **WebSocket** | `ws://localhost:1010/ws` → `/topic/alerts` | STOMP |

---

## 👥 Role-Based Access Control (RBAC)

Kiểm tra `user.role` từ Redux `authSlice`:

| Feature | USER/VIEWER | ADMIN |
|---------|-------------|-------|
| View Dashboard | ✅ | ✅ |
| View Alerts | ✅ | ✅ |
| Update Alert Status | ✅ | ✅ |
| Delete Alert | ❌ | ✅ |
| View Packets | ✅ | ✅ |
| Create Packet | ✅ | ✅ |
| Delete Packet | ❌ | ✅ |
| View Reports | ✅ | ✅ |
| Generate Report | ❌ | ✅ |
| Delete Report | ❌ | ✅ |
| Settings | ✅ | ✅ |
| Live Monitor | ✅ | ✅ |

---

## 🎨 Design System (shadcn/ui + Tailwind)

### Concept
Sử dụng **shadcn/ui** — component được generate trực tiếp vào `src/components/ui/` qua CLI. Cho phép tùy biến 100%.

### Color Palette (CSS Variables trong index.css)

HSL format để dễ switch Dark/Light mode:

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--background` | `0 0% 100%` | `222.2 84% 4.9%` | Nền chính |
| `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Chữ chính |
| `--primary` | `221.2 83.2% 53.3%` | `217.2 91.2% 59.8%` | Nút chính, links |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | CRITICAL alerts, nút xóa |
| `--warning` | `38 92% 50%` | `48 96% 53%` | HIGH/MEDIUM alerts |
| `--success` | `142 71% 45%` | `142 71% 45%` | Normal traffic |
| `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Disabled states |
| `--accent` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Hover backgrounds |
| `--card` | `0 0% 100%` | `222.2 84% 4.9%` | Card backgrounds |
| `--border` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Borders |

### Typography

- **Font Family:** `Inter` (Google Fonts) — via Tailwind config
- **Headings:** font-semibold to font-bold (600-700)
- **Body:** font-normal (400)
- **Monospace:** `JetBrains Mono` — IP addresses, technical data

### shadcn Components Used

| Component | shadcn CLI | Trang sử dụng |
|-----------|-----------|----------------|
| `Button` | `npx shadcn-ui add button` | Tất cả |
| `Input` | `npx shadcn-ui add input` | Login, Register, Search |
| `Card` | `npx shadcn-ui add card` | Dashboard, Detail pages |
| `Badge` | `npx shadcn-ui add badge` | Alerts, Packets (severity, status) |
| `Table` | `npx shadcn-ui add table` | Alerts, Packets, Reports |
| `Dialog` | `npx shadcn-ui add dialog` | Create Packet, Generate Report |
| `Select` | `npx shadcn-ui add select` | Filters |
| `Toast` | `npx shadcn-ui add toast` | Notifications toàn app |
| `Switch` | `npx shadcn-ui add switch` | Settings (theme, sound) |
| `DropdownMenu` | `npx shadcn-ui add dropdown-menu` | Actions column |
| `Sheet` | `npx shadcn-ui add sheet` | Mobile sidebar |
| `Separator` | `npx shadcn-ui add separator` | Layout dividers |
| `Skeleton` | `npx shadcn-ui add skeleton` | Loading states |
| `Tabs` | `npx shadcn-ui add tabs` | Detail pages |

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, Sheet sidebar |
| Tablet | 640-1024px | 2 columns, collapsible sidebar |
| Desktop | 1024-1440px | Full sidebar + content area |
| Wide | > 1440px | Max-width container centered |

---

## 🔄 State Management (Redux Toolkit)

### Store Configuration (`store.js`)
```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import alertReducer from './slices/alertSlice';
import wsReducer from './slices/wsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alerts: alertReducer,
    ws: wsReducer,
  },
});
```

### Auth Slice (`authSlice.js`)
```javascript
{
  user: { username, role } | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  status: 'idle' | 'loading' | 'failed',
  error: string | null
}
// AsyncThunks: loginThunk, refreshTokenThunk, logoutThunk
// Selectors: selectUser, selectIsAuthenticated, selectIsAdmin
```

### Alert Slice (`alertSlice.js`)
```javascript
{
  list: [],             // Paginated alerts
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  filters: { status: 'ALL', type: 'ALL' },
  unreadCount: 0,       // ++ khi WebSocket nhận alert mới
  latestAlert: null,    // Alert mới nhất từ WebSocket
}
// Reducers: setFilters, addRealtimeAlert, markAsRead, clearAlerts
// AsyncThunks: fetchAlerts, updateAlertStatus, deleteAlert
// Selectors: selectAlerts, selectUnreadCount (memoized via createSelector)
```

### WebSocket Slice (`wsSlice.js`)
```javascript
{
  isConnected: boolean,
  connectionStatus: 'disconnected' | 'connecting' | 'connected',
  lastMessageTime: timestamp | null
}
// Reducers: setConnected, setDisconnected, setConnecting, setLastMessage
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation & Core Setup (2-3 ngày)
- [ ] Khởi tạo dự án: `npm create vite@latest ./ -- --template react`
- [ ] Cài Tailwind CSS + PostCSS + Autoprefixer
- [ ] Khởi tạo **shadcn/ui**: `npx shadcn-ui@latest init` (New York, Slate)
- [ ] Generate components cơ bản: `button`, `input`, `card`, `badge`, `toast`, `skeleton`
- [ ] Cài Redux Toolkit + React Redux
- [ ] Setup `store.js` + `authSlice.js` + bọc App với `<Provider>`
- [ ] Setup Axios instance + interceptors (JWT từ Redux)
- [ ] Layout: Sidebar, Header, MainLayout (responsive)
- [ ] Theme provider: Dark/Light mode toggle
- [ ] Route config: AppRouter + PrivateRoute

### Phase 2: Auth & Core Pages (3-4 ngày)
- [ ] LoginPage + RegisterPage (Form + Zod + React Hook Form)
- [ ] Generate shadcn `table` + cài `@tanstack/react-table`
- [ ] AlertsPage: DataTable, filter, pagination, status update
- [ ] PacketsPage: DataTable, filter, Dialog tạo packet mới
- [ ] AlertDetailPage + PacketDetailPage

### Phase 3: Dashboard & Real-time (3 ngày)
- [ ] Cài Recharts
- [ ] DashboardPage: Stat cards, PieChart, BarChart, AreaChart
- [ ] `dashboardSlice.js` + `fetchDashboardStats` thunk
- [ ] WebSocket integration: `wsSlice.js` + `useWebSocket` hook
- [ ] LiveMonitorPage: Live feed + WebSocket status indicator
- [ ] Real-time toast notifications + sound alerts

### Phase 4: Reports & Settings (2 ngày)
- [ ] ReportsPage: Dialog tạo report, DataTable, detail view
- [ ] ReportDetailPage: content + stats
- [ ] SettingsPage: profile, theme, notifications
- [ ] NotFoundPage (404)

### Phase 5: Polish & Optimization (1-2 ngày)
- [ ] `createSelector` cho memoized Redux selectors
- [ ] Responsive kiểm tra Mobile/Tablet
- [ ] Error boundaries + edge-case handling
- [ ] React.lazy + Suspense cho code splitting
- [ ] Skeleton loading states cho mọi page
- [ ] Accessibility review (keyboard navigation, ARIA)

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backend port:** `1010` (không phải 8080 mặc định)
2. **WebSocket endpoint:** `ws://localhost:1010/ws` với SockJS fallback
3. **CORS:** Backend đã config cho `localhost:5173` (Vite) và `localhost:3000`
4. **Auth flow:** Refresh token qua HttpOnly cookie → Axios cần `withCredentials: true`
5. **Roles:** Backend có `USER` và `ADMIN`, register mặc định role `VIEWER`
6. **Pagination:** Backend trả Spring Page format `{ content, totalElements, totalPages }`
7. **Date format:** Backend dùng `LocalDateTime` (ISO format) → parse bằng `date-fns`
8. **Node.js:** Sử dụng v20.x LTS để đảm bảo tương thích
9. **shadcn/ui init:** Chọn style `New York`, base color `Slate`
10. **Redux DevTools:** Bật trong development để debug state
