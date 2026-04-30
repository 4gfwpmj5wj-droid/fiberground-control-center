import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Workflow, CheckCircle, Clock, AlertTriangle, ChevronRight, Inbox, Filter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "../components/auth/DataContext";
import { useAuth } from "../components/auth/AuthContext";
import { toast } from "sonner";

export default function Workflows() {
  const { role, user } = useAuth();
  const { workflowTasks, updateTaskStatus } = useData();
  const [filter, setFilter] = useState<"Alle" | "Offen" | "Erledigt">("Offen");

  // Only show tasks assigned to this user, or if admin, maybe all tasks (but mock data assigns per user)
  const myTasks = workflowTasks.filter(t => t.assigned_to === user?.id);
  const filteredTasks = myTasks.filter(t => filter === "Alle" || t.status === filter);

  const completeTask = (id: string) => {
    updateTaskStatus(id, "Erledigt");
    toast.success("Aufgabe abgeschlossen");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col h-full">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Workflow className="w-6 h-6 text-cyan-400" /> Workflow Center
          </h1>
          <p className="text-slate-400 mt-1">Verwalten Sie Prozessschritte, Freigaben und Automatisierungen.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white" onClick={() => setFilter("Alle")}>Alle anzeigen</Button>
           <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-0"><Send className="w-4 h-4 mr-2"/> Neuen Workflow starten</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Ihre Aufgaben</h3>
             
             <button 
                onClick={() => setFilter("Offen")}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${filter === "Offen" ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
             >
                <div className="flex items-center gap-2">
                   <Inbox className="w-4 h-4" /> Offen
                </div>
                {myTasks.filter(t => t.status === "Offen").length > 0 && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold">{myTasks.filter(t => t.status === "Offen").length}</span>}
             </button>

             <button 
                onClick={() => setFilter("Erledigt")}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${filter === "Erledigt" ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
             >
                <div className="flex items-center gap-2">
                   <CheckCircle className="w-4 h-4" /> Erledigt
                </div>
             </button>
             
             <div className="my-2 border-t border-slate-800"></div>

             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 mt-2">Kategorien</h3>
             <button className="flex items-center text-sm gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 w-full text-left">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Freigaben
             </button>
             <button className="flex items-center text-sm gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 w-full text-left">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Zeitkorrekturen
             </button>
             <button className="flex items-center text-sm gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 w-full text-left">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> System-Tasks
             </button>

             {role === "admin" && (
             <div className="mt-8 bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl">
                 <h4 className="text-xs font-semibold text-white flex items-center gap-2 mb-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Fehlende Buchungen</h4>
                 <p className="text-xs text-slate-400 mb-3">2 Mitarbeiter haben gestern keinen Feierabend gebucht.</p>
                 <Link to="/admin" className="w-full">
                   <Button size="sm" variant="outline" className="w-full text-[10px] h-7 bg-slate-900 border-slate-700">Jetzt korrigieren</Button>
                 </Link>
             </div>
             )}

             <div className="mt-4 bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                 <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-3">
                   E-Mail Benachrichtigungen
                 </h4>
                 <div className="space-y-3">
                   <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Neue Urlaubsanträge</span>
                      <div className="relative inline-flex items-center">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                      </div>
                   </label>
                   <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Krankmeldungen</span>
                      <div className="relative inline-flex items-center">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                      </div>
                   </label>
                   <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Automatische Erinnerungen</span>
                      <div className="relative inline-flex items-center">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                      </div>
                   </label>
                 </div>
             </div>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-3 flex flex-col gap-4">
           {filteredTasks.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-2xl bg-slate-900/20 text-slate-500 p-8">
               <CheckCircle className="w-12 h-12 mb-4 text-emerald-500/20" />
               <h3 className="font-semibold text-white mb-1">Alles erledigt!</h3>
               <p className="text-sm">Sie haben aktuell keine Aufgaben in dieser Ansicht.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {filteredTasks.map(task => (
                 <div key={task.id} className={`bg-slate-900/60 border rounded-2xl p-5 transition-all ${task.status === 'Erledigt' ? 'border-slate-800/50 opacity-60' : 'border-slate-700 hover:border-cyan-500/50'}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                       <div className="flex items-start gap-4">
                          <div className={`mt-1 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                             task.status === 'Erledigt' ? 'bg-slate-800 text-slate-500' :
                             task.priority === 'Hoch' ? 'bg-rose-500/20 text-rose-400' :
                             task.priority === 'Normal' ? 'bg-blue-500/20 text-blue-400' :
                             'bg-emerald-500/20 text-emerald-400'
                          }`}>
                             {task.status === 'Erledigt' ? <CheckCircle className="w-5 h-5" /> :
                              task.type === 'Approval' ? <CheckCircle className="w-5 h-5" /> :
                              <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold ${task.status === 'Erledigt' ? 'text-slate-300' : 'text-white'}`}>{task.title}</h3>
                                {task.priority === 'Hoch' && task.status === 'Offen' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">Priorität</span>}
                             </div>
                             <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                             
                             <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Erstellt: {new Date(task.created_at).toLocaleDateString('de-DE')}</span>
                                <span className="flex items-center gap-1"><Workflow className="w-3 h-3" /> Typ: {task.type}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                          {task.status === 'Offen' ? (
                            <>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white w-full md:w-32 text-xs" onClick={() => completeTask(task.id)}>Erledigen</Button>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5"/> Abgeschlossen</span>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
