import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import useAuth from '../hooks/useAuth';

export default function RedeemPage() {
  const [photoId, setPhotoId] = useState('');
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleRedeem = async () => {
    if (!/^\d{1,6}$/.test(photoId)) {
      alert('Code invalide. Le code doit contenir entre 1 et 6 chiffres.');
      return;
    }
    const { data: photo, error } = await supabase
      .from('photos')
      .select('*')
      .eq('photo_id', parseInt(photoId))
      .single();
    if (error || !photo) {
      alert('Aucune photo trouvée avec ce code.');
      return;
    }
    const publicUrl = `https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`;
    window.open(publicUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Background décoratif */}
      <div style={styles.background}>
        <div style={styles.shapeBlue} />
        <div style={styles.shapePink} />
        <div style={styles.shapeGreen} />
      </div>

      {/* Navbar */}
      <div style={styles.navbar}>
        <button onClick={() => navigate('/')} style={navButtonStyle}>
          ⬅ Accueil
        </button>
        {user && <UserMenu />}
      </div>

      {/* Contenu principal */}
      <div style={styles.content}>
        <h1 style={styles.title}>Réclamer une photo</h1>
        <input
          type="text"
          maxLength={6}
          value={photoId}
          onChange={(e) => setPhotoId(e.target.value)}
          placeholder="Entrez le code à 6 chiffres"
          style={styles.input}
        />
        <button onClick={handleRedeem} style={styles.button}>
          🎁 Redeem
        </button>
      </div>
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
        <div style={styles.userMenu}>
          <button onClick={() => { setOpen(false); navigate('/settings'); }} style={menuItemStyle}>
            Paramètres
          </button>
          <button onClick={() => { setOpen(false); navigate('/dashboard'); }} style={menuItemStyle}>
            Dashboard
          </button>
          <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#f87171', borderTop: '1px solid #374151' }}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

const navButtonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.95rem',
  background: 'none',
  border: '1px solid #6366f1',
  color: '#6366f1',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

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

const styles = {
  page: {
    position: 'relative',
    fontFamily: 'system-ui, sans-serif',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
    zIndex: -1,
  },
  shapeBlue: {
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
  },
  shapePink: {
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
  },
  shapeGreen: {
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
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    textAlign: 'center',
    color: '#e5e7eb',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
  },
  input: {
    padding: '0.75rem 1.25rem',
    fontSize: '1.1rem',
    borderRadius: '0.75rem',
    border: '1px solid #4b5563',
    background: '#1f2937',
    color: '#f9fafb',
    width: '250px',
    textAlign: 'center',
  },
  button: {
    padding: '0.9rem 2rem',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#fff',
    background: 'linear-gradient(to right, #6366f1, #3b82f6)',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  },
  userMenu: {
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
  },
  loading: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
  },
};
