import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import supabase from '../services/supabaseClient';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ photos: 0, ventes: 0, revenus: 0 });

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (user) fetchStats();
  }, [user, loading]);

  const fetchStats = async () => {
    const userId = user.id;

    // Nombre de photos
    const { count: photoCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('photographer_id', userId);

    // Nombre de ventes
    const { count: venteCount } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('photographer_id', userId);

    // Revenu total
    const { data: revenueData } = await supabase
      .rpc('total_revenue_for_user', { p_user_id: userId });

    setStats({
      photos: photoCount || 0,
      ventes: venteCount || 0,
      revenus: revenueData?.[0]?.total || 0
    });
  };

  if (loading || !user) return null;

  const pseudo = user.user_metadata?.pseudo || 'utilisateur';

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      {/* Fullscreen background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0f0f, #1e293b)',
          zIndex: -1,
        }}
      >
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', backgroundColor: '#3b82f6', opacity: 0.1, transform: 'rotate(45deg)', borderRadius: '2rem', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '350px', height: '350px', backgroundColor: '#ec4899', opacity: 0.1, transform: 'rotate(-30deg)', borderRadius: '1rem', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100px', height: '100px', backgroundColor: '#10b981', opacity: 0.1, transform: 'translate(-50%, -50%) rotate(15deg)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      <div style={{ padding: '2rem', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁 Mon Espace</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#9ca3af' }}>
          Bonjour <strong>{pseudo}</strong> ! Voici un aperçu de votre activité :
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <StatCard title="📸 Photos mises en ligne" value={stats.photos} />
          <StatCard title="🛒 Ventes" value={stats.ventes} />
          <StatCard title="💰 Revenus (€)" value={stats.revenus.toFixed(2)} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/upload')} style={actionButtonStyle}>
            ➕ Ajouter une photo
          </button>
          <button onClick={() => navigate('/gallery')} style={actionButtonStyle}>
            🌐 Voir la galerie
          </button>
          <button onClick={() => navigate('/my-purchases')} style={actionButtonStyle}>
            🎟️ Mes ventes
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid #334155',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#9ca3af' }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{value}</div>
    </div>
  );
}

const actionButtonStyle = {
  background: 'linear-gradient(to right, #6366f1, #3b82f6)',
  border: 'none',
  color: 'white',
  padding: '0.75rem 1.5rem',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
};
