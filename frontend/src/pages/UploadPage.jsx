import { useState } from 'react';
import supabase from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/pages/UploadPage.css';

export default function UploadPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name) return alert('Veuillez remplir tous les champs');

    setUploading(true);

    // Étape 1 : Récupère ou crée une session liée au photographe
    let sessionId;
    const { data: existingSessions, error: sessionFetchError } = await supabase
      .from('sessions')
      .select('id')
      .eq('photographer_id', user.id)
      .limit(1);

    if (sessionFetchError) {
      console.error('Erreur récupération session:', sessionFetchError.message);
      alert("Erreur lors de la récupération de la session");
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
          price: 10, // prix par défaut
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30j
        })
        .select();

      if (sessionCreateError || !newSession || newSession.length === 0) {
        console.error('Erreur création session:', sessionCreateError?.message);
        alert("Erreur lors de la création de la session");
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
      console.error('Erreur upload:', storageError.message);
      alert('Erreur lors de l\'upload');
      setUploading(false);
      return;
    }

    // Étape 3 : Insertion dans la table photos
    const { error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          storage_path: filePath,
          description,
          session_id: sessionId,
        },
      ]);

    if (dbError) {
      console.error('Erreur DB:', dbError);
      alert(`Erreur en base de données : ${dbError.message}`);
    } else {
      alert('✅ Photo uploadée !');
      navigate('/gallery');
    }

    setUploading(false);
  };

  if (loading) return null;
  if (!user) return navigate('/login');

  return (
    <div className="upload-page">
      {/* Background shapes */}
      <div className="upload-page__background">
        <div className="upload-page__shape-1"></div>
        <div className="upload-page__shape-2"></div>
        <div className="upload-page__shape-3"></div>
      </div>
      <button onClick={() => navigate('/dashboard')} className="btn-gradient upload-page__back-button">
        ← Retour au Dashboard
      </button>

      <h1 className="upload-page__title">➕ Ajouter une photo</h1>

      <form onSubmit={handleUpload} className="upload-page__form">
        <input
          type="text"
          placeholder="Nom de l'image"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="upload-page__input"
        />

        <textarea
          placeholder="Description (ajoutez des #tags si besoin)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="upload-page__textarea"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="upload-page__input"
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
