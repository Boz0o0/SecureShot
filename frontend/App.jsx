import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupabaseProvider } from './src/contexts/SupabaseContext';
import AuthGuard from './src/components/AuthGuard';

// Pages
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import SessionDetail from './src/pages/SessionDetail';
import Preview from './src/pages/Preview';
import Download from './src/pages/Download';
import NotFound from './src/pages/NotFound';

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