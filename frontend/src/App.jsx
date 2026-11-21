import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import FamilyHubPage from './pages/FamilyHubPage';
import SubsidyPage from './pages/SubsidyPage';
import EmergencySupportPage from './pages/EmergencySupportPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import ConsentReviewPage from './pages/ConsentReviewPage';
import LinkConnectionModal from './components/LinkConnectionModal';
import ChatbotWidget from './components/ChatbotWidget';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // If on login or public consent page, render clean full-page layout without sidebar
  if (location.pathname === '/login' || location.pathname.startsWith('/consent/')) {
    return <>{children}<ChatbotWidget /></>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <footer className="lg:ml-64 bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>© 2026 Bharat Scheme. National Smart Gas Digital Platform.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>IOCL (Indane)</span>
            <span>•</span>
            <span>BPCL (Bharat Gas)</span>
            <span>•</span>
            <span>HPCL (HP Gas)</span>
            <span>•</span>
            <span className="text-red-600 font-bold">1906 Emergency Helpline</span>
          </div>
        </div>
      </footer>
      <ChatbotWidget />
    </div>
  );
}

function LinkPageHelper() {
  const [modalOpen, setModalOpen] = useState(true);
  return (
    <>
      <DashboardPage />
      <LinkConnectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLinked={() => window.location.href = '/'}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/link" element={<LinkPageHelper />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/family" element={<FamilyHubPage />} />
            <Route path="/subsidy" element={<SubsidyPage />} />
            <Route path="/support" element={<EmergencySupportPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/consent/:token" element={<ConsentReviewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
