import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get('/customers/')
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Πελάτες</h2>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>{c.first_name} {c.last_name}</li>
        ))}
      </ul>
    </div>
  );
}
