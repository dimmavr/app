import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Items() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/items/');
      setItems(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης ειδών:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Επιβεβαιώνεις διαγραφή;')) return;
    try {
      await api.delete(`/items/${id}/`);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Σφάλμα διαγραφής:', err);
    }
  };

  const filtered = items.filter((item) =>
    `${item.name} ${item.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Είδη</h2>
        <Link
          to="/items/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Νέο Είδος
        </Link>
      </div>

      <input
        type="text"
        placeholder="Αναζήτηση..."
        className="mb-4 p-2 border rounded w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Όνομα</th>
              <th className="text-left p-2">Περιγραφή</th>
              <th className="text-right p-2">Τιμή (€)</th>
              <th className="text-center p-2">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">
                  {(parseFloat(item.price) || 0).toFixed(2)}
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Δεν βρέθηκαν είδη.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
