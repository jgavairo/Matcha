import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
    activeChatUserId: number | null;
    setActiveChatUserId: (id: number | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeChatUserId, setActiveChatUserId] = useState<number | null>(null);

    return (
        <ChatContext.Provider value={{ activeChatUserId, setActiveChatUserId }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
