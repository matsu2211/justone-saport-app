export interface Player {
  id: string;
  name: string;
}

export enum GamePhase {
  Start,
  PlayerSetup,
  Round,
  Preview,
  GodHintSetup,
  GodHintGM,
  GodHintTimer,
}

export enum NGMode {
  OFF = 'OFF',
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
}

export enum GodHintStatus {
  Setup,
  Ready,
  Playing,
  Paused,
  Finished,
}

export interface GodHintState {
  timeLimit: number;
  remainingTime: number;
  score: number;
  currentWord: string;
  currentNGWords: string[];
  ngMode: NGMode;
  usedWords: string[];
  status: GodHintStatus;
  isWordHidden: boolean;
}

export enum RoundPhase {
  Loading,
  GuesserSelection,
  GuesserConfirmation,
  WordSelection,
  ClueThinking,
  ClueInput,
  Guessing,
  Result,
  Error,
}