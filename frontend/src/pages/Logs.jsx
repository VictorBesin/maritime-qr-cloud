import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Logs({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/clock/logs/${user.id}`);
        setLogs(res.data);
      } catch (e) {
        console.error("Failed fetching logs");
      } finally {
        setLoading(false);
      }
    };
    if (navigator.onLine) {
        fetchLogs();
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleExportPDF = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 1-indexed for the API
      
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const pdfUrl = `${API_URL}/clock/monthly/pdf/${user.id}/${year}/${month}`;
      
      window.open(pdfUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Punch Logs</h2>
        <button 
            onClick={handleExportPDF}
            className="bg-blue-800 hover:bg-blue-900 transition-colors text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Export PDF
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
        {loading ? (
           <p className="p-8 text-center text-gray-500 animate-pulse">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No logs found or device is offline.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map(log => (
              <li key={log.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-800 text-lg mb-1">
                    {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Duty Zone ID: {log.qr_type_id}</p>
                </div>
                <div className={`font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wider ${log.type === 'IN' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                  {log.type}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
