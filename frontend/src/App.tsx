import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<div className="text-center py-10">Login Page (Todo)</div>} />
          <Route path="register" element={<div className="text-center py-10">Register Page (Todo)</div>} />
          <Route path="matches" element={<div className="text-center py-10">Matches Page (Todo)</div>} />
          <Route path="chat" element={<div className="text-center py-10">Chat Page (Todo)</div>} />
          <Route path="*" element={<div className="text-center py-10">404 Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
