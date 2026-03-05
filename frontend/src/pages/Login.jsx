import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/auth/login`, { code });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError('Invalid Access Code. Try 1234');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Seafarer Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="Enter Access Code (PIN)" 
            value={code} 
            onChange={e => setCode(e.target.value)}
            className="border p-3 rounded text-center text-xl tracking-widest"
            required
          />
          <button type="submit" className="bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
