import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useNoScroll from '../hooks/useNoScroll';
import UserMenu from '../components/UserMenu';
import '../styles/pages/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useNoScroll();

  const handleNavigation = (route, message) => {
    if (!user && (route === '/gallery' || route === '/redeem')) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
    } else {
      if (message) {
        toast.success(message);
      }
      navigate(route);
    }
  };

  if (loading) {
    return (
      <div className="home-page__loading">
        <div className="home-page__loading-spinner"></div>
        Chargement...
      </div>
    );
  }

  return (
    <div className="home-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'react-hot-toast',
        }}
      />

      {/* Background */}
      <div className="home-page__background">
        <div className="home-page__background-shape"></div>
      </div>

      {/* Navbar */}
      <div className="home-page__navbar">
        {!user ? (
          <>
            <button 
              onClick={() => handleNavigation('/register', 'Redirection vers la création de compte')} 
              className="home-page__nav-button"
            >
              Créer un compte
            </button>
            <button 
              onClick={() => handleNavigation('/login', 'Redirection vers la connexion')} 
              className="home-page__nav-button"
            >
              Connexion
            </button>
          </>
        ) : (
          <div className="home-page__user-menu">
            <UserMenu />
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="home-page__content">
        <h1 className="home-page__title">SecureShot</h1>
        <p className="home-page__subtitle">
          La plateforme sécurisée pour vendre vos photos en ligne.
        </p>

        <button
          onClick={() => handleNavigation(user ? '/gallery' : '/login', user ? 'Redirection vers la galerie' : null)}
          className="home-page__button home-page__button--primary"
        >
          Accéder à la galerie
        </button>

        <button
          onClick={() => handleNavigation(user ? '/redeem' : '/login', user ? 'Redirection vers la récupération de photo' : null)}
          className="home-page__button home-page__button--secondary"
        >
          Redeem a Picture
        </button>
      </div>

      {/* Footer */}
      <footer className="home-page__footer">
        © {new Date().getFullYear()} SecureShot — Tous droits réservés.
      </footer>
    </div>
  );
}
