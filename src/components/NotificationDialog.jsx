import { useState } from 'react';
import { Bell, X, Send } from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const NotificationDialog = ({ open, onClose }) => {
  const { notifications, addNotification, clearNotifications } = useNotifications();
  const { isAdmin } = useContext(AuthContext);
  const [newNotification, setNewNotification] = useState('');

  const handleSendNotification = () => {
    if (newNotification.trim()) {
      addNotification(newNotification);
      setNewNotification('');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Bell className="mr-2" /> Admin Notifications
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {isAdmin && (
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNotification}
                    onChange={(e) => setNewNotification(e.target.value)}
                    placeholder="Enter notification message"
                    className="flex-1 border rounded-md p-2"
                  />
                  <button
                    onClick={handleSendNotification}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Send className="mr-1" size={16} /> Send
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No notifications available
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 border-b last:border-b-0">
                      <p className="text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {notifications.length > 0 && isAdmin && (
              <button
                onClick={clearNotifications}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;