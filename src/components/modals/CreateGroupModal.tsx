import React, { useState } from 'react';
import type { Player } from '../../types';

interface Props {
  players: Player[];
  onCreateGroup: (name: string, playerIds: string[]) => void;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<Props> = ({ players, onCreateGroup, onClose }) => {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="row between center mb-sm">
          <h3 className="h3">Create Group</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <label className="label">Group name</label>
        <input className="input mb-sm" value={name} onChange={e => setName(e.target.value)} />

        <div className="mb-sm">
          <div className="label">Select players</div>
          <div className="modal-list">
            {players.map(p => (
              <label key={p.id} className="modal-row">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggle(p.id)}
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="row right gap-sm">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!name.trim()) return;
              onCreateGroup(name.trim(), selected);
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
