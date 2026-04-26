import axios from "axios";
import { store } from "@/store/store";
import { refreshTokenThunk, clearAuth } from "@/store/slices/authSlice";
import { API_URL } from "@/lib/constants";
import { mockAlerts, mockDashboardStats, mockPackets, mockReports, mockUser } from "./mockData";

// --- MOCK MODE TOGGLE ---
const USE_MOCK = false;
// ------------------------

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
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
        const result = await store.dispatch(refreshTokenThunk());
        if (refreshTokenThunk.fulfilled.match(result)) {
          const newToken = result.payload.token;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(error);
          store.dispatch(clearAuth());
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
    if (USE_MOCK) return { data: { content: mockAlerts, totalElements: 25, totalPages: 1, currentPage: 0, pageSize: 10 } };
    return apiClient.get("/api/alerts", { params });
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
    if (USE_MOCK) return { data: { content: mockPackets, totalElements: 25, totalPages: 1, currentPage: 0, pageSize: 10 } };
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
