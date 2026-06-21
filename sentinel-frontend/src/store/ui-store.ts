import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardState {
  refreshInterval: number;
  autoRefresh: boolean;
  dateRange: {
    start: string;
    end: string;
  } | null;
  setRefreshInterval: (interval: number) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setDateRange: (range: { start: string; end: string } | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  refreshInterval: 30000, // 30 seconds
  autoRefresh: true,
  dateRange: null,

  setRefreshInterval: (interval) => set({ refreshInterval: interval }),
  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
  setDateRange: (range) => set({ dateRange: range }),
}));

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: "sentinel-sidebar",
    }
  )
);

interface NotificationState {
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: string;
  }>;
  addNotification: (notification: {
    type: "success" | "error" | "warning" | "info";
    message: string;
  }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

interface ChatState {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  isStreaming: boolean;
  addMessage: (message: {
    role: "user" | "assistant";
    content: string;
  }) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  clearMessages: () => set({ messages: [] }),
}));

