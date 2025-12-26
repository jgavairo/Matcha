import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="matches" element={<div className="text-center py-10">Matches Page (Todo)</div>} />
          <Route path="chat" element={<div className="text-center py-10">Chat Page (Todo)</div>} />
          <Route path="*" element={<div className="text-center py-10">404 Not Found</div>} />
        </Route>
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
