import React, { useState } from 'react';
import type { GamePlayer } from '../../types';
import { formatMoney, formatSigned, round2 } from '../../utils/money';

interface Props {
  player: GamePlayer;
  updateBuyIn: (playerId: string, additionalAmount: number) => void;
  leaveTable: (playerId: string, cashOut: number) => void;
  isInactive?: boolean;
}

export const ActivePlayerCard: React.FC<Props> = ({
  player,
  updateBuyIn,
  leaveTable,
  isInactive = false,
}) => {
  const [addAmount, setAddAmount] = useState('');
  const [cashOut, setCashOut] = useState('');
  const profit = player.cashOut !== null ? round2(player.cashOut - player.buyIn) : null;
  const profitClass = profit === null ? '' : profit > 0 ? 'green' : profit < 0 ? 'red' : 'muted';
  const barWidth = profit === null || profit === 0 ? 0 : Math.max(5, Math.min(100, Math.abs(profit)));

  return (
    <div className={`card ${isInactive ? 'card-muted' : ''}`}>
      <div className="row between center mb-sm">
        <h3 className="card-title">{player.name}</h3>
        {profit !== null && <span className={`chip ${profitClass}`}>{formatSigned(profit, false)}</span>}
      </div>
      {profit !== null && (
        <div className="meter mt-sm">
          <span className={`meter-fill ${profitClass === 'muted' ? '' : profitClass}`} style={{ width: `${barWidth}%` }} />
        </div>
      )}

      <div className="stats small mt-sm">
        <div>
          <div className="stat-label">Buy-in</div>
          <div className="stat-value">{formatMoney(player.buyIn)}</div>
        </div>
        <div>
          <div className="stat-label">Cash Out</div>
          <div className="stat-value">{player.cashOut !== null ? formatMoney(player.cashOut) : '-'}</div>
        </div>
      </div>

      {!isInactive && (
        <div className="vstack gap-sm mt-sm">
          <div className="row gap-sm">
            <input
              type="number"
              className="input"
              placeholder="Add buy-in"
              min="0"
              step="0.01"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                const amt = parseFloat(addAmount);
                if (isNaN(amt) || amt <= 0) return alert('Enter a valid amount');
                updateBuyIn(player.playerId, amt);
                setAddAmount('');
              }}
            >
              Add
            </button>
          </div>
          <div className="row gap-sm">
            <input
              type="number"
              className="input"
              placeholder="Cash out"
              min="0"
              step="0.01"
              value={cashOut}
              onChange={e => setCashOut(e.target.value)}
            />
            <button
              className="btn btn-success"
              onClick={() => {
                const amt = parseFloat(cashOut);
                if (isNaN(amt) || amt < 0) return alert('Enter a valid amount');
                leaveTable(player.playerId, amt);
                setCashOut('');
              }}
            >
              Leave Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
