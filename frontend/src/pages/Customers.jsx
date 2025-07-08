import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης πελατών:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις τον πελάτη;')) return;

    try {
      await api.delete(`/customers/${id}/`);
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Σφάλμα διαγραφής:', err);
    }
  };

  const filtered = customers.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Πελάτες</h2>
        <Link
          to="/customers/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          <span className="text-lg">➕</span> Νέος Πελάτης
        </Link>
      </div>

      <input
        type="text"
        placeholder="Αναζήτηση..."
        className="mb-4 p-2 border rounded w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-left p-2">Όνομα</th>
              <th className="text-left p-2">Επώνυμο</th>
              <th className="text-left p-2">ΑΦΜ</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Τηλέφωνο</th>
              <th className="text-left p-2">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.first_name}</td>
                <td className="p-2">{c.last_name}</td>
                <td className="p-2">{c.tax_id}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2 flex gap-2">
                  <Link to={`/customers/${c.id}`} className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded">
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                  <Link to={`/customers/${c.id}/edit`} className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded">
                    <PencilSquareIcon className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Δεν βρέθηκαν πελάτες.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
