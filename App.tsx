import React, { useState, useCallback, useEffect } from 'react';
import { GamePhase, Player, NGMode } from './types';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import PlayerSetupScreen from './components/PlayerSetupScreen';
import RoundScreen from './components/RoundScreen';
import NGHintSetup from './components/NGHint/NGHintSetup';
import NGHintGM from './components/NGHint/NGHintGM';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GamePhase>(GamePhase.Start);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roundKey, setRoundKey] = useState<number>(1);
  const [ngHintSettings, setNGHintSettings] = useState<{ timeLimit: number; ngMode: NGMode } | null>(null);
  const [showRuby, setShowRuby] = useState<boolean>(() => {
    const saved = localStorage.getItem('showRuby');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('showRuby', showRuby.toString());
  }, [showRuby]);

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path === '/gm') {
      setGameState(GamePhase.NGHintSetup);
    }
  }, []);

  const handleStartGame = useCallback(() => {
    setGameState(GamePhase.PlayerSetup);
  }, []);

  const handleStartNGHint = useCallback(() => {
    setGameState(GamePhase.NGHintSetup);
  }, []);

  const handleNGHintSetupComplete = useCallback((settings: { timeLimit: number; ngMode: NGMode }) => {
    setNGHintSettings(settings);
    setGameState(GamePhase.NGHintGM);
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
    setNGHintSettings(null);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, []);

  const handleBack = useCallback(() => {
    if (gameState === GamePhase.PlayerSetup || gameState === GamePhase.NGHintSetup) {
      setGameState(GamePhase.Start);
    } else if (gameState === GamePhase.Round) {
      setGameState(GamePhase.PlayerSetup);
    }
  }, [gameState]);

  const renderGameContent = () => {
    switch (gameState) {
      case GamePhase.Start:
        return <StartScreen onStart={handleStartGame} onStartNGHint={handleStartNGHint} />;
      case GamePhase.PlayerSetup:
        return <PlayerSetupScreen onSetupComplete={handleSetupComplete} onBack={handleBack} onHome={handleRestart} />;
      case GamePhase.Round:
        return <RoundScreen key={roundKey} players={players} onNextRound={handleNextRound} onRestart={handleRestart} onBack={handleBack} />;
      case GamePhase.NGHintSetup:
        return <NGHintSetup onStart={handleNGHintSetupComplete} onBack={handleBack} onHome={handleRestart} />;
      case GamePhase.NGHintGM:
        return ngHintSettings ? <NGHintGM initialSettings={ngHintSettings} onRestart={handleRestart} /> : null;
      default:
        return <StartScreen onStart={handleStartGame} onStartNGHint={handleStartNGHint} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-slate-800 ${!showRuby ? 'ruby-hidden' : ''}`}>
      <div className={`w-full ${gameState === GamePhase.NGHintGM ? 'max-w-5xl' : 'max-w-2xl'} mx-auto pb-4 transition-all duration-500`}>
        <Header gameState={gameState} players={players} showRuby={showRuby} onToggleRuby={() => setShowRuby(!showRuby)} />
        <main className={`mt-6 bg-white rounded-xl shadow-lg p-6 sm:p-8 min-h-[450px] flex flex-col justify-center overflow-hidden`}>
          {renderGameContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
