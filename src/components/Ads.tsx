import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, X } from 'lucide-react';

interface AdItem {
  id: number;
  image: string;
  link: string;
  title: string;
}

interface AdsProps {
  type: 'lobby' | 'table';
  className?: string;
}

export const Ads: React.FC<AdsProps> = ({ type, className = '' }) => {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads');
        const data = await response.json();
        setAds(data[type] || []);
      } catch (e) {
        console.error('Failed to fetch ads:', e);
      }
    };
    fetchAds();
  }, [type]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  if (!isVisible || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  if (type === 'table') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 ${className}`}
      >
        <div className="relative group">
          <img 
            src={currentAd.image} 
            alt={currentAd.title} 
            className="h-12 w-auto rounded-lg border border-white/10 shadow-2xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 bg-black/80 rounded-full border border-white/20 text-white/40 hover:text-white"
            >
              <X size={10} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[8px] font-black uppercase tracking-widest text-white text-center truncate">{currentAd.title}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl aspect-[2/1] ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute inset-0"
        >
          <img 
            src={currentAd.image} 
            alt={currentAd.title} 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black rounded uppercase tracking-widest">Sponsored</span>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">{currentAd.title}</h3>
            </div>
            <a 
              href={currentAd.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              Learn More <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {ads.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-yellow-500 w-4' : 'bg-white/20'}`} 
          />
        ))}
      </div>
    </div>
  );
};
