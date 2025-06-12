import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import '../styles/globals.css';

function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="user-menu">
      <button
        onClick={() => setOpen(!open)}
        className="user-menu__button"
        title="Menu utilisateur"
      >
        👤
      </button>

      {open && (
        <div className="user-menu__dropdown glass-container">
          <button onClick={() => navigate('/settings')} className="user-menu__item">
            Paramètres
          </button>
          <button onClick={() => navigate('/dashboard')} className="user-menu__item">
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="user-menu__item user-menu__item--danger"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;