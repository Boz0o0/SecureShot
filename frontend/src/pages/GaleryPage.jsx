import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import supabase from '../services/supabaseClient';
import UserMenu from '../components/UserMenu.jsx';
import '../styles/pages/GalleryPage.css';

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
      .select('id, storage_path, description, uploader_username, price, created_at')
      .eq('uploader_username', user.user_metadata?.pseudo);

    if (search.trim() !== '') {
      query = query.or(`description.ilike.%${search}%,uploader_username.ilike.%${search}%`);
    }

    // Appliquer tri
    switch (sortBy) {
      case 'date_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'date_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('description', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('description', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur Supabase :', error.message);
      alert('Erreur Supabase : ' + error.message);
    } else {
      setPhotos(data);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="gallery-page">
      <div className="gallery-page__background"></div>
      
      <div className="gallery-page__user-menu">
        <UserMenu />
      </div>

      <h1 className="gallery-page__title">Galerie Photos</h1>

      <div className="gallery-page__filters">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field gallery-page__search"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field gallery-page__sort"
        >
          <option value="date_desc">📅 Récentes</option>
          <option value="date_asc">📅 Anciennes</option>
          <option value="name_asc">🔤 A-Z</option>
          <option value="name_desc">🔤 Z-A</option>
        </select>
      </div>

      <div className="gallery-page__grid">
        {photos.map((photo) => (
          <div key={photo.id} className="gallery-page__photo-card glass-container">
            <img
              src={`https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`}
              alt={photo.description}
              className="gallery-page__photo-image image-hover"
              onClick={() => window.open(`https://lgiqlrliauiubrupuxjg.supabase.co/storage/v1/object/public/photos/${photo.storage_path}`, '_blank')}
              title="Cliquez pour ouvrir en plein écran"
            />
            <div className="gallery-page__photo-info">
              <p className="gallery-page__photo-description" title={photo.description || 'Aucune description'}>
                {photo.description || 'Aucune description'}
              </p>
              <p className="gallery-page__photo-photographer" title={`Photographe : ${photo.uploader_username}`}>
                📸 Photographe : <strong>{photo.uploader_username}</strong>
              </p>
              <p className="gallery-page__photo-price">
                💰 Prix : {photo.price?.toFixed(2)} €
              </p>
              <p className="gallery-page__photo-date">
                🕒 {new Date(photo.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
