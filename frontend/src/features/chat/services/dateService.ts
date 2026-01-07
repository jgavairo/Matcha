import { api } from '../../../services/api';

export interface DateProposal {
    id: number;
    sender_id: number;
    receiver_id: number;
    date_time: string;
    location: string;
    description: string;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    created_at: string;
}

export const dateService = {
    getDates: async (targetUserId: number): Promise<DateProposal[]> => {
        const response = await api.get(`/dates/${targetUserId}`);
        return response.data;
    },

    proposeDate: async (data: { receiverId: number; dateTime: string; location: string; description: string }) => {
        const response = await api.post('/dates', data);
        return response.data;
    },

    updateStatus: async (dateId: number, status: 'accepted' | 'declined') => {
        const response = await api.put(`/dates/${dateId}/status`, { status });
        return response.data;
    },

    modifyDate: async (dateId: number, data: { dateTime: string; location: string; description: string }) => {
        const response = await api.put(`/dates/${dateId}/modify`, data);
        return response.data;
    },

    cancelDate: async (dateId: number) => {
        const response = await api.delete(`/dates/${dateId}`);
        return response.data;
    }
};
