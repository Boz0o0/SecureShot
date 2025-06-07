import { useState } from 'react';
import supabase from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

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
    <div style={{ position: 'relative', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #0f0f0f, #1f2937)', color: 'white', padding: '4rem 2rem' }}>
      {/* Background shapes */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', backgroundColor: '#3b82f6', opacity: 0.1, transform: 'rotate(45deg)', borderRadius: '2rem', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '350px', height: '350px', backgroundColor: '#ec4899', opacity: 0.1, transform: 'rotate(-30deg)', borderRadius: '1rem', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100px', height: '100px', backgroundColor: '#10b981', opacity: 0.1, transform: 'translate(-50%, -50%) rotate(15deg)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>➕ Ajouter une photo</h1>

      <form onSubmit={handleUpload} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <input
          type="text"
          placeholder="Nom de l’image"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <textarea
          placeholder="Description (ajoutez des #tags si besoin)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: '100px' }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={uploading}
          style={{
            padding: '0.75rem',
            background: 'linear-gradient(to right, #6366f1, #3b82f6)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {uploading ? '📤 Envoi en cours...' : '📸 Uploader'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: '0.75rem 1rem',
  background: '#1e293b',
  border: '1px solid #334155',
  color: 'white',
  borderRadius: '0.5rem',
  fontSize: '1rem',
};
