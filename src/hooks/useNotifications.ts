import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationsCount
} from '../firebase/services';
import { Notification } from '../types';

export const useNotifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка уведомлений
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedNotifications = await getUserNotifications(user.uid);
      setNotifications(fetchedNotifications);
      
      // Получаем количество непрочитанных уведомлений
      const count = await getUnreadNotificationsCount(user.uid);
      setUnreadCount(count);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Первоначальная загрузка уведомлений
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return false;

    try {
      await markNotificationAsRead(notificationId);
      // Обновляем состояние локально
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [user]);

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(async () => {
    if (!user) return false;

    try {
      await markAllNotificationsAsRead(user.uid);
      // Обновляем состояние локально
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [user]);

  // Удалить уведомление
  const removeNotification = useCallback(async (notificationId: string) => {
    if (!user) return false;

    try {
      await deleteNotification(notificationId);
      // Обновляем состояние локально
      const notificationToRemove = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Если удаляем непрочитанное уведомление, уменьшаем счетчик
      if (notificationToRemove && !notificationToRemove.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [user, notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: fetchNotifications
  };
}; 