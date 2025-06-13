import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import useAuth from '../hooks/useAuth';

export default function PaymentPage() {
  const { photoId } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const paypalRef = useRef(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      console.log("📸 Chargement des infos de la photo pour photo_id =", photoId);
      
      const { data, error } = await supabase
        .from('photos')
        .select(`
          id,
          storage_path,
          photo_id,
          price,
          photographer_id,
          photographer:profiles!photos_photographer_id_fkey(paypal_email)
        `)
        .eq('photo_id', parseInt(photoId))
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
      }

      if (!data) {
        console.warn('⚠️ Aucune donnée reçue de Supabase');
        alert('Photo non trouvée');
        navigate('/redeem');
        return;
      }

      console.log('✅ Photo reçue de Supabase :', data);
      console.log('📧 Email PayPal du photographe :', data?.photographer?.paypal_email ?? 'Non défini');
      console.log('🧑 ID photographe:', data.photographer_id);

      setPhoto(data);
      setLoading(false);
    };

    fetchPhoto();
  }, [photoId, navigate]);

  useEffect(() => {
    if (!photo) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const maxWidth = 350;
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx.filter = 'blur(10px)';
      tempCtx.drawImage(img, 0, 0, width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0);
      canvas.style.borderRadius = '1rem';
      canvas.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    };
  }, [photo]);

  useEffect(() => {
    if (!photo) return;

    const loadPayPal = async () => {
      if (!photo?.photographer?.paypal_email) {
        console.warn("❌ Pas d'email PayPal défini pour le photographe.");
        alert("Le vendeur n'a pas configuré son adresse PayPal.");
        return;
      }

      console.log("🚀 Paiement PayPal pour :", {
        prix: photo.price,
        photo_id: photo.photo_id,
        email_paypal: photo.photographer.paypal_email
      });

      if (window.paypal) {
        renderPayPal();
      } else {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=EUR`;
        script.onload = renderPayPal;
        document.body.appendChild(script);
      }
    };

    const renderPayPal = () => {
      if (!photo?.photographer?.paypal_email) return;

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: photo.price.toFixed(2) },
              description: `Achat photo #${photo.photo_id}`,
              payee: {
                email_address: photo.photographer.paypal_email,
              },
            }],
          });
        },
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();
          alert(`Paiement réussi ! Merci ${details.payer.name.given_name}`);
          const fullImageUrl = `https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`;
          navigate(`/confirm?image=${encodeURIComponent(fullImageUrl)}&photo_id=${photo.id}&storage_path=${photo.storage_path}`);
        },
        onError: (err) => {
          console.error('Erreur PayPal:', err);
          alert('Erreur pendant le paiement.');
        }
      }).render(paypalRef.current);
    };

    loadPayPal();
  }, [photo, navigate]);

  if (loading || authLoading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.background}>
        <div style={styles.shapeBlue} />
        <div style={styles.shapePink} />
        <div style={styles.shapeGreen} />
      </div>

      <div style={styles.navbar}>
        <button onClick={() => navigate('/')} style={navButtonStyle}>⬅ Accueil</button>
        {user && <UserMenu />}
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Finalisez votre paiement</h1>
        <canvas ref={canvasRef} alt="Preview floutée" style={styles.previewCanvas} />
        <div style={styles.paymentInfo}>
          <p style={styles.price}>Prix : {photo.price.toFixed(2)} €</p>
          <div ref={paypalRef} style={{ marginTop: '1rem' }} />
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...styles.userButton,
          ...(hover ? { background: '#2563eb' } : {}),
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
  userButton: {
    fontSize: '1.3rem',
    background: '#3b82f6',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    padding: '0.3rem 0.7rem',
    transition: 'background-color 0.3s ease',
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
  content: {
    textAlign: 'center',
    color: '#e5e7eb',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    alignItems: 'center',
    maxWidth: '400px',
    width: '90%',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
  },
  previewCanvas: {
    borderRadius: '1rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  paymentInfo: {
    marginTop: '1rem',
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: '600',
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
