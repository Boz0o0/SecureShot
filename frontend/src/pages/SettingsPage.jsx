import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/SettingsPage.css';


const Settings = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Settings saved:', { firstName, lastName, username, paypalEmail, email, password, notifications, theme });
    alert('Paramètres sauvegardés !');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="settings-page">
      <div className='settings-page__background'></div>
      <h1>Paramètres du compte</h1>
      <form onSubmit={handleSubmit} className="settings-page__form glass-container">
        <div>
          <label>Prénom:</label><br />
          <input
            type="text"
            placeholder='Prénom'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Nom:</label><br />
          <input
            type="text"
            placeholder='Nom'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Pseudo:</label><br />
          <input
            type="text"
            value={username}
            placeholder='Pseudo'
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email PayPal:</label><br />
          <input
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Nouveau mot de passe:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            Recevoir les notifications
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Thème:</label><br />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" onClick={handleBack} className="btn-gradient">Retour</button>
          <button type="submit" className="btn-gradient">Sauvegarder</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
