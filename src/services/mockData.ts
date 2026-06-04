import { AlertResponse, DashboardStatsResponse, PacketResponse, ReportResponse, TimelinePoint, User } from "@/types";

export const mockUser: User = {
  username: "admin_mock",
  role: "ADMIN",
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

export const mockPackets: PacketResponse[] = [
  { id: 1, srcIp: "192.168.1.100", dstIp: "10.0.0.5", srcPort: 443, dstPort: 80, duration: 0.1, land: 0, wrongFragment: 0, urgent: 0, protocol: "TCP", size: 1024, label: "normal", attackType: "", confidence: 0.95, capturedAt: "2026-06-03T10:00:00Z", isThreat: false, message: "Normal traffic detected" },
  { id: 2, srcIp: "192.168.1.101", dstIp: "10.0.0.5", srcPort: 53, dstPort: 53, duration: 0.0, land: 0, wrongFragment: 0, urgent: 0, protocol: "UDP", size: 512, label: "attack", attackType: "DoS", confidence: 0.88, capturedAt: "2026-06-03T10:05:00Z", isThreat: true, message: "DoS attack detected with 88% confidence" },
  { id: 3, srcIp: "10.0.0.5", dstIp: "192.168.1.102", srcPort: 80, dstPort: 443, duration: 0.5, land: 0, wrongFragment: 0, urgent: 0, protocol: "TCP", size: 2048, label: "normal", attackType: "", confidence: 0.99, capturedAt: "2026-06-03T10:10:00Z", isThreat: false, message: "Normal traffic detected" },
  { id: 4, srcIp: "192.168.1.103", dstIp: "10.0.0.5", srcPort: 22, dstPort: 22, duration: 1.2, land: 0, wrongFragment: 0, urgent: 0, protocol: "TCP", size: 256, label: "attack", attackType: "Brute Force", confidence: 0.92, capturedAt: "2026-06-03T10:15:00Z", isThreat: true, message: "Brute Force attack detected with 92% confidence" },
  { id: 5, srcIp: "192.168.1.104", dstIp: "10.0.0.5", srcPort: 8080, dstPort: 80, duration: 0.2, land: 0, wrongFragment: 0, urgent: 0, protocol: "TCP", size: 1500, label: "normal", attackType: "", confidence: 0.91, capturedAt: "2026-06-03T10:20:00Z", isThreat: false, message: "Normal traffic detected" },
  { id: 6, srcIp: "192.168.1.42", dstIp: "10.0.0.33", srcPort: 33456, dstPort: 0, duration: 0.0, land: 0, wrongFragment: 0, urgent: 0, protocol: "ICMP", size: 84, label: "attack", attackType: "Probe", confidence: 0.6974, capturedAt: "2026-05-22T21:56:31", isThreat: true, message: "Probe attack detected with 70% confidence" },
];

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
