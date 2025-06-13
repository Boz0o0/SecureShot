import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [pseudoAvailable, setPseudoAvailable] = useState(true);
  const [checkingPseudo, setCheckingPseudo] = useState(false);

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setUsername(profile.pseudo || '');
          setPaypalEmail(profile.paypal_email || '');
          setTheme(profile.theme || 'dark');
          setNotifications(profile.notifications !== false);
        }
        setEmail(user.email || '');
      }
    };
    
    fetchProfile();
  }, [user]);

  // Vérifie la disponibilité du pseudo en live, avec debounce
  useEffect(() => {
    if (!username) {
      setPseudoAvailable(true);
      return;
    }

    let isMounted = true;
    setCheckingPseudo(true);

    const timeoutId = setTimeout(async () => {
      if (!isMounted) return;
      // Requête pour vérifier si le pseudo existe dans un autre profil
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('pseudo', username)
        .neq('id', user?.id)
        .limit(1);

      if (!error) {
        setPseudoAvailable(data.length === 0);
      } else {
        setPseudoAvailable(true); // En cas d'erreur, on laisse passer
      }
      setCheckingPseudo(false);
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [username, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const updateToast = toast.loading('Mise à jour en cours...');

    try {
      if (!pseudoAvailable) {
        toast.dismiss(updateToast);
        toast.error('Ce pseudo est déjà utilisé.');
        setIsUpdating(false);
        return;
      }

      const emailChanged = email !== user?.email;
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const metadataChanges = 
        firstName !== (currentProfile?.first_name || '') ||
        lastName !== (currentProfile?.last_name || '') ||
        username !== (currentProfile?.pseudo || '') ||
        paypalEmail !== (currentProfile?.paypal_email || '') ||
        theme !== (currentProfile?.theme || 'dark') ||
        notifications !== (currentProfile?.notifications !== false);

      if (!emailChanged && !metadataChanges) {
        toast.dismiss(updateToast);
        toast('ℹ️ Aucun changement détecté', { duration: 3000 });
        setIsUpdating(false);
        return;
      }
      if (!password) {
        toast.dismiss(updateToast);
        toast.error('Le mot de passe est requis pour sauvegarder les modifications');
        setIsUpdating(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: password,
      });
      if (error) {
        toast.dismiss(updateToast);
        toast.error('Mot de passe incorrect');
        setIsUpdating(false);
        return;
      }
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) {
          throw new Error('Erreur lors de la mise à jour de l\'email: ' + emailError.message);
        }
      }
      if (metadataChanges) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            pseudo: username,
            paypal_email: paypalEmail,
            theme: theme,
            notifications: notifications
          })
          .eq('id', user.id);
        if (profileError) {
          throw new Error('Erreur lors de la mise à jour du profil: ' + profileError.message);
        }
      }
      toast.dismiss(updateToast);
      toast.success('Profil mis à jour avec succès !');
      setPassword('');
    } catch (err) {
      toast.dismiss(updateToast);
      if (err.message.includes('email')) {
        toast.error('Erreur lors de la mise à jour de l\'email: ' + err.message);
      } else {
        toast.error('Erreur lors de la mise à jour: ' + err.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="settings-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'react-hot-toast',
        }}
      />
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
                style={{ borderColor: pseudoAvailable ? undefined : '#f87171' }}
              />
              {!checkingPseudo && !pseudoAvailable && (
                <p style={{ color: '#f87171', marginTop: '0.25rem' }}>Ce pseudo est déjà utilisé.</p>
              )}
              {checkingPseudo && (
                <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Vérification du pseudo...</p>
              )}
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

            <div className="settings-page__form-group">
              <label className="settings-page__label">💰 Email PayPal</label>
              <input
                type="email"
                value={paypalEmail}
                placeholder='votre@email-paypal.com'
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="input-field"
              />
            </div>

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
          </div>

          <div className="settings-page__form-section">
            <div className="settings-page__form-group">
              <label className="settings-page__label">🔒 Mot de passe actuel</label>
              <input
                type="password"
                value={password}
                placeholder='••••••••'
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => toast('Mot de passe requis pour sauvegarder les modifications', { duration: 2000 })}
                className="input-field"
              />
            </div>
          </div>
          <div className="settings-page__form-section">
            <div className="settings-page__form-group">
              <label className="settings-page__label">📬 Notifications</label>
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
            <button type="submit" className="btn-gradient settings-page__button" disabled={isUpdating}>
              {isUpdating ? '⏳ Mise à jour...' : '💾 Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
