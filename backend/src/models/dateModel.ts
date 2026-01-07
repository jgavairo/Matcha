import { db } from '../utils/db';

export interface DateProposal {
    id: number;
    sender_id: number;
    receiver_id: number;
    date_time: Date;
    location: string;
    description: string;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    created_at: Date;
}

export const createDate = async (senderId: number, receiverId: number, dateTime: string, location: string, description: string) => {
    return await db.insert('dates', {
        sender_id: senderId,
        receiver_id: receiverId,
        date_time: dateTime,
        location,
        description,
        status: 'pending'
    });
};

export const updateDate = async (id: number, data: Partial<DateProposal>) => {
    return await db.update('dates', id, data);
};

export const getDateById = async (id: number) => {
    return await db.findOne('dates', { id });
};

export const getDatesBetweenUsers = async (user1Id: number, user2Id: number) => {
    const query = `
        SELECT * FROM dates 
        WHERE (sender_id = $1 AND receiver_id = $2) 
           OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY date_time DESC
    `;
    const res = await db.query(query, [user1Id, user2Id]);
    return res.rows;
};

export const deleteDate = async (id: number) => {
    return await db.delete('dates', { id });
};
