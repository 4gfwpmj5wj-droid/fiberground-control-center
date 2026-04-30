import React, { useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Shield } from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { toast } from "sonner";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e: React.FormEvent, roleOverride?: "admin" | "mitarbeiter") => {
    e.preventDefault();
    if (!email && !roleOverride) {
      toast.error("Bitte E-Mail Adresse eingeben.");
      return;
    }
    const loginEmail = roleOverride ? (roleOverride === "admin" ? "admin@fiberground.de" : "mitarbeiter@fiberground.de") : email;
    
    if (login(loginEmail)) {
      navigate("/");
    } else {
      toast.error("Anmeldung fehlgeschlagen.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-white/10 shadow-lg shadow-cyan-500/20 mb-6">
            <Logo className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fiberground</h1>
          <p className="text-cyan-400/80 text-sm mt-1 uppercase tracking-widest font-semibold">Control Center</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Anmelden</h2>
            <p className="text-sm text-slate-400 mt-1">
              Bitte melden Sie sich mit Ihren Zugangsdaten an.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">E-Mail Adresse</label>
              <input 
                id="email" 
                type="email" 
                placeholder="m.mustermann@fiberground.de" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-200 placeholder:text-slate-600 transition-shadow"
                required={!email && email.length === 0} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Passwort</label>
                <a href="#" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Vergessen?</a>
              </div>
              <input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-200 transition-shadow"
                required={!password && password.length === 0} 
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-cyan-500/25 transition-all outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 mt-2">
              Anmelden
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
             <div className="relative mb-4 flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-slate-900/60 px-2 text-slate-500 absolute -top-6">Simulator</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => handleLogin(e, "mitarbeiter")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-medium transition-colors"
                >
                  <User className="w-3.5 h-3.5" /> Mitarbeiter
                </button>
                <button 
                  onClick={(e) => handleLogin(e, "admin")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-medium transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
