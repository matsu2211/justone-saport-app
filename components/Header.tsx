
import React from 'react';
import { GamePhase, Player } from '../types';
import { UsersIcon } from './Icons';

interface HeaderProps {
  gameState: GamePhase;
  players: Player[];
}

const Header: React.FC<HeaderProps> = ({ gameState, players }) => {
  return (
    <header className="text-center">
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
      {gameState === GamePhase.Preview && (
        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold border border-emerald-200">
          プレビューモード
        </div>
      )}
      {(gameState === GamePhase.GodHintSetup || gameState === GamePhase.GodHintGM) && (
        <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
          <ruby>神<rt>かみ</rt></ruby>ヒントモード
        </div>
      )}
    </header>
  );
};

export default Header;
