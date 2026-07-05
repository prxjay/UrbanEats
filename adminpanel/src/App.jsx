import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import AddFood from './pages/AddFood/AddFood';
import ListFood from './pages/ListFood/ListFood';
import Orders from './pages/Orders/Orders';
import Support from './pages/Support/Support';
import Login from './pages/Login/Login';
import Sidebar from './components/Sidebar/Sidebar';
import { ToastContainer } from 'react-toastify';
import { AdminAuthProvider, useAdminAuth } from './context/AuthContext';

const ProtectedLayout = () => {
  const { adminUser } = useAdminAuth();
  if (!adminUser) return <Navigate to="/login" replace />;

  return (
    <div className="admin-layout" id="wrapper">
      <Sidebar />
      <div id="page-content-wrapper">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="page-main-content">
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/add' element={<AddFood />} />
            <Route path='/list' element={<ListFood />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/support' element={<Support />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<LoginGuard />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AdminAuthProvider>
  );
};

// If already logged in, redirect away from /login
const LoginGuard = () => {
  const { adminUser } = useAdminAuth();
  if (adminUser) return <Navigate to="/" replace />;
  return <Login />;
};

export default App;