import { Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '@context/NotificationContext';
import { ChatProvider } from '@context/ChatContext';
import { CallProvider } from '@context/CallContext';
import { useAuth } from '@context/AuthContext';
import ToastContainer from '@features/notifications/components/ToastContainer';
import NotificationListener from '@features/notifications/components/NotificationListener';
import MainLayout from '@layouts/MainLayout';
import AppLayout from '@layouts/AppLayout';
import SimpleLayout from '@layouts/SimpleLayout';
import HomePage from '@pages/HomePage';
import RegisterPage from '@pages/RegisterPage';
import ForgotPasswordPage from '@pages/ForgotPasswordPage';
import LoginPage from '@pages/LoginPage';
import DiscoverPage from '@pages/DiscoverPage';
import SearchPage from '@pages/SearchPage';
import ProfilePage from '@pages/ProfilePage';
import ChatPage from '@pages/ChatPage';
import ProtectedRoute from '@components/ProtectedRoute';
import UnauthenticatedRoute from '@components/UnauthenticatedRoute';
import VerifyEmailPage from '@pages/VerifyEmailPage';
import ResetPasswordPage from '@pages/ResetPasswordPage';
import CompleteProfilePage from '@pages/CompleteProfilePage';

function App() {
  const { isAuthenticated, user } = useAuth();

  const isProfileComplete = user?.statusId === 2;

  return (
    <NotificationProvider>
      <ChatProvider>
        <CallProvider>
        <ToastContainer />
        <NotificationListener />
        <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/matches" element={<div className="text-center py-10">Matches Page (Todo)</div>} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          <Route element={<SimpleLayout />}>
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
          </Route>
        </Route>


        <Route element={<UnauthenticatedRoute />}>
            <Route element={<MainLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<div className="text-center py-10">404 Not Found</div>} />
            </Route>
        </Route>

        {/* Public Route (Accessible both logged in and logged out) */}
        <Route element={<MainLayout />}>
           <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route path="/" element={
          isAuthenticated 
            ? (isProfileComplete ? <AppLayout /> : <SimpleLayout />)
            : <MainLayout />
        }>
          <Route index element={
            isAuthenticated 
              ? (isProfileComplete ? <DiscoverPage /> : <CompleteProfilePage />)
              : <HomePage />
          } />
        </Route>
      </Routes>
      </CallProvider>
      </ChatProvider>
    </NotificationProvider>
  );
}

export default App
