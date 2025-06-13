import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu.jsx';
import useAuth from '../hooks/useAuth.js';
import supabase from '../services/supabaseClient.js';
import '../styles/pages/SettingsPage.css';

const Settings = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      setUsername(user.user_metadata?.pseudo || '');
      setEmail(user.email || '');
      setTheme(user.user_metadata?.theme || 'light');
      setNotifications(user.user_metadata?.notifications !== false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: user?.email,
          password: password,
        });
        if (error) {
          setPasswordError('Mot de passe incorrect');
          return;
        } else {
          setPasswordError('');
        }
      } catch (err) {
        setPasswordError('Erreur lors de la vérification');
        return;
      }
    }
    console.log('Settings saved:', { firstName, lastName, username, paypalEmail, email, password, notifications, theme });
    alert('Paramètres sauvegardés !');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="settings-page">
      <div className='settings-page__background'></div>
      
      <div className="settings-page__user-menu">
        <UserMenu />
      </div>

      <h1 className="settings-page__title">Paramètres du compte</h1>
      
      <div className="settings-page__container">
        <form onSubmit={handleSubmit} className="settings-page__form glass-container">
          
          <div className="settings-page__form-section">
            <div className="settings-page__form-group">
              <label className="settings-page__label">Prénom</label>
              <input
                type="text"
                placeholder='Votre prénom'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="settings-page__form-group">
              <label className="settings-page__label">Nom</label>
              <input
                type="text"
                placeholder='Votre nom'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="settings-page__form-section">
            <div className="settings-page__form-group">
              <label className="settings-page__label">Pseudo</label>
              <input
                type="text"
                value={username}
                placeholder='Votre pseudo'
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="settings-page__form-group">
              <label className="settings-page__label">Email</label>
              <input
                type="email"
                value={email}
                placeholder='nouveau@email.com'
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="settings-page__form-section">
            <div className="settings-page__form-group">
              <label className="settings-page__label">🔒 Mot de passe actuel</label>
              <input
                type="password"
                value={password}
                placeholder='••••••••'
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
              {passwordError && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  padding: '0.25rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '0.25rem'
                }}>
                  {passwordError}
                </div>
              )}
            </div>
          </div>
          <div className="settings-page__form-section">
            <div className="settings-page__form-group">
              <label className="settings-page__label">Thème</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="settings-page__select"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
            <div className="settings-page__form-group">
              <label className="settings-page__label">Notifications</label>
              <div className="settings-page__checkbox-group">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="settings-page__checkbox"
                />
                <label htmlFor="notifications" className="settings-page__checkbox-label">
                  Recevoir les notifications
                </label>
              </div>
            </div>
          </div>

          <div className="settings-page__buttons">
            <button type="button" onClick={handleBack} className="btn-gradient settings-page__button">
              ← Retour
            </button>
            <button type="submit" className="btn-gradient settings-page__button">
              💾 Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;