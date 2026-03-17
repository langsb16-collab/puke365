import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useTranslation } from '../LanguageContext';
import { Send, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatSystemProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ messages, onSendMessage, isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="absolute left-6 top-20 bottom-24 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl z-[60] p-4 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-black italic uppercase tracking-tighter text-xl flex items-center gap-2">
              <MessageSquare size={20} className="text-yellow-500" />
              {t('chat')}
            </h3>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 text-xs uppercase font-bold tracking-widest">
                No messages yet
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-yellow-500/70">{msg.playerName}</span>
                    <span className="text-[8px] text-white/20">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-white/90">
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('placeholder')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
