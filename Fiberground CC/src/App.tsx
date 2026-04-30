/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import { DataProvider } from "./components/auth/DataContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Urlaub from "./pages/Urlaub";
import Zeiterfassung from "./pages/Zeiterfassung";
import Kalender from "./pages/Kalender";
import AiMailAssistant from "./pages/AiMailAssistant";
import Admin from "./pages/Admin";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import Workflows from "./pages/Workflows";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/urlaub" element={<AppLayout><Urlaub /></AppLayout>} />
            <Route path="/zeiterfassung" element={<AppLayout><Zeiterfassung /></AppLayout>} />
            <Route path="/kalender" element={<AppLayout><Kalender /></AppLayout>} />
            <Route path="/workflows" element={<AppLayout><Workflows /></AppLayout>} />
            <Route path="/mail-assistent" element={<AppLayout><AiMailAssistant /></AppLayout>} />
            <Route path="/admin" element={<AppLayout><ProtectedRoute reqRole="admin"><Admin /></ProtectedRoute></AppLayout>} />
            <Route path="/admin/users/:id" element={<AppLayout><ProtectedRoute reqRole="admin"><AdminUserDetail /></ProtectedRoute></AppLayout>} />
            <Route path="/403" element={<AppLayout><NotAuthorized /></AppLayout>} />
            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </Router>
        <Toaster theme="dark" position="top-right" richColors toastOptions={{
          style: { background: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc' }
        }} />
      </DataProvider>
    </AuthProvider>
  );
}
