import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

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

  const filtered = orders.filter((o) => {
    const query = search.toLowerCase();
    const name = o.customer_name?.toLowerCase() || '';
    const date = o.date || '';
    const statusMatch =
      paymentStatus === ''
        ? true
        : paymentStatus === 'paid'
        ? o.is_paid
        : !o.is_paid;

    return (
      (name.includes(query) || date.includes(query)) && statusMatch
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📦 Παραγγελίες</h2>
        <Link to="/orders/new" className="bg-green-600 text-white px-4 py-2 rounded">
          ➕ Νέα Παραγγελία
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Αναζήτηση (όνομα ή ημερομηνία)"
          className="p-2 border rounded w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded w-full md:w-1/4"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">Όλες</option>
          <option value="paid">Εξοφλημένες</option>
          <option value="unpaid">Εκκρεμείς</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Ημερομηνία</th>
              <th className="p-2">Πελάτης</th>
              <th className="p-2 text-right">Σύνολο (€)</th>
              <th className="p-2 text-center">Κατάσταση</th>
              <th className="p-2 text-center">Προβολή</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((order) => (
                <tr key={order.id} className="border-t hover:bg-blue-50">
                  <td className="p-2">#{order.id}</td>
                  <td className="p-2">{order.date}</td>
                  <td className="p-2">{order.customer_name}</td>
                  <td className="p-2 text-right">
                    {parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    {order.is_paid ? (
                      <span className="text-green-600 font-semibold">Εξοφλημένη</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Εκκρεμεί</span>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 underline"
                    >
                      Προβολή
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
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
