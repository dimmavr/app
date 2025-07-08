import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OrderCreate() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([
    { item: '', quantity: 1, price: 0 },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchCustomers = async () => {
    const res = await api.get('/customers/');
    setCustomers(res.data);
  };

  const fetchItems = async () => {
    const res = await api.get('/items/');
    setItems(res.data);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;

    if (field === 'item') {
      const selected = items.find((i) => i.id === parseInt(value));
      updated[index].price = selected ? selected.price : 0;
    }

    setOrderItems(updated);
  };

  const addItemRow = () => {
    setOrderItems([...orderItems, { item: '', quantity: 1, price: 0 }]);
  };

  const removeItemRow = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const total = orderItems.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders/', {
        customer: selectedCustomer,
        items: orderItems.map((i) => ({
          item: i.item,
          quantity: i.quantity,
          total: total.toFixed(2),
        })),
      });
      navigate('/orders');
    } catch (err) {
      console.error('Σφάλμα αποθήκευσης παραγγελίας:', err);
      alert('Αποτυχία αποθήκευσης. Έλεγξε τα στοιχεία.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">➕ Νέα Παραγγελία</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Πελάτης</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">-- Επιλέξτε πελάτη --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Είδη</label>
          {orderItems.map((row, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <select
                value={row.item}
                onChange={(e) =>
                  handleItemChange(index, 'item', e.target.value)
                }
                className="border p-2 rounded w-1/2"
                required
              >
                <option value="">-- Επιλέξτε είδος --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={row.quantity}
                onChange={(e) =>
                  handleItemChange(index, 'quantity', parseInt(e.target.value))
                }
                className="border p-2 rounded w-1/4"
                required
              />

              <span className="w-1/4 text-right text-gray-700">
                {(row.price * row.quantity).toFixed(2)} €
              </span>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="text-red-500 hover:text-red-700 font-bold text-xl"
                >
                  &minus;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItemRow}
            className="text-blue-600 hover:underline text-sm mt-1"
          >
            ➕ Προσθήκη είδους
          </button>
        </div>

        <div className="text-xl font-bold">Σύνολο: {total.toFixed(2)} €</div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Αποθήκευση Παραγγελίας
        </button>
      </form>
    </div>
  );
}
