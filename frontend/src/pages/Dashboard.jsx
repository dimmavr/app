import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [dailyOrders, setDailyOrders] = useState([]);
  const [dailyPayments, setDailyPayments] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [topDebtors, setTopDebtors] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, paymentsRes, itemsRes, debtorsRes, unpaidRes] = await Promise.all([
        api.get('/orders/today/'),
        api.get('/payments/today/'),
        api.get('/items/top_selling/'),
        api.get('/dashboard/top_debtors/'),
        api.get('/orders/?is_paid=false')
      ]);

      setDailyOrders(ordersRes.data);
      setDailyPayments(paymentsRes.data);
      setTopItems(Object.entries(itemsRes.data));
      setTopDebtors(debtorsRes.data);
      setUnpaidOrders(unpaidRes.data.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης dashboard:', err);
    }
  };

  if (loading) return <p>Φόρτωση...</p>;

  const totalSales = dailyOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Dashboard</h2>
        <div className="flex space-x-2">
          <Link to="/orders/new" className="bg-blue-600 text-white px-3 py-1 rounded">➕ Νέα Παραγγελία</Link>
          <Link to="/payments" className="bg-green-600 text-white px-3 py-1 rounded">➕ Νέα Πληρωμή</Link>
          <Link to="/customers" className="bg-gray-700 text-white px-3 py-1 rounded">🔍 Αναζήτηση Πελάτη</Link>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold text-lg mb-2">📅 Σύνοψη Ημέρας</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Πελάτης</th>
              <th className="p-2 text-left">Είδος</th>
              <th className="p-2 text-right">Τιμή</th>
            </tr>
          </thead>
          <tbody>
            {dailyOrders.flatMap((order) =>
              order.items.map((i, idx) => (
                <tr key={`${order.id}-${idx}`} className="border-t">
                  <td className="p-2">{order.customer_name}</td>
                  <td className="p-2">{i.item.name}</td>
                  <td className="p-2 text-right">{parseFloat(i.total_price).toFixed(2)} €</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-4 text-sm font-bold text-right">Σύνολο Ημέρας: {totalSales.toFixed(2)} €</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold text-lg mb-2">🏆 Top Είδη Πωλήσεων</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Είδος</th>
                <th className="p-2 text-right">Ποσότητα</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map(([name, qty]) => (
                <tr key={name} className="border-t">
                  <td className="p-2">{name}</td>
                  <td className="p-2 text-right">{qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold text-lg mb-2">💰 Top Πελάτες με Υπόλοιπο</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Πελάτης</th>
                <th className="p-2 text-right">Χρέος (€)</th>
              </tr>
            </thead>
            <tbody>
              {topDebtors.map((debtor, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{debtor.customer}</td>
                  <td className="p-2 text-right">{parseFloat(debtor.debt).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold text-lg mb-2">🕒 Πρόσφατες Ανεξόφλητες Παραγγελίες</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Ημερομηνία</th>
              <th className="p-2">Πελάτης</th>
              <th className="p-2 text-right">Σύνολο</th>
              <th className="p-2 text-right">Υπόλοιπο</th>
            </tr>
          </thead>
          <tbody>
            {unpaidOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.date}</td>
                <td className="p-2">{o.customer_name}</td>
                <td className="p-2 text-right">{parseFloat(o.total_amount).toFixed(2)} €</td>
                <td className="p-2 text-right">{parseFloat(o.remaining_amount).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}