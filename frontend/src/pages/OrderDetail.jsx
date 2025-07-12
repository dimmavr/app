import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const shouldPrint = new URLSearchParams(location.search).get('print') === 'true';

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState('');
  const [totalCustomerDebt, setTotalCustomerDebt] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchOrder();
    fetchPayments();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}/`);
      setOrder(res.data);
      fetchTotalCustomerDebt(res.data.customer_id);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης παραγγελίας:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/?order=${id}`);
      setPayments(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης πληρωμών:', err);
    }
  };

  const fetchTotalCustomerDebt = async (customerId) => {
    try {
      const res = await api.get(`/customers/${customerId}/debt/`);
      setTotalCustomerDebt(res.data.total_debt);
    } catch (err) {
      console.warn('Δεν υπάρχει endpoint για συνολικό υπόλοιπο πελάτη.');
    }
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(newPayment);
    if (!amount || amount <= 0) {
      alert('Εισάγετε έγκυρο ποσό.');
      return;
    }

    try {
      await api.post('/payments/', {
        order: id,
        amount,
      });
      setNewPayment('');
      fetchOrder();
      fetchPayments();
    } catch (err) {
      console.error('Σφάλμα πληρωμής:', err);
    }
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`order_${order.id}.pdf`);
  };

  useEffect(() => {
    if (order && shouldPrint) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order, shouldPrint]);

  if (!order) return <p>Φόρτωση...</p>;

  const remaining = parseFloat(order.remaining_amount || 0).toFixed(2);
  const total = parseFloat(order.total_amount || 0).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {!shouldPrint && (
        <div className="flex justify-end gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🖨️ Εκτύπωση
          </button>
        
        </div>
      )}

      <div ref={printRef} className="bg-white p-6 rounded shadow print-area space-y-6">
        <h2 className="text-xl font-bold">Παραγγελία #{order.id}</h2>
        <p><strong>Ημερομηνία:</strong> {order.date}</p>
        <p><strong>Πελάτης:</strong> {order.customer_name}</p>
        <p><strong>Κατάσταση:</strong>{' '}
          {order.is_paid ? (
            <span className="text-green-600 font-semibold">Εξοφλημένη</span>
          ) : (
            <span className="text-red-600 font-semibold">Ανεξόφλητη</span>
          )}
        </p>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Είδος</th>
              <th className="p-2 text-left">Ποσότητα</th>
              <th className="p-2 text-left">Τιμή (€)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{i.item.name}</td>
                <td className="p-2">{i.quantity}</td>
                <td className="p-2">
                  {(parseFloat(i.price || i.item?.price || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right font-bold text-lg">Σύνολο: {total} €</div>

        {/* Πληρωμές */}
        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-semibold">💳 Πληρωμές</h3>
          {payments.length > 0 ? (
            <>
              <ul className="text-sm border border-gray-200 rounded p-2 bg-gray-50">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between border-b last:border-b-0 py-1">
                    <span>📅 {p.date}</span>
                    <span className="font-semibold">💰 {parseFloat(p.amount).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
              <div className="text-right font-semibold mt-2">
                Σύνολο Πληρωμών:{" "}
                {payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)} €
              </div>
            </>
          ) : (
            <p className="text-gray-500">Δεν υπάρχουν πληρωμές.</p>
          )}

          <div className="text-right text-lg font-bold text-red-600">
            Υπόλοιπο: {remaining} €
          </div>

          {totalCustomerDebt !== null && (
            <div className="text-right text-sm text-gray-600">
              🔢 Σύνολο υπολοίπου πελάτη: {parseFloat(totalCustomerDebt).toFixed(2)} €
            </div>
          )}
        </div>
      </div>

      {/* Inline πληρωμή (μόνο εκτός εκτύπωσης) */}
      {!shouldPrint && (
        <div className="bg-gray-50 p-4 rounded border space-y-3 mt-6 no-print">
          <h3 className="text-lg font-semibold">➕ Νέα Πληρωμή</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Ποσό πληρωμής"
              className="p-2 border rounded w-40"
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value)}
            />
            <button
              onClick={handleAddPayment}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Καταχώρηση
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
