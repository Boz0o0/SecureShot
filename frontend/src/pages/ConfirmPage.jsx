import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import UserMenu from '../components/UserMenu';
import '../styles/pages/ConfirmPage.css'; // Ajoute ici ton CSS spécifique ConfirmPage

export default function ConfirmPage() {
  const [searchParams] = useSearchParams();
  const imageUrl = searchParams.get('image');
  const photoId = searchParams.get('photo_id');
  const storagePath = searchParams.get('storage_path');

  const navigate = useNavigate();
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

      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        toast.error("Erreur suppression BDD : " + deleteError.message);
        return;
      }
    };

    buyPhotoAndDelete();
  }, [photoId, storagePath, user]);

  const handleDownload = async () => {
    if (!imageUrl) {
      toast.error("URL de l'image introuvable.");
      return;
    }
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('Erreur réseau');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erreur lors du téléchargement.");
    }
  };

  return (
    <div className="confirm-page-container">
      <Toaster position="top-center" />

      <div className="background-blur">
        <div className="blur-blue" />
        <div className="blur-pink" />
        <div className="blur-green" />
      </div>

      <button onClick={() => navigate('/')} className="nav-button">
        ⬅ Menu principal
      </button>

      {user && (
        <div className="user-menu-position">
          <UserMenu />
        </div>
      )}

      <h1 className="confirm-title">✅ Paiement réussi !</h1>
      <p className="confirm-text">
        Merci pour votre achat. Vous pouvez maintenant accéder à votre photo :
      </p>

      <div className="confirm-actions">
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="view-button"
        >
          Voir l’image
        </a>

        <button onClick={handleDownload} className="download-button">
          Télécharger l’image
        </button>
      </div>
    </div>
  );
}
