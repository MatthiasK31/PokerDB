import React from 'react';
import { usePoker } from '../state/PokerContext';
import { GameList } from '../components/GameList';

export const LogsPage: React.FC = () => {
  const { games } = usePoker();
  return <GameList games={games} />;
};

