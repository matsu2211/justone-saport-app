
import { GoogleGenAI } from "@google/genai";

export const wordList: string[] = [
  "スマホ", "電車", "りんご", "コーヒー", "ネコ", "おにぎり", "チョコレート", "テレビ", "花火", "ハサミ",
  "コンビニ", "パンダ", "カレーライス", "鏡", "時計", "メガネ", "ドラえもん", "スマブラ", "ルービックキューブ", "マリオ",
  "冷蔵庫", "トイレットペーパー", "新幹線", "映画館", "カメラ", "サウナ", "宇宙", "UFO", "雪だるま", "トランプ",
  "アイスクリーム", "花束", "犬", "雨", "ゆき", "サッカー", "野球", "テニス", "ボードゲーム", "クレヨンしんちゃん",
  "仮面ライダー", "ミッキー", "ポケモン", "スライム", "落語", "忍者", "鎌倉", "江戸時代", "フライパン", "ラーメン",
  "おすし", "スープ", "バイキング（食べ放題）", "地球", "満月", "コップ", "風鈴", "クリスマス", "ハロウィン", "お正月",
  "カラオケ", "漫画", "カメ", "サメ", "ピクニック", "ドライブ", "スイカ割り", "たこ焼き", "焼肉", "カフェ",
  "パズル", "海水浴", "バレンタインデー", "コンサート", "演劇", "旅行", "電話", "誕生日", "なべ", "ギター",
  "ピアノ", "ダンス", "スケート", "迷路", "コインランドリー", "温泉", "掃除機", "せんたくばさみ", "ホチキス", "ドーナツ",
  "ぶどう", "レモン", "地図", "地球儀", "カレンダー", "手紙", "昆虫", "蝶々", "星座", "鉛筆",
  "じゃんけん", "ボウリング", "ゴルフ", "サングラス", "自転車", "バス", "タクシー", "ヨーヨー", "花見", "流れ星",
  "結婚式", "ぬいぐるみ", "かがみもち", "けん玉", "将棋", "麻雀", "ペンギン", "トースト", "ハンバーガー", "焼き芋",
  "ビール", "お弁当", "ガチャガチャ", "お化け屋敷", "ダイヤモンド", "ケーキ", "シャンプー", "電球", "ねこじゃらし", "プリン",
  "たぬき", "カーテン", "蚊取り線香", "アルバム", "カードゲーム", "水族館", "動物園", "サンドイッチ", "ゲームセンター",
  "スポンジ", "ヘッドホン", "リモコン", "目覚まし時計", "スカイツリー", "駅", "空港", "かばん", "雑誌", "コイン", "ポスト",
  "マグカップ", "ココナッツ", "とさか", "カミソリ", "船長", "カラス", "ベッド", "ファイル", "タイツ", "トラクター",
  "しんじゅ", "牛", "役者", "銃", "信用", "どろ", "広告", "ティッシュ", "ドラゴン", "線路",
  "スキップ", "変化", "鬼", "野球帽", "油", "いす", "裁判所", "楽器", "爆弾", "真ん中",
  "レバー（棒）", "ハチ", "カメラ", "時間", "昼休み", "ガイコツ", "サウナ", "クリーム", "レンズ", "モーター",
  "シェイク", "お祭り", "ステップ", "ヒーロー", "朝", "ジャム", "顔", "雲", "らくだ", "ジュース",
  "ピアノ", "メニュー", "トラック", "運転", "おやつ", "コック", "ショー", "宇宙飛行士", "小説", "ドラム",
  "野獣", "熱", "プルーン", "お札", "看護師", "やきとり", "アンテナ", "円", "ラケット", "サラダ",
  "カギ", "病気", "毛布", "魔王", "港", "引退", "スプーン", "博物館", "羊", "影",
  "現在", "少数派", "トースト", "プログラム", "タイル", "ぶた", "声", "銀行", "怪物", "ニンジン",
  "サービス", "矢", "昼", "かかし", "水", "金", "ボウル", "図書館", "砂時計", "センス",
  "アヒル", "カウボーイ", "味", "ベンチ", "工事", "願い", "ゲーム機", "くじら", "右", "タンス",
  "足", "ヒゲ", "石", "ツノ", "車", "海", "春", "病院", "車輪", "写真",
  "女王", "魔法", "草", "競争", "マイク", "気体", "目印", "よろい", "ミニチュア", "ロケット",
  "おもちゃ", "世界", "手のひら", "出口", "パン", "キャンプ", "世界遺産", "ぶどう", "空気", "目",
  "紅茶", "プレゼント", "パスタ", "切手", "ドクロ", "会社", "釣り", "ふうとう", "壁", "衣装",
  "散歩", "呼吸", "揚げ物", "消防車", "低音", "景品", "クモ", "道路", "ソリ", "食べ放題（ビュッフェ）",
  "白鳥", "探偵", "日曜日", "ヒント", "シャツ", "シール", "季節", "玉ねぎ", "スイッチ", "井戸",
  "船", "12月", "景色", "玄関", "モグラ", "金メダル", "体", "寝袋", "チャンス", "ダイビング",
  "公園", "歯", "握手", "イルカ", "野球場", "解決", "冬", "しっぽ", "スキマ", "つめ",
  "患者", "ブランコ", "そろばん", "温度計", "ふくろう", "茶色", "ガム", "サイン", "アトラクション", "鉄棒",
  "かご", "ひまわり", "羽"
];

/**
 * Shuffles array in place and returns a slice of it.
 * @param array The array to shuffle.
 * @param num The number of elements to return.
 * @returns A new array containing `num` random elements from the original array.
 */
const getRandomElements = <T>(array: T[], num: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export const generateWords = async (): Promise<string[]> => {
  // Use only the static wordList as requested, bypassing AI generation.
  return Promise.resolve(getRandomElements(wordList, 5));
};

export const getRandomWord = (usedWords: string[]): string => {
  const availableWords = wordList.filter(w => !usedWords.includes(w));
  if (availableWords.length === 0) {
    // Reset if all words are used
    return wordList[Math.floor(Math.random() * wordList.length)];
  }
  return availableWords[Math.floor(Math.random() * availableWords.length)];
};

export const generateNGWords = async (word: string, count: number): Promise<string[]> => {
  if (count <= 0) return [];
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `お題『${word}』に対して、ヒントで使われると簡単になりすぎるNGワードを${count}個出してください。単語のみで出力してください。`,
      config: {
        systemInstruction: "あなたはゲームマスターです。お題に対するNGワードを生成します。説明文は不要です。単語のみを改行区切りで出力してください。",
      }
    });
    
    const text = response.text || "";
    return text.split('\n')
      .map(w => w.trim().replace(/^[・\-\d\.]+\s*/, ''))
      .filter(w => w !== "")
      .slice(0, count);
  } catch (error) {
    console.error("Error generating NG words:", error);
    return [];
  }
};

export interface DuplicateCheckResult {
  duplicates: string[][]; // Groups of words that are considered duplicates
}

export const checkDuplicates = async (clues: string[]): Promise<string[][]> => {
  if (clues.length <= 1) return [];

  // Client-side duplicate check logic
  // 1. Normalize (trim, lowercase, convert Katakana to Hiragana for comparison)
  const toHiragana = (str: string) => {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  };

  const normalizedMap = new Map<string, string[]>();
  
  clues.forEach(clue => {
    const trimmed = clue.trim();
    if (!trimmed) return;
    
    // Normalize for comparison: lowercase and Katakana -> Hiragana
    const normalized = toHiragana(trimmed.toLowerCase());
    
    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, []);
    }
    normalizedMap.get(normalized)!.push(clue);
  });

  // Return groups that have more than one element (duplicates)
  return Array.from(normalizedMap.values()).filter(group => group.length > 1);
};
