import React, { useState } from 'react';
import type { GamePlayer, Group, Player } from '../types';
import { PlayerCard } from './PlayerCard';
import { CreateGroupModal } from './modals/CreateGroupModal';

interface Props {
  players: Player[];
  groups: Group[];
  addPlayer: (name: string) => void;
  renamePlayer: (id: string, newName: string) => void;
  deletePlayer: (id: string) => void;
  createGroup: (name: string, playerIds: string[]) => void;
  startGame: (initialPlayers: GamePlayer[]) => void;
  activeGame: any | null;
}

export const PlayerList: React.FC<Props> = ({
  players,
  groups,
  addPlayer,
  createGroup,
  renamePlayer,
  deletePlayer,
  startGame,
  activeGame,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleStartGame = () => {
    if (selectedPlayers.length < 2) {
      alert('Select at least 2 players to start a game');
      return;
    }
    const gamePlayers: GamePlayer[] = [];
    for (const playerId of selectedPlayers) {
      const player = players.find(p => p.id === playerId);
      if (!player) continue;
      const buyInAmount = prompt(`Enter buy-in for ${player.name}`);
      if (buyInAmount === null) return; // cancelled
      const buyIn = parseFloat(buyInAmount);
      if (isNaN(buyIn) || buyIn <= 0) {
        alert(`Invalid buy-in for ${player.name}`);
        return;
      }
      gamePlayers.push({
        playerId: player.id,
        name: player.name,
        buyIn,
        cashOut: null,
        isActive: true,
      });
    }
    startGame(gamePlayers);
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const filteredPlayers =
    selectedGroup === 'all'
      ? players
      : players.filter(p => groups.find(g => g.id === selectedGroup)?.playerIds.includes(p.id));

  return (
    <div>
      <div className="row wrap gap-md mb-lg">
        <form onSubmit={handleAddPlayer} className="row gap-sm">
          <input
            type="text"
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder="New player name"
            className="input"
          />
          <button className="btn btn-success" type="submit">
            Add Player
          </button>
        </form>
        <button className="btn btn-primary" onClick={() => setShowCreateGroupModal(true)}>
          Create Group
        </button>
        {!activeGame && players.length >= 2 && (
          <button
            className="btn btn-accent ml-auto"
            onClick={handleStartGame}
            disabled={selectedPlayers.length < 2}
            title={selectedPlayers.length < 2 ? 'Select 2+ players' : 'Start game'}
          >
            Start Game ({selectedPlayers.length} players)
          </button>
        )}
      </div>

      <div className="mb-md">
        <label className="label">Filter by Group</label>
        <select
          className="select max-250"
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
        >
          <option value="all">All Players</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid">
        {filteredPlayers.length ? (
          filteredPlayers.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              isSelected={selectedPlayers.includes(p.id)}
              selectable={!activeGame}
              onSelect={() => handlePlayerSelect(p.id)}
              onEdit={() => {
                const name = prompt('Edit player name', p.name);
                if (name && name.trim()) renamePlayer(p.id, name.trim());
              }}
              onDelete={() => {
                if (confirm('Delete this player? This will not remove them from past game logs.')) {
                  deletePlayer(p.id);
                }
              }}
            />
          ))
        ) : (
          <div className="muted center pad-lg">No players yet.</div>
        )}
      </div>

      {showCreateGroupModal && (
        <CreateGroupModal
          players={players}
          onCreateGroup={(name, ids) => {
            createGroup(name, ids);
            setShowCreateGroupModal(false);
          }}
          onClose={() => setShowCreateGroupModal(false)}
        />
      )}
    </div>
  );
};
