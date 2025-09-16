import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { usePoker } from '../state/PokerContext';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { activeGame } = usePoker();
  const label = location.pathname === '/' ? 'View Active Game' : 'View Players';
  const toggle = () => {
    if (location.pathname === '/') navigate('/game');
    else navigate('/');
  };
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="container row between center">
          <h1 className="brand">
            <Link to="/" className="brand-link" aria-label="Home">
              <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3l9 8h-3v8h-5v-5H11v5H6v-8H3l9-8z"/></svg>
              Poker Tracker
            </Link>
          </h1>
          <div className="row gap-sm">
            {activeGame && (
              <button className="btn btn-primary" onClick={toggle}>{label}</button>
            )}
            <button className="btn" onClick={() => navigate('/logs')}>Logs</button>
          </div>
        </div>
      </header>
      <main className="container pad-md">
        <Outlet />
      </main>
    </div>
  );
};

