
import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import { PlayIcon, UserIcon, UsersIcon, ArrowLeftIcon, HomeIcon } from './Icons';

interface PlayerSetupScreenProps {
  onSetupComplete: (players: Player[]) => void;
  onBack: () => void;
  onHome: () => void;
}

const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({ onSetupComplete, onBack, onHome }) => {
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const handleInternalBack = () => {
    if (playerCount) {
      setPlayerCount(null);
    } else {
      onBack();
    }
  };

  const playerCounts = Array.from({ length: 8 }, (_, i) => i + 3); // 3 to 10 players

  const handleSelectCount = (count: number) => {
    setPlayerCount(count);
    const newPlayers = Array.from({ length: count }, (_, i) => {
      return players[i] || { id: `player-${i}`, name: '' };
    });
    setPlayers(newPlayers);
  };
  
  const handleNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const allNamesEntered = useMemo(() => {
    if (players.length === 0) return false;
    return players.every(p => p.name.trim() !== '');
  }, [players]);

  const handleStartGame = () => {
    if (allNamesEntered) {
      onSetupComplete(players);
    }
  };

  return (
    <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full relative">
      <div className="absolute -left-2 -top-2 flex gap-1">
        <button
          onClick={handleInternalBack}
          className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
          title="戻る"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onHome}
          className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
          title="ホームに戻る"
        >
          <HomeIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-slate-700 flex items-center justify-center gap-2">
          <UsersIcon className="w-7 h-7" />
          プレイヤー<ruby>設定<rt>せってい</rt></ruby>
        </h2>
        <p className="mt-2 text-slate-500"><ruby>参加<rt>さんか</rt></ruby>する<ruby>人数<rt>にんずう</rt></ruby>を<ruby>選<rt>えら</rt></ruby>んで、<ruby>名前<rt>なまえ</rt></ruby>を<ruby>入力<rt>にゅうりょく</rt></ruby>してください。</p>

        <div className="mt-4 text-sm text-center w-full max-w-xs mx-auto bg-slate-100 p-3 rounded-lg">
          <p className="font-bold text-slate-700">◎<ruby>参加確認<rt>さんかかくにん</rt></ruby></p>
          <p className="text-slate-600 mt-1"><ruby>参加<rt>さんか</rt></ruby>・・・１</p>
          <p className="text-slate-600"><ruby>見<rt>み</rt></ruby>るだけ・・・２</p>
        </div>

        <div className="mt-6">
          <p className="font-semibold text-slate-600"><ruby>参加人数<rt>さんかにんずう</rt></ruby></p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {playerCounts.map(count => (
              <button
                key={count}
                onClick={() => handleSelectCount(count)}
                className={`w-14 h-14 text-xl font-bold rounded-full transition-all duration-200 flex items-center justify-center
                  ${playerCount === count 
                    ? 'bg-sky-500 text-white shadow-lg scale-110' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`
                }
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {playerCount && (
          <div className="mt-8 w-full max-w-md mx-auto animate-fade-in">
            <p className="font-semibold text-slate-600">プレイヤー<ruby>名<rt>めい</rt></ruby></p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto px-2">
              {players.map((player, index) => (
                <div key={player.id} className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`プレイヤー ${index + 1}`}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={handleStartGame}
            disabled={!allNamesEntered}
            className="flex items-center justify-center w-full sm:w-auto mx-auto px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <PlayIcon className="w-6 h-6 mr-2" />
            ゲーム<ruby>開始<rt>かいし</rt></ruby>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetupScreen;
