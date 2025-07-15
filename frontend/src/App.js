import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import ItemForm from './pages/ItemForm';
import Items from './pages/Items';
import Login from './pages/Login';
import OrderCreate from './pages/OrderCreate';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import StatsPanel from './pages/StatsPanel';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/items" element={<Items />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/customers/new" element={<CustomerForm />} />
                  <Route path="/customers/:id/edit" element={<CustomerForm />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/items" element={<Items />} />
                  <Route path="/items/new" element={<ItemForm />} />
                  <Route path="/items/:id/edit" element={<ItemForm />} />
                  <Route path="/orders/new" element={<OrderCreate />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/stats" element={<ProtectedRoute><StatsPanel /></ProtectedRoute>} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
