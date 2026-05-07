import axios from "axios";
// import { store } from "@/store/store"; // Removed to fix circular dependency
import { refreshTokenThunk, clearAuth } from "@/store/slices/authSlice";
import { API_URL } from "@/lib/constants";
import { mockAlerts, mockDashboardStats, mockPackets, mockReports, mockUser } from "./mockData";
import { clearAccessTokenCookie, getAccessTokenCookie } from "@/lib/authCookies";

// --- MOCK MODE TOGGLE ---
export const USE_MOCK = false;
// ------------------------

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let injectedStore: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const injectStore = (_store: any) => {
  injectedStore = _store;
};

apiClient.interceptors.request.use((config) => {
  const token = injectedStore?.getState().auth.accessToken || getAccessTokenCookie();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (v: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (USE_MOCK) return Promise.reject(error); // Don't intercept refresh in mock mode
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const result = await injectedStore.dispatch(refreshTokenThunk());
        if (refreshTokenThunk.fulfilled.match(result)) {
          const newToken = result.payload.token;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(error);
          clearAccessTokenCookie();
          injectedStore.dispatch(clearAuth());
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Service functions (Mocked)
export const authService = {
  login: async (data: { username: string; password: string }) => {
    if (USE_MOCK) {
      localStorage.setItem("mockToken", "mock_jwt_token_123");
      return { data: { token: "mock_jwt_token_123" } };
    }
    return apiClient.post<{ token: string }>("/api/auth/login", data);
  },
  register: async (data: unknown) => {
    if (USE_MOCK) return { data: { message: "Mock user registered" } };
    return apiClient.post("/api/auth/register", data);
  },
  me: async (token?: string) => {
    if (USE_MOCK) {
      if (!localStorage.getItem("mockToken")) return Promise.reject(new Error("Not authenticated"));
      return { data: mockUser };
    }
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return apiClient.get<{ username: string; role: string }>("/api/auth/me", config);
  },
  refresh: async () => {
    if (USE_MOCK) return { data: { token: "mock_jwt_token_456" } };
    return apiClient.post<{ token: string }>("/api/auth/refresh");
  },
  logout: async () => {
    if (USE_MOCK) {
      localStorage.removeItem("mockToken");
      return { data: { message: "Logged out" } };
    }
    return apiClient.post("/api/auth/logout");
  },
};

export const alertService = {
  getAll: async (params: Record<string, string | number>) => {
    if (USE_MOCK) {
      let filtered = [...mockAlerts];
      if (params.status && params.status !== "ALL") {
        filtered = filtered.filter(a => a.status === params.status);
      }
      if (params.severity && params.severity !== "ALL") {
        filtered = filtered.filter(a => a.severity === params.severity);
      }
      if (params.alertType && params.alertType !== "ALL") {
        filtered = filtered.filter(a => a.alertType === params.alertType);
      }
      return { data: { content: filtered, totalElements: filtered.length, totalPages: 1, currentPage: 0, pageSize: 10 } };
    }
    return apiClient.get("/api/alerts", { params });
  },
  getById: async (id: number) => {
    if (USE_MOCK) {
      const alert = mockAlerts.find(a => a.id === id);
      if (!alert) return Promise.reject(new Error("Alert not found"));
      // Mock: attach related packet info
      const packet = mockPackets.find(p => p.id === alert.packetId);
      return { data: { ...alert, packet: packet || null } };
    }
    return apiClient.get(`/api/alerts/${id}`);
  },
  updateStatus: async (id: number, status: string) => {
    if (USE_MOCK) {
      const alert = mockAlerts.find(a => a.id === id);
      return { data: alert ? { ...alert, status } : {} };
    }
    return apiClient.patch(`/api/alerts/${id}/status`, { status });
  },
  delete: async (id: number) => {
    if (USE_MOCK) return { data: {} };
    return apiClient.delete(`/api/alerts/${id}`);
  },
};

export const packetService = {
  getAll: async (params: Record<string, string | number>) => {
    if (USE_MOCK) {
      let filtered = [...mockPackets];
      if (params.label && params.label !== "ALL") {
        filtered = filtered.filter(p => p.label === params.label);
      }
      return { data: { content: filtered, totalElements: filtered.length, totalPages: 1, currentPage: 0, pageSize: 10 } };
    }
    return apiClient.get("/api/packets", { params });
  },
  delete: async (id: number) => {
    if (USE_MOCK) return { data: {} };
    return apiClient.delete(`/api/packets/${id}`);
  },
};

export const dashboardService = {
  getStats: async (from?: string, to?: string) => {
    if (USE_MOCK) return { data: mockDashboardStats };
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return apiClient.get("/api/dashboard/stats", { params });
  },
};

export const reportService = {
  getAll: async (page = 0, size = 10) => {
    if (USE_MOCK) return { data: { content: mockReports, totalElements: 2, totalPages: 1, currentPage: 0, pageSize: 10 } };
    return apiClient.get("/api/reports", { params: { page, size } });
  },
  create: async (data: unknown) => {
    if (USE_MOCK) return { data: {} };
    return apiClient.post("/api/reports", data);
  },
  delete: async (id: number) => {
    if (USE_MOCK) return { data: {} };
    return apiClient.delete(`/api/reports/${id}`);
  },
};
