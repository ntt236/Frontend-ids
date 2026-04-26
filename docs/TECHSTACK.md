# 🛠️ NetSentinel IDS — Frontend Tech Stack

> **Ngày tạo:** 2026-04-26  
> **Phiên bản:** v1.1.0 (Redux Toolkit & shadcn/ui)

---

## 📦 Core Framework & Environment

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **React** | 18.x | UI Library | Component-based, virtual DOM, hooks system. |
| **Vite** | 5.x | Build tool & Dev server | HMR cực nhanh, ES modules, tối ưu build. |
| **JavaScript** | ES6+ | Ngôn ngữ chính | Phổ biến, dễ tiếp cận, đủ cho scope dự án. |
| **Node.js** | v20.x LTS | Runtime Environment | Phiên bản LTS ổn định, tương thích tốt với các package. |

---

## 🧠 State Management

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **Redux Toolkit** | 2.x | Global State | Quản lý state phức tạp, tối ưu re-render khi xử lý luồng dữ liệu realtime lớn. |
| **React Redux** | 9.x | React Binding | Kết nối chuẩn giữa Redux Store và React Components. |

### Redux Architecture
```
store.js
├── authSlice.js     → JWT, user info, login/logout thunks
├── alertSlice.js    → Alert list, filters, pagination, unread count
├── packetSlice.js   → Packet list, filters (optional)
├── dashboardSlice.js→ Dashboard stats cache (optional)
└── wsSlice.js       → WebSocket connection status
```

---

## 🎨 Styling & UI Components

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **shadcn/ui** | Latest | UI Component System | Component chuẩn accessibility, copy vào dự án để custom 100%. |
| **Tailwind CSS** | 3.x | Utility-first CSS | Styling nhanh, dễ maintain, tích hợp sâu với shadcn. |
| **Radix UI** | 1.x | Headless Primitives | Core cho shadcn/ui (đảm bảo ARIA chuẩn). |
| **Lucide React** | 0.4x | Icon library | Icon mặc định của shadcn/ui, nhẹ và đồng nhất. |
| **class-variance-authority** | 0.7.x | Component variants | Quản lý variants cho shadcn components. |
| **clsx** + **tailwind-merge** | 2.x | CSS class merging | Hàm `cn()` helper cho shadcn. |

### shadcn/ui Setup
```bash
# Khởi tạo
npx shadcn-ui@latest init
# → Style: New York
# → Base color: Slate
# → CSS variables: Yes

# Thêm components
npx shadcn-ui add button input card badge table dialog select toast switch dropdown-menu sheet skeleton tabs separator
```

---

## 🔗 HTTP & API

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **Axios** | 1.x | HTTP client | Interceptors (JWT auto-attach), tự động xử lý Refresh Token. |

### Axios Configuration
```javascript
// Interceptor tự động gắn JWT token từ Redux Store
axios.interceptors.request.use(config => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor auto-refresh token qua HttpOnly Cookie
axios.interceptors.response.use(null, async error => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    await store.dispatch(refreshTokenThunk());
    return axios(error.config);
  }
  return Promise.reject(error);
});
```

---

## 🔌 WebSocket (Real-time)

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **@stomp/stompjs** | 7.x | STOMP protocol | Tương thích hoàn hảo với Spring Boot WebSocket. |
| **sockjs-client** | 1.x | Fallback Transport | Hỗ trợ proxy/firewall block native WS. |

### WebSocket → Redux Flow
```
SockJS → ws://localhost:1010/ws
  → STOMP CONNECT
  → SUBSCRIBE /topic/alerts
  ← Nhận JSON → dispatch(addRealtimeAlert(data)) → Redux alertSlice
  ← Update wsSlice.connectionStatus
```

---

## 📊 Data Visualization

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **Recharts** | 2.x | Charts library | Biểu diễn Dashboard (PieChart, BarChart, AreaChart realtime). |

---

## 🗺️ Routing

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **React Router DOM** | 6.x | Client-side routing | Điều hướng, phân quyền Private/Public routes. |

### Route Map
```
/login              → LoginPage (public)
/register           → RegisterPage (public)
/dashboard          → DashboardPage (protected)
/live-monitor       → LiveMonitorPage (protected)
/alerts             → AlertsPage (protected)
/alerts/:id         → AlertDetailPage (protected)
/packets            → PacketsPage (protected)
/packets/:id        → PacketDetailPage (protected)
/reports            → ReportsPage (protected)
/reports/:id        → ReportDetailPage (protected)
/settings           → SettingsPage (protected)
/*                  → NotFoundPage
```

---

## 📝 Forms & Validation

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **React Hook Form** | 7.x | Form management | Performance tốt, uncontrolled forms. |
| **Zod** | 3.x | Schema validation | Type-safe, composable, tích hợp tốt với RHF. |
| **@hookform/resolvers** | 3.x | Resolver bridge | Kết nối Zod với React Hook Form. |

---

## 📋 Data Tables

| Công nghệ | Phiên bản | Mục đích | Lý do chọn |
|-----------|-----------|----------|-------------|
| **@tanstack/react-table** | 8.x | Headless table | Sorting, filtering, pagination — kết hợp shadcn Table. |

---

## 📋 package.json Dependencies Dự Kiến

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@reduxjs/toolkit": "^2.2.0",
    "react-redux": "^9.1.0",
    "axios": "^1.7.0",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.441.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-slot": "^1.0.2",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "@tanstack/react-table": "^8.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 🌐 Environment Variables

```env
# .env (Development)
VITE_API_URL=http://localhost:1010
VITE_WS_URL=ws://localhost:1010/ws

# .env.production
VITE_API_URL=https://api.netsentinel.com
VITE_WS_URL=wss://api.netsentinel.com/ws
```

---

## ⚡ Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Time to Interactive (TTI) | < 3.0s |
| Redux State Update Latency | < 16ms (60fps) |
| Bundle size (gzipped) | < 250KB |
| WebSocket Message Delay | < 100ms |