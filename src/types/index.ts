// TypeScript types aligned with backend DTOs

export interface User {
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

// ─── Packets ────────────────────────────────────────────────────
export interface PacketResponse {
  id: number;
  sourceIp: string;
  destIp: string;
  protocol: string;
  size: number;
  label: string;
  attackType: string;
  confidence: number;
  capturedAt: string;
}

export interface PacketRequest {
  sourceIp: string;
  destIp: string;
  protocol: string;
  size: number;
  label: string;
  attackType: string;
  confidence: number;
}

// ─── Alerts ─────────────────────────────────────────────────────
export interface AlertResponse {
  id: number;
  packetId: number;
  alertType: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  updatedAt: string | null;
}

export interface AlertStatusUpdateRequest {
  status: string;
}

export interface AlertStatsDto {
  openCount: number;
  resolvedCount: number;
  ignoredCount: number;
  totalCount: number;
  alertsByType: [string, number][];
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface TimelinePoint {
  date: string;
  count: number;
}

export interface DashboardStatsResponse {
  totalPackets: number;
  totalAlerts: number;
  openAlerts: number;
  resolvedAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  alertTimeline: TimelinePoint[];
  systemStatus: string;
}

// ─── Reports ────────────────────────────────────────────────────
export interface ReportRequest {
  title: string;
  fromDate: string; // "YYYY-MM-DD"
  toDate: string;
}

export interface ReportResponse {
  id: number;
  title: string;
  generatedBy: string;
  fromDate: string;
  toDate: string;
  totalPackets: number;
  totalAlerts: number;
  alertsByType: Record<string, number>;
  generatedAt: string;
}

// ─── Pagination ─────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ─── WebSocket Alert ────────────────────────────────────────────
export interface WsAlert {
  id: number;
  packetId: number;
  alertType: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string;
}
