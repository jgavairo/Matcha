import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@context/NotificationContext';
import ToastContainer from '@features/notifications/components/ToastContainer';
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@pages/HomePage';
import RegisterPage from '@pages/RegisterPage';
import LoginPage from '@pages/LoginPage';
import DiscoverPage from '@pages/DiscoverPage';
import AppLayout from '@layouts/AppLayout';
import ProtectedRoute from '@components/ProtectedRoute';

function App() {
  return (
    <NotificationProvider>
      <ToastContainer />
      <BrowserRouter>
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <div className="flex-grow overflow-y-auto mt-16 flex flex-col">
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<DiscoverPage />} />
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
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App
