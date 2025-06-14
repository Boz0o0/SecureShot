import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/pages/RegisterPage.css';
import '../styles/globals.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [age, setAge] = useState(18);
  // On peut garder errorMsg si tu veux afficher aussi dans le form
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (age < 18) {
      const msg = "Tu dois avoir au moins 18 ans pour t'inscrire.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          pseudo,
          age,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      toast.error(error.message);
    } else {
      toast.success('✅ Inscription réussie ! Connecte-toi.');
      navigate('/login');
    }
  };

  return (
    <div className="register-page">
      <Toaster position="top-center" />
      
      {/* Background with decorative elements */}
      <div className="register-page__background" />

      <div className="register-page__container">
        <form onSubmit={handleRegister} className="register-page__form">
          <h2 className="register-page__title">Créer un compte</h2>

          {errorMsg && (
            <p className="register-page__error">{errorMsg}</p>
          )}

          <div className="register-page__field-group">
            <label className="register-page__label">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="register-page__input"
            />
          </div>

          <div className="register-page__field-group">
            <label className="register-page__label">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="register-page__input"
            />
          </div>

          <div className="register-page__field-group">
            <label className="register-page__label">Pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
              className="register-page__input"
            />
          </div>

          <div className="register-page__field-group">
            <label className="register-page__label">Âge</label>
            <input
              type="number"
              value={age}
              min={18}
              onChange={(e) => setAge(Number(e.target.value))}
              required
              className="register-page__input"
            />
          </div>

          <div className="register-page__field-group">
            <label className="register-page__label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="register-page__input"
            />
          </div>

          <div className="register-page__field-group">
            <label className="register-page__label">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="register-page__input"
            />
          </div>

          <button type="submit" className="register-page__submit-btn">
            S'inscrire
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="register-page__back-btn"
          >
            ← Retour à l'accueil
          </button>
        </form>
      </div>
    </div>
  );
}
