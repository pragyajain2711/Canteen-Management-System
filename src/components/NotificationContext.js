// NotificationContext.js
import { createContext, useState, useEffect, useContext } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage on initial render
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications).map(n => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      read: false,
      isAdminNotification: true // Mark as admin-generated
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead,
        clearNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);