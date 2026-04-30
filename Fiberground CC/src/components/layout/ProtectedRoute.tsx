import { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, reqRole }: { children: ReactNode, reqRole?: "admin" | "mitarbeiter" }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (reqRole && role !== reqRole) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
