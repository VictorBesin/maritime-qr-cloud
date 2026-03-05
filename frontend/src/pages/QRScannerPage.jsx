import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { saveLogOffline } from '../offlineSync';
import axios from 'axios';

export default function QRScannerPage({ user }) {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 5 });
    
    scanner.render(async (text) => {
      scanner.clear();
      try {
        const payload = JSON.parse(text); // Assume QR contains JSON { userId, qrTypeId, url }
        
        // Ensure the QR user matches logged in user or alert
        if (payload.userId != user.id) {
            setScanResult({ error: "QR Code user mismatch. Please scan your own code." });
            return;
        }

        const logData = {
          userId: user.id,
          qrTypeId: payload.qrTypeId,
          timestamp: new Date().toISOString(),
          clientId: `web-${Date.now()}`
        };

        if (navigator.onLine) {
          const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
          const res = await axios.post(`${API_URL}/qr/scan`, logData);
          setScanResult({ success: `Successfully clocked ${res.data.type}` });
        } else {
          logData.type = "OFFLINE"; // Backend must figure out IN/OUT state on sync later
          await saveLogOffline(logData);
          setScanResult({ success: "Offline: Punch stored locally." });
        }
      } catch (err) {
        setScanResult({ error: "Invalid QR Code format. " + err.message });
      }
    }, (err) => {
      // scanning
    });

    return () => {
      scanner.clear().catch(e => console.error(e));
    };
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <h2 className="text-lg font-bold mb-4 text-center">Scan Duty QR Code</h2>
        <div id="reader" className="w-full"></div>
      </div>
      
      {scanResult && (
        <div className={`p-4 rounded text-center ${scanResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {scanResult.error || scanResult.success}
          <button onClick={() => setScanResult(null)} className="ml-4 underline">Close</button>
        </div>
      )}
    </div>
  );
}
