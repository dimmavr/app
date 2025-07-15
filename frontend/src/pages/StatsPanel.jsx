// src/pages/StatsPanel.jsx
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';

export default function StatsPanel() {
  const [periodType, setPeriodType] = useState('day');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [periodType, date, month, year, startDate, endDate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let res;
      let gte, lte;

      if (periodType === 'day' && date) {
        gte = lte = date;
      } else if (periodType === 'month' && month) {
        const [y, m] = month.split('-');
        gte = `${y}-${m}-01`;
        const end = new Date(y, m, 0).getDate();
        lte = `${y}-${m}-${end}`;
      } else if (periodType === 'year' && year) {
        gte = `${year}-01-01`;
        lte = `${year}-12-31`;
      } else if ((periodType === 'week' || periodType === 'custom') && startDate && endDate) {
        gte = startDate;
        lte = endDate;
      }

      if (gte && lte) {
        res = await api.get(`/orders/?date__gte=${gte}&date__lte=${lte}`);
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Σφάλμα φόρτωσης στατιστικών:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupByItemDetailed = () => {
    const stats = {};
    for (const order of orders) {
      for (const i of order.items || []) {
        const name = i.item.name;
        const category = i.item.category || '';
        if (categoryFilter && category !== categoryFilter) continue;
        const quantity = i.quantity;
        const price = parseFloat(i.price || i.item?.price || 0);
        if (!stats[name]) {
          stats[name] = { quantity: 0, total: 0 };
        }
        stats[name].quantity += quantity;
        stats[name].total += quantity * price;
      }
    }
    return Object.entries(stats);
  };

  const getAllCategories = () => {
    const categories = new Set();
    for (const order of orders) {
      for (const i of order.items || []) {
        if (i.item.category) categories.add(i.item.category);
      }
    }
    return Array.from(categories);
  };

  const exportExcel = () => {
    const itemData = groupByItemDetailed().map(([name, data]) => ({
      Είδος: name,
      Ποσότητα: data.quantity,
      "Σύνολο (€)": data.total.toFixed(2),
    }));

    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(itemData);
    XLSX.utils.book_append_sheet(wb, sheet, 'Πωλήσεις');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'πωλήσεις.xlsx');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-2xl font-bold">📄 Αναφορά Πωλήσεων</h2>
        <div className="space-x-2">
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-1 rounded">📥 Excel</button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-1 rounded">🖨️ Εκτύπωση</button>
        </div>
      </div>

      <div className="mb-4 space-y-3 print:hidden">
        <label className="block font-semibold">Τύπος Περιόδου</label>
        <select
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value)}
          className="p-2 border rounded w-full md:w-1/3"
        >
          <option value="day">Ημέρα</option>
          <option value="week">Εβδομάδα</option>
          <option value="month">Μήνας</option>
          <option value="year">Έτος</option>
          <option value="custom">Προσαρμοσμένο</option>
        </select>

        {periodType === 'day' && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />
        )}
        {periodType === 'month' && (
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border rounded" />
        )}
        {periodType === 'year' && (
          <input type="number" placeholder="π.χ. 2023" value={year} onChange={(e) => setYear(e.target.value)} className="p-2 border rounded" />
        )}
        {(periodType === 'week' || periodType === 'custom') && (
          <div className="flex gap-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded" />
            <span>έως</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded" />
          </div>
        )}

        <div>
          <label className="block font-semibold">Φίλτρο Κατηγορίας</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded w-full md:w-1/3"
          >
            <option value="">Όλες</option>
            {getAllCategories().map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Φόρτωση...</p>
      ) : (
        <div className="bg-white rounded shadow p-4 print-area">
          <h3 className="font-semibold text-lg mb-4">📦 Πωλήσεις στο διάστημα</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Είδος</th>
                <th className="p-2 text-right">Ποσότητα</th>
                <th className="p-2 text-right">Σύνολο (€)</th>
              </tr>
            </thead>
            <tbody>
              {groupByItemDetailed().map(([name, data]) => (
                <tr key={name} className="border-t">
                  <td className="p-2">{name}</td>
                  <td className="p-2 text-right">{data.quantity}</td>
                  <td className="p-2 text-right">{data.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
