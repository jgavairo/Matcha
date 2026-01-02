import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@context/NotificationContext';
import { useAuth } from '@context/AuthContext';
import ToastContainer from '@features/notifications/components/ToastContainer';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@pages/HomePage';
import RegisterPage from '@pages/RegisterPage';
import ForgotPasswordPage from '@pages/ForgotPasswordPage';
import LoginPage from '@pages/LoginPage';
import DiscoverPage from '@pages/DiscoverPage';
import SearchPage from '@pages/SearchPage';
import ProfilePage from '@pages/ProfilePage';
import ChatPage from '@pages/ChatPage';
import AppLayout from '@layouts/AppLayout';
import ProtectedRoute from '@components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <NotificationProvider>
      <ToastContainer />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/matches" element={<div className="text-center py-10">Matches Page (Todo)</div>} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Route>


        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<div className="text-center py-10">404 Not Found</div>} />
        </Route>

        <Route path="/" element={isAuthenticated ? <AppLayout /> : <MainLayout />}>
          <Route index element={isAuthenticated ? <DiscoverPage /> : <HomePage />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App
