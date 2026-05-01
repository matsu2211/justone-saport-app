export interface Player {
  id: string;
  name: string;
}

export enum GamePhase {
  Start,
  PlayerSetup,
  Round,
  NGHintSetup,
  NGHintGM,
}

export enum NGMode {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
}

export enum NGHintStatus {
  Setup,
  Ready,
  Playing,
  Paused,
  Finished,
}

export interface NGHintState {
  timeLimit: number;
  remainingTime: number;
  score: number;
  currentWord: string;
  currentNGWords: string[];
  ngMode: NGMode;
  usedWords: string[];
  status: NGHintStatus;
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