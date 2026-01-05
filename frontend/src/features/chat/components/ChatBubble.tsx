import React from 'react';
import { Message } from '../services/chatService';
import { Dropdown, DropdownItem } from 'flowbite-react';
import { HiDotsVertical } from 'react-icons/hi';

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
    otherUsername: string;
    onReply?: (message: Message) => void;
    onCopy?: (content: string) => void;
    onDelete?: (messageId: number) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
    message, 
    isMe, 
    otherUsername,
    onReply,
    onCopy,
    onDelete
}) => {
    if (message.sender_id === null) {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    const handleCopy = () => {
        if (onCopy) {
            onCopy(message.content);
        } else {
            navigator.clipboard.writeText(message.content);
        }
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${isMe ? 'Me' : otherUsername}&background=random`;

    return (
        <div className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''} group`}>
            <img className="w-8 h-8 rounded-full" src={avatarUrl} alt="User avatar" />
            
            <div className="flex flex-col gap-1 w-full max-w-[320px]">
                <div className={`flex items-center space-x-2 rtl:space-x-reverse ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isMe ? 'You' : otherUsername}
                    </span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                
                <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${isMe ? 'bg-blue-100 dark:bg-blue-700 rounded-s-xl rounded-ee-xl' : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'}`}>
                    <p className="text-sm font-normal text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                        {message.content}
                    </p>
                </div>
                
                <span className={`text-sm font-normal text-gray-500 dark:text-gray-400 ${isMe ? 'text-right' : ''}`}>
                    {message.is_read ? 'Read' : 'Delivered'}
                </span>
            </div>

            {/* Dropdown Menu */}
            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Dropdown 
                    label="" 
                    renderTrigger={() => (
                        <button className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
                            <HiDotsVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    )}
                    placement={isMe ? "bottom-end" : "bottom-start"}
                >
                    <DropdownItem onClick={() => onReply?.(message)}>Reply</DropdownItem>
                    <DropdownItem onClick={handleCopy}>Copy</DropdownItem>
                    <DropdownItem onClick={() => onDelete?.(message.id)} className="text-red-600 dark:text-red-500">Delete</DropdownItem>
                </Dropdown>
            </div>
        </div>
    );
};

export default ChatBubble;
