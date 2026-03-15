import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useTranslation } from '../LanguageContext';
import { Send, X, MessageSquare, Smile, Mic, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatSystemProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ messages, onSendMessage, isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const emojis = ['😀', '😂', '😎', '👍', '🔥', '💰', '🃏', '🎰', '🏆', '💪', '👏', '🤝', '😤', '😅', '🤔', '😱'];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      setShowEmoji(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji);
    setShowEmoji(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="absolute right-6 top-20 bottom-24 w-96 bg-gradient-to-br from-black/90 to-neutral-900/90 backdrop-blur-xl border-2 border-[#d4af37]/30 rounded-3xl z-[60] shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#d4af37]/20 to-transparent border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-lg">
              <MessageSquare size={20} className="text-black" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tighter text-lg text-white">
                {t('chat')}
              </h3>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Table Chat</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d4af37 transparent'
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3">
            <MessageSquare size={48} className="opacity-20" />
            <p className="text-xs uppercase font-bold tracking-widest">No messages yet</p>
            <p className="text-[10px] text-white/10">Say hi to your opponents!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">
                  {msg.playerName[0].toUpperCase()}
                </div>
                <span className="text-[11px] font-bold text-yellow-500/90">{msg.playerName}</span>
                <span className="text-[9px] text-white/20 ml-auto">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="ml-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 text-sm text-white/90 shadow-lg backdrop-blur-sm">
                {msg.message}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-4 right-4 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-10"
          >
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-white/10 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-black/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            title="Emoji"
          >
            <Smile size={18} className="text-yellow-500" />
          </button>
          <button
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            title="Voice Message"
          >
            <Mic size={18} className="text-blue-500" />
          </button>
          <button
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            title="Voice Call"
          >
            <Volume2 size={18} className="text-green-500" />
          </button>
        </div>
        
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('placeholder')}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
            style={{ scrollbarWidth: 'thin' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg disabled:shadow-none"
          >
            <Send size={16} className={inputValue.trim() ? 'text-black' : 'text-white/20'} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
