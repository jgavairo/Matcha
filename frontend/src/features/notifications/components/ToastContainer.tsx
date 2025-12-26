import React from 'react';
import { Toast, ToastToggle, Button } from 'flowbite-react';
import { HiCheck, HiX, HiExclamation, HiInformationCircle } from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';
import { ToastType } from '@app-types/notifications';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <HiCheck className="h-5 w-5" />;
      case 'error':
        return <HiX className="h-5 w-5" />;
      case 'warning':
        return <HiExclamation className="h-5 w-5" />;
      case 'info':
      default:
        return <HiInformationCircle className="h-5 w-5" />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200';
      case 'warning':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200';
      case 'info':
      default:
        return 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id}>
          <div className="flex items-start">
            <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getColors(toast.type)}`}>
              {getIcon(toast.type)}
            </div>
            <div className="ml-3 text-sm font-normal">
              {toast.title && <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white block">{toast.title}</span>}
              <div className="mb-2 text-sm font-normal">{toast.message}</div>
              {toast.actions && (
                <div className="flex gap-2">
                  {toast.actions.map((action, index) => (
                    <div className="w-auto" key={index}>
                      <Button size="xs" color={action.color || 'light'} onClick={() => { action.onClick(); removeToast(toast.id); }}>
                        {action.label}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ToastToggle onDismiss={() => removeToast(toast.id)} />
          </div>
        </Toast>
      ))}
    </div>
  );
};

export default ToastContainer;
