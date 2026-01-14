import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admins from './pages/Admins';
import Dillers from './pages/Dillers';
import Sotuvchilar from './pages/Sotuvchilar';
import Payments from './pages/Payments';
import Statistika from './pages/Statistika';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admins"
            element={
              <ProtectedRoute requireSuperAdmin={true}>
                <Layout>
                  <Admins />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dillers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dillers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sotuvchilar"
            element={
              <ProtectedRoute>
                <Layout>
                  <Sotuvchilar />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistika"
            element={
              <ProtectedRoute>
                <Layout>
                  <Statistika />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;