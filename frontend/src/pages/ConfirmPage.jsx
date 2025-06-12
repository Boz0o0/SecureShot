import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

export default function ConfirmPage() {
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get('image');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Scroll désactivé
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Récupération de l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 0,
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Fond flou décoratif */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
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

      {/* Bouton retour menu principal */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '2rem',
          padding: '0.5rem 1rem',
          fontSize: '0.95rem',
          background: 'none',
          border: '1px solid #6366f1',
          color: '#6366f1',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        ⬅ Menu principal
      </button>

      {/* Bouton utilisateur */}
      {user && (
        <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 10 }}>
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
      )}

      {/* Message principal */}
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#e5e7eb' }}>
        ✅ Paiement réussi !
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#d1d5db', maxWidth: '500px' }}>
        Merci pour votre achat. Vous pouvez maintenant accéder à votre photo :
      </p>

      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: '1.5rem',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 600,
          background: 'linear-gradient(to right, #10b981, #22c55e)',
          color: 'white',
          borderRadius: '0.75rem',
          textDecoration: 'none',
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
        }}
      >
        Voir l’image
      </a>
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
