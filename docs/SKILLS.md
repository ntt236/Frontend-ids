# 🎯 NetSentinel IDS — Frontend Skills Required

> **Ngày tạo:** 2026-04-26  
> **Phiên bản:** v1.1.0 (Redux Toolkit & shadcn/ui)

---

## 📊 Skill Matrix Tổng Quan

| Skill | Mức độ yêu cầu | Độ ưu tiên |
|-------|----------------|------------|
| React.js (Hooks) | ⭐⭐⭐⭐ Advanced | 🔴 Critical |
| JavaScript (ES6+) | ⭐⭐⭐⭐ Advanced | 🔴 Critical |
| Redux Toolkit | ⭐⭐⭐ Intermediate | 🔴 Critical |
| REST API (Axios) | ⭐⭐⭐⭐ Advanced | 🔴 Critical |
| WebSocket / STOMP | ⭐⭐⭐ Intermediate | 🔴 Critical |
| shadcn/ui + Radix UI | ⭐⭐⭐ Intermediate | 🟡 Important |
| Tailwind CSS | ⭐⭐⭐ Intermediate | 🟡 Important |
| Recharts | ⭐⭐ Basic | 🟡 Important |
| React Router v6 | ⭐⭐⭐ Intermediate | 🟡 Important |
| Zod + React Hook Form | ⭐⭐ Basic | 🟡 Important |
| @tanstack/react-table | ⭐⭐ Basic | 🟡 Important |
| Responsive Design | ⭐⭐⭐ Intermediate | 🟡 Important |
| Git | ⭐⭐⭐ Intermediate | 🟡 Important |
| Network/Security Concepts | ⭐⭐ Basic | 🟢 Nice-to-have |

---

## 🔴 Critical Skills (Bắt buộc)

### 1. React.js Fundamentals & Advanced

**Cần biết:**
- Functional components & JSX
- Hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- Custom hooks: `useWebSocket`, `useAppDispatch`, `useAppSelector`
- Component lifecycle & cleanup (WebSocket disconnect, interval clear)
- Conditional rendering & list rendering
- React.memo & performance optimization
- Code splitting: `React.lazy` + `Suspense`
- Error Boundaries

**Áp dụng:**
- Layout system (Sidebar, Header, MainLayout)
- Tất cả page components
- Custom hooks cho WebSocket & Redux
- Protected routes & role-based rendering

---

### 2. Redux Toolkit (RTK) — **MỚI**

**Cần biết:**
- `configureStore` — tạo Redux store
- `createSlice` — tạo reducer + actions tự động
- `createAsyncThunk` — xử lý async logic (API calls)
- `useSelector` + `useDispatch` (React-Redux hooks)
- `createSelector` (memoized selectors — tránh re-render)
- Immutable state update (RTK dùng Immer internally)
- DevTools integration

**Áp dụng:**
- `authSlice` — quản lý JWT token, user info, login/logout thunks
- `alertSlice` — danh sách alerts, filters, pagination, real-time unread count
- `wsSlice` — trạng thái kết nối WebSocket
- Axios interceptor lấy token từ `store.getState().auth.accessToken`
- WebSocket hook dispatch `addRealtimeAlert()` vào Redux

**Ví dụ code:**
```javascript
// authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, isAuthenticated: false },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    }
  }
});
```

---

### 3. REST API Integration (Axios)

**Cần biết:**
- HTTP methods: GET, POST, PATCH, DELETE
- Headers: `Authorization: Bearer <token>`, `Content-Type`
- Axios instance + interceptors
- Request interceptor: auto-attach JWT từ Redux store
- Response interceptor: auto-refresh token khi 401
- `withCredentials: true` cho HttpOnly cookie
- Pagination handling (Spring Page format)
- Error handling theo status code

**Áp dụng:**
```
Auth:      POST /api/auth/login → dispatch setCredentials()
Alerts:    GET  /api/alerts?page=0&size=10&status=OPEN
Dashboard: GET  /api/dashboard/stats
Packets:   POST /api/packets → create + trigger ML prediction
Reports:   POST /api/reports → ADMIN only
```

---

### 4. WebSocket / STOMP Protocol

**Cần biết:**
- WebSocket: full-duplex real-time communication
- STOMP protocol: subscribe/publish pattern trên WebSocket
- SockJS: fallback transport
- Connection lifecycle: connect → subscribe → receive → disconnect
- Reconnection logic (auto-reconnect)
- JSON message parsing

**Áp dụng:**
- Connect `ws://localhost:1010/ws` via SockJS
- Subscribe `/topic/alerts`
- Nhận alert → `dispatch(addRealtimeAlert(data))` vào Redux
- Update `wsSlice` connection status
- Toast notification + sound alert cho CRITICAL

**Library:** `@stomp/stompjs` + `sockjs-client`

---

## 🟡 Important Skills (Quan trọng)

### 5. shadcn/ui + Radix UI — **MỚI**

**Cần biết:**
- shadcn/ui CLI: `npx shadcn-ui add <component>`
- Components sinh vào `src/components/ui/` — có thể customize 100%
- Radix UI primitives: unstyled, accessible components
- `cn()` helper function (`clsx` + `tailwind-merge`)
- CSS Variables cho theming (HSL format)
- Component variants via `class-variance-authority` (CVA)

**Components thường dùng:**
`Button`, `Card`, `Badge`, `Table`, `Dialog`, `Select`, `Input`, `Toast`, `Sheet`, `Switch`, `DropdownMenu`, `Skeleton`, `Tabs`

---

### 6. Tailwind CSS

**Cần biết:**
- Utility classes: `flex`, `grid`, `p-4`, `text-lg`, `bg-background`
- Responsive: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode: `dark:` prefix
- Animation: `transition`, `duration`, `animate-pulse`
- Custom config: `tailwind.config.js` (shadcn theme extension)
- `tailwindcss-animate` plugin

---

### 7. Recharts (Data Visualization)

**Cần biết:**
- `PieChart`, `BarChart`, `LineChart`, `AreaChart`
- `ResponsiveContainer`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- Custom tooltip formatting
- Color customization từ CSS variables

**Áp dụng:** Dashboard charts (alerts by type, severity, timeline)

---

### 8. React Router DOM v6

**Cần biết:**
- `BrowserRouter`, `Routes`, `Route`
- `useNavigate`, `useParams`, `useSearchParams`
- Nested routes & layout routes
- Protected routes (check Redux `isAuthenticated`)
- Lazy loading routes
- Programmatic navigation

---

### 9. Zod + React Hook Form

**Cần biết:**
- Zod schema definition & validation
- `useForm` hook
- Integration: `@hookform/resolvers/zod`
- Error messages display
- shadcn `Form` component integration

**Áp dụng:** Login, Register, Create Packet, Generate Report forms

---

### 10. @tanstack/react-table

**Cần biết:**
- Column definitions
- Sorting, filtering, pagination
- Row selection (checkbox)
- Integration với shadcn `Table` component

**Áp dụng:** Alerts table, Packets table, Reports table

---

## 🟢 Nice-to-have Skills

### 11. Network & Security Concepts
- IDS (Intrusion Detection System) basics
- Attack types: DoS, Probe, R2L, U2R
- Packet structure: source IP, dest IP, protocol
- JWT lifecycle

### 12. Performance Optimization
- `createSelector` (memoized Redux selectors)
- `React.memo` & `useMemo`
- Code splitting & lazy loading
- Bundle analysis

---

## 📚 Tài Liệu Tham Khảo

| Tài liệu | Link |
|-----------|------|
| React Docs | https://react.dev |
| Redux Toolkit | https://redux-toolkit.js.org |
| shadcn/ui | https://ui.shadcn.com |
| Vite Guide | https://vitejs.dev/guide |
| Tailwind CSS | https://tailwindcss.com/docs |
| Recharts | https://recharts.org |
| React Router v6 | https://reactrouter.com |
| @tanstack/react-table | https://tanstack.com/table |
| Zod | https://zod.dev |
| React Hook Form | https://react-hook-form.com |
| STOMP.js | https://stomp-js.github.io |
| Lucide Icons | https://lucide.dev |

---

## 🎓 Learning Path Gợi Ý

```
Tuần 1: React fundamentals + Hooks + Router + Redux Toolkit
         ↓
Tuần 2: shadcn/ui + Tailwind CSS + Responsive Design
         ↓
Tuần 3: Axios + JWT Auth + Zod Forms + Data Tables
         ↓
Tuần 4: WebSocket (STOMP) + Recharts + Polish
```
