import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import UserMenu from '../components/UserMenu.jsx';
import useAuth from '../hooks/useAuth';
import supabase from '../services/supabaseClient';
import '../styles/pages/PaymentPage.css';

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
      toast.loading("Chargement des infos de la photo...", { id: 'loadingPhoto' });

      const { data, error } = await supabase
        .from('photos')
        .select(`
          id,
          storage_path,
          photo_id,
          price,
          photographer_id,
          photographer:profiles(paypal_email)
        `)
        .eq('photo_id', parseInt(photoId))
        .limit(1)
        .single();

      toast.dismiss('loadingPhoto');

      if (error) {
        toast.error('Erreur Supabase: ' + error.message);
        return;
      }

      if (!data) {
        toast.error('Photo non trouvée');
        navigate('/redeem');
        return;
      }

      toast.success('Photo chargée');
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
        toast.error("Le vendeur n'a pas configuré son adresse PayPal.");
        return;
      }

      toast.loading("Chargement du bouton PayPal...", { id: 'loadingPayPal' });

      if (window.paypal) {
        renderPayPal();
      } else {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=EUR`;
        script.onload = () => {
          toast.dismiss('loadingPayPal');
          renderPayPal();
        };
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
          try {
            const details = await actions.order.capture();
            toast.success(`Paiement réussi ! Merci ${details.payer.name.given_name}`);
            const fullImageUrl = `https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`;
            navigate(`/confirm?image=${encodeURIComponent(fullImageUrl)}&photo_id=${photo.id}&storage_path=${photo.storage_path}`);
          } catch {
            toast.error('Erreur lors de la confirmation du paiement.');
          }
        },
        onError: (err) => {
          toast.error('Erreur pendant le paiement:', err);
        }
      }).render(paypalRef.current);
    };

    loadPayPal();
  }, [photo, navigate]);

  if (loading || authLoading) {
    return (
      <div className="payment-page__loading">
        <div className="payment-page__loading-spinner">⏳</div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="payment-page">
        <div className="payment-page__background"></div>

        <div className="payment-page__navbar">
          <button 
            onClick={() => navigate('/')} 
            className="payment-page__nav-button"
          >
            ⬅ Accueil
          </button>
          {user && <UserMenu />}
        </div>

        <div className="payment-page__content">
          <h1 className="payment-page__title">Finalisez votre paiement</h1>
          <canvas 
            ref={canvasRef} 
            alt="Preview floutée" 
            className="payment-page__preview-canvas" 
          />
          <div className="payment-page__payment-info">
            <p className="payment-page__price">Prix : {photo.price.toFixed(2)} €</p>
            <div ref={paypalRef} className="payment-page__paypal-container" />
          </div>
        </div>
      </div>
    </>
  );
}
