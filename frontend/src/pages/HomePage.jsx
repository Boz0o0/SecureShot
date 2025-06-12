import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import useNoScroll from '../hooks/useNoScroll';
import supabase from '../services/supabaseClient';

const navButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.95rem',
  background: 'none',
  border: '1px solid #6366f1',
  color: '#6366f1',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useNoScroll();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Chargement...
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 0,
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden', // empêche débordements décoratifs
      }}
    >
      {/* Fullscreen Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
          zIndex: -1,
          overflow: 'hidden', // empêche débordement décorations
        }}
      >
        {/* Decorative shapes */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            maxWidth: '100vw',
            maxHeight: '100vh',
            backgroundColor: '#3b82f6',
            opacity: 0.1,
            transform: 'rotate(45deg)',
            borderRadius: '2rem',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-120px',
            width: '350px',
            height: '350px',
            maxWidth: '100vw',
            maxHeight: '100vh',
            backgroundColor: '#ec4899',
            opacity: 0.1,
            transform: 'rotate(-30deg)',
            borderRadius: '1rem',
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            backgroundColor: '#10b981',
            opacity: 0.1,
            transform: 'translate(-50%, -50%) rotate(15deg)',
            borderRadius: '50%',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Navbar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '1rem 2rem',
          display: 'flex',
          gap: '1rem',
          zIndex: 10,
          alignItems: 'center',
        }}
      >
        {!user ? (
          <>
            <button onClick={() => navigate('/register')} style={navButtonStyle}>
              Créer un compte
            </button>
            <button onClick={() => navigate('/login')} style={navButtonStyle}>
              Connexion
            </button>
          </>
        ) : (
          <UserMenu />
        )}
      </div>

      {/* Page Content */}
      <div
        style={{
          padding: '4rem 2rem 8rem', // bottom padding pour laisser place au footer
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e5e7eb',
          textAlign: 'center',
          flexGrow: 1, // prend tout l'espace vertical restant
          gap: '1rem',
        }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
          SecureShot
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '2rem' }}>
          La plateforme sécurisée pour vendre vos photos en ligne.
        </p>

        <button
          onClick={() => navigate(user ? '/gallery' : '/login')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '500',
            color: '#fff',
            background: 'linear-gradient(to right, #6366f1, #3b82f6)',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          Accéder à la galerie
        </button>

        {/* Nouveau bouton pour redemption */}
        <button
          onClick={() => navigate(user ? '/redeem' : '/login')}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '500',
            color: '#fff',
            background: 'linear-gradient(to right, #ec4899, #f43f5e)',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          Redeem a Picture
        </button>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280',
          width: '100%',
          padding: '1rem 0',
          borderTop: '1px solid #374151',
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        © {new Date().getFullYear()} SecureShot — Tous droits réservés.
      </footer>
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: '1.3rem',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
        title="Menu utilisateur"
      >
        👤
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: 0,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            minWidth: '150px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            zIndex: 999,
          }}
        >
          <button
            onClick={() => {
              setOpen(false);
              navigate('/settings');
            }}
            style={menuItemStyle}
          >
            Paramètres
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate('/dashboard');
            }}
            style={menuItemStyle}
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{
              ...menuItemStyle,
              color: '#f87171',
              borderTop: '1px solid #374151',
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  color: 'white',
  fontSize: '0.95rem',
  cursor: 'pointer',
};
