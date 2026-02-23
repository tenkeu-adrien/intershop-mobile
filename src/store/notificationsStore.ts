import { create } from 'zustand';
import api from '../services/api';
import type { Notification } from '../types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (userId: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.notifications.getAll(userId);
      if (response.success) {
        // Convert date strings to Date objects
        const notifications = response.data.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
          emailSentAt: notif.emailSentAt ? new Date(notif.emailSentAt) : undefined,
        }));
        
        set({ 
          notifications,
          unreadCount: notifications.filter((n: Notification) => !n.isRead).length,
          loading: false 
        });
      } else {
        throw new Error(response.error || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchUnreadCount: async (userId: string) => {
    try {
      const response = await api.notifications.getUnreadCount(userId);
      if (response.success) {
        set({ unreadCount: response.data.count });
      }
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.notifications.markAsRead(notificationId);
      if (response.success) {
        // Update local state
        const { notifications } = get();
        const updatedNotifications = notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        
        set({ 
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.isRead).length
        });
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      set({ error: error.message });
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const response = await api.notifications.markAllAsRead(userId);
      if (response.success) {
        // Update local state
        const { notifications } = get();
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        
        set({ 
          notifications: updatedNotifications,
          unreadCount: 0
        });
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));
