import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import GaleryPage from './pages/GaleryPage';
import DashboardPage from './pages/DashboardPage';
import UpladPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import RedeemPage from './pages/RedeemPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmPage from './pages/ConfirmPage';
import { PrivateRoute, PublicOnlyRoute } from './RouteGuards';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Pages publiques accessibles à tous */}
        <Route path="/" element={<HomePage />} />
        <Route path="/payment/:photoId" element={<PaymentPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />

        {/* Pages publiques accessibles uniquement si non connecté */}
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        {/* Pages privées nécessitant une authentification */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UpladPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/redeem"
          element={
            <PrivateRoute>
              <RedeemPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <PrivateRoute>
              <GaleryPage />
            </PrivateRoute>
          }
        />

        {/* Redirection en cas de route inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
