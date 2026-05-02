import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Image as ImageIcon, History, Music } from 'lucide-react';

import { JiaobeiState, TossResult, TossRecord, Side } from './types';
import { Jiaobei } from './components/Jiaobei';
import { Background } from './components/Background';
import { HistoryModal } from './components/HistoryModal';
import { triggerFireworks, playBambooDropSound } from './utils/effects';

export default function App() {
  const [isTossing, setIsTossing] = useState(false);
  const [blocks, setBlocks] = useState<[JiaobeiState, JiaobeiState] | null>(null);
  const [result, setResult] = useState<TossResult>(null);
  const [tossKey, setTossKey] = useState(0);
  const [stats, setStats] = useState({ '圣杯': 0, '笑杯': 0, '怒杯': 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [consecutiveShengBei, setConsecutiveShengBei] = useState(0);
  const [history, setHistory] = useState<TossRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [wish, setWish] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (customAudioUrl) {
        URL.revokeObjectURL(customAudioUrl);
      }
    };
  }, [customAudioUrl]);

  useEffect(() => {
    const savedStats = localStorage.getItem('jiaobei-stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        // ignore
      }
    }
    
    const savedSound = localStorage.getItem('jiaobei-sound');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }

    const savedBg = localStorage.getItem('jiaobei-custom-bg');
    if (savedBg) {
      setCustomBg(savedBg);
    }

    const savedHistory = localStorage.getItem('jiaobei-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomBg(url);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            localStorage.setItem('jiaobei-custom-bg', event.target.result as string);
          } catch (err) {
            console.warn('Image too large to save', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('jiaobei-sound', String(next));
      return next;
    });
  };

  const clearStats = () => {
    const newStats = { '圣杯': 0, '笑杯': 0, '怒杯': 0 };
    setStats(newStats);
    setConsecutiveShengBei(0);
    setHistory([]);
    localStorage.setItem('jiaobei-stats', JSON.stringify(newStats));
    localStorage.removeItem('jiaobei-history');
  };

  const toss = () => {
    setIsTossing(true);
    setResult(null);
    setTossKey(prev => prev + 1);

    const getSide = (): Side => Math.random() > 0.5 ? 'flat' : 'convex';
    const b1 = getSide();
    const b2 = getSide();
    
    // Spread them slightly apart
    const finalBlocks: [JiaobeiState, JiaobeiState] = [
      { side: b1, rotation: -60 + Math.random() * 120, x: -60 - Math.random() * 30, y: Math.random() * 60 - 30, flipX: false },
      { side: b2, rotation: -60 + Math.random() * 120, x: 60 + Math.random() * 30, y: Math.random() * 60 - 30, flipX: true }
    ];
    setBlocks(finalBlocks);

    // Play sound when blocks land
    setTimeout(() => playBambooDropSound(soundEnabled, customAudioUrl), 1250);

    // After animation ends, show result
    setTimeout(() => {
      let finalResult: TossResult;
      if (b1 !== b2) {
        finalResult = '圣杯';
      } else if (b1 === 'flat') {
        finalResult = '笑杯';
      } else {
        finalResult = '怒杯';
      }
      setResult(finalResult);

      setStats(prev => {
        const newStats = { ...prev, [finalResult]: prev[finalResult] + 1 };
        localStorage.setItem('jiaobei-stats', JSON.stringify(newStats));
        return newStats;
      });

      if (finalResult === '圣杯') {
        setConsecutiveShengBei(prev => {
          const next = prev + 1;
          if (next > 0 && next % 3 === 0) {
            triggerFireworks();
          }
          return next;
        });
      } else {
        setConsecutiveShengBei(0);
      }

      setHistory(prev => {
        const sequence = prev.length ? prev[0].sequence + 1 : 1;
        const newRecord: TossRecord = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          sequence,
          result: finalResult,
          wish: wish.trim() || undefined,
        };
        const next = [newRecord, ...prev];
        localStorage.setItem('jiaobei-history', JSON.stringify(next));
        return next;
      });

      setIsTossing(false);
    }, 1400); // slightly longer than animation to let it settle
  };

  return (
    <div className="min-h-screen bg-stone-950 flex justify-center items-center p-0 sm:p-4 md:p-8">
      <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[850px] sm:max-h-[90vh] flex flex-col items-center justify-between font-sans text-amber-100 overflow-y-auto overflow-x-hidden bg-red-950 selection:bg-amber-500/30 sm:rounded-[3rem] sm:border-[8px] sm:border-stone-800 sm:shadow-2xl">
        <Background customBg={customBg} />
        
        {/* Background Upload Toggle */}
        <label 
          className="absolute top-4 left-4 z-50 p-2 text-amber-500/80 hover:text-amber-400 bg-black/40 rounded-full backdrop-blur-sm border border-amber-500/20 transition-colors cursor-pointer"
          aria-label="Upload background"
        >
          <ImageIcon size={20} />
          <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
        </label>

        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {/* History Modal Toggle */}
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-amber-500/80 hover:text-amber-400 bg-black/40 rounded-full backdrop-blur-sm border border-amber-500/20 transition-colors"
            aria-label="View history"
          >
            <History size={20} />
          </button>

          {/* Custom Audio Upload */}
          <label 
            className="p-2 text-amber-500/80 hover:text-amber-400 bg-black/40 rounded-full backdrop-blur-sm border border-amber-500/20 transition-colors cursor-pointer"
            aria-label="Upload custom sound effect"
            title="更换音效"
          >
            <Music size={20} />
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
                  setCustomAudioUrl(URL.createObjectURL(file));
                }
              }} 
            />
          </label>

          {/* Sound Toggle */}
          <button 
            onClick={toggleSound}
            className="p-2 text-amber-500/80 hover:text-amber-400 bg-black/40 rounded-full backdrop-blur-sm border border-amber-500/20 transition-colors"
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <HistoryModal 
          show={showHistory} 
          onClose={() => setShowHistory(false)} 
          history={history} 
        />

        <div className="relative z-10 flex flex-col justify-end items-center w-full px-5 py-6 min-h-full">
          {/* We'll move the title down just above the blocks */}
          <div className="flex flex-col items-center flex-1 justify-end w-full pb-2">
            <div className="text-center mb-4">
               <h1 className="text-2xl font-bold tracking-[0.2em] text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-1 font-serif">掷圣杯</h1>
               <p className="text-amber-200/90 text-xs tracking-[0.1em] font-medium border-b border-amber-500/30 pb-1 px-4 drop-shadow-md">妈祖保佑 · 诚心问事</p>
            </div>

            {/* The Table / Canvas area */}
            <div className="h-40 relative w-full flex items-center justify-center">
              {blocks && (
                <>
                  {/* Block 1 (Left) */}
                  <motion.div
                    key={`block0-${tossKey}`}
                    initial={{ y: 250, x: -30, rotate: -180, scale: 0.2 }}
                    animate={{ 
                      y: [150, -100, blocks[0].y], 
                      x: [-10, blocks[0].x * 0.5, blocks[0].x],
                      rotate: [0, 360, blocks[0].rotation + 720],
                      scale: [0.5, 1.1, 0.8]
                    }}
                    transition={{ duration: 1.3, times: [0, 0.4, 1], ease: "easeOut" }}
                    className="absolute z-20"
                  >
                    <Jiaobei side={blocks[0].side} flipX={blocks[0].flipX} />
                  </motion.div>
                  
                  {/* Block 2 (Right) */}
                  <motion.div
                    key={`block1-${tossKey}`}
                    initial={{ y: 250, x: 30, rotate: 180, scale: 0.2 }}
                    animate={{ 
                      y: [150, -120, blocks[1].y], 
                      x: [10, blocks[1].x * 0.5, blocks[1].x],
                      rotate: [0, -360, blocks[1].rotation - 720],
                      scale: [0.5, 1.1, 0.8]
                    }}
                    transition={{ duration: 1.35, times: [0, 0.45, 1], ease: "easeOut" }}
                    className="absolute z-10"
                  >
                    <Jiaobei side={blocks[1].side} flipX={blocks[1].flipX} />
                  </motion.div>
                </>
              )}
            </div>

            {/* Result Area */}
            <div className="min-h-[100px] w-full flex items-center justify-center my-2">
              <AnimatePresence mode="wait">
                {result && !isTossing && (
                  <motion.div
                    key={result}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="text-center bg-black/60 p-4 rounded-xl border-t border-b border-amber-500/50 shadow-2xl backdrop-blur-md w-full"
                  >
                    <h2 className="text-2xl font-extrabold text-amber-400 mb-1 tracking-[0.2em] font-serif">
                      {result}
                    </h2>
                    <div className="text-amber-100/90 text-xs leading-relaxed">
                      {result === '圣杯' && (
                        <p>神明应允，大吉大利。(一平一凸)</p>
                      )}
                      {result === '笑杯' && (
                        <p>神明微笑，机缘未到。(两平)</p>
                      )}
                      {result === '怒杯' && (
                        <p>神明不许，请重新考量。(两凸)</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-full flex flex-col items-center">
              {/* Wish Input Area */}
              <div className="w-full mb-3 px-1">
                <input 
                  type="text"
                  placeholder="心中默念或写下所求之事..."
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  disabled={isTossing}
                  className="w-full bg-black/40 border border-amber-500/30 rounded-full px-4 py-2.5 text-sm text-amber-100 placeholder:text-amber-500/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center disabled:opacity-50 transition-colors"
                  maxLength={50}
                />
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={!isTossing ? { scale: 1.05, boxShadow: "0 0 20px rgba(245,158,11,0.4)" } : {}}
                whileTap={!isTossing ? { scale: 0.95 } : {}}
                disabled={isTossing}
                onClick={toss}
                className="relative group overflow-hidden bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-black text-lg px-10 py-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] disabled:opacity-60 disabled:cursor-not-allowed border-2 border-amber-400 w-full mb-4"
              >
                <span className="relative z-10 tracking-[0.2em]">{isTossing ? '诉说中...' : '请筊'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </motion.button>
              
              {/* Stats Area */}
              <div className="bg-black/50 p-3 rounded-xl border border-amber-500/20 backdrop-blur-md w-full shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-amber-500/80 font-bold tracking-widest text-[10px]">掷筊记录</h3>
                  <button 
                    onClick={clearStats} 
                    className="text-amber-500/60 hover:text-amber-400 text-[10px] px-2 py-1 bg-red-900/40 hover:bg-red-900/80 rounded border border-amber-500/10 transition-colors"
                  >
                    重置
                  </button>
                </div>
                <div className="flex justify-around text-[10px] text-amber-200/80 px-2">
                  <div className="flex flex-col items-center">
                    <span className="text-amber-600 mb-0.5 font-medium">圣杯</span>
                    <span className="font-mono text-sm text-amber-400">{stats['圣杯']}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-amber-600 mb-0.5 font-medium">笑杯</span>
                    <span className="font-mono text-sm text-amber-400">{stats['笑杯']}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-amber-600 mb-0.5 font-medium">怒杯</span>
                    <span className="font-mono text-sm text-amber-400">{stats['怒杯']}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

