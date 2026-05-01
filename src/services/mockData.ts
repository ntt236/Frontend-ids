import { AlertResponse, DashboardStatsResponse, PacketResponse, ReportResponse, TimelinePoint, User } from "@/types";

export const mockUser: User = {
  username: "admin_mock",
  role: "USER",
};

export const mockDashboardStats: DashboardStatsResponse = {
  totalPackets: 154230,
  totalAlerts: 1245,
  openAlerts: 45,
  resolvedAlerts: 1100,
  alertsByType: {
    "DoS": 450,
    "Probe": 320,
    "R2L": 150,
    "U2R": 85,
    "normal": 240,
  },
  alertsBySeverity: {
    "CRITICAL": 120,
    "HIGH": 340,
    "MEDIUM": 500,
    "LOW": 285,
  },
  alertTimeline: Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString(),
      count: Math.floor(Math.random() * 200) + 50,
    };
  }),
  systemStatus: "WARNING",
};

export const mockAlerts: AlertResponse[] = Array.from({ length: 25 }).map((_, i) => {
  const types = ["DoS", "Probe", "R2L", "U2R"];
  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const statuses = ["OPEN", "RESOLVED", "IGNORED"];
  const d = new Date();
  d.setMinutes(d.getMinutes() - i * 15);

  return {
    id: 1000 - i,
    packetId: 5000 - i,
    alertType: types[i % types.length],
    severity: severities[i % severities.length],
    message: `Suspicious traffic pattern detected from 192.168.1.${i % 255}`,
    status: statuses[i % statuses.length],
    createdAt: d.toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    updatedAt: d.toISOString(),
  };
});

export const mockPackets: PacketResponse[] = Array.from({ length: 25 }).map((_, i) => {
  const isAttack = i % 3 === 0;
  const d = new Date();
  d.setSeconds(d.getSeconds() - i * 5);

  return {
    id: 5000 - i,
    sourceIp: `192.168.1.${10 + i}`,
    destIp: `10.0.0.${i}`,
    protocol: i % 2 === 0 ? "TCP" : "UDP",
    size: Math.floor(Math.random() * 1500) + 40,
    label: isAttack ? "attack" : "normal",
    attackType: isAttack ? (i % 2 === 0 ? "DoS" : "Probe") : "normal",
    confidence: isAttack ? 0.85 + Math.random() * 0.14 : 0.95 + Math.random() * 0.04,
    capturedAt: d.toISOString(),
  };
});

export const mockReports: ReportResponse[] = [
  {
    id: 1,
    title: "Weekly Security Summary",
    generatedBy: "admin",
    fromDate: "2026-04-10",
    toDate: "2026-04-17",
    totalPackets: 850000,
    totalAlerts: 3200,
    alertsByType: { "DoS": 1200, "Probe": 800 },
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Monthly Attack Surface Analysis",
    generatedBy: "admin",
    fromDate: "2026-03-01",
    toDate: "2026-03-31",
    totalPackets: 3500000,
    totalAlerts: 15400,
    alertsByType: { "DoS": 6000, "Probe": 4000, "R2L": 1000 },
    generatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];
