import React from 'react';
import type { Player } from '../types';
import { formatMoney, formatSigned } from '../utils/money';

interface Props {
  player: Player;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PlayerCard: React.FC<Props> = ({
  player,
  selectable = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const color = player.netProfits > 0 ? 'green' : player.netProfits < 0 ? 'red' : 'gray';
  const barWidth = player.netProfits === 0 ? 0 : Math.max(5, Math.min(100, Math.abs(player.netProfits)));
  return (
    <div className={`card ${isSelected ? 'selected' : ''}`} onClick={selectable ? onSelect : undefined}>
      <div className="row between center mb-sm">
        <div className="row gap-sm center">
          {selectable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => { e.stopPropagation(); onSelect?.(); }}
            />
          )}
          <h3 className="card-title">{player.name}</h3>
        </div>
        <span className="row gap-sm">
          {selectable && (
            <span className={`chip ${isSelected ? 'chip-selected' : ''}`}>{
              isSelected ? 'Selected' : 'Tap to select'
            }</span>
          )}
          <button
            className="btn"
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            title="Edit name"
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            title="Delete player"
          >
            Delete
          </button>
        </span>
      </div>
      <div className="meter">
        <span className={`meter-fill ${color}`} style={{ width: `${barWidth}%` }} />
      </div>
      <div className="stats mt-sm">
        <div>
          <div className="stat-label">Total Buy-ins</div>
          <div className="stat-value">{formatMoney(player.totalBuyIns)}</div>
        </div>
        <div>
          <div className="stat-label">Total Cash-outs</div>
          <div className="stat-value">{formatMoney(player.totalCashOuts)}</div>
        </div>
        <div>
          <div className="stat-label">Net Profit</div>
          <div className={`stat-value ${color}`}>{formatSigned(player.netProfits, false)}</div>
        </div>
        <div>
          <div className="stat-label">Games Played</div>
          <div className="stat-value">{player.gamesPlayed}</div>
        </div>
      </div>
    </div>
  );
};
