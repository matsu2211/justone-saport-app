import React, { useState, useEffect } from 'react';
import { NGHintState, NGHintStatus } from '../../types';

const NGHintTimer: React.FC = () => {
  const [state, setState] = useState<NGHintState | null>(null);

  useEffect(() => {
    // Listen for state updates from the GM window (if applicable)
    // This is a placeholder for potential multi-window synchronization
  }, []);

  if (!state) return null;

  const percentage = (state.remainingTime / state.timeLimit) * 100;
  const isTimeLow = state.remainingTime <= 10 && state.status === NGHintStatus.Playing;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64">
        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-slate-100 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className={`fill-none transition-all duration-1000 ${
              isTimeLow ? 'stroke-rose-500' : 'stroke-sky-500'
            }`}
            strokeWidth="8"
            strokeDasharray="283%"
            strokeDashoffset={`${283 - (283 * percentage) / 100}%`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Time Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-6xl sm:text-8xl font-black tabular-nums transition-colors ${
            isTimeLow ? 'text-rose-500 animate-pulse' : 'text-slate-700'
          }`}>
            {state.remainingTime}
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Seconds</div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mt-8 flex gap-4">
        {state.status === NGHintStatus.Finished ? (
          <div className="px-6 py-2 bg-rose-100 text-rose-600 rounded-full font-black text-xl animate-bounce">
            TIME UP!
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div className="text-xs font-black text-slate-300 uppercase mb-1">Status</div>
              <div className={`px-4 py-1 rounded-lg font-black text-sm ${
                state.status === NGHintStatus.Playing ? 'bg-emerald-100 text-emerald-600' :
                state.status === NGHintStatus.Paused ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {state.status === NGHintStatus.Playing && 'PLAYING'}
                {state.status === NGHintStatus.Paused && 'PAUSED'}
                {state.status === NGHintStatus.Ready && 'READY'}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs font-black text-slate-300 uppercase mb-1">Score</div>
              <div className="text-2xl font-black text-sky-500">{state.score}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NGHintTimer;
