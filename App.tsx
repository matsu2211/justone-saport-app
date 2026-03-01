
import React, { useState, useCallback, useEffect } from 'react';
import { GamePhase, Player, NGMode } from './types';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import PlayerSetupScreen from './components/PlayerSetupScreen';
import RoundScreen from './components/RoundScreen';
import PreviewScreen from './components/PreviewScreen';
import GodHintSetup from './components/GodHint/GodHintSetup';
import GodHintGM from './components/GodHint/GodHintGM';
import GodHintTimer from './components/GodHint/GodHintTimer';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GamePhase>(GamePhase.Start);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roundKey, setRoundKey] = useState<number>(1);
  const [godHintSettings, setGodHintSettings] = useState<{ timeLimit: number; ngMode: NGMode } | null>(null);

  // Handle URL-based routing for God Hint Timer
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path === '/timer') {
      setGameState(GamePhase.GodHintTimer);
    } else if (path === '/gm') {
      setGameState(GamePhase.GodHintSetup);
    }
  }, []);

  const handleStartGame = useCallback(() => {
    setGameState(GamePhase.PlayerSetup);
  }, []);

  const handleStartPreview = useCallback(() => {
    setGameState(GamePhase.Preview);
  }, []);

  const handleStartGodHint = useCallback(() => {
    setGameState(GamePhase.GodHintSetup);
  }, []);

  const handleGodHintSetupComplete = useCallback((settings: { timeLimit: number; ngMode: NGMode }) => {
    setGodHintSettings(settings);
    setGameState(GamePhase.GodHintGM);
  }, []);

  const handleSetupComplete = useCallback((newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setGameState(GamePhase.Round);
  }, []);

  const handleNextRound = useCallback(() => {
    setRoundKey(k => k + 1);
  }, []);

  const handleRestart = useCallback(() => {
    setRoundKey(1);
    setPlayers([]);
    setGameState(GamePhase.Start);
    setGodHintSettings(null);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, []);

  const handleBack = useCallback(() => {
    if (gameState === GamePhase.PlayerSetup || gameState === GamePhase.Preview || gameState === GamePhase.GodHintSetup) {
      setGameState(GamePhase.Start);
    } else if (gameState === GamePhase.Round) {
      setGameState(GamePhase.PlayerSetup);
    }
  }, [gameState]);

  const renderGameContent = () => {
    switch (gameState) {
      case GamePhase.Start:
        return <StartScreen onStart={handleStartGame} onPreview={handleStartPreview} onGodHint={handleStartGodHint} />;
      case GamePhase.PlayerSetup:
        return <PlayerSetupScreen onSetupComplete={handleSetupComplete} onBack={handleBack} onHome={handleRestart} />;
      case GamePhase.Round:
        return <RoundScreen key={roundKey} players={players} onNextRound={handleNextRound} onRestart={handleRestart} onBack={handleBack} />;
      case GamePhase.Preview:
        return <PreviewScreen onRestart={handleRestart} onBack={handleBack} />;
      case GamePhase.GodHintSetup:
        return <GodHintSetup onStart={handleGodHintSetupComplete} onBack={handleBack} onHome={handleRestart} />;
      case GamePhase.GodHintGM:
        return godHintSettings ? <GodHintGM initialSettings={godHintSettings} onRestart={handleRestart} /> : null;
      case GamePhase.GodHintTimer:
        return <GodHintTimer />;
      default:
        return <StartScreen onStart={handleStartGame} onPreview={handleStartPreview} onGodHint={handleStartGodHint} />;
    }
  };

  // Timer screen should be full width and no header
  if (gameState === GamePhase.GodHintTimer) {
    return <GodHintTimer />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-slate-800">
      <div className={`w-full ${gameState === GamePhase.GodHintGM ? 'max-w-5xl' : 'max-w-2xl'} mx-auto pb-4 transition-all duration-500`}>
        <Header gameState={gameState} players={players} />
        <main className={`mt-6 bg-white rounded-xl shadow-lg p-6 sm:p-8 min-h-[450px] flex flex-col justify-center overflow-hidden`}>
          {renderGameContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
