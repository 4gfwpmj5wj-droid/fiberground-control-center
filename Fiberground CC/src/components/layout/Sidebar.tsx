import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { 
  LayoutDashboard, 
  Palmtree, 
  Clock, 
  CalendarDays, 
  Mail, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "../ui/Logo";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Urlaub", href: "/urlaub", icon: Palmtree },
  { label: "Zeiterfassung", href: "/zeiterfassung", icon: Clock },
  { label: "Kalender", href: "/kalender", icon: CalendarDays },
  { label: "KI Mail Assistent", href: "/mail-assistent", icon: Mail },
];

export default function Sidebar() {
  const { role, user } = useAuth();
  
  const initials = user?.name ? user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : 'M';

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col shrink-0 transition-all">
      <div className="h-16 flex items-center px-6 shrink-0 mt-2">
        <div className="flex items-center gap-3 text-white font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <Logo className="w-5 h-5 text-white" />
          </div>
          FIBERGROUND
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-400 hover:bg-slate-800"
                )
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}

        {role === "admin" && (
          <>
            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administration
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-400 hover:bg-slate-800"
                )
              }
            >
              <Shield className="w-5 h-5" />
              Admin
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 border-2 border-cyan-500/50 flex items-center justify-center font-bold text-slate-300">
             {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Mitarbeiter"}</p>
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">{role || "User"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
