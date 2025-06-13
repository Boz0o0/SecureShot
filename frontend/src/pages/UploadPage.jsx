import { useState } from 'react';
import supabase from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNoScroll from '../hooks/useNoScroll';
import UserMenu from '../components/UserMenu.jsx';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/pages/UploadPage.css';

export default function UploadPage() {
  useNoScroll();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name || !price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setUploading(true);

    // Étape 1 : Récupérer ou créer une session liée au photographe
    let sessionId;
    const { data: existingSessions, error: sessionFetchError } = await supabase
      .from('sessions')
      .select('id')
      .eq('photographer_id', user.id)
      .limit(1);

    if (sessionFetchError) {
      toast.error("Erreur lors de la récupération de la session : " + sessionFetchError.message);
      setUploading(false);
      return;
    }

    if (existingSessions.length > 0) {
      sessionId = existingSessions[0].id;
    } else {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: newSession, error: sessionCreateError } = await supabase
        .from('sessions')
        .insert({
          code: newCode,
          photographer_id: user.id,
          price: 10,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .select();

      if (sessionCreateError || !newSession || newSession.length === 0) {
        toast.error("Erreur lors de la création de la session : " + (sessionCreateError?.message || "inconnue"));
        setUploading(false);
        return;
      }

      sessionId = newSession[0].id;
    }

    // Étape 2 : Upload fichier dans Supabase Storage
    const filePath = `${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (storageError) {
      toast.error('Erreur lors de l\'upload : ' + storageError.message);
      setUploading(false);
      return;
    }

    // Étape 3 : Insertion dans la table photos avec pseudo et prix
    const { error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          storage_path: filePath,
          description,
          session_id: sessionId,
          uploader_username: user.user_metadata?.pseudo || 'inconnu',
          price: parseFloat(price),
          photographer_id: user.id,
        },
      ]);

    if (dbError) {
      toast.error(`Erreur en base de données : ${dbError.message}`);
    } else {
      toast.success('✅ Photo uploadée !');
      navigate('/gallery');
    }

    setUploading(false);
  };

  if (loading) return null;
  if (!user) return navigate('/login');

  return (
    <div className="upload-page">
      <Toaster position="top-center" toastOptions={{ duration: 4000, className: 'react-hot-toast' }} />
      <div className="upload-page__background"></div>
      <div className="upload-page__user-menu">
        <UserMenu />
      </div>

      <h1 className="upload-page__title">➕ Ajouter une photo</h1>

      <form onSubmit={handleUpload} className="upload-page__form glass-container">
        <input
          type="text"
          placeholder="Nom de l'image"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-field"
        />

        <textarea
          placeholder="Description (ajoutez des #tags si besoin)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea-field"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Prix (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="input-field"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="file-input"
        />

        <button
          type="submit"
          disabled={uploading}
          className="btn-gradient upload-page__button"
        >
          {uploading ? '📤 Envoi en cours...' : '📸 Uploader'}
        </button>
      </form>
    </div>
  );
}
