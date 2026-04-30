import React from "react";
import { Users, UserCheck, UserMinus, UserX, FileText, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { useData } from "../auth/DataContext";
import { users } from "../../lib/mock-data";

export default function AdminOverview() {
  const { requests, timeEntries, liveStates } = useData();

  const today = new Date().toISOString().split('T')[0];

  const presentCount = Object.values(liveStates).filter((s: any) => s.status === "Arbeitet" || s.status === "Pause").length;
  const missingCount = requests.filter(r => r.status === "Genehmigt" && r.start_date <= today && r.end_date >= today).length;
  const sickCount = requests.filter(r => r.status === "Genehmigt" && r.type === "Krank" && r.start_date <= today && r.end_date >= today).length;

  const openAbsences = requests.filter(r => r.status === "Offen").length;
  const openTimeCorrections = timeEntries.filter(t => t.status === "Offen").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Mitarbeiter Gesamt", value: users.length, icon: Users, color: "text-blue-400" },
          { title: "Heute Anwesend", value: presentCount, icon: UserCheck, color: "text-emerald-400" },
          { title: "Heute Abwesend", value: missingCount, icon: UserMinus, color: "text-amber-400" },
          { title: "Heute Krank", value: sickCount, icon: UserX, color: "text-rose-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex justify-between items-center z-10 relative">
              {stat.title}
              <stat.icon className={`w-4 h-4 ${stat.color} shrink-0`} />
            </p>
            <div className="mt-3 relative z-10">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
           <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Ausstehende Freigaben</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                 <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Urlaubsanträge</p>
                 <p className="text-2xl font-bold text-amber-400 mt-2">{openAbsences}</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                 <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Zeitkorrekturen</p>
                 <p className="text-2xl font-bold text-cyan-400 mt-2">{openTimeCorrections}</p>
              </div>
           </div>
        </div>
        <div className="col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
           <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Team Saldo</h3>
           <div className="space-y-4">
              <div>
                 <div className="flex justify-between items-end mb-1">
                    <p className="text-xs text-slate-400">Team Überstunden</p>
                    <p className="text-sm font-bold text-emerald-400">+ 124.5h</p>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[60%]"></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between items-end mb-1">
                    <p className="text-xs text-slate-400">Team Fehlstunden</p>
                    <p className="text-sm font-bold text-rose-400">- 42.0h</p>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[20%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
