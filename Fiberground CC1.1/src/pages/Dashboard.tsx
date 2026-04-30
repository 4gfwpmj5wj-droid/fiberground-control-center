import { Activity, Palmtree, UserMinus, FileText, ArrowRight, Clock, CheckSquare, Home, CalendarDays, Mail, Watch, TimerReset, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../components/auth/DataContext";
import { useAuth } from "../components/auth/AuthContext";
import { users } from "../lib/mock-data";

export default function Dashboard() {
  const { role, user } = useAuth();
  const { requests: absenceRequests, timeEntries, liveStates, workflowTasks } = useData();

  const openRequests = absenceRequests.filter(req => req.status === "Offen").length;
  
  const today = new Date().toISOString().split('T')[0];
  const missingToday = absenceRequests.filter(req => req.status === "Genehmigt" && req.type === "Krank" && req.start_date <= today && req.end_date >= today).length;
  const vacationToday = absenceRequests.filter(req => req.status === "Genehmigt" && req.type === "Urlaub" && req.start_date <= today && req.end_date >= today).length;
  const homeofficeToday = absenceRequests.filter(req => req.status === "Genehmigt" && req.type === "Homeoffice" && req.start_date <= today && req.end_date >= today).length;

  const clockedInCount = Object.values(liveStates).filter((state: any) => state.status === "Arbeitet" || state.status === "Pause").length;
  const totalTeamMembers = users.length;
  
  const capacityPercent = Math.round(((totalTeamMembers - vacationToday - missingToday) / totalTeamMembers) * 100);

  const teamStundenHeute = (timeEntries.filter(t => t.date === today && t.status === "Genehmigt").reduce((acc, curr) => acc + curr.worked_minutes, 0) / 60).toFixed(1);

  const pendingTasks = workflowTasks.filter(t => t.status === "Offen" && t.assigned_to === user?.id).length;

  const getRecentActivities = () => {
    // combine recent time entries and requests for demonstration
    const list: any[] = [];
    
    timeEntries.slice(0, 3).forEach(t => {
       const user = users.find(u => u.id === t.user_id);
       list.push({
         id: 't'+t.id,
         icon: Watch,
         color: "text-emerald-400 text-emerald-500/20 bg-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-emerald-500/20",
         title: `${user?.name} hat sich eingestempelt`,
         desc: `${new Date(t.created_at).toLocaleString('de-DE')} • ${t.type}`,
         date: new Date(t.created_at)
       });
    });

    absenceRequests.slice(0, 2).forEach(r => {
       const user = users.find(u => u.id === r.user_id);
       list.push({
         id: 'r'+r.id,
         icon: Palmtree,
         color: "text-blue-400 bg-blue-500/20 border-slate-700/30",
         title: `${user?.name} hat ${r.type} beantragt`,
         desc: `Zeitraum: ${new Date(r.start_date).toLocaleDateString('de-DE')} - ${new Date(r.end_date).toLocaleDateString('de-DE')}`,
         date: new Date(r.created_at)
       });
    });

    return list.sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
  };

  const activities = getRecentActivities();

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col">
      <div className="border-b border-slate-800 pb-4 mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Übersicht und schnelles Eingreifen in alle Prozesse.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: "Eingestempelt", value: `${clockedInCount}/${totalTeamMembers}`, icon: Watch, trend: "", trendText: "Im Büro / Homeoffice", negative: false },
          { title: "Heute im Urlaub", value: vacationToday.toString(), icon: Palmtree, trend: "", trendText: "Genehmigt", negative: false },
          { title: "Heute Krank", value: missingToday.toString(), icon: UserMinus, trend: "", trendText: "Gemeldet", negative: missingToday > 0 },
          { title: "Homeoffice", value: homeofficeToday.toString(), icon: Home, trend: "", trendText: "Remote", negative: false },
          { title: "Offene Aufgaben", value: pendingTasks.toString(), icon: FileText, trend: "", trendText: "Für dich", negative: pendingTasks > 0 },
          { title: "Offene Anträge", value: openRequests.toString(), icon: Clock, trend: "", trendText: "Im System", negative: openRequests > 0 },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative group overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold flex justify-between items-center z-10 relative">
               <span className="truncate mr-2">{stat.title}</span>
               <stat.icon className="w-4 h-4 text-cyan-400 shrink-0" />
            </p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 z-10 relative">
              <span className="text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{stat.value}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border self-start sm:self-auto ${stat.negative ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
                {stat.trendText}
              </span>
            </div>
            {/* Ambient card glow */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Smart Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
           {/* Workflow & Sofort zu Prüfen */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 rounded-t-2xl">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Heute offene Aufgaben & Workflows
                </h2>
                <Link to="/workflows" className="text-xs text-cyan-400 hover:underline">Zum Workflow Center</Link>
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/20 border border-emerald-500/30 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckSquare className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-sm text-white font-medium">{pendingTasks} Aufgaben warten auf dich</p>
                          <p className="text-[11px] text-slate-400">Bitte prüfe das Workflow Center</p>
                       </div>
                    </div>
                    <Link to="/workflows" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-md font-bold transition-colors">Prüfen</Link>
                 </div>
              </div>
           </div>

           {/* Letzte Aktivitäten */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 rounded-t-2xl">
                <h2 className="font-semibold text-white">Letzte Aktivitäten</h2>
                <button className="text-xs text-cyan-400 hover:underline">Alle ansehen</button>
              </div>
              <div className="p-4 space-y-4">
                 {activities.map((act) => (
                    <div key={act.id} className={`flex items-center gap-4 p-3 rounded-xl bg-slate-800/20 border transition-colors hover:bg-slate-800/40 cursor-default ${act.color}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                        <act.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{act.title}</p>
                        <p className="text-[11px] text-slate-500">{act.desc}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/workflows" className="px-3 py-1 bg-cyan-600 text-white text-[10px] rounded-md font-bold hover:bg-cyan-500 transition-colors">Details</Link>
                      </div>
                    </div>
                 ))}
                 {activities.length === 0 && <p className="text-slate-500 text-sm p-4 text-center">Keine Aktivitäten gefunden.</p>}
              </div>
           </div>
        </div>

        {/* Quick Actions & Live Warnings (Right Column) */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col pt-0">
             <div className="p-4 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> System- & HR-Hinweise</h3>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">4</span>
             </div>
             <div className="p-4 space-y-3 bg-gradient-to-b from-amber-500/5 to-transparent rounded-b-2xl max-h-[320px] overflow-y-auto no-scrollbar">
                {capacityPercent < 50 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                     <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1">Kritische Unterbesetzung</p>
                     <p className="text-sm text-white">Kapazität liegt bei {capacityPercent}% <span className="text-slate-400">(Handlungsempfehlung)</span></p>
                  </div>
                )}
                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                   <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Minusstunden Warnung</p>
                   <p className="text-sm text-white">Max Mustermann <span className="text-slate-400">(-8.5h in diesem Monat)</span></p>
                </div>
                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                   <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Pausenwarnung</p>
                   <p className="text-sm text-white">Sarah Bauer <span className="text-slate-400">(6.5h gearbeitet ohne Pause)</span></p>
                </div>
                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                   <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">Auffällige Fehlzeiten</p>
                   <p className="text-sm text-white">Anna Schmidt <span className="text-slate-400">(Am 3. Montag in Folge krank)</span></p>
                </div>
             </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl h-full shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/zeiterfassung" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-all group">
                <div className="flex items-center gap-3 text-emerald-400 group-hover:text-emerald-300">
                  <Watch className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">Zeiterfassung öffnen</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/urlaub" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-300 group-hover:text-cyan-400">
                  <Palmtree className="w-5 h-5" />
                  <span className="text-sm font-medium">Urlaub beantragen</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </Link>
              <Link to="/urlaub" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-300 group-hover:text-amber-400">
                  <UserMinus className="w-5 h-5" />
                  <span className="text-sm font-medium">Krank melden</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </Link>
              <Link to="/kalender" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-300 group-hover:text-blue-400">
                  <CalendarDays className="w-5 h-5" />
                  <span className="text-sm font-medium">Kalender öffnen</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

        {/* Nächste Abwesenheiten Tabelle */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col p-6 items-center justify-center text-center">
               <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center relative shadow-inner mb-4">
                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="50%" cy="50%" r="46%" className="stroke-slate-800 fill-none stroke-[8px]" />
                   <circle cx="50%" cy="50%" r="46%" className="stroke-emerald-500 fill-none stroke-[8px] transition-all duration-1000 ease-out" strokeLinecap="round" strokeDasharray={`${capacityPercent} 100`} pathLength="100" />
                 </svg>
                 <div className="flex flex-col">
                   <span className="text-4xl font-black text-white">{capacityPercent}%</span>
                   <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Kapazität</span>
                 </div>
               </div>
               <h3 className="font-semibold text-white">Team Verfügbarkeit (Heute)</h3>
               <p className="text-sm text-slate-400 mt-2 max-w-sm">
                 {totalTeamMembers - vacationToday - missingToday} von {totalTeamMembers} Mitarbeitern verfügbar.
               </p>
          </div>
  
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 rounded-t-2xl">
                <h2 className="font-semibold text-white">Nächste Abwesenheiten</h2>
                <Link to="/kalender" className="text-xs text-cyan-400 hover:underline">Alle</Link>
              </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Wer</th>
                    <th className="px-4 py-3 font-semibold">Typ</th>
                    <th className="px-4 py-3 font-semibold text-right">Datumsbereich</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {absenceRequests
                    .filter(r => r.status === "Genehmigt" && r.start_date >= today)
                    .sort((a,b) => a.start_date.localeCompare(b.start_date))
                    .slice(0, 4)
                    .map(r => {
                      const u = users.find(u => u.id === r.user_id);
                      return (
                        <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">{u?.name?.substring(0, 15)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] border ${
                              r.type === 'Urlaub' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              r.type === 'Homeoffice' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}>{r.type}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-400">
                             {new Date(r.start_date).toLocaleDateString('de-DE')}
                          </td>
                        </tr>
                      )
                    })}
                  {absenceRequests.filter(r => r.status === "Genehmigt" && r.start_date >= today).length === 0 && (
                     <tr><td colSpan={3} className="text-center p-4 text-slate-500 text-sm">Keine Einträge.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col pt-0">
              <div className="p-4 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl">
                 <h3 className="font-semibold text-white">Monatsübersicht</h3>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><Palmtree className="w-4 h-4"/></div>
                       <span className="text-sm font-medium text-slate-300">Urlaubstage</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-widest">{absenceRequests.filter(r => r.status === "Genehmigt" && r.type === "Urlaub" && r.start_date.startsWith(today.substring(0,7))).length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center"><UserMinus className="w-4 h-4"/></div>
                       <span className="text-sm font-medium text-slate-300">Krankheit</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-widest">{absenceRequests.filter(r => r.status === "Genehmigt" && r.type === "Krank" && r.start_date.startsWith(today.substring(0,7))).length}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center"><Home className="w-4 h-4"/></div>
                       <span className="text-sm font-medium text-slate-300">Homeoffice</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-widest">{absenceRequests.filter(r => r.status === "Genehmigt" && r.type === "Homeoffice" && r.start_date.startsWith(today.substring(0,7))).length}</span>
                 </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col p-4 bg-gradient-to-t from-emerald-500/5 to-transparent">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-2"><Activity className="w-4 h-4" /> 30-Tage Trend</h3>
              <p className="text-sm text-slate-300 mb-1">Überstunden vs. Soll {'>'} 105%</p>
              <div className="flex items-end gap-1 mt-2 h-12">
                 {[40, 60, 45, 75, 55, 80, 65, 90, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-500/20 border border-emerald-500/30 rounded-t-sm" style={{ height: `${h}%` }}></div>
                 ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
