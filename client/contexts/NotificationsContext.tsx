import React, { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  type: "task-assigned" | "due-soon" | "overdue" | "approved" | "needs-review";
  title: string;
  message: string;
  relatedTo?: string; // task/submission ID
  read: boolean;
  timestamp: Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "task-assigned",
      title: "New Task Assigned",
      message: "You've been assigned 'Plan Summer Fundraiser' in Events",
      relatedTo: "task-1",
      read: false,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      type: "due-soon",
      title: "Task Due Tomorrow",
      message: "'Submit Event Proposal' is due tomorrow at 5 PM",
      relatedTo: "task-2",
      read: false,
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "3",
      type: "approved",
      title: "Approval Granted",
      message: "Your reimbursement request has been approved ✅",
      relatedTo: "submission-1",
      read: true,
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        timestamp: new Date(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
};
