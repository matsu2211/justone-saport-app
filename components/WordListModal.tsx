import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, List } from 'lucide-react';
import { wordList } from '../services/wordService';

interface WordListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord?: (word: string) => void;
}

const WordListModal: React.FC<WordListModalProps> = ({ isOpen, onClose, onSelectWord }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWords = useMemo(() => {
    return wordList.filter(word => 
      word.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleWordClick = (word: string) => {
    if (onSelectWord) {
      onSelectWord(word);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg text-white flex-shrink-0">
                  <List size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">お<ruby>題<rt>だい</rt></ruby><ruby>一覧<rt>いちらん</rt></ruby></h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="お題を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
                />
              </div>
              <div className="mt-2 text-xs text-slate-400 px-1 flex justify-between items-center">
                <span>全 {wordList.length} 件中 {filteredWords.length} 件表示</span>
                {onSelectWord && <span className="text-emerald-600 font-bold">クリックでお題を選択</span>}
              </div>
            </div>

            {/* Word List */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredWords.map((word, index) => (
                  <button 
                    key={index}
                    onClick={() => handleWordClick(word)}
                    className={`p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-all text-center ${
                      onSelectWord 
                        ? 'hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm active:scale-95 cursor-pointer' 
                        : 'cursor-default'
                    }`}
                  >
                    {word}
                  </button>
                ))}
                {filteredWords.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 italic">
                    お題が見つかりませんでした
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all text-center"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WordListModal;
