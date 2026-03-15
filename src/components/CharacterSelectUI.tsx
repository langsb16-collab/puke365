import React from 'react';
import { POKER_CHARACTERS } from '../constants';
import { PokerCharacter } from '../types';
import { useTranslation } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface CharacterSelectUIProps {
  onSelect: (character: PokerCharacter) => void;
  selectedId: number;
}

export const CharacterSelectUI: React.FC<CharacterSelectUIProps> = ({ onSelect, selectedId }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 max-w-4xl w-full shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
          {t('selectCharacter')}
        </h2>
        <div className="px-4 py-1 bg-white/5 rounded-full border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">20 {t('avatarsAvailable')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {POKER_CHARACTERS.map((char) => (
          <motion.button
            key={char.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(char)}
            className={`group relative flex flex-col rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
              selectedId === char.id 
                ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.3)]' 
                : 'border-white/5 bg-white/5 hover:border-white/20'
            }`}
          >
            {/* Avatar Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-white/10 to-transparent">
              <img 
                src={char.avatar} 
                alt={t(`char_${char.id}`)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                referrerPolicy="no-referrer" 
              />
              
              {/* Selected Badge */}
              <AnimatePresence>
                {selectedId === char.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-2 bg-yellow-500 text-black text-[8px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    {t('selected')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info Section */}
            <div className="p-3 text-left">
              <p className="text-[10px] font-black uppercase tracking-tighter truncate leading-tight mb-0.5">
                {t(`char_${char.id}`)}
              </p>
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full ${
                  char.style.includes('Aggressive') ? 'bg-red-500' : 
                  char.style.includes('Tight') ? 'bg-blue-500' : 
                  char.style.includes('Bluffer') ? 'bg-purple-500' : 'bg-emerald-500'
                }`} />
                <p className="text-[8px] font-bold uppercase text-white/40 tracking-widest">
                  {t(`style_${char.style.toLowerCase().replace('-', '_')}`)}
                </p>
              </div>
            </div>

            {/* Selection Glow Overlay */}
            {selectedId === char.id && (
              <div className="absolute inset-0 pointer-events-none border-2 border-yellow-500/50 rounded-3xl animate-pulse" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
