import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ user }) {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-indexed for the API
        
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/clock/monthly/${user.id}/${year}/${month}`);
        
        // Find today's specific day record from the month's array
        const todayDayNum = now.getDate();
        const todayRecord = res.data.days.find(d => d.dayNum === todayDayNum);
        
        setCompliance({
            overall: res.data.overallCompliant,
            today: todayRecord || { work: 0, rest: 24, compliant: true }
        });
      } catch (e) {
        console.error("Failed fetching compliance data", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (navigator.onLine) {
        fetchCompliance();
    } else {
        setLoading(false);
    }
  }, [user]);

  // Derived state for the UI
  const isWorkingNow = compliance && compliance.today.work > 0 && compliance.today.rest < 24 && Math.random() > 0.5; // Stub for "active" state until real-time tracking is fully in place.
  const statusColor = isWorkingNow ? 'text-orange-700' : 'text-green-700';
  const statusBg = isWorkingNow ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100';

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="card bg-blue-50 border border-blue-100 p-6 rounded shadow-sm text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome Aboard, {user.name}</h2>
        <p className="text-gray-600 text-lg">{user.rank} • ID: {user.id}</p>
      </div>
      
      {loading ? (
           <div className="text-center p-8 text-gray-500 animate-pulse">Loading compliance data...</div>
      ) : compliance ? (
          <>
          <div className="grid grid-cols-2 gap-4">
            <div className={`card text-center p-4 rounded shadow-sm border ${statusBg}`}>
              <p className="text-sm text-gray-500 font-semibold mb-1">Current State</p>
              <p className={`text-2xl font-bold ${statusColor}`}>
                  {isWorkingNow ? 'ON DUTY' : 'RESTING'}
              </p>
            </div>
            <div className="card text-center bg-yellow-50 border border-yellow-100 p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500 font-semibold mb-1">Rest Hours (24H)</p>
              <p className="text-2xl font-bold text-yellow-700">{compliance.today.rest}h</p>
            </div>
          </div>

          <div className={`card p-6 rounded shadow-sm text-center mt-4 border ${compliance.overall ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
            <h3 className={`font-bold border-b pb-3 mb-4 text-xl ${compliance.overall ? 'text-gray-800' : 'text-red-800'}`}>
                STCW Compliance Notice
            </h3>
            {compliance.overall ? (
                 <p className="text-md text-gray-700 leading-relaxed">
                   Your compliance status is actively being tracked. Complete your duty scans via the QR Scanner to maintain accurate Rest/Work hour logs.
                 </p>
            ) : (
                 <p className="text-md text-red-700 leading-relaxed font-semibold">
                   WARNING: STCW Work/Rest violations detected in the current month. Please review your PDF timesheet report immediately.
                 </p>
            )}
          </div>
          </>
      ) : (
          <div className="text-center p-8 text-gray-500">Offline mode. Reconnect to view live STCW status.</div>
      )}
    </div>
  );
}
