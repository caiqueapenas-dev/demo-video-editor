import { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    setIsLoggedIn(loggedIn);

    const path = window.location.pathname;
    setIsAdmin(path === '/admin');
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  if (isAdmin) {
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
    }
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <LanguageProvider>
      <LandingPage />
    </LanguageProvider>
  );
}

export default App;
