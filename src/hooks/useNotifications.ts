import { useState, useCallback } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission as NotificationPermission
      : 'denied'
  );

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (permission === 'granted') {
      return 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [permission]);

  const showNotification = useCallback(
    (
      title: string,
      options?: {
        body?: string;
        icon?: string;
        badge?: string;
        tag?: string;
        silent?: boolean;
        requireInteraction?: boolean;
        actions?: any[];
        data?: any;
      }
    ) => {
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      try {
        const notification = new Notification(title, {
          body: options?.body || undefined,
          icon: options?.icon || '/favicon.ico',
          badge: options?.badge || '/favicon.ico',
          tag: options?.tag || undefined,
          silent: options?.silent || false,
          requireInteraction: options?.requireInteraction || false,
          data: options?.data || undefined
        });

        // Auto-close notification after 5 seconds if not requiring interaction
        if (!options?.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
        return null;
      }
    },
    [permission]
  );

  const showStudyReminder = useCallback(
    (message: string) => {
      return showNotification('Study Reminder', {
        body: message,
        icon: '/icons/study-icon.png',
        tag: 'study-reminder',
        requireInteraction: false,
        actions: [
          {
            action: 'start',
            title: 'Start Now'
          },
          {
            action: 'snooze',
            title: 'Snooze 10min'
          }
        ]
      });
    },
    [showNotification]
  );

  const showBreakReminder = useCallback(
    (message: string) => {
      return showNotification('Break Time!', {
        body: message,
        icon: '/icons/break-icon.png',
        tag: 'break-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'break',
            title: 'Take Break'
          },
          {
            action: 'continue',
            title: 'Continue 5min'
          }
        ]
      });
    },
    [showNotification]
  );

  const showSessionComplete = useCallback(
    (sessionType: string, duration: number) => {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      return showNotification('Session Complete!', {
        body: `Great job! You completed a ${timeStr} ${sessionType} session.`,
        icon: '/icons/success-icon.png',
        tag: 'session-complete',
        requireInteraction: false,
        actions: [
          {
            action: 'review',
            title: 'Review Session'
          },
          {
            action: 'next',
            title: 'Start Next'
          }
        ]
      });
    },
    [showNotification]
  );

  const showDeadlineAlert = useCallback(
    (subjectName: string, daysLeft: number) => {
      const urgency = daysLeft <= 1 ? 'Urgent' : daysLeft <= 3 ? 'Important' : 'Reminder';
      const timeText = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;
      
      return showNotification(`${urgency}: Deadline Approaching`, {
        body: `${subjectName} deadline is ${timeText}. Make sure you're on track!`,
        icon: '/icons/deadline-icon.png',
        tag: `deadline-${subjectName}`,
        requireInteraction: daysLeft <= 1,
        actions: [
          {
            action: 'study',
            title: 'Study Now'
          },
          {
            action: 'schedule',
            title: 'Update Schedule'
          }
        ]
      });
    },
    [showNotification]
  );

  return {
    permission,
    requestPermission,
    showNotification,
    showStudyReminder,
    showBreakReminder,
    showSessionComplete,
    showDeadlineAlert
  };
}