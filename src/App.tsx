import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MentorDiscoveryPage from './pages/MentorDiscoveryPage';
import BookingPage from './pages/BookingPage';
import SessionPage from './pages/SessionPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/mentors" element={<PrivateRoute><MentorDiscoveryPage /></PrivateRoute>} />
      <Route path="/book/:mentorId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
      <Route path="/session/:roomId" element={<PrivateRoute><SessionPage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
