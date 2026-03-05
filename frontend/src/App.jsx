import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import QRScannerPage from './pages/QRScannerPage';
import Logs from './pages/Logs';
import Navbar from './components/Navbar';
import { syncOfflineLogs } from './offlineSync';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Try syncing when app loads and comes online
    window.addEventListener('online', syncOfflineLogs);
    if (navigator.onLine) {
      syncOfflineLogs();
    }
    return () => window.removeEventListener('online', syncOfflineLogs);
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar user={user} onLogout={() => { localStorage.clear(); setUser(null); }} />
        <main className="flex-1 p-4 max-w-md mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/scan" element={<QRScannerPage user={user} />} />
            <Route path="/logs" element={<Logs user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
