import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoker } from '../state/PokerContext';
import { GameLedger } from '../components/GameLedger';

export const LedgerPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games } = usePoker();
  const game = games.find(g => g.id === id);
  return <GameLedger game={game ?? null} onClose={() => navigate('/')} />;
};

