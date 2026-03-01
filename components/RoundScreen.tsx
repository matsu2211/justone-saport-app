
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { RoundPhase, Player } from '../types';
import { generateWords, checkDuplicates } from '../services/wordService';
import { RetryIcon, PlayIcon, EyeClosedIcon, EyeOpenIcon, ShuffleIcon, UserIcon, PencilSquareIcon, CheckIcon, CrossIcon, ClockIcon, LightbulbIcon, ArrowLeftIcon, HomeIcon, ListIcon } from './Icons';
import Spinner from './Spinner';
import Timer from './Timer';
import WordListModal from './WordListModal';

interface RoundScreenProps {
  players: Player[];
  onNextRound: () => void;
  onRestart: () => void;
  onBack: () => void;
}

const GUESSING_TIME_LIMIT = 90; // seconds
const CLUE_THINKING_TIME_LIMIT = 60; // seconds

const RoundScreen: React.FC<RoundScreenProps> = ({ players, onNextRound, onRestart, onBack }) => {
  const [phase, setPhase] = useState<RoundPhase>(RoundPhase.GuesserSelection);
  const [words, setWords] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState<string>('');
  const [error, setError] = useState<React.ReactNode>('');
  const [guesser, setGuesser] = useState<Player | null>(null);
  const [clues, setClues] = useState<Map<string, string>>(new Map());
  const [guess, setGuess] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(GUESSING_TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [thinkingTimeLeft, setThinkingTimeLeft] = useState(CLUE_THINKING_TIME_LIMIT);
  const [isThinkingTimerRunning, setIsThinkingTimerRunning] = useState(false);
  const [validClues, setValidClues] = useState<Map<string, string>>(new Map());
  const [duplicateClues, setDuplicateClues] = useState<Map<string, string>>(new Map());
  const [isWordListOpen, setIsWordListOpen] = useState(false);
  const [customWord, setCustomWord] = useState('');

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
    setThinkingTimeLeft(CLUE_THINKING_TIME_LIMIT);
    setIsThinkingTimerRunning(false);
  };
  
  const handleStartThinkingTimer = () => {
    setIsThinkingTimerRunning(true);
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
    setPhase(RoundPhase.Guessing);
  };

  const handleConfirmGuess = useCallback(() => {
    setIsTimerRunning(false);
    setPhase(RoundPhase.Result);
  }, []);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
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
    if (!isTimerRunning || phase !== RoundPhase.Guessing) {
      return;
    }

    setTimeLeft(GUESSING_TIME_LIMIT);
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isTimerRunning, phase]);

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
                <button
                  onClick={() => setIsWordListOpen(true)}
                  className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
                  title="お題一覧を表示"
                >
                  <ListIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-slate-500">
              <EyeClosedIcon className="inline-block w-5 h-5 mr-1 align-text-bottom" />
              <ruby>回答者<rt>かいとうしゃ</rt></ruby>の{guesser?.name}さんは<ruby>見<rt>み</rt></ruby>ないでください。
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
                  placeholder="お題を入力..."
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
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 flex items-center justify-center gap-2">
              <LightbulbIcon className="w-7 h-7" />
              ヒント<ruby>考<rt>かんが</rt></ruby>え<ruby>中<rt>ちゅう</rt></ruby>...
            </h2>
            <p className="mt-2 text-slate-500">
              <ruby>他<rt>ほか</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>と<ruby>被<rt>かぶ</rt></ruby>らないユニークなヒントを<ruby>考<rt>かんが</rt></ruby>えてください。
            </p>
            
            {isThinkingTimerRunning ? (
                <Timer timeLeft={thinkingTimeLeft} timeLimit={CLUE_THINKING_TIME_LIMIT} />
            ) : (
                <div className="relative my-6 w-32 h-32 flex items-center justify-center">
                    <LightbulbIcon className="w-20 h-20 text-slate-300" />
                </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              {!isThinkingTimerRunning && (
                <button
                    onClick={handleStartThinkingTimer}
                    className="flex items-center justify-center px-8 py-4 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    <ClockIcon className="w-6 h-6 mr-2" />
                    タイマーをスタート
                </button>
              )}
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
                            placeholder="ヒントを1<ruby>単語<rt>たんご</rt></ruby>で<ruby>入力<rt>にゅうりょく</rt></ruby>"
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
                      <h3 className="font-bold text-lg text-rose-600"><ruby>被<rt>かぶ</rt></ruby>ったヒント</h3>
                      <div className="mt-2 flex flex-wrap justify-center gap-3">
                      {Array.from(duplicateClues.values()).map((clue, i) => (
                          <div key={i} className="bg-rose-100 text-rose-800 line-through px-4 py-2 rounded-lg">{clue}</div>
                      ))}
                      </div>
                  </div>
              )}
          </div>
        );

        return (
          <div className="text-center w-full flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
                <EyeOpenIcon className="inline-block w-7 h-7 mr-2 align-text-bottom" />
                <ruby>回答者<rt>かいとうしゃ</rt></ruby>: {guesser?.name}さん、お<ruby>題<rt>だい</rt></ruby>は<ruby>何<rt>なに</rt></ruby>でしょう？
            </h2>
            
            {!isTimerRunning ? (
              <div className="mt-8 animate-fade-in w-full flex flex-col items-center">
                <p className="text-slate-600">ヒントを<ruby>確認<rt>かくにん</rt></ruby>し、<ruby>準備<rt>じゅんび</rt></ruby>ができたらタイマーを<ruby>開始<rt>かいし</rt></ruby>してください。</p>
                <div className="my-6">
                  {renderClues()}
                </div>
                <button
                    onClick={handleStartTimer}
                    className="flex items-center justify-center px-8 py-4 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    <ClockIcon className="w-6 h-6 mr-2" />
                    タイマーをスタート ({GUESSING_TIME_LIMIT}<ruby>秒<rt>びょう</rt></ruby>)
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <Timer timeLeft={timeLeft} timeLimit={GUESSING_TIME_LIMIT} />
                <div className="w-full">
                    {renderClues()}
                    <div className="mt-6">
                      <label htmlFor="guesser-answer" className="font-semibold text-slate-600">あなたの<ruby>答<rt>こた</rt></ruby>え</label>
                      <input
                          id="guesser-answer"
                          type="text"
                          value={guess}
                          onChange={(e) => setGuess(e.target.value)}
                          className="mt-2 w-full max-w-sm mx-auto block pl-4 pr-3 py-3 border border-slate-300 rounded-lg text-xl text-center focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                          placeholder="お<ruby>題<rt>だい</rt></ruby>を<ruby>推測<rt>すいそく</rt></ruby>して<ruby>入力<rt>にゅうりょく</rt></ruby>"
                      />
                    </div>

                    <div className="mt-6">
                        <button
                        onClick={handleConfirmGuess}
                        disabled={guess.trim() === ''}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                        <ruby>答<rt>こた</rt></ruby>えを<ruby>確定<rt>かくてい</rt></ruby>する
                        </button>
                    </div>
                </div>
              </div>
            )}
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
      <WordListModal 
        isOpen={isWordListOpen} 
        onClose={() => setIsWordListOpen(false)} 
        onSelectWord={handleWordSelect}
      />
    </div>
  );
};

export default RoundScreen;
