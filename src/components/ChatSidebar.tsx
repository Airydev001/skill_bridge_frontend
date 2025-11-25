import React, { useState, useEffect, useRef } from 'react';

interface Message {
    message: string;
    senderId: string;
    senderName: string;
    timestamp: string;
}

interface ChatSidebarProps {
    socket: any;
    roomId: string;
    userId: string;
    userName: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ socket, roomId, userId, userName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive-message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('receive-message');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send-message', {
            roomId,
            message: newMessage,
            senderId: userId,
            senderName: userName
        });

        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 w-80">
            <div className="p-4 border-b border-gray-700 bg-gray-800">
                <h3 className="text-white font-semibold">Session Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.senderId === userId ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 ${msg.senderId === userId
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-200'
                            }`}>
                            <p className="text-sm font-bold mb-1 text-opacity-75">{msg.senderName}</p>
                            <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatSidebar;
