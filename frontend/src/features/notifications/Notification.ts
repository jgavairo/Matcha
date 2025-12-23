import toast from 'react-hot-toast';

const baseStyle = {
  borderRadius: '10px',
  padding: '12px 16px',
  fontWeight: '500',
};

export const Notification = {
  success: (message: string) => {
    toast.success(message, {
      id: 'notification',
      duration: 4000,
      style: {
        ...baseStyle,
        background: '#059669',  // Emerald-600
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#059669',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      id: 'notification',
      duration: 5000,
      style: {
        ...baseStyle,
        background: '#DC2626',  // Red-600
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#DC2626',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      id: 'notification',
      duration: 4000,
      icon: 'ℹ️',
      style: {
        ...baseStyle,
        background: '#1F2937',  // Gray-800
        color: '#fff',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      id: 'notification',
      style: {
        ...baseStyle,
        background: '#1F2937',
        color: '#fff',
      },
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

