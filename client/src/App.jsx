import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import Assets from './pages/Assets';
import Sims from './pages/Sims';
import Calendar from './pages/Calendar';
import DeviceTypes from './pages/DeviceTypes';
import Projects from './pages/Projects';
import Software from './pages/Software';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

/**
 * Protected Route Wrapper
 * Checks if user is authenticated, otherwise redirects to login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="departments" element={<Departments />} />
            <Route path="employees" element={<Employees />} />
            <Route path="assets" element={<Assets />} />
            <Route path="sims" element={<Sims />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="device-types" element={<DeviceTypes />} />
            <Route path="projects" element={<Projects />} />
            <Route path="software" element={<Software />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
