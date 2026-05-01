
import React from 'react';
import { GamePhase, Player } from '../types';
import { UsersIcon, EyeIcon, EyeOffIcon } from './Icons';

interface HeaderProps {
  gameState: GamePhase;
  players: Player[];
  showRuby: boolean;
  onToggleRuby: () => void;
}

const Header: React.FC<HeaderProps> = ({ gameState, players, showRuby, onToggleRuby }) => {
  return (
    <header className="text-center relative">
      <div className="absolute right-0 top-0">
        <button 
          onClick={onToggleRuby}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${
            showRuby 
              ? 'bg-sky-100 text-sky-600 hover:bg-sky-200' 
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
          title={showRuby ? 'ルビを非表示にする' : 'ルビを表示する'}
        >
          {showRuby ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
          <span>ルビ</span>
        </button>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-600">
        ジャストワン
      </h1>
      {(gameState === GamePhase.PlayerSetup || gameState === GamePhase.Round) && players.length > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
            <UsersIcon className="w-5 h-5" />
            <span>{players.length}<ruby>人<rt>にん</rt></ruby></span>
          </div>
        )
      }
      {(gameState === GamePhase.NGHintSetup || gameState === GamePhase.NGHintGM) && (
        <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
          NGワードゲーム
        </div>
      )}
    </header>
  );
};

export default Header;
