import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';

export default function OrderCreate() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης πελατών:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get('/items/');
      setItems(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης ειδών:', err);
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { item: null, quantity: 1 }]);
  };

  const removeItem = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer || !selectedCustomer.value) {
      alert('Επιλέξτε πελάτη.');
      return;
    }

    const validItems = orderItems.filter(i => i.item && i.quantity > 0);
    if (validItems.length === 0) {
      alert('Προσθέστε τουλάχιστον ένα είδος.');
      return;
    }

    const payload = {
      customer: selectedCustomer.value,
      items: validItems.map(i => ({
        item: i.item.value,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await api.post('/orders/', payload);
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      console.error('Σφάλμα αποθήκευσης παραγγελίας:', err);
      alert('Σφάλμα κατά την αποθήκευση.');
    }
  };

  const totalAmount = orderItems.reduce((sum, i) => {
    const price = items.find(it => it.id === i.item?.value)?.price || 0;
    return sum + price * (i.quantity || 0);
  }, 0);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">➕ Νέα Παραγγελία</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Πελάτης</label>
          <Select
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.first_name} ${c.last_name}`,
            }))}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            placeholder="Επιλέξτε πελάτη..."
            className="text-sm"
          />
        </div>

        <div className="space-y-4">
          <label className="block font-semibold">Είδη</label>
          {orderItems.map((i, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Select
                className="w-full"
                options={items.map((item) => ({
                  value: item.id,
                  label: `${item.name} (${parseFloat(item.price).toFixed(2)} €)`,
                }))}
                value={i.item}
                onChange={(selected) => updateItem(index, 'item', selected)}
                placeholder="Επιλογή είδους"
              />
              <input
                type="number"
                min="1"
                className="w-24 p-1 border rounded"
                value={i.quantity}
                onChange={(e) =>
                  updateItem(index, 'quantity', parseInt(e.target.value))
                }
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 font-bold"
              >
                ✖
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
          >
            ➕ Προσθήκη Είδους
          </button>
        </div>

        <div className="text-right font-bold text-lg">
          Σύνολο: {totalAmount.toFixed(2)} €
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Αποθήκευση Παραγγελίας
        </button>
      </form>
    </div>
  );
}
