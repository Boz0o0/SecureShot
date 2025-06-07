import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import supabase from '../services/supabaseClient';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchPhotos();
  }, [search, sortBy, user]);

  const fetchPhotos = async () => {
    let query = supabase
      .from('photos')
      .select('*'); // <-- tout sélectionner temporairement pour debug

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur Supabase :', error.message);
      alert('Erreur Supabase : ' + error.message);
    } else {
      console.log('✅ Données photos :', data);
      setPhotos(data);
    }
  };


  if (loading || !user) return null;

  return (
    <div style={{ position: 'relative', zIndex: 0, fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
          zIndex: -1,
        }}
      >
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', backgroundColor: '#3b82f6', opacity: 0.1, transform: 'rotate(45deg)', borderRadius: '2rem', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '350px', height: '350px', backgroundColor: '#ec4899', opacity: 0.1, transform: 'rotate(-30deg)', borderRadius: '1rem', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100px', height: '100px', backgroundColor: '#10b981', opacity: 0.1, transform: 'translate(-50%, -50%) rotate(15deg)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }}>
        <UserMenu />
      </div>

      <div
        style={{
          marginTop: '6rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '400px',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #334155',
            background: '#1e293b',
            color: 'white',
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            background: '#1e293b',
            color: 'white',
            border: '1px solid #475569',
            borderRadius: '0.5rem',
          }}
        >
          <option value="date_desc">📅 Récentes</option>
          <option value="date_asc">📅 Anciennes</option>
          <option value="name_asc">🔤 A-Z</option>
          <option value="name_desc">🔤 Z-A</option>
          <option value="popularity">🔥 Populaires</option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: '4rem',
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              background: '#1f2937',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              padding: '1rem',
              border: '1px solid #334155',
            }}
          >
            <img
              src={`https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`}
              alt={photo.description}
              style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              {photo.description || 'Aucune description'}
            </p>
          </div>
        ))}
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
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: 0,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            minWidth: '160px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            zIndex: 999,
          }}
        >
          <button onClick={() => navigate('/settings')} style={menuItemStyle}>
            Paramètres
          </button>
          <button onClick={() => navigate('/dashboard')} style={menuItemStyle}>
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
