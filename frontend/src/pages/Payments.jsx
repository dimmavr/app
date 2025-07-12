import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments/');
      setPayments(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης πληρωμών:', err);
    }
  };

  const filtered = payments.filter((p) => {
    const name = `${p.customer_name || ''}`.toLowerCase();
    const date = `${p.date || ''}`;
    return (
      name.includes(searchTerm.toLowerCase()) || date.includes(searchTerm)
    );
  });

  const total = filtered.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((p) => ({
        Ημερομηνία: p.date,
        Πελάτης: p.customer_name || '-',
        Ποσό: parseFloat(p.amount).toFixed(2),
        Παραγγελία: `#${p.order}`,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Πληρωμές');
    XLSX.writeFile(workbook, 'payments.xlsx');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">💳 Πληρωμές</h2>
        <div className="no-print">
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded">
            📊 Excel
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Αναζήτηση (όνομα ή 2025-07)"
        className="p-2 border rounded w-full md:w-1/2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="bg-white p-6 rounded shadow text-black">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Ημερομηνία</th>
              <th className="p-2">Πελάτης</th>
              <th className="p-2 text-right">Ποσό (€)</th>
              <th className="p-2 text-center">Παραγγελία</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-blue-50">
                  <td className="p-2">{p.date}</td>
                  <td className="p-2">{p.customer_name || '-'}</td>
                  <td className="p-2 text-right">{parseFloat(p.amount).toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <Link to={`/orders/${p.order}`} className="text-blue-600 underline">
                      #{p.order}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Δεν βρέθηκαν πληρωμές.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-right text-lg font-bold mt-4">
          Σύνολο: {total.toFixed(2)} €
        </div>
      </div>
    </div>
  );
}
