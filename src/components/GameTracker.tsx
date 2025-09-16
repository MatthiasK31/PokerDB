import React, { useMemo, useState } from 'react';
import type { Game, GamePlayer, Player } from '../types';
import { formatMoney, round2 } from '../utils/money';
import { ActivePlayerCard } from './game/ActivePlayerCard';

interface Props {
  activeGame: Game | null;
  players: Player[];
  addPlayerToGame: (playerId: string, buyIn: number) => void;
  updateBuyIn: (playerId: string, additionalAmount: number) => void;
  leaveTable: (playerId: string, cashOut: number) => void;
  endGame: () => void;
}

export const GameTracker: React.FC<Props> = ({
  activeGame,
  players,
  addPlayerToGame,
  updateBuyIn,
  leaveTable,
  endGame,
}) => {
  const [addPlayerId, setAddPlayerId] = useState('');
  const [addPlayerBuyIn, setAddPlayerBuyIn] = useState('');

  const totals = useMemo(() => {
    if (!activeGame) return { totalBuyIns: 0, totalCashOuts: 0, inPlay: 0, active: 0 };
    const totalBuyIns = round2(activeGame.players.reduce((s, p) => s + p.buyIn, 0));
    const totalCashOuts = round2(activeGame.players.reduce((s, p) => s + (p.cashOut ?? 0), 0));
    const active = activeGame.players.filter(p => p.isActive).length;
    return { totalBuyIns, totalCashOuts, inPlay: round2(totalBuyIns - totalCashOuts), active };
  }, [activeGame]);

  if (!activeGame) {
    return <div className="muted">No active game. Start one from the Players view.</div>;
  }

  const inactivePlayers = activeGame.players.filter(p => !p.isActive);
  const activePlayers = activeGame.players.filter(p => p.isActive);

  const availablePlayers = players.filter(
    p => !activeGame.players.some(seat => seat.playerId === p.id)
  );

  return (
    <div>
      <div className="card mb-lg">
        <div className="row between center">
          <div>
            <div className="muted">Started</div>
            <div className="h3">{new Date(activeGame.date).toLocaleString()}</div>
          </div>
          <button className="btn btn-danger" onClick={endGame}>
            End Game
          </button>
        </div>
        <div className="tiles mt-md">
          <div className="tile">
            <div className="tile-label">Total Players</div>
            <div className="tile-value">{activeGame.players.length}</div>
          </div>
          <div className="tile">
            <div className="tile-label">Active Players</div>
            <div className="tile-value">{totals.active}</div>
          </div>
          <div className="tile">
            <div className="tile-label">Total Buy-ins</div>
            <div className="tile-value">{formatMoney(totals.totalBuyIns)}</div>
          </div>
          <div className="tile">
            <div className="tile-label">Money in Play</div>
            <div className="tile-value">{formatMoney(totals.inPlay)}</div>
          </div>
        </div>
        <div className="row between mt-md">
          <div className="muted">Total Cash-outs:</div>
          <div className="h3">{formatMoney(totals.totalCashOuts)}</div>
        </div>
        <div className="row between mt-xs">
          <div className="muted">Difference:</div>
          <div className={`h3 ${totals.inPlay === 0 ? 'green' : totals.inPlay < 0 ? 'red' : ''}`}>
            {formatMoney(totals.inPlay)}
          </div>
        </div>
      </div>

      <div className="mb-md row gap-sm">
        <select
          className="select"
          value={addPlayerId}
          onChange={e => setAddPlayerId(e.target.value)}
        >
          <option value="">Add player to table...</option>
          {availablePlayers.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          className="input max-150"
          placeholder="Buy-in"
          type="number"
          min="0"
          step="0.01"
          value={addPlayerBuyIn}
          onChange={e => setAddPlayerBuyIn(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!addPlayerId) return;
            const amt = parseFloat(addPlayerBuyIn);
            if (isNaN(amt) || amt <= 0) {
              alert('Enter a valid buy-in');
              return;
            }
            addPlayerToGame(addPlayerId, amt);
            setAddPlayerId('');
            setAddPlayerBuyIn('');
          }}
          disabled={!addPlayerId}
        >
          Add Player
        </button>
      </div>

      <h3 className="section-title">Active Players ({activePlayers.length})</h3>
      <div className="grid">
        {activePlayers.length ? (
          activePlayers.map(p => (
            <ActivePlayerCard
              key={p.playerId}
              player={p}
              updateBuyIn={updateBuyIn}
              leaveTable={leaveTable}
            />
          ))
        ) : (
          <div className="muted center pad-lg">No active players</div>
        )}
      </div>

      {!!inactivePlayers.length && (
        <>
          <h3 className="section-title mt-lg">Players Who Left ({inactivePlayers.length})</h3>
          <div className="grid">
            {inactivePlayers.map(p => (
              <ActivePlayerCard
                key={p.playerId}
                player={p}
                updateBuyIn={updateBuyIn}
                leaveTable={leaveTable}
                isInactive
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
