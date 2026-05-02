import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { TossRecord } from '../types';

interface HistoryModalProps {
  show: boolean;
  onClose: () => void;
  history: TossRecord[];
}

export const HistoryModal = ({ show, onClose, history }: HistoryModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-[340px] bg-red-950/90 border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-4 border-b border-amber-500/20 pb-2">
              <h2 className="text-xl font-bold text-amber-400 font-serif tracking-widest">请筊记录</h2>
              <button 
                onClick={onClose}
                className="text-amber-500/60 hover:text-amber-400 bg-black/40 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center text-amber-500/50 py-8 text-sm">暂无记录</div>
              ) : (
                history.map(record => (
                  <div key={record.id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-amber-500/10">
                    <div className="flex flex-col">
                      <span className="text-amber-500/80 text-xs font-medium">第 {record.sequence} 掷</span>
                      <span className="text-amber-100/60 text-[10px]">
                        {new Date(record.timestamp).toLocaleString('zh-CN')}
                      </span>
                      {record.wish && (
                        <span className="text-amber-200/90 text-[11px] mt-1 pr-2">
                          意愿：{record.wish}
                        </span>
                      )}
                    </div>
                    <div className={`font-bold font-serif text-lg ${record.result === '圣杯' ? 'text-amber-400' : 'text-amber-600/80'}`}>
                      {record.result}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
