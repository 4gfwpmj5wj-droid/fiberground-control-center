import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useData } from "../auth/DataContext";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Bell, CheckCircle, Clock, AlertTriangle, Workflow, ChevronDown, Menu, MessageSquare, Send } from "lucide-react";
import { Logo } from "../ui/Logo";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function Header({ toggleMobileMenu }: { toggleMobileMenu?: () => void }) {
  const { logout, role, user } = useAuth();
  const { notifications, markNotificationRead, addFeedback } = useData();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const currentUserNotifications = notifications.filter(n => n.user_id === user?.id || n.user_id === "all");
  const unreadCount = currentUserNotifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(event.target as Node)) {
        setShowFeedback(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    currentUserNotifications.forEach(n => markNotificationRead(n.id));
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    if (user) {
      addFeedback({
        user_id: user.id,
        text: feedbackText
      });
    }
    toast.success("Feedback erfolgreich gesendet! Danke.");
    setFeedbackText("");
    setShowFeedback(false);
  };

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Urlaub & Abwesenheit", path: "/urlaub" },
    { name: "Zeiterfassung", path: "/zeiterfassung" },
    { name: "Kalender", path: "/kalender" },
    { name: "Workflows", path: "/workflows" },
  ];

  if (role === "admin") {
    navLinks.push({ name: "Admin Center", path: "/admin" });
  }

  const currentNavName = navLinks.find(link => location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path)))?.name || 'Dashboard';

  const getCategoryColor = (category?: string) => {
    if (category === "kritisch") return "text-red-400 bg-red-400/10 border-red-500/20";
    if (category === "wichtig") return "text-amber-400 bg-amber-400/10 border-amber-500/20";
    return "text-cyan-400 bg-cyan-400/10 border-cyan-500/20";
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-40">
      <div className="flex items-center gap-4">
        {toggleMobileMenu && (
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-6 hidden md:flex">
           <div className="relative group cursor-pointer">
             <h1 className="text-xl font-bold text-white flex items-center gap-2">
               {currentNavName}
               <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
             </h1>
             
             <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
               {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className={`block px-4 py-2 text-sm transition-colors ${location.pathname === link.path ? 'text-cyan-400 bg-slate-800/50 font-medium' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>
               ))}
             </div>
           </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Feedback Button */}
        <div className="relative" ref={feedbackRef}>
           <button 
             onClick={() => setShowFeedback(!showFeedback)}
             className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none hidden sm:block"
             title="Feedback geben"
           >
             <MessageSquare className="w-5 h-5" />
           </button>
           
           {showFeedback && (
             <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-semibold text-white mb-2">Feedback & Wünsche</h3>
                <p className="text-xs text-slate-400 mb-4">Gibt es ein Problem oder hast du eine Idee zur Verbesserung?</p>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24 mb-3"
                  placeholder="Beschreibe dein Anliegen..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <Button onClick={handleSendFeedback} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Senden
                </Button>
             </div>
           )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border-2 border-slate-900"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
                <h3 className="font-semibold text-white flex items-center gap-2">Mitteilungen {unreadCount > 0 && <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>}</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-slate-400 hover:text-white hover:underline transition-colors">Alle als gelesen markieren</button>
                )}
              </div>
              <div className="overflow-y-auto no-scrollbar flex-1 p-2 space-y-1 bg-slate-900/50">
                {currentUserNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Keine neuen Benachrichtigungen
                  </div>
                ) : (
                  currentUserNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-xl transition-all cursor-default border ${notification.read ? 'bg-transparent border-transparent opacity-60' : 'bg-slate-800/40 border-slate-700/50 shadow-sm'}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                          notification.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                           notification.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           notification.type === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                           <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                             <p className={`text-sm font-medium truncate ${notification.read ? 'text-slate-300' : 'text-white'}`}>{notification.title}</p>
                             {notification.category && (
                               <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${getCategoryColor(notification.category)}`}>
                                 {notification.category}
                               </span>
                             )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5 break-words line-clamp-2 leading-relaxed">{notification.message}</p>
                          <div className="flex items-center justify-between mt-3">
                             <span className="text-[10px] text-slate-500">{new Date(notification.created_at).toLocaleString('de-DE', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })}</span>
                             <div className="flex items-center gap-3">
                               <Link to={notification.target_url} onClick={() => { markNotificationRead(notification.id); setShowNotifications(false); }} className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">Anzeigen</Link>
                               {!notification.read && <button onClick={() => markNotificationRead(notification.id)} className="text-[11px] text-slate-500 hover:text-white transition-colors">Gelesen</button>}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-center">
                 <Link to="/workflows" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2">
                   <Workflow className="w-3.5 h-3.5" />
                   Workflow Center öffnen
                 </Link>
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 hidden sm:flex">
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
