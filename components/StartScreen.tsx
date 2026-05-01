import React, { useState } from 'react';
import { PlayIcon, QuestionMarkCircleIcon } from './Icons';
import RulesModal from './RulesModal';

interface StartScreenProps {
  onStart: () => void;
  onStartNGHint: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onStartNGHint }) => {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  return (
    <>
      <div className="text-center flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-semibold text-slate-700">ジャストワンへようこそ！</h2>
        <p className="mt-2 max-w-md mx-auto text-slate-500">
          『ジャスト・ワン』は、プレイヤーみんなが<ruby>力<rt>ちから</rt></ruby>を<ruby>合<rt>あ</rt></ruby>わせて<ruby>遊<rt>あそ</rt></ruby>ぶ<ruby>協力型<rt>きょうりょくがた</rt></ruby>のパーティゲームです。
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-sm">
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            <PlayIcon className="w-6 h-6 mr-2" />
            <ruby>新<rt>あたら</rt></ruby>しいゲームを<ruby>始<rt>はじ</rt></ruby>める
          </button>
          
          <button
            onClick={onStartNGHint}
            className="w-full flex items-center justify-center px-8 py-4 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            <PlayIcon className="w-6 h-6 mr-2" />
            NGワードゲーム
          </button>

          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="w-full flex items-center justify-center px-8 py-4 bg-white border border-slate-300 text-slate-600 font-bold rounded-lg shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
            ゲームのルール
          </button>
        </div>
      </div>
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} mode={isRulesModalOpen ? 'standard' : undefined} />
    </>
  );
};

export default StartScreen;
