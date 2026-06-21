import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getRiskColor(score: number): string {
  if (score >= 80) return "text-red-500";
  if (score >= 60) return "text-orange-500";
  if (score >= 40) return "text-yellow-500";
  return "text-green-500";
}

export function getRiskBadgeColor(score: number): string {
  if (score >= 80) return "bg-red-500/10 text-red-500 border-red-500/20";
  if (score >= 60) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (score >= 40) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-green-500/10 text-green-500 border-green-500/20";
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    FLAGGED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    REVIEWING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    OPEN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    IN_PROGRESS: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    CLOSED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    RESOLVED: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  return statusMap[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

