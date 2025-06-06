import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext';
import AuthGuard from './components/AuthGuard';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionDetail from './pages/SessionDetail';
import Preview from './pages/Preview';
import Download from './pages/Download';
import NotFound from './pages/NotFound';

function App() {
  return (
    <SupabaseProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/preview/:code" element={<Preview />} />
            <Route path="/download/:sessionId" element={<Download />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/session/:sessionId" element={
              <AuthGuard>
                <SessionDetail />
              </AuthGuard>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </SupabaseProvider>
  );
}

export default App;