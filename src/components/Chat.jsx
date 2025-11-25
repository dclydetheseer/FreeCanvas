import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';

const Chat = ({ user, roomId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [isOpen, roomId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await addDoc(collection(db, "rooms", roomId, "messages"), {
                text: newMessage,
                userId: user.uid,
                userName: user.email.split('@')[0],
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-40 flex flex-col items-end transition-all ${isOpen ? 'w-80' : 'w-auto'}`}>

            {/* Chat Window */}
            {isOpen && (
                <div className="w-full h-96 bg-dark-surface border border-gray-700 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden mb-2 animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <MessageSquare size={16} className="text-neon-blue" /> Live Chat
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-bg/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.userId === user.uid ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-gray-500 mb-1">{msg.userName}</span>
                                <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${msg.userId === user.uid
                                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-neon-blue text-black rounded-full hover:bg-white transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-neon-blue text-black rounded-full shadow-lg shadow-neon-blue/30 flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default Chat;
