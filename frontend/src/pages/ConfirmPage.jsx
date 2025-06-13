import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export default function ConfirmPage() {
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get('image');
  const photoId = searchParams.get('photo_id');
  const storagePath = searchParams.get('storage_path');

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const buyPhotoAndDelete = async () => {
      if (!photoId || !storagePath) {
        toast.error("Paramètres manquants.");
        return;
      }
      if (!user) return;

      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .select('id, photographer_id, price')
        .eq('id', photoId)
        .single();

      if (photoError || !photoData) {
        toast.error("Erreur récupération photo : " + (photoError?.message || "photo introuvable"));
        return;
      }

      toast.success('📸 Photo récupérée avec succès.');

      const { data: insertData, error: insertError } = await supabase
        .from('sales')
        .insert([
          {
            photo_id: photoData.id,
            buyer_id: user.id,
            seller_id: photoData.photographer_id,
            amount: photoData.price,
            sale_date: new Date().toISOString()
          },
        ])
        .select();

      if (insertError) {
        toast.error("Erreur enregistrement de la vente : " + insertError.message);
        return;
      }

      toast.success('✅ Vente enregistrée.');

      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        toast.error("Erreur suppression BDD : " + deleteError.message);
        return;
      }

      toast.success('🗑 Photo supprimée avec succès.');
      toast.success('✅ Achat et transfert vers sales réussis !');
    };

    buyPhotoAndDelete();
  }, [photoId, storagePath, user]);

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
      <Toaster position="top-center" />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        <div style={blurBox('#3b82f6', '-100px', '-100px', '300px', '300px', 80)} />
        <div style={blurBox('#ec4899', '-120px', '-120px', '350px', '350px', 100)} />
        <div style={blurBox('#10b981', '50%', '50%', '100px', '100px', 50, true)} />
      </div>

      <button onClick={() => navigate('/')} style={navButtonStyle}>
        ⬅ Menu principal
      </button>

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
            <div style={userMenuStyle}>
              <button onClick={() => { setOpen(false); navigate('/settings'); }} style={menuItemStyle}>Paramètres</button>
              <button onClick={() => { setOpen(false); navigate('/dashboard'); }} style={menuItemStyle}>Dashboard</button>
              <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#f87171', borderTop: '1px solid #374151' }}>Déconnexion</button>
            </div>
          )}
        </div>
      )}

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
        style={viewButtonStyle}
      >
        Voir l’image
      </a>
    </div>
  );
}

const navButtonStyle = {
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

const userMenuStyle = {
  position: 'absolute',
  top: '2.5rem',
  right: 0,
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  minWidth: '150px',
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
};

const viewButtonStyle = {
  marginTop: '1.5rem',
  padding: '1rem 2rem',
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(to right, #10b981, #22c55e)',
  color: 'white',
  borderRadius: '0.75rem',
  textDecoration: 'none',
  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
};

const blurBox = (color, top, left, w, h, blur, center = false) => ({
  position: 'absolute',
  top,
  left,
  width: w,
  height: h,
  backgroundColor: color,
  opacity: 0.1,
  transform: center
    ? 'translate(-50%, -50%) rotate(15deg)'
    : 'rotate(45deg)',
  borderRadius: '2rem',
  filter: `blur(${blur}px)`,
});
