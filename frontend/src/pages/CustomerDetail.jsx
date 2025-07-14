import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../services/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [newPaymentAmounts, setNewPaymentAmounts] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [customerRes, ordersRes, paymentsRes] = await Promise.all([
        api.get(`/customers/${id}/`),
        api.get(`/orders/?customer=${id}`),
        api.get(`/payments/?customer=${id}`),
      ]);
      setCustomer(customerRes.data);
      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης δεδομένων:', err);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handlePaymentChange = (orderId, value) => {
    setNewPaymentAmounts((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const handleAddPayment = async (orderId) => {
    const amount = parseFloat(newPaymentAmounts[orderId]);
    if (!amount || amount <= 0) return;

    try {
      await api.post('/payments/', {
        order: orderId,
        customer: id,
        amount,
        date: new Date().toISOString().split('T')[0],
        method: '',
      });
      setNewPaymentAmounts((prev) => ({ ...prev, [orderId]: '' }));
      fetchData();
    } catch (err) {
      console.error('Σφάλμα καταχώρησης πληρωμής:', err);
    }
  };

  const paymentsByOrder = payments.reduce((acc, payment) => {
    const orderId = payment.order;
    if (!acc[orderId]) acc[orderId] = [];
    acc[orderId].push(payment);
    return acc;
  }, {});

  const totalOrders = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

  const validOrderIds = new Set(orders.map(o => o.id));
  const totalPayments = payments.reduce((sum, p) => {
    return validOrderIds.has(p.order) ? sum + (parseFloat(p.amount) || 0) : sum;
  }, 0);

  const balance = totalOrders - totalPayments;

  const formatBalance = (amount) => {
    if (amount > 0) return `${amount.toFixed(2)} € 🔴 (χρέος)`;
    if (amount < 0) return `${Math.abs(amount).toFixed(2)} € 🔵 (πιστωτικό)`;
    return `0.00 € ✅ (εξοφλημένο)`;
  };

  const exportToExcel = () => {
    const data = orders.map((order) => {
      const orderPayments = paymentsByOrder[order.id] || [];
      const paidAmount = orderPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const total = parseFloat(order.total_amount) || 0;
      const balancePerOrder = total - paidAmount;
      const isPaid = balancePerOrder <= 0;

      const orderDate = new Date(order.date);
      const today = new Date();
      const isOverdue = !isPaid && (today - orderDate) / (1000 * 60 * 60 * 24) > 7;

      const paymentsDetails = orderPayments
        .map((p) => `${p.date}: ${parseFloat(p.amount).toFixed(2)}€`)
        .join(' • ');

      return {
        'Ημερομηνία': order.date,
        'Αρ. Παραγγελίας': `#${order.id}`,
        'Σύνολο (€)': total.toFixed(2),
        'Πληρωμές (€)': paidAmount.toFixed(2),
        'Υπόλοιπο (€)': balancePerOrder > 0 ? balancePerOrder.toFixed(2) : '0.00',
        'Κατάσταση': isPaid ? 'Εξοφλημένη' : 'Ανεξόφλητη',
        'Καθυστερημένη': isOverdue ? 'Ναι' : 'Όχι',
        'Πληρωμές Αναλυτικά': paymentsDetails || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Παραγγελίες');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Καρτέλα_Πελάτη_${customer?.last_name || 'Πελάτης'}.xlsx`);
  };

  if (loading) return <p>Φόρτωση...</p>;
  if (!customer) return <p>Δεν βρέθηκε πελάτης.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold">🧾 Καρτέλα Πελάτη</h2>
        <div className="space-x-2">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            📥 Εξαγωγή Excel
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            🖨️ Εκτύπωση
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow print-area">
        <h3 className="text-xl font-semibold mb-2">Στοιχεία Πελάτη</h3>
        <div className="space-y-1 mb-4">
          <p><strong>Όνομα:</strong> {customer.first_name} {customer.last_name}</p>
          <p><strong>ΑΦΜ:</strong> {customer.tax_id}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Τηλέφωνο:</strong> {customer.phone}</p>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-1">📋 Παραγγελίες & Πληρωμές</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Ημερομηνία</th>
              <th className="p-2">Αρ. Παραγγελίας</th>
              <th className="p-2 text-right">Σύνολο (€)</th>
              <th className="p-2 text-right">Πληρωμές (€)</th>
              <th className="p-2 text-right">Υπόλοιπο (€)</th>
              <th className="p-2 text-right">Κατάσταση</th>
              <th className="p-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const orderPayments = paymentsByOrder[order.id] || [];
              const paidAmount = orderPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
              const total = parseFloat(order.total_amount) || 0;
              const balancePerOrder = total - paidAmount;
              const isPaid = balancePerOrder <= 0;

              const orderDate = new Date(order.date);
              const today = new Date();
              const isOverdue = !isPaid && (today - orderDate) / (1000 * 60 * 60 * 24) > 7;

              return (
                <>
                  <tr key={order.id} className="border-t">
                    <td className="p-2">{order.date}</td>
                    <td className="p-2">#{order.id}</td>
                    <td className="p-2 text-right">{total.toFixed(2)}</td>
                    <td className="p-2 text-right">{paidAmount.toFixed(2)}</td>
                    <td className="p-2 text-right">{balancePerOrder > 0 ? balancePerOrder.toFixed(2) : '0.00'}</td>
                    <td className="p-2 text-right">
                      {isPaid ? (
                        <span className="text-green-600 font-semibold">Εξοφλημένη</span>
                      ) : (
                        <>
                          <span className="text-red-600 font-semibold">Ανεξόφλητη</span>
                          {isOverdue && <span className="text-red-500 font-bold ml-2">🔥 Καθυστερημένη</span>}
                        </>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        {expandedOrders[order.id] ? 'Απόκρυψη' : 'Προβολή'}
                      </button>
                    </td>
                  </tr>
                  {expandedOrders[order.id] && (
                    <>
                      {orderPayments.map((p) => (
                        <tr key={p.id} className="text-sm text-gray-600">
                          <td colSpan={2} className="pl-6">📅 {p.date}</td>
                          <td colSpan={5} className="text-right pr-6">{parseFloat(p.amount).toFixed(2)} €</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="pl-6 py-2">
                          💶 Πληρωμή: 
                          <input
                            type="number"
                            step="0.01"
                            value={newPaymentAmounts[order.id] || ''}
                            onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                            className="ml-2 px-2 py-1 border rounded w-24"
                          />
                          <button
                            onClick={() => handleAddPayment(order.id)}
                            className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Καταχώρηση
                          </button>
                        </td>
                      </tr>
                    </>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        <div className="text-right text-xl font-bold mt-6">
          Υπόλοιπο: {formatBalance(balance)}
        </div>
      </div>
    </div>
  );
}