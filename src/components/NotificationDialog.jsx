import { useState, useEffect, useContext } from 'react';
import { Bell, X, Check, Send } from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { AuthContext } from './AuthContext';
import { feedbackApi } from './api';

const NotificationDialog = ({ open, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    refreshNotifications,
    resetNotificationHistory, // NEW
    message,
    showMessage
  } = useNotifications();

  const { employee, isAdmin } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    recipientId: ''
  });

  useEffect(() => {
    if (isAdmin && open) {
      const fetchCustomers = async () => {
        try {
          const response = await feedbackApi.getAllCustomers();
          setCustomers(response.data);
        } catch (error) {
          console.error("Failed to fetch customers:", error);
          showMessage("Failed to load customers", true);
        }
      };
      fetchCustomers();
    }
  }, [isAdmin, open]);

  const handleSendNotification = async () => {
    if (!newNotification.content.trim()) {
      showMessage("Content cannot be empty", true);
      return;
    }

    setIsLoading(true);
    try {
      await feedbackApi.createNotification({
        title: newNotification.title || `Notification from ${employee.firstName}`,
        content: newNotification.content,
        senderId: employee.employeeId,
        recipientId: newNotification.recipientId || null
      });

      setNewNotification({ title: '', content: '', recipientId: '' });
      showMessage("Notification sent successfully!");
      refreshNotifications(); // Refresh UI after sending
    } catch (error) {
      console.error("Failed to send notification:", error);
      showMessage("Failed to send notification", true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-2 rounded ${message.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {message.text}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto mb-4 border rounded">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm">{notification.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                          {notification.senderName && ` • From: ${notification.senderName}`}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="ml-2 p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No notifications</p>
              )}
            </div>

            <div className="flex justify-between mt-2 items-center">
              <button
                onClick={clearNotifications}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={notifications.length === 0}
              >
                Clear All
              </button>

              {/* Admin reset button */}
              {isAdmin && (
                <button
                  onClick={resetNotificationHistory}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Reset and show all notifications
                </button>
              )}
            </div>

            {isAdmin && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">New Notification</h4>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Title (optional)"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Message..."
                  value={newNotification.content}
                  onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newNotification.recipientId}
                  onChange={(e) => setNewNotification({ ...newNotification, recipientId: e.target.value })}
                >
                  <option value="">All Customers</option>
                  {customers.map(customer => (
                    <option key={customer.employeeId} value={customer.employeeId}>
                      {customer.firstName} {customer.lastName} ({customer.employeeId})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSendNotification}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={!newNotification.content.trim() || isLoading}
                >
                  {isLoading ? 'Sending...' : (
                    <>
                      <Send size={16} />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;
