import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { useTranslations } from '../hooks/useTranslations';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);


interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
    const { t, locale } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: t('chatbot.greeting') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setMessages([{ sender: 'bot', text: t('chatbot.greeting') }]);
    }, [t]);

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const botResponse = await sendMessageToGemini(input, locale);
        const botMessage: Message = { text: botResponse, sender: 'bot' };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <div className={`fixed bottom-5 right-5 z-50 transition-transform duration-300 ${isOpen ? 'scale-0 pointer-events-none' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-primary hover:bg-brand-dark shadow-xl rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
                    aria-label={t('chatbot.openChat')}
                >
                    <ChatIcon />
                </button>
            </div>

            <div className={`fixed bottom-0 right-0 sm:bottom-5 sm:right-5 h-full w-full sm:h-[600px] sm:w-[400px] bg-brand-light shadow-2xl rounded-lg flex flex-col transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <header className="bg-brand-dark text-white p-4 flex justify-between items-center rounded-t-lg">
                    <h3 className="font-bold text-lg">{t('chatbot.header')}</h3>
                    <button onClick={() => setIsOpen(false)} aria-label={t('chatbot.closeChat')} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon />
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto bg-brand-accent/30">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-brand-secondary text-white rounded-br-none' : 'bg-white text-brand-dark rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs px-4 py-3 rounded-2xl shadow-sm bg-white">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('chatbot.placeholder')}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-brand-primary text-white p-3 rounded-full hover:bg-brand-dark disabled:bg-gray-400 transition-colors"
                            aria-label={t('chatbot.sendMessage')}
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;