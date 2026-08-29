import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LessonListPage } from './pages/LessonListPage.js';
import { LessonCreatePage } from './pages/LessonCreatePage.js';
import { LessonDetailPage } from './pages/LessonDetailPage.js';
import { ResourceHubPage } from './pages/ResourceHubPage.js';
import { ResourceUploadPage } from './pages/ResourceUploadPage.js';
import { CalendarPage } from './pages/CalendarPage.js';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Teacher Workspace Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/calendar"
          element={
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          }
        />
        <Route
          path="/lessons"
          element={
            <AppLayout>
              <LessonListPage />
            </AppLayout>
          }
        />
        <Route
          path="/lessons/create"
          element={
            <AppLayout>
              <LessonCreatePage />
            </AppLayout>
          }
        />
        <Route
          path="/lessons/:id"
          element={
            <AppLayout>
              <LessonDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/lessons/:id/edit"
          element={
            <AppLayout>
              <LessonCreatePage />
            </AppLayout>
          }
        />
        <Route
          path="/resources"
          element={
            <AppLayout>
              <ResourceHubPage />
            </AppLayout>
          }
        />
        <Route
          path="/resources/upload"
          element={
            <AppLayout>
              <ResourceUploadPage />
            </AppLayout>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
