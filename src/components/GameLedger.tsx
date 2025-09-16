import React from 'react';
import type { Game } from '../types';
import { formatMoney, formatSigned, round2 } from '../utils/money';

interface Props {
  game: Game | null;
  onClose: () => void;
}

export const GameLedger: React.FC<Props> = ({ game, onClose }) => {
  if (!game) return <div className="muted">Ledger not found.</div>;
  const totalBuyIns = round2(game.players.reduce((s,p)=>s+p.buyIn,0));
  const totalCashOuts = round2(game.players.reduce((s,p)=>s+(p.cashOut ?? 0),0));
  const diff = round2(totalBuyIns - totalCashOuts);

  return (
    <div>
      <div className="row between center mb-md">
        <div>
          <div className="muted">Game</div>
          <div className="h3">{new Date(game.date).toLocaleString()}</div>
        </div>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>

      <div className="tiles mb-md">
        <div className="tile"><div className="tile-label">Players</div><div className="tile-value">{game.players.length}</div></div>
        <div className="tile"><div className="tile-label">Total Buy-ins</div><div className="tile-value">{formatMoney(totalBuyIns)}</div></div>
        <div className="tile"><div className="tile-label">Total Cash-outs</div><div className="tile-value">{formatMoney(totalCashOuts)}</div></div>
        <div className="tile"><div className="tile-label">Difference</div><div className={`tile-value ${diff===0? 'green':''}`}>{formatMoney(diff)}</div></div>
      </div>

      <div className="card">
        <h3 className="section-title">Ledger</h3>
        <div className="grid">
          {game.players.map(p => {
            const profit = round2((p.cashOut ?? 0) - p.buyIn);
            const color = profit > 0 ? 'green' : profit < 0 ? 'red' : '';
            return (
              <div className="card" key={p.playerId}>
                <div className="row between center mb-sm">
                  <div className="h3">{p.name}</div>
                  <div className={`chip ${color}`}>{formatSigned(profit, false)}</div>
                </div>
                <div className="stats small">
                  <div><div className="stat-label">Buy-in</div><div className="stat-value">{formatMoney(p.buyIn)}</div></div>
                  <div><div className="stat-label">Cash-out</div><div className="stat-value">{p.cashOut !== null ? formatMoney(p.cashOut) : '-'}</div></div>
                  <div><div className="stat-label">Status</div><div className="stat-value">{p.isActive ? 'Active (unfinished)' : 'Left'}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
