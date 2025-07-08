import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης παραγγελιών:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Επιβεβαιώνεις διαγραφή παραγγελίας;')) return;
    try {
      await api.delete(`/orders/${id}/`);
      setOrders(orders.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Σφάλμα διαγραφής:', err);
    }
  };

  const filtered = orders.filter((o) => {
    const name =
      o.customer_name ||
      (o.customer?.first_name && o.customer?.last_name
        ? `${o.customer.first_name} ${o.customer.last_name}`
        : '');
    const nameMatch = name.toLowerCase().includes(searchName.toLowerCase());
    const dateMatch = o.date?.includes(searchDate);
    return nameMatch && dateMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Παραγγελίες</h2>
        <Link
          to="/orders/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          ➕ Νέα Παραγγελία
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Αναζήτηση πελάτη..."
          className="p-2 border rounded w-full md:w-1/3"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Φιλτράρισμα ημερομηνίας (π.χ. 2025-07)"
          className="p-2 border rounded w-full md:w-1/3"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Ημερομηνία</th>
              <th className="p-2">Πελάτης</th>
              <th className="p-2 text-right">Σύνολο (€)</th>
              <th className="p-2 text-center">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((o) => {
                const displayName =
                  o.customer_name ||
                  (o.customer?.first_name && o.customer?.last_name
                    ? `${o.customer.first_name} ${o.customer.last_name}`
                    : '-');

                return (
                  <tr key={o.id} className="border-t hover:bg-blue-50">
                    <td className="p-2">#{o.id}</td>
                    <td className="p-2">{o.date}</td>
                    <td className="p-2">{displayName}</td>
                    <td className="p-2 text-right">
                      {(parseFloat(o.total_amount) || 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <Link
                          to={`/orders/${o.id}`}
                          title="Προβολή"
                          className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/orders/${o.id}/edit`}
                          title="Επεξεργασία"
                          className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(o.id)}
                          title="Διαγραφή"
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  Δεν βρέθηκαν παραγγελίες.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
