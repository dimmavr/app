import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const totalOrders = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const balance = totalOrders - totalPayments;

  const openOrderModal = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/`);
      setSelectedOrderDetails(res.data);
      setShowModal(true);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης παραγγελίας:', err);
    }
  };

  if (loading) return <p>Φόρτωση...</p>;
  if (!customer) return <p>Δεν βρέθηκε πελάτης.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Καρτέλα Πελάτη</h2>
        <div className="bg-white p-4 rounded shadow space-y-1">
          <p><strong>Όνομα:</strong> {customer.first_name} {customer.last_name}</p>
          <p><strong>ΑΦΜ:</strong> {customer.tax_id}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Τηλέφωνο:</strong> {customer.phone}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">📦 Παραγγελίες</h3>
        <div className="overflow-y-auto max-h-[300px] border rounded shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Ημερομηνία</th>
                <th className="text-right px-4 py-2">Σύνολο (€)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => openOrderModal(o.id)}
                  className="cursor-pointer hover:bg-blue-50 border-t"
                >
                  <td className="px-4 py-2">#{o.id}</td>
                  <td className="px-4 py-2">{o.date}</td>
                  <td className="px-4 py-2 text-right">{(parseFloat(o.total_amount) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded text-xl font-bold">
        Υπόλοιπο: {balance.toFixed(2)} € {balance > 0 ? '🔴 (χρέος)' : '🟢 (μηδέν ή πιστωτικό)'}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6 shadow-xl space-y-4">
            <Dialog.Title className="text-xl font-bold">
              Παραγγελία #{selectedOrderDetails?.id}
            </Dialog.Title>

            <p className="text-sm text-gray-600">Ημερομηνία: {selectedOrderDetails?.date}</p>

            {selectedOrderDetails?.items?.length > 0 ? (
              <>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2">Είδος</th>
                      <th className="p-2">Ποσότητα</th>
                      <th className="p-2">Σύνολο (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetails.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.item.name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{(parseFloat(item.total_price) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right mt-4 font-semibold">
                  Σύνολο Παραγγελίας: {parseFloat(selectedOrderDetails.total_amount).toFixed(2)} €
                </div>
              </>
            ) : (
              <p className="text-gray-500">Δεν υπάρχουν είδη.</p>
            )}

            <div className="text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Κλείσιμο
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
