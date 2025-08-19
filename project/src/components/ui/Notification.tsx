import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type NotificationProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export const Notification = ({ message, onClose, duration = 3000 }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
        <CheckCircle2 className="h-6 w-6 text-white" />
        <span className="font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Fermer la notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

type NotificationItem = {
  id: string;
  message: string;
};

type NotificationProviderProps = {
  children: React.ReactNode;
};

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

import { createContext, useContext } from 'react';

type NotificationContextType = {
  addNotification: (message: string) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  addNotification: () => {},
});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
