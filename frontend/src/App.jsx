import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminPackages from './pages/AdminPackages';
import AdminShipRequests from './pages/AdminShipRequests';
import AdminClients from './pages/AdminClients';
import ClientDashboard from './pages/ClientDashboard';
import ClientPackages from './pages/ClientPackages';
import Layout from './components/Layout';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} />;
    return children;
  };

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { 
            background: '#1e293b', 
            color: '#fff', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            fontSize: '0.9rem'
          } 
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Layout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="packages" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="ship-requests" element={<AdminShipRequests />} />
          <Route path="clients" element={<AdminClients />} />
        </Route>

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute role="client">
            <Layout role="client" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="packages" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="packages" element={<ClientPackages />} />
        </Route>

        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin/packages' : '/client/packages') : '/login'} />} />
      </Routes>
    </Router>
  );
};

export default App;
