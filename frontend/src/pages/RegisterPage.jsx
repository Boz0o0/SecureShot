import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert('✅ Inscription réussie ! Connecte-toi.');
      navigate('/login');
    }
  };

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
      />

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <form
          onSubmit={handleRegister}
          style={{
            background: '#1f2937',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Créer un compte</h2>

          {errorMsg && (
            <p style={{ color: '#f87171', marginBottom: '1rem' }}>{errorMsg}</p>
          )}

          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label>Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            S'inscrire
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
                marginTop: '1rem',
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                background: 'none',
                border: '1px solid #64748b',
                color: '#94a3b8',
                borderRadius: '0.5rem',
                cursor: 'pointer',
            }}
            >
            ← Retour à l'accueil
          </button>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #475569',
  background: '#0f172a',
  color: 'white',
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'linear-gradient(to right, #6366f1, #3b82f6)',
  border: 'none',
  borderRadius: '0.5rem',
  color: 'white',
  fontWeight: '600',
  cursor: 'pointer',
};
