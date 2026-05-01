import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { RoundPhase, Player } from '../types';
import { generateWords, checkDuplicates } from '../services/wordService';
import { RetryIcon, PlayIcon, PauseIcon, EyeClosedIcon, EyeOpenIcon, ShuffleIcon, UserIcon, PencilSquareIcon, CheckIcon, CrossIcon, ClockIcon, LightbulbIcon, ArrowLeftIcon, HomeIcon, ClipboardIcon } from './Icons';
import Spinner from './Spinner';
import Timer from './Timer';

interface RoundScreenProps {
  players: Player[];
  onNextRound: () => void;
  onRestart: () => void;
  onBack: () => void;
}

const DEFAULT_GUESSING_TIME = 90; // seconds
const DEFAULT_THINKING_TIME = 60; // seconds

const RoundScreen: React.FC<RoundScreenProps> = ({ players, onNextRound, onRestart, onBack }) => {
  const [phase, setPhase] = useState<RoundPhase>(RoundPhase.GuesserSelection);
  const [words, setWords] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState<string>('');
  const [error, setError] = useState<React.ReactNode>('');
  const [guesser, setGuesser] = useState<Player | null>(null);
  const [clues, setClues] = useState<Map<string, string>>(new Map());
  const [guess, setGuess] = useState<string>('');

  // Timer settings
  const [guessingLimit, setGuessingLimit] = useState(DEFAULT_GUESSING_TIME);
  const [thinkingLimit, setThinkingLimit] = useState(DEFAULT_THINKING_TIME);

  const [timeLeft, setTimeLeft] = useState(DEFAULT_GUESSING_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [thinkingTimeLeft, setThinkingTimeLeft] = useState(DEFAULT_THINKING_TIME);
  const [isThinkingTimerRunning, setIsThinkingTimerRunning] = useState(false);
  const [validClues, setValidClues] = useState<Map<string, string>>(new Map());
  const [duplicateClues, setDuplicateClues] = useState<Map<string, string>>(new Map());
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [isWordCopied, setIsWordCopied] = useState(false);

  const handleCopyWord = useCallback(() => {
    navigator.clipboard.writeText(secretWord).then(() => {
      setIsWordCopied(true);
      setTimeout(() => setIsWordCopied(false), 2000);
    });
  }, [secretWord]);

  const handleInternalBack = useCallback(() => {
    switch (phase) {
      case RoundPhase.GuesserSelection:
        onBack();
        break;
      case RoundPhase.GuesserConfirmation:
        setPhase(RoundPhase.GuesserSelection);
        break;
      case RoundPhase.WordSelection:
        setPhase(RoundPhase.GuesserConfirmation);
        break;
      case RoundPhase.ClueThinking:
        setPhase(RoundPhase.WordSelection);
        break;
      case RoundPhase.ClueInput:
        setPhase(RoundPhase.ClueThinking);
        break;
      case RoundPhase.Guessing:
        setPhase(RoundPhase.ClueInput);
        break;
      case RoundPhase.Result:
        setPhase(RoundPhase.Guessing);
        break;
      case RoundPhase.Error:
        setPhase(RoundPhase.WordSelection);
        break;
      default:
        onBack();
    }
  }, [phase, onBack]);

  const clueGivers = useMemo(() => players.filter(p => p.id !== guesser?.id), [players, guesser]);

  const fetchWords = useCallback(async () => {
    setPhase(RoundPhase.Loading);
    setError('');
    try {
      const generatedWords = await generateWords();
      setWords(generatedWords);
      setPhase(RoundPhase.WordSelection);
    } catch (err) {
      setError(
        <>
          <ruby>お題<rt>おだい</rt></ruby>の<ruby>生成<rt>せいせい</rt></ruby>に<ruby>失敗<rt>しっぱい</rt></ruby>しました。
          <ruby>接続<rt>せつぞく</rt></ruby>またはAPIキーを<ruby>確認<rt>かくにん</rt></ruby>してください。
        </>
      );
      setPhase(RoundPhase.Error);
    }
  }, []);

  const handleGuesserSelect = (player: Player) => {
    setGuesser(player);
    setPhase(RoundPhase.GuesserConfirmation);
  };
  
  const handleRandomGuesser = () => {
    const randomIndex = Math.floor(Math.random() * players.length);
    handleGuesserSelect(players[randomIndex]);
  };

  const handleConfirmGuesser = () => {
    fetchWords();
  };

  const handleWordSelect = (word: string) => {
    setSecretWord(word);
    const initialClues = new Map(clueGivers.map(p => [p.id, '']));
    setClues(initialClues);
    setPhase(RoundPhase.ClueThinking);
    setThinkingTimeLeft(thinkingLimit);
    setIsThinkingTimerRunning(false);
  };
  
  const handleProceedToClueInput = useCallback(() => {
    setIsThinkingTimerRunning(false);
    setPhase(RoundPhase.ClueInput);
  }, []);

  const handleClueChange = (playerId: string, clue: string) => {
    setClues(prev => new Map(prev).set(playerId, clue));
  };
  
  const allCluesEntered = useMemo(() => {
    if (clues.size !== clueGivers.length) return false;
    return Array.from(clues.values()).every(clue => (clue as string).trim() !== '');
  }, [clues, clueGivers]);

  const handleConfirmClues = async () => {
    const rawClues = Array.from(clues.values()) as string[];
    
    const duplicateGroups = await checkDuplicates(rawClues);
    const duplicateSet = new Set<string>();
    duplicateGroups.forEach(group => group.forEach(word => duplicateSet.add(word)));
    
    const valid = new Map<string, string>();
    const duplicate = new Map<string, string>();
    
    clues.forEach((clue, playerId) => {
      if (duplicateSet.has(clue)) {
        duplicate.set(playerId, clue);
      } else {
        valid.set(playerId, clue);
      }
    });
    
    setValidClues(valid);
    setDuplicateClues(duplicate);
    setShowDuplicates(false);
    setPhase(RoundPhase.Guessing);
  };

  const handleConfirmGuess = useCallback(() => {
    setIsTimerRunning(false);
    setPhase(RoundPhase.Result);
  }, []);

  const handleStartThinkingTimer = () => {
    setThinkingTimeLeft(thinkingLimit);
    setIsThinkingTimerRunning(true);
  };

  const handleStartTimer = () => {
    setTimeLeft(guessingLimit);
    setIsTimerRunning(true);
  };

  const handleToggleThinkingTimer = () => {
    setIsThinkingTimerRunning(prev => !prev);
  };

  const handleToggleGuessingTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const renderTimeSelector = (currentLimit: number, onChange: (val: number) => void, label: string, onStart?: () => void) => {
    const options = [
      { label: '1分', value: 60 },
      { label: '2分', value: 120 },
      { label: '3分', value: 180 },
    ];

    return (
      <div className="mt-4 flex flex-col items-center w-full max-w-xs">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  console.log(`Setting ${label} to ${opt.value}s`);
                  onChange(opt.value);
                }}
                className={`py-3 rounded-xl font-black transition-all ${
                  currentLimit === opt.value
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-100 scale-105'
                    : 'bg-white text-slate-400 border border-slate-100 hover:border-sky-200 hover:text-sky-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          {onStart && (
            <button
              onClick={onStart}
              className="w-full py-3 bg-amber-500 text-white font-black rounded-xl shadow-lg shadow-amber-100 hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ClockIcon className="w-5 h-5" />
              タイマースタート
            </button>
          )}
        </div>
      </div>
    );
  };
  useEffect(() => {
    if (!isThinkingTimerRunning || phase !== RoundPhase.ClueThinking) {
      return;
    }
    const timerId = setInterval(() => {
      setThinkingTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleProceedToClueInput();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isThinkingTimerRunning, phase, handleProceedToClueInput]);

  useEffect(() => {
    if (phase !== RoundPhase.Guessing) {
      return;
    }

    if (isTimerRunning) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [isTimerRunning, phase]);

  useEffect(() => {
    if (phase === RoundPhase.Guessing && timeLeft === guessingLimit && !isTimerRunning) {
        // Just sync if needed
    }
  }, [guessingLimit, phase, timeLeft, isTimerRunning]);

  useEffect(() => {
    if (isTimerRunning && phase === RoundPhase.Guessing && timeLeft <= 0) {
      setGuess('時間切れ');
      handleConfirmGuess();
    }
  }, [timeLeft, phase, isTimerRunning, handleConfirmGuess]);


  // Remove the old useMemo for validClues and duplicateClues

  const renderContent = () => {
    switch (phase) {
      case RoundPhase.GuesserSelection:
        return (
          <div className="text-center w-full">
            <h2 className="text-2xl font-semibold text-slate-700"><ruby>回答者<rt>かいとうしゃ</rt></ruby>は<ruby>誰<rt>だれ</rt></ruby>ですか？</h2>
            <p className="mt-2 text-slate-500"><ruby>回答者<rt>かいとうしゃ</rt></ruby>をランダムまたは<ruby>手動<rt>しゅどう</rt></ruby>で<ruby>選択<rt>せんたく</rt></ruby>してください。</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={handleRandomGuesser}
                    className="flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    <ShuffleIcon className="w-6 h-6 mr-2" />
                    ランダムに<ruby>選択<rt>せんたく</rt></ruby>
                </button>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {players.map(player => (
                    <button
                        key={player.id}
                        onClick={() => handleGuesserSelect(player)}
                        className="flex flex-col items-center p-3 bg-slate-100 rounded-lg text-slate-800 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                    >
                        <UserIcon className="w-8 h-8 mb-2" />
                        <span className="font-semibold text-center break-all">{player.name}</span>
                    </button>
                ))}
            </div>
          </div>
        );

      case RoundPhase.GuesserConfirmation:
        return (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700"><ruby>今回<rt>こんかい</rt></ruby>の<ruby>回答者<rt>かいとうしゃ</rt></ruby>は...</h2>
            <div className="my-6 flex flex-col items-center gap-4">
                <UserIcon className="w-20 h-20 text-sky-500" />
                <p className="text-4xl font-bold text-sky-600">{guesser?.name}さんです！</p>
            </div>
            <button
                onClick={handleConfirmGuesser}
                className="mt-8 flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
                <PlayIcon className="w-6 h-6 mr-2" />
                お<ruby>題設定<rt>だいせってい</rt></ruby>に<ruby>進<rt>すす</rt></ruby>む
            </button>
            <p className="mt-4 text-rose-500 font-bold animate-pulse">
              ※画面共有を停止してください
            </p>
          </div>
        );

      case RoundPhase.Loading:
        return (
          <div className="text-center flex flex-col items-center justify-center h-full">
            <Spinner />
            <p className="mt-4 text-slate-500">
              お題を生成中...
            </p>
          </div>
        );
      
      case RoundPhase.Error:
        return (
          <div className="text-center flex flex-col items-center justify-center h-full">
             <p className="text-rose-500 font-semibold">{error}</p>
             <button
              onClick={fetchWords}
              className="mt-6 flex items-center justify-center px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
              <RetryIcon className="w-5 h-5 mr-2" />
              <ruby>再試行<rt>さいしこう</rt></ruby>
            </button>
          </div>
        );

      case RoundPhase.WordSelection:
        return (
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h2 className="text-2xl font-semibold text-slate-700">お<ruby>題<rt>だい</rt></ruby>を1つ<ruby>選<rt>えら</rt></ruby>んでください</h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchWords}
                  className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
                  title="お題を再生成"
                >
                  <ShuffleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-slate-500">
              <ruby>回答者<rt>かいとうしゃ</rt></ruby>の{guesser?.name}さんは１〜５の<ruby>好<rt>す</rt></ruby>きな<ruby>数字<rt>すうじ</rt></ruby>を<ruby>教<rt>おし</rt></ruby>えてください
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {words.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordSelect(word)}
                  className="p-4 bg-slate-100 rounded-lg text-lg font-semibold text-slate-800 hover:bg-sky-100 hover:text-sky-600 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                >
                  <span className="font-bold text-sky-500 mr-2">{index + 1}.</span>{word}
                </button>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 w-full max-w-md mx-auto">
              <p className="text-sm font-medium text-slate-400 mb-4 flex items-center justify-center gap-2">
                <PencilSquareIcon className="w-4 h-4" />
                または<ruby>自由<rt>じゆう</rt></ruby>にお<ruby>題<rt>だい</rt></ruby>を<ruby>入力<rt>にゅうりょく</rt></ruby>する
              </p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customWord.trim()) handleWordSelect(customWord.trim());
                }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-700"
                />
                <button
                  type="submit"
                  disabled={!customWord.trim()}
                  className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-600 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                >
                  <ruby>決定<rt>けってい</rt></ruby>
                </button>
              </form>
            </div>
          </div>
        );
        
      case RoundPhase.ClueThinking:
        return (
          <div className="text-center w-full flex flex-col items-center justify-center animate-fade-in">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-2 left-4 text-[10px] font-black text-sky-300 uppercase tracking-widest">SECRET WORD</div>
                <div className="mt-2 flex items-center justify-center gap-4">
                    <span className="text-3xl font-black text-slate-800">{secretWord}</span>
                    <button
                        onClick={handleCopyWord}
                        className="p-2 bg-white text-slate-400 hover:text-sky-500 rounded-lg shadow-sm border border-slate-100 transition-all relative"
                        title="お題をコピー"
                    >
                        <ClipboardIcon className="w-5 h-5" />
                        {isWordCopied && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                Copied!
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 flex items-center justify-center gap-2">
              <LightbulbIcon className="w-7 h-7" />
              ヒント<ruby>考<rt>かんが</rt></ruby>え<ruby>中<rt>ちゅう</rt></ruby>...
            </h2>
            <p className="mt-2 text-slate-500">
              <ruby>他<rt>ほか</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>と<ruby>被<rt>かぶ</rt></ruby>らないユニークなヒントを<ruby>考<rt>かんが</rt></ruby>えてください。
            </p>
            
            {isThinkingTimerRunning ? (
                <div className="flex flex-col items-center">
                    <Timer 
                      timeLeft={thinkingTimeLeft} 
                      timeLimit={thinkingLimit} 
                      isRunning={isThinkingTimerRunning} 
                      onClick={handleToggleThinkingTimer}
                    />
                    <button
                        onClick={handleToggleThinkingTimer}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all"
                    >
                        <PauseIcon className="w-4 h-4" />
                        <ruby>一時停止<rt>いちじていし</rt></ruby>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    {thinkingTimeLeft < thinkingLimit ? (
                        <div className="flex flex-col items-center">
                            <Timer 
                              timeLeft={thinkingTimeLeft} 
                              timeLimit={thinkingLimit} 
                              isRunning={isThinkingTimerRunning} 
                              onClick={handleToggleThinkingTimer}
                            />
                            <button
                                onClick={handleToggleThinkingTimer}
                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-600 rounded-full font-bold hover:bg-sky-200 transition-all"
                            >
                                <PlayIcon className="w-4 h-4" />
                                <ruby>再開<rt>さいかい</rt></ruby>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="relative my-6 w-32 h-32 flex items-center justify-center">
                                <LightbulbIcon className="w-20 h-20 text-slate-300" />
                            </div>
                            {renderTimeSelector(thinkingLimit, (val) => {
                                setThinkingLimit(val);
                                setThinkingTimeLeft(val);
                            }, "考える時間", handleStartThinkingTimer)}
                        </>
                    )}
                </div>
            )}

            <div className="mt-8 space-y-4">
              <p className="text-sm font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 max-w-md mx-auto">
                GMはお題をヒント出題者にアナウンスしてください。タイマー終了後、合図で一斉にヒントをチャットに送ってもらってください
              </p>
              <button
                onClick={handleProceedToClueInput}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
              >
                <PencilSquareIcon className="w-6 h-6 mr-2" />
                ヒント<ruby>入力<rt>にゅうりょく</rt></ruby>へ<ruby>進<rt>すす</rt></ruby>む
              </button>
            </div>
          </div>
        );

      case RoundPhase.ClueInput:
        return (
          <div className="text-center w-full">
            <h2 className="text-2xl font-semibold text-slate-700">ヒントを<ruby>入力<rt>にゅうりょく</rt></ruby></h2>
            <p className="mt-1 text-slate-500">お<ruby>題<rt>だい</rt></ruby>: <span className="font-bold text-sky-600">{secretWord}</span></p>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1 max-w-md mx-auto text-center">
              <p className="font-bold text-slate-600">かぶったヒントは次の画面で自動的に処理されます</p>
              <p className="text-[11px] text-rose-500 font-bold">※「緑」と「みどり」などは別として処理されるので入力時に同じ内容は表記の統一をしてください</p>
            </div>

            <div className="mt-6 space-y-4 max-h-[280px] overflow-y-auto px-2">
              {clueGivers.map((player) => (
                <div key={player.id} className="flex items-center gap-3">
                    <label htmlFor={`clue-${player.id}`} className="w-24 text-right font-semibold text-slate-600 truncate">{player.name}</label>
                    <div className="relative flex-grow">
                        <PencilSquareIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id={`clue-${player.id}`}
                            type="text"
                            value={clues.get(player.id) || ''}
                            onChange={(e) => handleClueChange(player.id, e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                    </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <button
                onClick={handleConfirmClues}
                disabled={!allCluesEntered}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                ヒントを<ruby>確定<rt>かくてい</rt></ruby>する
              </button>
            </div>
          </div>
        );

      case RoundPhase.Guessing: {
        const renderClues = () => (
          <div className="w-full">
              <h3 className="font-bold text-lg text-emerald-600"><ruby>見<rt>み</rt></ruby>られるヒント</h3>
              {validClues.size > 0 ? (
                  <div className="mt-2 flex flex-wrap justify-center gap-3">
                  {Array.from(validClues.values()).map((clue, i) => (
                      <div key={i} className="bg-emerald-100 text-emerald-800 font-semibold px-4 py-2 rounded-lg text-lg shadow-sm">{clue}</div>
                  ))}
                  </div>
              ) : (
                  <p className="mt-2 text-slate-500"><ruby>残念<rt>ざんねん</rt></ruby>！<ruby>見<rt>み</rt></ruby>られるヒントはありませんでした...</p>
              )}

              {duplicateClues.size > 0 && (
                  <div className="mt-4">
                      <button 
                        onClick={() => setShowDuplicates(!showDuplicates)}
                        className="flex items-center justify-center gap-2 mx-auto text-slate-500 hover:text-rose-500 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"
                      >
                        {showDuplicates ? <EyeOpenIcon className="w-4 h-4" /> : <EyeClosedIcon className="w-4 h-4" />}
                        <span className="text-sm font-bold">
                          {showDuplicates ? '被ったヒントを隠す' : '被ったヒントを表示'}
                        </span>
                        <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[10px] ml-1">
                          {duplicateClues.size}
                        </span>
                      </button>
                      
                      {showDuplicates && (
                        <div className="mt-4 animate-fade-in">
                          <h3 className="font-bold text-sm text-rose-600 mb-2 uppercase tracking-wider"><ruby>被<rt>かぶ</rt></ruby>ったヒント</h3>
                          <div className="flex flex-wrap justify-center gap-3">
                            {Array.from(duplicateClues.values()).map((clue, i) => (
                                <div key={i} className="bg-rose-50 text-rose-400 line-through px-4 py-2 rounded-lg border border-rose-100">{clue}</div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
              )}
          </div>
        );

        return (
          <div className="text-center w-full flex flex-col items-center animate-fade-in">
            <p className="mb-4 text-rose-500 font-bold animate-pulse">
              ※画面共有をONにしてください
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
                <EyeOpenIcon className="inline-block w-7 h-7 mr-2 align-text-bottom" />
                <ruby>回答者<rt>かいとうしゃ</rt></ruby>: {guesser?.name}さん、お<ruby>題<rt>だい</rt></ruby>は<ruby>何<rt>なに</rt></ruby>でしょう？
            </h2>
            
            <div className="w-full mt-8">
                {renderClues()}
                
                <div className="mt-10 max-w-sm mx-auto">
                  <label htmlFor="guesser-answer" className="font-semibold text-slate-600 block mb-2">あなたの<ruby>答<rt>こた</rt></ruby>え</label>
                  <input
                      id="guesser-answer"
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="お題を入力..."
                      className="w-full pl-4 pr-3 py-4 border-2 border-slate-200 rounded-2xl text-2xl text-center focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all shadow-inner bg-slate-50"
                  />
                </div>

                <div className="mt-10">
                    <button
                    onClick={handleConfirmGuess}
                    disabled={guess.trim() === ''}
                    className="w-full sm:w-auto flex items-center justify-center px-10 py-5 bg-sky-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-sky-200 hover:bg-sky-600 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                    >
                    <ruby>答<rt>こた</rt></ruby>えを<ruby>確定<rt>かくてい</rt></ruby>する
                    </button>
                </div>
            </div>
          </div>
        );
      }
      case RoundPhase.Result: {
        const isCorrect = guess.trim().toLowerCase() === secretWord.trim().toLowerCase();
        const isTimeUp = guess === '時間切れ';

        let ResultIcon, resultMessage, resultClass;

        if (isTimeUp) {
            ResultIcon = <ClockIcon className="w-16 h-16" />;
            resultMessage = <><ruby>時間切<rt>じかんぎ</rt></ruby>れ！</>;
            resultClass = "text-rose-500";
        } else if (isCorrect) {
            ResultIcon = <CheckIcon className="w-16 h-16" />;
            resultMessage = <><ruby>正解<rt>せいかい</rt></ruby>！</>;
            resultClass = "text-emerald-500";
        } else {
            ResultIcon = <CrossIcon className="w-16 h-16" />;
            resultMessage = <><ruby>残念<rt>ざんねん</rt></ruby>！</>;
            resultClass = "text-slate-500";
        }

        return (
            <div className="text-center w-full flex flex-col items-center justify-center animate-fade-in">
                <div className={resultClass}>
                    {ResultIcon}
                </div>
                <h2 className={`mt-4 text-4xl font-bold ${resultClass}`}>{resultMessage}</h2>
                
                {!isTimeUp && (
                  <p className="mt-4 text-xl text-slate-600">
                    あなたの<ruby>回答<rt>かいとう</rt></ruby>: <span className="font-bold">{guess}</span>
                  </p>
                )}

                <div className="mt-8">
                    <p className="text-lg text-slate-600"><ruby>正解<rt>せいかい</rt></ruby>は...</p>
                    <h3 className="mt-2 text-5xl sm:text-6xl font-extrabold text-sky-600">{secretWord}</h3>
                </div>

                <div className="mt-10">
                    <button
                        onClick={onNextRound}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                    >
                        <PlayIcon className="w-6 h-6 mr-2" />
                        <ruby>次<rt>つぎ</rt></ruby>のラウンドへ
                    </button>
                </div>
            </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in w-full h-full flex items-center justify-center relative">
      <div className="absolute -left-2 -top-2 flex gap-1 z-10">
        <button
          onClick={handleInternalBack}
          className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
          title="戻る"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onRestart}
          className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
          title="ホームに戻る"
        >
          <HomeIcon className="w-6 h-6" />
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default RoundScreen;
