import React from 'react';
import type { Game } from '../types';
import { formatMoney, round2 } from '../utils/money';
import { useNavigate } from 'react-router-dom';

interface Props { games: Game[]; }

export const GameList: React.FC<Props> = ({ games }) => {
  const navigate = useNavigate();
  const ended = [...games]
    .filter(g => !g.isActive || !!g.endedAt)
    .sort((a,b)=> {
      const ad = new Date(a.endedAt ?? a.date).getTime();
      const bd = new Date(b.endedAt ?? b.date).getTime();
      return bd - ad;
    });

  if (!ended.length) return <div className="muted">No past games yet.</div>;

  const summary = (g: Game) => {
    const totalBuyIns = round2(g.players.reduce((s,p)=>s+p.buyIn,0));
    const totalCashOuts = round2(g.players.reduce((s,p)=>s+(p.cashOut ?? 0),0));
    const diff = round2(totalBuyIns - totalCashOuts);
    return { totalBuyIns, totalCashOuts, diff };
  };

  return (
    <div className="grid">
      {ended.map(g => {
        const s = summary(g);
        return (
          <div key={g.id} className="card">
            <div className="row between center mb-sm">
              <div className="h3">{new Date(g.date).toLocaleString()}</div>
              <button className="btn btn-primary" onClick={()=>navigate(`/logs/${g.id}`)}>View Ledger</button>
            </div>
            <div className="stats small">
              <div>
                <div className="stat-label">Players</div>
                <div className="stat-value">{g.players.length}</div>
              </div>
              <div>
                <div className="stat-label">Buy-ins</div>
                <div className="stat-value">{formatMoney(s.totalBuyIns)}</div>
              </div>
              <div>
                <div className="stat-label">Cash-outs</div>
                <div className="stat-value">{formatMoney(s.totalCashOuts)}</div>
              </div>
              <div>
                <div className="stat-label">Difference</div>
                <div className={`stat-value ${s.diff===0? 'green':''}`}>{formatMoney(s.diff)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};
