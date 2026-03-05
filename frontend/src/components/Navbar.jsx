import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isActive = (path) => location.pathname === path ? 'border-b-2 border-white font-bold' : 'text-blue-200 hover:text-white transition-colors';

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 w-full">
      <div className="p-4 flex flex-col gap-3">
        {/* Top row: Brand & Status */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="font-bold text-xl tracking-tight">Maritime QR</h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Connection Status Indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-blue-800 text-green-400' : 'bg-red-900 text-red-200'}`}>
                    <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></span>
                    {isOnline ? 'Online' : 'Offline'}
                </div>
                
                <button 
                  onClick={onLogout} 
                  className="bg-blue-800 hover:bg-blue-700 text-sm font-medium px-3 py-1.5 rounded transition-colors"
                >
                  Logout
                </button>
            </div>
        </div>

        {/* Bottom row: Navigation Links */}
        <div className="flex justify-around text-sm border-t border-blue-800 pt-2 pb-1">
            <Link to="/" className={`pb-1 ${isActive('/')}`}>Dashboard</Link>
            <Link to="/scan" className={`pb-1 flex gap-1 items-center ${isActive('/scan')}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan
            </Link>
            <Link to="/logs" className={`pb-1 ${isActive('/logs')}`}>Logs</Link>
        </div>
      </div>
    </nav>
  );
}
