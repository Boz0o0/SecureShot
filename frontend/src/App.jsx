import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import GaleryPage from './pages/GaleryPage';
import DashboardPage from './pages/DashboardPage';
import UpladPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gallery" element={<GaleryPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UpladPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}
