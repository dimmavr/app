import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // id από το /edit
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    tax_id: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}/`)
        .then(res => setFormData(res.data))
        .catch(err => console.error('Σφάλμα φόρτωσης:', err));
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await api.put(`/customers/${id}/`, formData);
      } else {
        await api.post('/customers/', formData);
      }
      navigate('/customers');
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
        {isEdit ? 'Επεξεργασία Πελάτη' : 'Προσθήκη Νέου Πελάτη'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {['first_name', 'last_name', 'tax_id', 'email', 'phone'].map((field) => (
          <div key={field}>
            <label className="block font-semibold capitalize">{field.replace('_', ' ')}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            {errors[field] && <p className="text-red-600">{errors[field]}</p>}
          </div>
        ))}

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
