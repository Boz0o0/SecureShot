import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import '../styles/pages/RedeemPage.css';
import UserMenu from '../components/UserMenu';

export default function RedeemPage() {
  const [photoId, setPhotoId] = useState('');
  const [isHover, setIsHover] = useState(false);
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
      toast.error('Code invalide. Le code doit contenir entre 1 et 6 chiffres.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('id, storage_path, photo_id')
        .eq('photo_id', parseInt(photoId));

      if (error) {
        toast.error("Erreur lors de la récupération : " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        toast.error('Aucune photo trouvée avec ce code.');
        return;
      }

      navigate(`/payment/${photoId}`);
    } catch (err) {
      toast.error("Une erreur inconnue est survenue.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Chargement...
      </div>
    );
  }

  return (
    <div className="page">
      {/* Background décoratif */}
      <div className="background">
        <div className="shapeBlue" />
        <div className="shapePink" />
        <div className="shapeGreen" />
      </div>

      {/* Navbar */}
      <div className="navbar">
        <button
          onClick={() => navigate('/')}
          className="navButton"
        >
          ⬅ Accueil
        </button>
        {user && <UserMenu />}
      </div>

      {/* Contenu principal */}
      <div className="content">
        <h1 className="title">Réclamer une photo</h1>
        <input
          type="text"
          maxLength={6}
          value={photoId}
          onChange={(e) => setPhotoId(e.target.value)}
          placeholder="Entrez le code à 6 chiffres"
          className="input"
        />
        <button
          onClick={handleRedeem}
          className="button"
        >
          🎁 Redeem
        </button>
      </div>
    </div>
  );
}
