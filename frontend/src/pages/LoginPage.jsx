import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import supabase from '../services/supabaseClient';
import '../styles/pages/LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginToast = toast.loading('Connexion en cours...');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.dismiss(loginToast);
        toast.error(error.message);
      } else {
        toast.dismiss(loginToast);
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.dismiss(loginToast);
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'react-hot-toast',
        }}
      />
      
      <div className="login-page__background"></div>

      <div className="login-page__content">
        <form onSubmit={handleLogin} className="login-page__form glass-container">
          <h2 className="login-page__title">Connexion</h2>

          <div className="login-page__form-group">
            <label className="login-page__label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-page__input"
              placeholder="votre@email.com"
            />
          </div>

          <div className="login-page__form-group">
            <label className="login-page__label">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-page__input"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn-gradient login-page__submit"
            disabled={loading}
          >
            {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="login-page__back-button"
          >
            ← Retour à l'accueil
          </button>
        </form>
      </div>
    </div>
  );
}
