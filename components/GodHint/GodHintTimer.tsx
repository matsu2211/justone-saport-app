
import React, { useState, useEffect, useRef } from 'react';
import { GodHintState, GodHintStatus } from '../../types';
import { ClockIcon, TrophyIcon, MaximizeIcon } from '../Icons';

const GodHintTimer: React.FC = () => {
  const [state, setState] = useState<GodHintState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Timer: WebSocket connected');
        ws.send(JSON.stringify({ type: 'REQUEST_SYNC' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Timer: Received message', message);
          if (message.type === 'SYNC_STATE') {
            setState(message.state);
          }
        } catch (e) {
          console.error('Timer: Failed to parse message', e);
        }
      };

      ws.onclose = () => {
        console.log('Timer: WebSocket disconnected. Retrying...');
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error('Timer: WebSocket error', err);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Waiting for GM...</h2>
          <p className="mt-2 text-slate-400 text-sm">GM<ruby>画面<rt>がめん</rt></ruby>から「プレイ<ruby>開始<rt>かいし</rt></ruby>」を<ruby>押<rt>お</rt></ruby>してください。</p>
        </div>
      </div>
    );
  }

  const isTimeLow = state.remainingTime <= 10 && state.status === GodHintStatus.Playing;

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-8 relative overflow-hidden ${
      isTimeLow ? 'bg-rose-600' : 'bg-slate-50'
    }`}>
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] border-[40px] border-slate-900 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] border-[20px] border-slate-900 rounded-full"></div>
      </div>

      <button
        onClick={toggleFullScreen}
        className="absolute top-8 right-8 p-4 bg-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-300 rounded-2xl transition-all backdrop-blur-md"
        title="フルスクリーン"
      >
        <MaximizeIcon className="w-8 h-8" />
      </button>

      <div className="relative z-10 text-center w-full max-w-4xl">
        {state.status === GodHintStatus.Finished ? (
          <div className="animate-bounce-in">
            <TrophyIcon className="w-48 h-48 text-amber-500 mx-auto mb-8 drop-shadow-2xl" />
            <h2 className={`text-6xl font-black mb-4 uppercase tracking-widest ${isTimeLow ? 'text-white' : 'text-slate-800'}`}>Time's Up!</h2>
            <div className="text-9xl font-black text-sky-500 drop-shadow-lg">
              {state.score}
            </div>
            <div className={`text-2xl font-black mt-2 uppercase tracking-widest ${isTimeLow ? 'text-rose-100' : 'text-sky-600'}`}>Correct Answers</div>
          </div>
        ) : (
          <div className="space-y-12 relative">
            {state.status === GodHintStatus.Paused && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50 rounded-3xl">
                <div className="text-8xl font-black text-slate-800 uppercase tracking-[0.2em] drop-shadow-2xl animate-pulse">
                  PAUSED
                </div>
              </div>
            )}
            {state.status === GodHintStatus.Ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-50 rounded-3xl">
                <div className="text-8xl font-black text-sky-500 uppercase tracking-[0.2em] drop-shadow-2xl">
                  READY
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <div className={`text-2xl font-black uppercase tracking-widest mb-4 flex items-center gap-3 ${isTimeLow ? 'text-rose-100' : 'text-sky-500'}`}>
                <ClockIcon className="w-8 h-8" />
                Remaining Time
              </div>
              <div className={`text-[20rem] font-black leading-none drop-shadow-2xl transition-all ${
                isTimeLow ? 'text-white scale-110' : 'text-slate-800'
              }`}>
                {state.remainingTime}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className={`text-2xl font-black uppercase tracking-widest mb-2 flex items-center gap-3 ${isTimeLow ? 'text-rose-100' : 'text-sky-500'}`}>
                <TrophyIcon className="w-8 h-8" />
                Score
              </div>
              <div className={`text-8xl font-black drop-shadow-lg ${isTimeLow ? 'text-white' : 'text-slate-800'}`}>
                {state.score}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 font-black text-sm uppercase tracking-[0.5em] ${isTimeLow ? 'text-white/40' : 'text-slate-300'}`}>
        God Hint Mode
      </div>
    </div>
  );
};

export default GodHintTimer;
