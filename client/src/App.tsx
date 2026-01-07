import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ItemsPage from './pages/Items';
import SuppliersPage from './pages/Suppliers';
import OperationsPage from './pages/Operations';

// Placeholders for now
const Reports = () => <div className="p-4"><h2 className="text-2xl font-bold">Reports</h2><p className="text-gray-500">Summary and Movement.</p></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="items" element={<ItemsPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
