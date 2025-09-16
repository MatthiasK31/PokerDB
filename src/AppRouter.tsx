import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PokerProvider } from './state/PokerContext';
import { MainLayout } from './layouts/MainLayout';
import { PlayersPage } from './pages/PlayersPage';
import { GamePage } from './pages/GamePage';
import { LogsPage } from './pages/LogsPage';
import { LedgerPage } from './pages/LedgerPage';

// Lightweight router wrapper. The App component renders the two main views
// (Players and Active Game) based on the current route.
export function AppRouter() {
  return (
    <BrowserRouter>
      <PokerProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<PlayersPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/logs/:id" element={<LedgerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PokerProvider>
    </BrowserRouter>
  );
}
