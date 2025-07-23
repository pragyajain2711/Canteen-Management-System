import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { feedbackApi } from "./api";
import { AuthContext } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [message, setMessage] = useState(null);
  const { employee, isAdmin } = useContext(AuthContext);

  const employeeMemo = useMemo(() => employee, [employee?.employeeId]);

  // Store cleared time in localStorage
  const [lastClearedAt, setLastClearedAt] = useState(() => {
    return localStorage.getItem("lastClearedAt") || null;
  });

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadNotifications = async () => {
    try {
      const response = await feedbackApi.getMyNotifications();
      let data = response.data.filter(n => !lastClearedAt || new Date(n.createdAt) > new Date(lastClearedAt));

      // If admin, group by content + timestamp to remove duplicates
      if (isAdmin) {
        const grouped = new Map();

        data.forEach(n => {
          const key = `${n.title}|${n.content}|${new Date(n.createdAt).toISOString().slice(0, 16)}`;
          if (!grouped.has(key)) {
            grouped.set(key, n); // Keep the first one
          }
        });

        data = Array.from(grouped.values());
      }

      const sorted = data
        .map(n => ({
          ...n,
          isRead: n.status === 'READ',
          senderName: n.senderName || (n.senderId === employeeMemo?.employeeId ? 'You' : 'System')
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      showMessage("Failed to load notifications", true);
    }
  };

  useEffect(() => {
    if (employeeMemo) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [employeeMemo, lastClearedAt]);

  const markAsRead = async (id) => {
    try {
      await feedbackApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      showMessage("Failed to mark as read", true);
    }
  };

  const clearNotifications = () => {
    if (!isAdmin) {
      const hasUnread = notifications.some(n => !n.isRead);
      if (hasUnread) {
        showMessage("Cannot clear - not all notifications are read", true);
        return;
      }
    }

    const now = new Date().toISOString();
    localStorage.setItem("lastClearedAt", now);
    setLastClearedAt(now);
    setNotifications([]);
    setUnreadCount(0);
    showMessage("Notifications cleared");
  };

  const resetNotificationHistory = () => {
    localStorage.removeItem("lastClearedAt");
    setLastClearedAt(null);
    showMessage("Notification history reset.");
    loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications,
        refreshNotifications: loadNotifications,
        resetNotificationHistory,
        message,
        showMessage
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
