
import React, { useState, useCallback, useMemo } from 'react';
import { RoundPhase } from '../types';
import { generateWords, checkDuplicates } from '../services/wordService';
import { RetryIcon, PlayIcon, PencilSquareIcon, CheckIcon, CrossIcon, LightbulbIcon, ArrowLeftIcon, HomeIcon, ClipboardIcon, ShuffleIcon, ListIcon } from './Icons';
import Spinner from './Spinner';
import WordListModal from './WordListModal';

interface PreviewScreenProps {
  onRestart: () => void;
  onBack: () => void;
}

interface ParsedClue {
  player: string;
  clue: string;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ onRestart, onBack }) => {
  const [phase, setPhase] = useState<RoundPhase>(RoundPhase.Loading);
  const [words, setWords] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState<string>('');
  const [error, setError] = useState<React.ReactNode>('');
  const [bulkClues, setBulkClues] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'word' | 'clues' | 'ngCount' | null>(null);
  const [validClues, setValidClues] = useState<ParsedClue[]>([]);
  const [duplicateClues, setDuplicateClues] = useState<ParsedClue[]>([]);
  const [isWordListOpen, setIsWordListOpen] = useState(false);

  const [customWord, setCustomWord] = useState('');

  const handleCopy = useCallback((text: string, type: 'word' | 'clues' | 'ngCount') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  }, []);

  const handleInternalBack = useCallback(() => {
    switch (phase) {
      case RoundPhase.WordSelection:
        onBack();
        break;
      case RoundPhase.ClueInput:
        setPhase(RoundPhase.WordSelection);
        break;
      case RoundPhase.Result:
        setPhase(RoundPhase.ClueInput);
        break;
      case RoundPhase.Error:
        onBack();
        break;
      default:
        onBack();
    }
  }, [phase, onBack]);

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

  // Initial fetch
  React.useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleWordSelect = (word: string) => {
    setSecretWord(word);
    setPhase(RoundPhase.ClueInput);
  };

  const handleConfirmClues = async () => {
    // Split by 2 or more empty lines (3 or more newlines) to separate players
    const blocks = bulkClues.split(/\n\s*\n\s*\n+/).filter(b => b.trim() !== '');
    const parsedClues: ParsedClue[] = [];
    const timeRegex = /\d{1,2}:\d{2}/;

    blocks.forEach(block => {
      const lines = block.split('\n').map(l => l.trim());
      const timeLineIndex = lines.findIndex(l => timeRegex.test(l));

      if (timeLineIndex !== -1) {
        const timeLine = lines[timeLineIndex];
        const timeMatch = timeLine.match(timeRegex);
        
        if (timeMatch) {
          const t = timeMatch[0];
          const tIdx = timeLine.indexOf(t);
          const beforeT = timeLine.substring(0, tIdx).trim();
          const afterT = timeLine.substring(tIdx + t.length).trim();

          // Check if this block contains multiple time markers (old format with no double empty lines)
          const allTimesInBlock = block.match(new RegExp(timeRegex.source, 'g'));
          if (allTimesInBlock && allTimesInBlock.length > 1) {
            // Handle as multiple single-line clues
            const subLines = block.split('\n').filter(l => l.trim() !== '');
            subLines.forEach(sl => {
              const sm = sl.match(timeRegex);
              if (sm) {
                const st = sm[0];
                const stIdx = sl.indexOf(st);
                const sPlayer = sl.substring(0, stIdx).trim() || '不明';
                const sClue = sl.substring(stIdx + st.length).trim();
                if (sClue) parsedClues.push({ player: sPlayer, clue: sClue });
              }
            });
          } else {
            // Single player block (new format or single line)
            const player = (lines.slice(0, timeLineIndex).filter(l => l !== '').join(' ') || beforeT) || '不明';
            const clue = [afterT, ...lines.slice(timeLineIndex + 1)].filter(l => l.trim() !== '').join(' ');
            
            if (clue) {
              parsedClues.push({ player, clue });
            }
          }
        }
      } else {
        // Fallback for blocks without time markers
        const filteredLines = lines.filter(l => l !== '');
        if (filteredLines.length >= 2) {
          parsedClues.push({ player: filteredLines[0], clue: filteredLines.slice(1).join(' ') });
        } else if (filteredLines.length === 1) {
          parsedClues.push({ player: '不明', clue: filteredLines[0] });
        }
      }
    });

    const rawClueStrings = parsedClues.map(pc => pc.clue);
    const duplicateGroups = await checkDuplicates(rawClueStrings);
    const duplicateSet = new Set<string>();
    duplicateGroups.forEach(group => group.forEach(word => duplicateSet.add(word)));
    
    const valid: ParsedClue[] = [];
    const duplicate: ParsedClue[] = [];
    
    parsedClues.forEach(pc => {
      if (duplicateSet.has(pc.clue)) {
        // Check if we already added this specific clue to duplicates (to avoid double counting if multiple people gave same clue)
        // Actually, we want to show ALL duplicates with their player names.
        duplicate.push(pc);
      } else {
        valid.push(pc);
      }
    });
    
    setValidClues(valid);
    setDuplicateClues(duplicate);
    setPhase(RoundPhase.Result);
  };

  // Remove the old useMemo for validClues and duplicateClues

  const renderContent = () => {
    switch (phase) {
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
          <div className="text-center w-full">
            <div className="flex items-center justify-center gap-4 mb-6">
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

      case RoundPhase.ClueInput:
        return (
          <div className="text-center w-full">
            <h2 className="text-2xl font-semibold text-slate-700">ヒントを<ruby>一括入力<rt>いっかつにゅうりょく</rt></ruby></h2>
            <p className="mt-1 text-slate-500 flex items-center justify-center gap-2">
              お<ruby>題<rt>だい</rt></ruby>: <span className="font-bold text-sky-600">{secretWord}</span>
              <button
                onClick={() => handleCopy(`お題：${secretWord}`, 'word')}
                className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-all relative"
                title="お題をコピー"
              >
                <ClipboardIcon className="w-4 h-4" />
                {copiedType === 'word' && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded animate-bounce whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </p>
            <div className="mt-6">
              <textarea
                value={bulkClues}
                onChange={(e) => setBulkClues(e.target.value)}
                className="w-full h-64 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition resize-none font-mono text-sm"
                placeholder="プレイヤー名&#10;時刻&#10;ヒントの内容&#10;&#10;例:&#10;田中&#10;12:34&#10;りんご"
              />
              <p className="mt-2 text-xs text-slate-400 text-left">
                「プレイヤー名」「時刻」「ヒント」が改行で区切られた形式に対応しています。プレイヤーの区切りは2行以上の空行（改行3回以上）で行われます。
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={handleConfirmClues}
                disabled={bulkClues.trim() === ''}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <CheckIcon className="w-6 h-6 mr-2" />
                ヒントを<ruby>確定<rt>かくてい</rt></ruby>する
              </button>
            </div>
          </div>
        );

      case RoundPhase.Result:
        return (
          <div className="text-center w-full flex flex-col items-center justify-center animate-fade-in">
            <h2 className="text-2xl font-semibold text-slate-700 flex items-center gap-2">
              <LightbulbIcon className="w-7 h-7 text-sky-500" />
              プレビュー<ruby>結果<rt>けっか</rt></ruby>
            </h2>
            
            <div className="mt-6 p-6 bg-sky-50 rounded-2xl border border-sky-100 w-full relative group">
              <p className="text-sm text-sky-600 font-bold uppercase tracking-wider">お<ruby>題<rt>だい</rt></ruby></p>
              <h3 className="text-4xl font-black text-sky-600 mt-1">{secretWord}</h3>
              <button
                onClick={() => handleCopy(`お題：${secretWord}`, 'word')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-sky-400 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-all"
                title="お題をコピー"
              >
                <ClipboardIcon className="w-6 h-6" />
                {copiedType === 'word' && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded animate-bounce">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 relative group">
                <h3 className="font-bold text-emerald-700 flex items-center justify-center gap-2">
                  <CheckIcon className="w-5 h-5" />
                  OKヒント
                </h3>
                <button
                  onClick={() => handleCopy(validClues.map(c => `[${c.player}] ${c.clue}`).join(', '), 'clues')}
                  className="absolute right-4 top-4 p-1.5 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                  title="ヒント一覧をコピー"
                  disabled={validClues.length === 0}
                >
                  <ClipboardIcon className="w-5 h-5" />
                  {copiedType === 'clues' && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded animate-bounce">
                      Copied!
                    </span>
                  )}
                </button>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {validClues.length > 0 ? (
                    validClues.map((pc, i) => (
                      <span key={i} className="bg-white text-emerald-700 px-3 py-1.5 rounded-lg font-bold shadow-sm border border-emerald-100 flex flex-col items-start">
                        <span className="text-[10px] text-emerald-500 opacity-70 font-medium">@{pc.player}</span>
                        <span>{pc.clue}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-emerald-600/60 text-sm italic">なし</p>
                  )}
                </div>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 relative group">
                <h3 className="font-bold text-rose-700 flex items-center justify-center gap-2">
                  <CrossIcon className="w-5 h-5" />
                  NGヒント（<ruby>重複<rt>じゅうふく</rt></ruby>）
                </h3>
                <button
                  onClick={() => handleCopy(`NGヒントは ${duplicateClues.length}個！ (${duplicateClues.map(c => c.player).join(', ')})`, 'ngCount')}
                  className="absolute right-4 top-4 p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                  title="NGヒント数とプレイヤー名をコピー"
                >
                  <ClipboardIcon className="w-5 h-5" />
                  {copiedType === 'ngCount' && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded animate-bounce">
                      Copied!
                    </span>
                  )}
                </button>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {duplicateClues.length > 0 ? (
                    duplicateClues.map((pc, i) => (
                      <span key={i} className="bg-white text-rose-700 px-3 py-1.5 rounded-lg font-bold shadow-sm border border-rose-100 flex flex-col items-start opacity-60">
                        <span className="text-[10px] text-rose-400 opacity-70 font-medium">@{pc.player}</span>
                        <span className="line-through">{pc.clue}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-rose-600/60 text-sm italic">なし</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => {
                  setBulkClues('');
                  setPhase(RoundPhase.WordSelection);
                }}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all"
              >
                <ruby>別<rt>べつ</rt></ruby>のお<ruby>題<rt>だい</rt></ruby>で<ruby>試<rt>ため</rt></ruby>す
              </button>
              <button
                onClick={onRestart}
                className="px-8 py-4 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 transition-all"
              >
                メニューへ<ruby>戻<rt>もど</rt></ruby>る
              </button>
            </div>
          </div>
        );

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

export default PreviewScreen;
