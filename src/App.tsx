import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Game, GamePlayer, Group, Player } from './types';
import { PlayerList } from './components/PlayerList';
import { GameTracker } from './components/GameTracker';
import { GameList } from './components/GameList';
import { GameLedger } from './components/GameLedger';

type View = 'players' | 'game' | 'logs' | 'ledger';

interface AppProps {
  view?: View;
  ledgerId?: string;
}

export function App({ view = 'players', ledgerId }: AppProps) {
  const navigate = useNavigate();
  // Namespace localStorage per-browser install so each visitor gets a unique vault.
  const [profileId] = useState<string>(() => {
    const key = 'pokerProfileId';
    const current = localStorage.getItem(key);
    if (current) return current;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  });
  const k = (name: string) => `poker:${profileId}:${name}`;
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Resolve active game by explicit id if available; otherwise fall back to
  // whatever game is flagged active. This makes Start Game robust even if
  // navigation/render happens before the id state update commits.
  const activeGame = useMemo(() => {
    const byId = activeGameId ? games.find(g => g.id === activeGameId) : null;
    return byId ?? games.find(g => g.isActive) ?? null;
  }, [games, activeGameId]);

  // Load
  useEffect(() => {
    try {
      const p = localStorage.getItem(k('players'));
      const g = localStorage.getItem(k('groups'));
      const gm = localStorage.getItem(k('games'));
      const ag = localStorage.getItem(k('activeGameId'));
      if (p) setPlayers(JSON.parse(p));
      if (g) setGroups(JSON.parse(g));
      if (gm) setGames(JSON.parse(gm));
      if (ag) setActiveGameId(ag);
    } catch {}
  }, [profileId]);

  // Persist
  useEffect(() => {
    localStorage.setItem(k('players'), JSON.stringify(players));
  }, [players, profileId]);
  useEffect(() => {
    localStorage.setItem(k('groups'), JSON.stringify(groups));
  }, [groups, profileId]);
  useEffect(() => {
    localStorage.setItem(k('games'), JSON.stringify(games));
    if (activeGameId) localStorage.setItem(k('activeGameId'), activeGameId);
    else localStorage.removeItem(k('activeGameId'));
  }, [games, activeGameId, profileId]);

  // Player CRUD
  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      totalBuyIns: 0,
      totalCashOuts: 0,
      netProfits: 0,
      gamesPlayed: 0,
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const renamePlayer = (id: string, newName: string) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, name: newName } : p)));
    // reflect in active game if present
    if (activeGame) {
      const updated: Game = {
        ...activeGame,
        players: activeGame.players.map(seat =>
          seat.playerId === id ? { ...seat, name: newName } : seat
        ),
      };
      setGames(prev => prev.map(g => (g.id === updated.id ? updated : g)));
    }
  };

  const deletePlayer = (id: string) => {
    if (activeGame && activeGame.players.some(seat => seat.playerId === id && seat.isActive)) {
      alert('Cannot delete a player who is currently active in a game.');
      return;
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
    // Remove from groups
    setGroups(prev => prev.map(g => ({ ...g, playerIds: g.playerIds.filter(pid => pid !== id) })));
  };

  const createGroup = (name: string, playerIds: string[]) => {
    const newGroup: Group = { id: crypto.randomUUID(), name, playerIds };
    setGroups(prev => [...prev, newGroup]);
  };

  // Game lifecycle
  const startGame = (initialPlayers: GamePlayer[]) => {
    if (initialPlayers.length < 2) {
      alert('Need at least 2 players to start a game.');
      return;
    }
    const newGame: Game = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      isActive: true,
      players: initialPlayers,
    };
    setGames(prev => [...prev, newGame]);
    setActiveGameId(newGame.id);
    navigate('/game');
  };

  const addPlayerToGame = (playerId: string, buyIn: number) => {
    if (!activeGame) return;
    const p = players.find(pp => pp.id === playerId);
    if (!p) return;
    const gp: GamePlayer = { playerId, name: p.name, buyIn, cashOut: null, isActive: true };
    const updated: Game = { ...activeGame, players: [...activeGame.players, gp] };
    setGames(prev => prev.map(g => (g.id === updated.id ? updated : g)));
  };

  const updateBuyIn = (playerId: string, additionalAmount: number) => {
    if (!activeGame) return;
    const updated: Game = {
      ...activeGame,
      players: activeGame.players.map(p =>
        p.playerId === playerId ? { ...p, buyIn: p.buyIn + additionalAmount } : p
      ),
    };
    setGames(prev => prev.map(g => (g.id === updated.id ? updated : g)));
  };

  const leaveTable = (playerId: string, cashOut: number) => {
    if (!activeGame) return;
    const updated: Game = {
      ...activeGame,
      players: activeGame.players.map(p =>
        p.playerId === playerId ? { ...p, cashOut, isActive: false } : p
      ),
    };
    setGames(prev => prev.map(g => (g.id === updated.id ? updated : g)));
  };

  const endGame = () => {
    if (!activeGame) return;
    const endedGameId = activeGame.id;
    const allCashedOut = activeGame.players.every(p => !p.isActive || p.cashOut !== null);
    if (!allCashedOut) {
      alert('All active players must cash out first.');
      return;
    }
    // Apply results to lifetime stats
    const updatedPlayers = players.map(pl => {
      const seat = activeGame.players.find(gp => gp.playerId === pl.id);
      if (!seat) return pl;
      const buyIn = seat.buyIn;
      const cashOut = seat.cashOut ?? 0;
      const profit = cashOut - buyIn;
      return {
        ...pl,
        totalBuyIns: pl.totalBuyIns + buyIn,
        totalCashOuts: pl.totalCashOuts + cashOut,
        netProfits: pl.netProfits + profit,
        gamesPlayed: pl.gamesPlayed + 1,
      };
    });
    setPlayers(updatedPlayers);
    setGames(prev =>
      prev.map(g => (g.id === activeGame.id ? { ...g, isActive: false, endedAt: new Date().toISOString() } : g))
    );
    setActiveGameId(null);
    navigate(`/logs/${endedGameId}`);
  };

  // Header nav button label
  const headerSecondaryLabel = view === 'players' ? 'View Active Game' : 'View Players';
  const headerSecondaryAction = () => {
    if (view === 'players') navigate('/game');
    else navigate('/');
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="container row between center">
          <h1 className="brand">
            <Link to="/" className="brand-link" aria-label="Home">
              <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 3l9 8h-3v8h-5v-5H11v5H6v-8H3l9-8z"/>
              </svg>
              Poker Tracker
            </Link>
          </h1>
          {activeGame && (
            <button className="btn btn-primary" onClick={headerSecondaryAction}>
              {headerSecondaryLabel}
            </button>
          )}
          <button className="btn" onClick={() => navigate('/logs')}>Logs</button>
        </div>
      </header>

      <main className="container pad-md">
        {view === 'players' ? (
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
        ) : view === 'game' ? (
          <GameTracker
            activeGame={activeGame}
            players={players}
            addPlayerToGame={addPlayerToGame}
            updateBuyIn={updateBuyIn}
            leaveTable={leaveTable}
            endGame={endGame}
          />
        ) : view === 'logs' ? (
          <GameList games={games} />
        ) : (
          <GameLedger
            game={games.find(g => g.id === ledgerId) ?? null}
            onClose={() => navigate('/')}
          />
        )}
      </main>
    </div>
  );
}
