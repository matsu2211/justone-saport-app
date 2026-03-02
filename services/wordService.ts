
import { ngWordData } from './ngWordData';

export const wordList: string[] = Object.keys(ngWordData);

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
  
  const availableNGWords = ngWordData[word];
  
  if (!availableNGWords) {
    console.warn(`[Data] No NG words found for: ${word}`);
    return [];
  }

  // 利用可能なNGワードから指定された数だけランダムに抽出
  const shuffled = [...availableNGWords].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, availableNGWords.length));
  
  console.log(`[Data] Selected NG words for ${word} (count: ${count}):`, selected);
  return selected;
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
