import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Game, GamePlayer, Group, Player } from '../types';

interface PokerContextValue {
  players: Player[];
  groups: Group[];
  games: Game[];
  activeGame: Game | null;
  addPlayer: (name: string) => void;
  renamePlayer: (id: string, newName: string) => void;
  deletePlayer: (id: string) => void;
  createGroup: (name: string, playerIds: string[]) => void;
  startGame: (initialPlayers: GamePlayer[]) => void;
  addPlayerToGame: (playerId: string, buyIn: number) => void;
  updateBuyIn: (playerId: string, add: number) => void;
  leaveTable: (playerId: string, cashOut: number) => void;
  endGame: () => string | null; // returns ended game id
}

const PokerContext = createContext<PokerContextValue | undefined>(undefined);

export const PokerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const activeGame = useMemo(() => {
    const byId = activeGameId ? games.find(g => g.id === activeGameId) : null;
    return byId ?? games.find(g => g.isActive) ?? null;
  }, [games, activeGameId]);

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

  useEffect(() => { localStorage.setItem(k('players'), JSON.stringify(players)); }, [players, profileId]);
  useEffect(() => { localStorage.setItem(k('groups'), JSON.stringify(groups)); }, [groups, profileId]);
  useEffect(() => {
    localStorage.setItem(k('games'), JSON.stringify(games));
    if (activeGameId) localStorage.setItem(k('activeGameId'), activeGameId);
    else localStorage.removeItem(k('activeGameId'));
  }, [games, activeGameId, profileId]);

  const addPlayer = (name: string) => {
    const newPlayer: Player = { id: crypto.randomUUID(), name, totalBuyIns: 0, totalCashOuts: 0, netProfits: 0, gamesPlayed: 0 };
    setPlayers(p => [...p, newPlayer]);
  };

  const renamePlayer = (id: string, newName: string) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, name: newName } : p)));
    if (activeGame) {
      const updated: Game = { ...activeGame, players: activeGame.players.map(s => s.playerId === id ? { ...s, name: newName } : s) };
      setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
    }
  };

  const deletePlayer = (id: string) => {
    if (activeGame && activeGame.players.some(s => s.playerId === id && s.isActive)) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
    setGroups(prev => prev.map(g => ({ ...g, playerIds: g.playerIds.filter(pid => pid !== id) })));
  };

  const createGroup = (name: string, playerIds: string[]) => {
    const newGroup: Group = { id: crypto.randomUUID(), name, playerIds };
    setGroups(gs => [...gs, newGroup]);
  };

  const startGame = (initialPlayers: GamePlayer[]) => {
    if (initialPlayers.length < 2) return;
    const newGame: Game = { id: crypto.randomUUID(), date: new Date().toISOString(), isActive: true, players: initialPlayers };
    setGames(gs => [...gs, newGame]);
    setActiveGameId(newGame.id);
  };

  const addPlayerToGame = (playerId: string, buyIn: number) => {
    if (!activeGame) return;
    const p = players.find(pp => pp.id === playerId);
    if (!p) return;
    const seat: GamePlayer = { playerId, name: p.name, buyIn, cashOut: null, isActive: true };
    const updated: Game = { ...activeGame, players: [...activeGame.players, seat] };
    setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
  };

  const updateBuyIn = (playerId: string, add: number) => {
    if (!activeGame) return;
    const updated: Game = { ...activeGame, players: activeGame.players.map(p => p.playerId === playerId ? { ...p, buyIn: p.buyIn + add } : p) };
    setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
  };

  const leaveTable = (playerId: string, cashOut: number) => {
    if (!activeGame) return;
    const updated: Game = { ...activeGame, players: activeGame.players.map(p => p.playerId === playerId ? { ...p, cashOut, isActive: false } : p) };
    setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
  };

  const endGame = (): string | null => {
    if (!activeGame) return null;
    const allCashedOut = activeGame.players.every(p => !p.isActive || p.cashOut !== null);
    if (!allCashedOut) return null;
    const updatedPlayers = players.map(pl => {
      const seat = activeGame.players.find(gp => gp.playerId === pl.id);
      if (!seat) return pl;
      const buyIn = seat.buyIn;
      const cashOut = seat.cashOut ?? 0;
      const profit = cashOut - buyIn;
      return { ...pl, totalBuyIns: pl.totalBuyIns + buyIn, totalCashOuts: pl.totalCashOuts + cashOut, netProfits: pl.netProfits + profit, gamesPlayed: pl.gamesPlayed + 1 };
    });
    setPlayers(updatedPlayers);
    const endedId = activeGame.id;
    setGames(gs => gs.map(g => g.id === endedId ? { ...g, isActive: false, endedAt: new Date().toISOString() } : g));
    setActiveGameId(null);
    return endedId;
  };

  const value: PokerContextValue = { players, groups, games, activeGame, addPlayer, renamePlayer, deletePlayer, createGroup, startGame, addPlayerToGame, updateBuyIn, leaveTable, endGame };

  return <PokerContext.Provider value={value}>{children}</PokerContext.Provider>;
};

export function usePoker() {
  const ctx = useContext(PokerContext);
  if (!ctx) throw new Error('usePoker must be used within PokerProvider');
  return ctx;
}

