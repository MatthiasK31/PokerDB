import React from 'react';
import { usePoker } from '../state/PokerContext';
import { PlayerList } from '../components/PlayerList';

export const PlayersPage: React.FC = () => {
  const { players, groups, addPlayer, renamePlayer, deletePlayer, createGroup, startGame, activeGame } = usePoker();
  return (
    <PlayerList
      players={players}
      groups={groups}
      addPlayer={addPlayer}
      renamePlayer={renamePlayer}
      deletePlayer={deletePlayer}
      createGroup={createGroup}
      startGame={startGame}
      activeGame={activeGame}
    />
  );
};

