import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/customers', label: 'Πελάτες' },
  { to: '/items', label: 'Είδη' },
  { to: '/orders', label: 'Παραγγελίες' },
  { to: '/payments', label: 'Πληρωμές' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h1 className="text-xl font-bold mb-6">ERP Σύστημα</h1>
      <nav className="flex flex-col gap-3">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`p-2 rounded hover:bg-gray-700 ${
              location.pathname === to ? 'bg-gray-700 font-semibold' : ''
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
