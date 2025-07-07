import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password,
      });

      saveToken(response.data.token);  // <-- αυτό είναι το token από DRF auth
      navigate('/dashboard');
    } catch (err) {
      setError('Λάθος στοιχεία. Προσπάθησε ξανά.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Σύνδεση</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Όνομα χρήστη"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="password"
          placeholder="Κωδικός"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Σύνδεση
        </button>
      </form>
    </div>
  );
}
