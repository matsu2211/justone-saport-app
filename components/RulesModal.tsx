import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clipboard, 
  Check, 
  User, 
  Pencil, 
  CopyX, 
  Lightbulb,
  MessageCircleOff,
  Target
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'standard' | 'god-hint';
}

const RuleStep: React.FC<{ 
  icon: React.ReactNode; 
  title: React.ReactNode; 
  description: React.ReactNode; 
  index: number;
}> = ({ icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 + 0.2 }}
    className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-colors group"
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform mt-1">
      {icon}
    </div>
    <div className="flex-grow min-w-0">
      <div className="flex items-start gap-2 mb-1">
        <span className="flex-shrink-0 text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-bold mt-1">Step {index + 1}</span>
        <h3 className="font-bold text-slate-800 leading-relaxed pt-0.5">
          {title}
        </h3>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed">{description}</div>
    </div>
  </motion.div>
);

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, mode = 'standard' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPhraseCopied, setIsPhraseCopied] = useState(false);

  const standardRules = `プレイヤーのひとりが「回答者」となり、自分だけが見えないヒミツの言葉を１つランダムに選びます。
他のプレイヤーは回答者がヒミツの言葉を推理しやすいようなヒントを１つずつ考えます。
ただし！記入したヒントが他の誰かと同じ内容だと、そのヒントを回答者が見ることはできなくなるので要注意！
ヒントを考えるときにプレイヤー同士が話し合うことは禁止です！`;

  const godHintRules = `回答者（お題を当てる人）とヒント出題者に分かれます。
ヒント出題者は画面に表示される「お題」と、使ってはいけない「NGワード」を確認します。
ヒント出題者はNGワードを絶対に言わないように注意しながら、回答者にお題を伝えるためのヒントを出します。
回答者が正解したら次の問題へ！制限時間内にどれだけ多く正解できるか挑戦しましょう。`;

  const rulesText = mode === 'god-hint' ? godHintRules : standardRules;
  const phrase = mode === 'god-hint' 
    ? "NGワードを避けながら、神がかりなヒントでお題を導こう！"
    : "他の人とかぶらないように、お題を当てるためのヒントを考えよう！";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(rulesText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  }, [rulesText]);

  const handleCopyPhrase = useCallback(() => {
    navigator.clipboard.writeText(phrase).then(() => {
      setIsPhraseCopied(true);
      setTimeout(() => setIsPhraseCopied(false), 2000);
    });
  }, [phrase]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500 rounded-lg text-white flex-shrink-0">
                  <Lightbulb size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                  {mode === 'god-hint' ? <><ruby>神<rt>かみ</rt></ruby>ヒントモードの<ruby>遊<rt>あそ</rt></ruby>びかた</> : <><ruby>遊<rt>あそ</rt></ruby>びかたガイド</>}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mode === 'god-hint' ? (
                  <>
                    <RuleStep 
                      index={0}
                      icon={<User size={24} />}
                      title={<><ruby>役割<rt>やくわり</rt></ruby>の<ruby>決定<rt>けってい</rt></ruby></>}
                      description={<p><ruby>回答者<rt>かいとうしゃ</rt></ruby>（お<ruby>題<rt>だい</rt></ruby>を<ruby>当<rt>あ</rt></ruby>てる<ruby>人<rt>ひと</rt></ruby>）とヒント<ruby>出題者<rt>しゅつだいしゃ</rt></ruby>に<ruby>分<rt>わ</rt></ruby>かれます。</p>}
                    />
                    <RuleStep 
                      index={1}
                      icon={<Target size={24} />}
                      title={<>お<ruby>題<rt>だい</rt></ruby>とNGワードの<ruby>確認<rt>かくにん</rt></ruby></>}
                      description={<p>ヒント<ruby>出題者<rt>しゅつだいしゃ</rt></ruby>は<ruby>画面<rt>がめん</rt></ruby>に<ruby>表示<rt>ひょうじ</rt></ruby>される「お<ruby>題<rt>だい</rt></ruby>」と、ヒントに<ruby>使<rt>つか</rt></ruby>ってはいけない「NGワード」を<ruby>確認<rt>かくにん</rt></ruby>します。</p>}
                    />
                    <RuleStep 
                      index={2}
                      icon={<MessageCircleOff size={24} />}
                      title={<>ヒントを<ruby>出<rt>だ</rt></ruby>す</>}
                      description={<p>ヒント<ruby>出題者<rt>しゅつだいしゃ</rt></ruby>はNGワードを<ruby>絶対<rt>ぜったい</rt></ruby>に<ruby>言<rt>い</rt></ruby>わないように<ruby>注意<rt>ちゅうい</rt></ruby>しながら、<ruby>回答者<rt>かいとうしゃ</rt></ruby>にお<ruby>題<rt>だい</rt></ruby>を<ruby>伝<rt>つた</rt></ruby>えるためのヒントを<ruby>出<rt>だ</rt></ruby>します。</p>}
                    />
                    <RuleStep 
                      index={3}
                      icon={<Check size={24} />}
                      title={<><ruby>連続正解<rt>れんぞくせいかい</rt></ruby>を<ruby>目指<rt>めざ</rt></ruby>す</>}
                      description={<p><ruby>回答者<rt>かいとうしゃ</rt></ruby>が<ruby>正解<rt>せいかい</rt></ruby>したら<ruby>次<rt>つぎ</rt></ruby>の<ruby>問題<rt>もんだい</rt></ruby>へ！<ruby>制限時間内<rt>せいげんじかんない</rt></ruby>にどれだけ<ruby>多<rt>おお</rt></ruby>く<ruby>正解<rt>せいかい</rt></ruby>できるか<ruby>挑戦<rt>ちょうせん</rt></ruby>しましょう。</p>}
                    />
                  </>
                ) : (
                  <>
                    <RuleStep 
                      index={0}
                      icon={<User size={24} />}
                      title={<><ruby>回答者<rt>かいとうしゃ</rt></ruby>の<ruby>決定<rt>けってい</rt></ruby></>}
                      description={<p><ruby>一人<rt>ひとり</rt></ruby>が「<ruby>回答者<rt>かいとうしゃ</rt></ruby>」になります。<ruby>回答者<rt>かいとうしゃ</rt></ruby>は<ruby>自分<rt>じぶん</rt></ruby>だけが<ruby>見<rt>み</rt></ruby>えないお<ruby>題<rt>だい</rt></ruby>を1つ<ruby>選<rt>えら</rt></ruby>びます。</p>}
                    />
                    <RuleStep 
                      index={1}
                      icon={<Pencil size={24} />}
                      title={<>ヒントを<ruby>考<rt>かんが</rt></ruby>える</>}
                      description={
                        <>
                          <p><ruby>他<rt>ほか</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>は、<ruby>回答者<rt>かいとうしゃ</rt></ruby>がお<ruby>題<rt>だい</rt></ruby>を<ruby>当<rt>あ</rt></ruby>てられるようなヒントを1つずつ<ruby>書<rt>か</rt></ruby>きます。</p>
                          <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] shadow-sm">
                            <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Example</div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold">お題：りんご</span>
                            </div>
                            <div className="flex flex-wrap gap-1 text-slate-500">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">赤い</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">果物</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">青森</span>
                            </div>
                          </div>
                        </>
                      }
                    />
                    <RuleStep 
                      index={2}
                      icon={<CopyX size={24} />}
                      title={<><ruby>同<rt>おな</rt></ruby>じヒントは<ruby>無効<rt>むこう</rt></ruby></>}
                      description={
                        <>
                          <p><ruby>他<rt>ほか</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>とヒントが<ruby>被<rt>かぶ</rt></ruby>ったら、そのヒントは<ruby>消去<rt>しょうきょ</rt></ruby>されます！</p>
                          <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] shadow-sm">
                            <div className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Example</div>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-400">Aさん</span>
                                <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 line-through">赤い</span>
                              </div>
                              <span className="text-slate-300 font-bold">＝</span>
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-400">Bさん</span>
                                <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 line-through">赤い</span>
                              </div>
                              <span className="text-slate-400 mx-0.5">→</span>
                              <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">消去！</span>
                            </div>
                          </div>
                        </>
                      }
                    />
                    <RuleStep 
                      index={3}
                      icon={<Target size={24} />}
                      title={<>お<ruby>題<rt>だい</rt></ruby>を<ruby>当<rt>あ</rt></ruby>てる</>}
                      description={<p><ruby>残<rt>のこ</rt></ruby>ったヒントだけを<ruby>見<rt>み</rt></ruby>て、<ruby>回答者<rt>かいとうしゃ</rt></ruby>がお<ruby>題<rt>だい</rt></ruby>を<ruby>推理<rt>すいり</rt></ruby>します。<ruby>正解<rt>せいかい</rt></ruby>を<ruby>目指<rt>めざ</rt></ruby>そう！</p>}
                    />
                  </>
                )}
              </div>

              {mode === 'standard' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 items-start"
                >
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <MessageCircleOff size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm"><ruby>禁止事項<rt>きんしじこう</rt></ruby></h4>
                    <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                      ヒントを<ruby>考<rt>かんが</rt></ruby>えている<ruby>間<rt>あいだ</rt></ruby>、プレイヤー<ruby>同士<rt>どうし</rt></ruby>で<ruby>相談<rt>そうだん</rt></ruby>したり、ヒントの<ruby>内容<rt>ないよう</rt></ruby>を<ruby>教<rt>おし</rt></ruby>え<ruby>合<rt>あ</rt></ruby>ったりしてはいけません。
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center py-4"
              >
                <div className="inline-flex items-center gap-2 group/phrase relative">
                  <p className="text-slate-500 text-sm italic">
                    「
                    {mode === 'god-hint' ? (
                      <><ruby>NGワード<rt>えぬじーわーど</rt></ruby>を<ruby>避<rt>よ</rt></ruby>けながら、<ruby>神<rt>かみ</rt></ruby>がかりなヒントでお<ruby>題<rt>だい</rt></ruby>を<ruby>導<rt>みちび</rt></ruby>こう！</>
                    ) : (
                      <><ruby>他<rt>ほか</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>とかぶらないように、お<ruby>題<rt>だい</rt></ruby>を<ruby>当<rt>あ</rt></ruby>てるためのヒントを<ruby>考<rt>かんが</rt></ruby>えよう！</>
                    )}
                    」
                  </p>
                  <button
                    onClick={handleCopyPhrase}
                    className="p-1.5 text-slate-300 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all opacity-0 group-hover/phrase:opacity-100 focus:opacity-100"
                    title="メッセージをコピー"
                  >
                    {isPhraseCopied ? <Check size={14} className="text-emerald-500" /> : <Clipboard size={14} />}
                  </button>
                  {isPhraseCopied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded animate-bounce">
                      Copied!
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all text-center"
              >
                わかった！
              </button>
              <button
                onClick={handleCopy}
                disabled={isCopied}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isCopied ? (
                  <>
                    <Check size={20} className="text-emerald-500" />
                    <span>コピー<ruby>完了<rt>かんりょう</rt></ruby></span>
                  </>
                ) : (
                  <>
                    <Clipboard size={20} />
                    <span>ルールをコピー</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RulesModal;
