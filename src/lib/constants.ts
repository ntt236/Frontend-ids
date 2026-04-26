export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1010";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:1010/ws";

export const ATTACK_TYPES = ["DoS", "Probe", "R2L", "U2R", "normal"] as const;
export type AttackType = (typeof ATTACK_TYPES)[number];

export const ALERT_STATUSES = ["OPEN", "RESOLVED", "IGNORED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const PROTOCOLS = ["TCP", "UDP", "ICMP"] as const;
export type Protocol = (typeof PROTOCOLS)[number];

export const ROLES = ["ADMIN", "USER", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const SEVERITY_CONFIG: Record<string, { label: string; color: string; pulse: boolean }> = {
  CRITICAL: { label: "Critical", color: "text-red-500 bg-red-500/10 border-red-500/30", pulse: true },
  HIGH:     { label: "High",     color: "text-orange-500 bg-orange-500/10 border-orange-500/30", pulse: false },
  MEDIUM:   { label: "Medium",   color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", pulse: false },
  LOW:      { label: "Low",      color: "text-green-500 bg-green-500/10 border-green-500/30", pulse: false },
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN:     { label: "Open",     color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  RESOLVED: { label: "Resolved", color: "text-green-500 bg-green-500/10 border-green-500/30" },
  IGNORED:  { label: "Ignored",  color: "text-muted-foreground bg-muted/50 border-border" },
};

export const ATTACK_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  DoS:    { label: "DoS",    color: "text-red-500 bg-red-500/10" },
  Probe:  { label: "Probe",  color: "text-orange-500 bg-orange-500/10" },
  R2L:    { label: "R2L",    color: "text-yellow-500 bg-yellow-500/10" },
  U2R:    { label: "U2R",    color: "text-purple-500 bg-purple-500/10" },
  normal: { label: "Normal", color: "text-green-500 bg-green-500/10" },
};
