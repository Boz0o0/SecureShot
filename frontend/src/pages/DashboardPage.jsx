import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f, #1f2937)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>

      {/* Decorative Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', backgroundColor: '#3b82f6', opacity: 0.1, transform: 'rotate(45deg)', borderRadius: '2rem', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '350px', height: '350px', backgroundColor: '#ec4899', opacity: 0.1, transform: 'rotate(-30deg)', borderRadius: '1rem', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100px', height: '100px', backgroundColor: '#10b981', opacity: 0.1, transform: 'translate(-50%, -50%) rotate(15deg)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁 Mon Espace</h1>

      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#9ca3af' }}>
        Ici, vous pouvez ajouter de nouvelles photos à vendre.
      </p>

      <button
        onClick={() => navigate('/upload')}
        style={{
          background: 'linear-gradient(to right, #6366f1, #3b82f6)',
          border: 'none',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        ➕ Ajouter une photo
      </button>
    </div>
  );
}
