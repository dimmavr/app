import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      api.get(`/items/${id}/`)
        .then((res) => setFormData(res.data))
        .catch((err) => console.error('Σφάλμα φόρτωσης:', err));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        console.error('Σφάλμα αποθήκευσης:', err);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? 'Επεξεργασία Είδους' : 'Προσθήκη Νέου Είδους'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block font-semibold">Όνομα</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-semibold">Περιγραφή</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.description && <p className="text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label className="block font-semibold">Τιμή (€)</label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.price && <p className="text-red-600">{errors.price}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Αποθήκευση
        </button>
      </form>
    </div>
  );
}
