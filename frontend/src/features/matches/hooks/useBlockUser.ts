import { useState } from 'react';
import { api } from '@services/api';
import { useNotification } from '@context/NotificationContext';

export const useBlockUser = () => {
    const { addToast } = useNotification();
    const [blocking, setBlocking] = useState(false);

    const blockUser = async (userId: number, onSuccess?: () => void) => {
        setBlocking(true);
        try {
            const response = await api.post('/block', {
                blockedId: userId
            });

            if (response.status === 200) {
                addToast('User blocked successfully', 'success');
                if (onSuccess) onSuccess();
                return true;
            } else {
                const errorMsg = (response as any).response?.data?.error || 'Failed to block user';
                addToast(errorMsg, 'error');
                return false;
            }
        } catch (error) {
            const errorMsg = (error as any).response?.data?.error || 'Failed to block user';
            addToast(errorMsg, 'error');
            return false;
        } finally {
            setBlocking(false);
        }
    };

    return { blockUser, blocking };
};
