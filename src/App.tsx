import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Admin Route - No Header/Footer */}
            <Route path="/admin-panel-secure-access" element={<AdminPanel />} />
            
            {/* Public Routes - With Header/Footer */}
            <Route path="/*" element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;