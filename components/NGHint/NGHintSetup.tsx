
import React, { useState } from 'react';
import { NGMode } from '../../types';
import { ClockIcon, ShieldCheckIcon, PlayIcon, ArrowLeftIcon, HomeIcon, ListIcon, LightbulbIcon, UsersIcon, TrophyIcon } from '../Icons';

interface NGHintSetupProps {
  onStart: (settings: { timeLimit: number; ngMode: NGMode }) => void;
  onBack: () => void;
  onHome: () => void;
}

const NGHintSetup: React.FC<NGHintSetupProps> = ({ onStart, onBack, onHome }) => {
  const [timeLimit, setTimeLimit] = useState(60);
  const [ngMode, setNgMode] = useState<NGMode>(NGMode.NORMAL);

  const handleStart = () => {
    onStart({ timeLimit, ngMode });
  };

  const handleHome = () => {
    onHome();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-800 mb-2 flex items-center justify-center gap-3">
          <PlayIcon className="w-10 h-10 text-sky-500" />
          NGワードゲーム
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">NG Hint Game Setup</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Rules */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-700 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <ListIcon className="w-5 h-5 text-sky-500" />
            <ruby>遊<rt>あそ</rt></ruby>び<ruby>方<rt>かた</rt></ruby>・ルール
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex gap-4">
                <div className="bg-sky-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg shadow-sky-100 group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-sky-500 uppercase tracking-widest">Step 01</span>
                    <div className="font-black text-slate-800 text-lg"><ruby>役割<rt>やくわり</rt></ruby>を<ruby>決<rt>き</rt></ruby>める</div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    1〜2人が<span className="text-sky-600 font-bold">「<ruby>回答者<rt>かいとうしゃ</rt></ruby>」</span>になり、残りの全員が<span className="text-sky-600 font-bold">「ヒント<ruby>出題者<rt>しゅつだいしゃ</rt></ruby>」</span>になります。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex gap-4">
                <div className="bg-amber-400 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
                  <LightbulbIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Step 02</span>
                    <div className="font-black text-slate-800 text-lg">ヒントを<ruby>出<rt>だ</rt></ruby>す</div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    ヒント<ruby>出題者<rt>しゅつだいしゃ</rt></ruby>はお<ruby>題<rt>だい</rt></ruby>を<ruby>見<rt>み</rt></ruby>てヒントを<ruby>出<rt>だ</rt></ruby>します。<span className="text-rose-500 font-bold">NGワード</span>がある<ruby>場合<rt>ばあい</rt></ruby>は、それを使わずに<ruby>伝<rt>つた</rt></ruby>えましょう。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex gap-4 items-center">
              <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <p className="text-xs text-emerald-700 font-bold leading-relaxed">
                <ruby>制限時間内<rt>せいげんじかんない</rt></ruby>にどれだけ<ruby>多<rt>おお</rt></ruby>くの<ruby>正解<rt>せいかい</rt></ruby>を<ruby>導<rt>みちび</rt></ruby>き<ruby>出<rt>だ</rt></ruby>せるか、チームで<ruby>協力<rt>きょうりょく</rt></ruby>して<ruby>挑戦<rt>ちょうせん</rt></ruby>しましょう！
              </p>
            </div>

            {/* Hint Example Section */}
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4" />
                ヒントの<ruby>例<rt>れい</rt></ruby>
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">お<ruby>題<rt>だい</rt></ruby></div>
                  <div className="text-xl font-black text-slate-800">りんご</div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                    <span className="text-lg">💡</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative">
                      <p className="text-sm text-slate-600 font-bold leading-relaxed">
                        「<ruby>丸<rt>まる</rt></ruby>い<ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby>」「ニュートン」「<ruby>青森県<rt>あおもりけん</rt></ruby>」
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-black text-rose-400 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 italic">NG: フルーツ, 赤</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <div className="flex-1">
                    <div className="bg-sky-500 p-3 rounded-2xl rounded-tr-none shadow-lg shadow-sky-100 text-right">
                      <p className="text-sm text-white font-black">
                        「りんご！」
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-white rounded-full border border-sky-200 flex items-center justify-center shadow-sm">
                    <span className="text-lg">🤔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-8">
          <h3 className="text-lg font-black text-slate-700 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <ShieldCheckIcon className="w-5 h-5 text-sky-500" />
            ゲーム<ruby>設定<rt>せってい</rt></ruby>
          </h3>

          <div className="space-y-8">
            {/* Time Limit Selection */}
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <ruby>制限時間<rt>せいげんじかん</rt></ruby>
              </h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Duration</div>
                  <div className="text-3xl font-black text-sky-500 flex items-baseline gap-1">
                    {timeLimit >= 60 ? Math.floor(timeLimit / 60) : 0}
                    <span className="text-sm text-slate-400 font-bold">{timeLimit >= 60 ? '分' : ''}</span>
                    {timeLimit % 60 > 0 || timeLimit < 60 ? timeLimit % 60 : ''}
                    <span className="text-sm text-slate-400 font-bold">{timeLimit % 60 > 0 || timeLimit < 60 ? '秒' : ''}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  step="10"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400">10s</span>
                  <span className="text-[10px] font-bold text-slate-400">5m</span>
                  <span className="text-[10px] font-bold text-slate-400">10m</span>
                </div>
              </div>
            </section>

            {/* NG Mode Selection */}
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" />
                NGワードモード
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(NGMode) as Array<keyof typeof NGMode>).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setNgMode(NGMode[mode])}
                    className={`py-3 px-4 rounded-xl font-bold transition-all ${
                      ngMode === NGMode[mode]
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-bold italic leading-tight">
                ※NGモードをONにすると、<ruby>難易度<rt>なんいど</rt></ruby>ごとにNGワード<ruby>個数<rt>こすう</rt></ruby>が<ruby>増<rt>ふ</rt></ruby>えます。
              </p>
            </section>
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={handleStart}
              className="w-full py-5 bg-sky-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <PlayIcon className="w-6 h-6" />
              ゲームスタート！
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onBack}
                className="py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <ruby>戻<rt>もど</rt></ruby>る
              </button>
              <button
                onClick={handleHome}
                className="py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <HomeIcon className="w-4 h-4" />
                ホーム
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGHintSetup;
