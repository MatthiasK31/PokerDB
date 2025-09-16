import React from 'react';
import { usePoker } from '../state/PokerContext';
import { GameTracker } from '../components/GameTracker';

export const GamePage: React.FC = () => {
  const { activeGame, players, addPlayerToGame, updateBuyIn, leaveTable, endGame } = usePoker();
  return (
    <GameTracker
      activeGame={activeGame}
      players={players}
      addPlayerToGame={addPlayerToGame}
      updateBuyIn={updateBuyIn}
      leaveTable={leaveTable}
      endGame={() => { endGame(); }}
    />
  );
};

