import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '', // ✅ ΝΕΟ πεδίο
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/items/${id}/`);
      setFormData(res.data);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης είδους:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/items/${id}/`, formData);
      } else {
        await api.post('/items/', formData);
      }
      navigate('/items');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        console.error('Σφάλμα αποθήκευσης είδους:', err);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{isEdit ? '✏️ Επεξεργασία Είδους' : '➕ Νέο Είδος'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Όνομα</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {errors.name && <p className="text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-semibold">Περιγραφή</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
          {errors.description && <p className="text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label className="block font-semibold">Κατηγορία</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.category && <p className="text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label className="block font-semibold">Τιμή (€)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            step="0.01"
          />
          {errors.price && <p className="text-red-600">{errors.price}</p>}
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Αποθήκευση
        </button>
      </form>
    </div>
  );
}
