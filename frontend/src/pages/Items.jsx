import {
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
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
    if (!window.confirm('Διαγραφή είδους;')) return;
    try {
      await api.delete(`/items/${id}/`);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Σφάλμα διαγραφής:', err);
    }
  };

  // ✅ Φίλτρο: ψάχνει ταυτόχρονα σε όνομα και κατηγορία
  const filtered = items.filter((i) => {
    const nameMatch = i.name?.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = i.category?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || categoryMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Είδη</h2>
        <Link
          to="/items/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Νέο Είδος
        </Link>
      </div>

      <input
        type="text"
        placeholder="Αναζήτηση (όνομα ή κατηγορία)..."
        className="p-2 border rounded mb-4 w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Όνομα</th>
              <th className="p-2">Περιγραφή</th>
              <th className="p-2">Κατηγορία</th>
              <th className="p-2 text-right">Τιμή (€)</th>
              <th className="p-2 text-center">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((i) => (
                <tr key={i.id} className="border-t hover:bg-blue-50">
                  <td className="p-2">{i.name}</td>
                  <td className="p-2">{i.description}</td>
                  <td className="p-2">{i.category || '-'}</td>
                  <td className="p-2 text-right">{parseFloat(i.price).toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link
                        to={`/items/${i.id}/edit`}
                        title="Επεξεργασία"
                        className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(i.id)}
                        title="Διαγραφή"
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
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
