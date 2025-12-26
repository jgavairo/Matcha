export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type NotificationType = 
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'like'
  | 'visit'
  | 'message'
  | 'match'
  | 'unlike';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  time: Date;
  read: boolean;
  type: NotificationType;
  avatar?: string;
  sender?: string;
}
