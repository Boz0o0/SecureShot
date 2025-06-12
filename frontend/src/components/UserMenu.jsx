import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import '../styles/globals.css';

function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`user-menu__button ${open ? 'user-menu__button--active' : ''}`}
        title="Menu utilisateur"
      >
        👤
      </button>

      {open && (
        <div className="user-menu__dropdown glass-container">
          <button onClick={() => navigate('/')} className="user-menu__item">
            Accueil
          </button>
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