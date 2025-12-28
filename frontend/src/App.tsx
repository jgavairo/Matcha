import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@context/NotificationContext';
import { useAuth } from '@context/AuthContext';
import ToastContainer from '@features/notifications/components/ToastContainer';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@pages/HomePage';
import RegisterPage from '@pages/RegisterPage';
import LoginPage from '@pages/LoginPage';
import DiscoverPage from '@pages/DiscoverPage';
import SearchPage from '@pages/SearchPage';
import AppLayout from '@layouts/AppLayout';
import ProtectedRoute from '@components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <NotificationProvider>
      <ToastContainer />
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        <div id="main-content" className="flex-grow mt-16 flex flex-col overflow-hidden">
          <Routes>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/matches" element={<div className="text-center py-10">Matches Page (Todo)</div>} />
                  <Route path="/chat" element={<div className="text-center py-10">Chat Page (Todo)</div>} />
                </Route>
              </Route>
              
              <Route element={<MainLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<div className="text-center py-10">404 Not Found</div>} />
              </Route>

              <Route path="/" element={isAuthenticated ? <AppLayout /> : <MainLayout />}>
                <Route index element={isAuthenticated ? <DiscoverPage /> : <HomePage />} />
              </Route>
            </Routes>
            <Footer />
          </div>
        </div>
    </NotificationProvider>
  );
}

export default App
