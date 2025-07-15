import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../auth';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/customers', label: 'Πελάτες' },
  { to: '/items', label: 'Είδη' },
  { to: '/orders', label: 'Παραγγελίες' },
  { to: '/payments', label: 'Πληρωμές' },
  { to: '/stats', label: ' Στατιστικά' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();                 // 🔐 Καθαρίζει το token
    navigate('/');            // ⏩ Redirect στο login
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col justify-between">
      <div>
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

      <button
        onClick={handleLogout}
        className="mt-6 p-2 rounded bg-red-600 hover:bg-red-700 text-white"
      >
        Αποσύνδεση
      </button>
    </div>
  );
}
