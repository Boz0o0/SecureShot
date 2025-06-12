import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PaymentSuccess from './pages/PaymentSuccess';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import GaleryPage from './pages/GaleryPage';
import DashboardPage from './pages/DashboardPage';
import UpladPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import RedeemPage from './pages/RedeemPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmPage from './pages/ConfirmPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/:photoId" element={<PaymentPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gallery" element={<GaleryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UpladPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/redeem" element={<RedeemPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
      </Routes>
    </Router>
  );
}
