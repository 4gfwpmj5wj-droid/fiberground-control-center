import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import OnboardingModal from "./OnboardingModal";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      <OnboardingModal user={user} />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
           className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
           onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar with mobile toggle */}
      <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:flex`}>
         <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0 w-full">
        <Header toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
          {children}
          {/* Bottom Ambient Effect */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none"></div>
        </main>
      </div>
    </div>
  );
}
