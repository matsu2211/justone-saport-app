
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GodHintState, GodHintStatus, NGMode } from '../../types';
import { getRandomWord, generateNGWords } from '../../services/wordService';
import { 
  PlayIcon, 
  PauseIcon, 
  SkipForwardIcon, 
  CheckCircleIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ClipboardIcon, 
  RotateCcwIcon, 
  AlertTriangleIcon,
  ClockIcon,
  TrophyIcon,
  ShieldCheckIcon,
  HomeIcon,
  MaximizeIcon
} from '../Icons';

interface GodHintGMProps {
  initialSettings: { timeLimit: number; ngMode: NGMode };
  onRestart: () => void;
}

const GodHintGM: React.FC<GodHintGMProps> = ({ initialSettings, onRestart }) => {
  const [state, setState] = useState<GodHintState>({
    timeLimit: initialSettings.timeLimit,
    remainingTime: initialSettings.timeLimit,
    score: 0,
    currentWord: '',
    currentNGWords: [],
    ngMode: initialSettings.ngMode,
    usedWords: [],
    status: GodHintStatus.Setup,
    isWordHidden: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const stateRef = useRef(state);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('GM: WebSocket connected');
        // Send initial state
        ws.send(JSON.stringify({ type: 'UPDATE_STATE', state: stateRef.current }));
      };

      ws.onclose = () => {
        console.log('GM: WebSocket disconnected. Retrying...');
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error('GM: WebSocket error', err);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Sync state to the server
  const syncState = useCallback((newState: GodHintState) => {
    console.log('GM: Syncing state via WS', newState);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'UPDATE_STATE', state: newState }));
    }
  }, []);

  // Sync whenever state changes
  useEffect(() => {
    syncState(state);
  }, [state, syncState]);

  // Update local state
  const updateState = (updates: Partial<GodHintState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Timer logic
  useEffect(() => {
    if (state.status === GodHintStatus.Playing && state.remainingTime > 0) {
      timerRef.current = setInterval(() => {
        updateState({ remainingTime: state.remainingTime - 1 });
      }, 1000);
    } else if (state.remainingTime === 0) {
      updateState({ status: GodHintStatus.Finished });
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.remainingTime]);

  // Fetch next word
  const nextWord = useCallback(async (isCorrect: boolean) => {
    setIsLoading(true);
    const word = getRandomWord(state.usedWords);
    
    let ngCount = 0;
    if (state.ngMode === NGMode.EASY) ngCount = 1;
    if (state.ngMode === NGMode.NORMAL) ngCount = 2;
    if (state.ngMode === NGMode.HARD) ngCount = 3;

    const ngWords = await generateNGWords(word, ngCount);
    
    updateState({
      currentWord: word,
      currentNGWords: ngWords,
      usedWords: [...state.usedWords, word],
      score: isCorrect ? state.score + 1 : state.score,
      isWordHidden: false,
    });
    setIsLoading(false);
  }, [state.usedWords, state.score, state.ngMode]);

  // Start game
  const startGame = async () => {
    // Open timer window
    // In some environments, popups might be blocked or show a fallback page.
    // We provide a direct link as well.
    try {
      const timerWindow = window.open('/timer', 'GodHintTimer', 'width=800,height=600');
      if (!timerWindow) {
        console.warn('Popup blocked. Please allow popups or open /timer manually.');
      }
    } catch (e) {
      console.error('Failed to open timer window:', e);
    }
    
    await nextWord(false);
    updateState({ status: GodHintStatus.Ready });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.status !== GodHintStatus.Playing && state.status !== GodHintStatus.Ready) return;
      
      if (e.key === 'Enter') {
        if (state.status === GodHintStatus.Ready) {
          updateState({ status: GodHintStatus.Playing });
        } else {
          nextWord(true);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (state.status === GodHintStatus.Ready) {
          updateState({ status: GodHintStatus.Playing });
        } else {
          nextWord(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, nextWord]);

  // Copy to clipboard
  const handleCopy = () => {
    let text = `【お題】\n${state.currentWord}`;
    if (state.currentNGWords.length > 0) {
      text += `\n【NGワード】\n${state.currentNGWords.join('\n')}`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRestart = () => {
    onRestart();
  };

  if (state.status === GodHintStatus.Setup) {
    return (
      <div className="text-center p-8">
        <div className="bg-rose-500 text-white p-4 rounded-xl mb-8 flex items-center justify-center gap-3 animate-pulse">
          <AlertTriangleIcon className="w-6 h-6" />
          <span className="font-black text-lg">※回答者には見せないでください</span>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-8"><ruby>神<rt>かみ</rt></ruby>ヒントモード GM<ruby>画面<rt>がめん</rt></ruby></h2>
        
        <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto mb-10">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <ClockIcon className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <div className="text-sm text-slate-400 font-bold uppercase"><ruby>制限時間<rt>せいげんじかん</rt></ruby></div>
            <div className="text-2xl font-black text-slate-800">{state.timeLimit}<ruby>秒<rt>びょう</rt></ruby></div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm text-slate-400 font-bold uppercase">NGモード</div>
            <div className="text-2xl font-black text-slate-800">{state.ngMode}</div>
          </div>
        </div>

        <button
          onClick={startGame}
          className="px-12 py-5 bg-sky-500 text-white font-black text-2xl rounded-2xl shadow-xl shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all flex items-center gap-3 mx-auto"
        >
          <PlayIcon className="w-8 h-8" />
          プレイ<ruby>開始<rt>かいし</rt></ruby>！
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-slate-400 text-sm">
            ※「プレイ開始」を押してもタイマー画面が開かない場合は、以下のリンクを別窓で開いてください。
          </p>
          <a 
            href="/timer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sky-500 font-bold hover:underline flex items-center gap-1"
          >
            <MaximizeIcon className="w-4 h-4" />
            タイマー画面を直接開く
          </a>
        </div>
        <button
          onClick={handleRestart}
          className="mt-8 px-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition-all flex items-center gap-2 mx-auto"
        >
          <HomeIcon className="w-5 h-5" />
          ホームへ<ruby>戻<rt>もど</rt></ruby>る
        </button>
        <p className="mt-4 text-slate-400 text-sm">
          ※「プレイ<ruby>開始<rt>かいし</rt></ruby>」を<ruby>押<rt>お</rt></ruby>すと<ruby>別<rt>べつ</rt></ruby>ウィンドウでタイマー<ruby>画面<rt>がめん</rt></ruby>が<ruby>開<rt>ひら</rt></ruby>きます。
        </p>
      </div>
    );
  }

  if (state.status === GodHintStatus.Finished) {
    return (
      <div className="text-center p-8">
        <div className="bg-rose-500 text-white p-4 rounded-xl mb-8 flex items-center justify-center gap-3">
          <AlertTriangleIcon className="w-6 h-6" />
          <span className="font-black text-lg">※回答者には見せないでください</span>
        </div>

        <TrophyIcon className="w-24 h-24 text-amber-500 mx-auto mb-4" />
        <h2 className="text-4xl font-black text-slate-800 mb-2">ゲーム<ruby>終了<rt>しゅうりょう</rt></ruby>！</h2>
        <div className="text-6xl font-black text-sky-500 mb-10">
          <ruby>正解数<rt>せいかいすう</rt></ruby>: {state.score}
        </div>

        <button
          onClick={handleRestart}
          className="px-12 py-5 bg-slate-800 text-white font-black text-xl rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-900 active:scale-95 transition-all flex items-center gap-3 mx-auto"
        >
          <RotateCcwIcon className="w-6 h-6" />
          トップへ<ruby>戻<rt>もど</rt></ruby>る
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-rose-500 text-white p-3 rounded-xl mb-6 flex items-center justify-center gap-3">
        <AlertTriangleIcon className="w-5 h-5" />
        <span className="font-black">※回答者には見せないでください</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Status */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase">
              <ClockIcon className="w-4 h-4" />
              <ruby>残<rt>のこ</rt></ruby>り<ruby>時間<rt>じかん</rt></ruby>
            </div>
            <div className={`text-3xl font-black ${state.remainingTime <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>
              {state.remainingTime}s
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase">
              <TrophyIcon className="w-4 h-4" />
              スコア
            </div>
            <div className="text-3xl font-black text-sky-500">
              {state.score}
            </div>
          </div>
          
          <div className="pt-4 space-y-2">
            {state.status === GodHintStatus.Ready ? (
              <button
                onClick={() => updateState({ status: GodHintStatus.Playing })}
                className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 animate-bounce"
              >
                <PlayIcon className="w-6 h-6" />
                タイマースタート！
              </button>
            ) : (
              <button
                onClick={() => updateState({ status: state.status === GodHintStatus.Playing ? GodHintStatus.Paused : GodHintStatus.Playing })}
                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {state.status === GodHintStatus.Playing ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                {state.status === GodHintStatus.Playing ? <ruby>一時停止<rt>いちじていし</rt></ruby> : <ruby>再開<rt>さいかい</rt></ruby>}
              </button>
            )}
            <button
              onClick={() => syncState(stateRef.current)}
              className="w-full py-3 bg-sky-50 text-sky-600 font-bold rounded-xl hover:bg-sky-100 transition-all flex items-center justify-center gap-2"
              title="タイマー画面と同期"
            >
              <RotateCcwIcon className="w-5 h-5" />
              <ruby>同期<rt>どうき</rt></ruby>する
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              ホームへ
            </button>
          </div>
        </div>

        {/* Center Column: Current Word */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border-4 border-sky-500 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 left-6 text-xs font-black text-sky-300 uppercase tracking-widest">CURRENT WORD</div>
            
            <div className="mt-6 flex flex-col items-center justify-center min-h-[160px]">
              {isLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              ) : (
                <>
                  <div className={`text-6xl font-black text-slate-800 transition-all ${state.isWordHidden ? 'blur-xl select-none opacity-20' : ''}`}>
                    {state.currentWord}
                  </div>
                  
                  {state.currentNGWords.length > 0 && !state.isWordHidden && (
                    <div className="mt-8 w-full">
                      <div className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 text-center">NG WORDS</div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {state.currentNGWords.map((ng, i) => (
                          <span key={i} className="px-4 py-2 bg-rose-50 text-rose-600 font-black rounded-lg border border-rose-100">
                            {ng}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => updateState({ isWordHidden: !state.isWordHidden })}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                title={state.isWordHidden ? 'お題を表示' : 'お題を隠す'}
              >
                {state.isWordHidden ? <EyeIcon className="w-6 h-6" /> : <EyeOffIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={handleCopy}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all relative"
                title="コピー"
              >
                <ClipboardIcon className="w-6 h-6" />
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded animate-bounce whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => nextWord(true)}
              disabled={isLoading}
              className="py-6 bg-emerald-500 text-white font-black text-2xl rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all flex flex-col items-center gap-1"
            >
              <CheckCircleIcon className="w-8 h-8" />
              <ruby>次<rt>つぎ</rt></ruby>のお<ruby>題<rt>だい</rt></ruby>へ
              <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">ENTER</span>
            </button>
            <button
              onClick={() => nextWord(false)}
              disabled={isLoading}
              className="py-6 bg-amber-500 text-white font-black text-2xl rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-600 active:scale-95 transition-all flex flex-col items-center gap-1"
            >
              <SkipForwardIcon className="w-8 h-8" />
              PASS
              <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">SPACE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GodHintGM;
