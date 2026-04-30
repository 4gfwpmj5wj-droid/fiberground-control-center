import React from "react";
import { Check, X, MessageSquare, Clock, Palmtree, UserMinus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "../auth/DataContext";
import { useAuth } from "../auth/AuthContext";
import { users } from "../../lib/mock-data";
import { toast } from "sonner";

export default function AdminApprovals() {
  const { role } = useAuth();
  const { requests, timeEntries, updateRequestStatus, updateTimeEntryStatus } = useData();

  const openRequests = requests.filter(r => r.status === "Offen");
  const openTimeEntries = timeEntries.filter(t => t.status === "Offen" && t.type === "Manuell");

  const handleRequestApproval = (id: string, status: "Genehmigt" | "Abgelehnt") => {
    updateRequestStatus(id, status, role === "admin" ? "Genehmigt von Admin" : "");
    toast.success(`Antrag wurde ${status.toLowerCase()}`);
  };

  const handleTimeEntryApproval = (id: string, status: "Genehmigt" | "Abgelehnt") => {
    updateTimeEntryStatus(id, status);
    toast.success(`Zeitkorrektur wurde ${status.toLowerCase()}`);
  };

  // We need to import useAuth if we want to pass role, but actually DataContext already checks.
  // We can just omit comment or pass a string.
  
  return (
    <div className="space-y-6">
      
      {/* Abwesenheiten */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
           <h2 className="font-semibold text-white flex items-center gap-2"><Palmtree className="w-4 h-4 text-amber-400" /> Urlaubs & Abwesenheitsanträge ({openRequests.length})</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
           {openRequests.length > 0 ? openRequests.map(req => {
             const u = users.find(x => x.id === req.user_id);
             return (
               <div key={req.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                        {u?.name.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-medium text-white">{u?.name}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mr-2 ${req.type === 'Urlaub' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>{req.type}</span>
                          {new Date(req.start_date).toLocaleDateString('de-DE')} - {new Date(req.end_date).toLocaleDateString('de-DE')} ({req.days} Tage)
                        </p>
                        {req.comment && <p className="text-sm text-slate-500 mt-1 italic w-full">"{req.comment}"</p>}
                     </div>
                  </div>
                  <div className="flex border-t border-slate-800 pt-3 lg:border-0 lg:pt-0 gap-2">
                     <Button size="sm" variant="outline" onClick={() => handleRequestApproval(req.id, "Genehmigt")} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex-1 lg:flex-none"><Check className="w-4 h-4 mr-1"/> Genehmigen</Button>
                     <Button size="sm" variant="outline" onClick={() => handleRequestApproval(req.id, "Abgelehnt")} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 flex-1 lg:flex-none"><X className="w-4 h-4 mr-1"/> Ablehnen</Button>
                     <Button size="icon" variant="outline" className="bg-slate-800 border-slate-700 text-slate-400 hover:text-white" title="Rückfrage"><MessageSquare className="w-4 h-4"/></Button>
                  </div>
               </div>
             );
           }) : (
             <div className="p-8 text-center text-slate-500">Keine offenen Abwesenheitsanträge vorhanden.</div>
           )}
        </div>
      </div>

      {/* Zeitkorrekturen */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
           <h2 className="font-semibold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> Zeitkorrekturen ({openTimeEntries.length})</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
           {openTimeEntries.length > 0 ? openTimeEntries.map(te => {
             const u = users.find(x => x.id === te.user_id);
             return (
               <div key={te.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                        {u?.name.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="font-medium text-white">{u?.name} <span className="text-xs font-normal text-slate-500 ml-2">{new Date(te.date).toLocaleDateString('de-DE')}</span></h3>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                           <span className="text-emerald-400 font-medium">{te.clock_in}</span> - <span className="text-rose-400 font-medium">{te.clock_out}</span>
                           <span className="text-slate-500">({te.break_minutes}m Pause)</span>
                           <span className="text-cyan-400 font-bold ml-2">{(te.worked_minutes / 60).toFixed(1)}h</span>
                        </p>
                        {te.comment && <p className="text-sm text-slate-500 mt-1 italic w-full">"{te.comment}"</p>}
                     </div>
                  </div>
                  <div className="flex border-t border-slate-800 pt-3 lg:border-0 lg:pt-0 gap-2">
                     <Button size="sm" variant="outline" onClick={() => handleTimeEntryApproval(te.id, "Genehmigt")} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex-1 lg:flex-none"><Check className="w-4 h-4 mr-1"/> Genehmigen</Button>
                     <Button size="sm" variant="outline" onClick={() => handleTimeEntryApproval(te.id, "Abgelehnt")} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 flex-1 lg:flex-none"><X className="w-4 h-4 mr-1"/> Ablehnen</Button>
                     <Button size="icon" variant="outline" className="bg-slate-800 border-slate-700 text-slate-400 hover:text-white" title="Rückfrage"><MessageSquare className="w-4 h-4"/></Button>
                  </div>
               </div>
             );
           }) : (
             <div className="p-8 text-center text-slate-500">Keine offenen Zeitkorrekturen vorhanden.</div>
           )}
        </div>
      </div>

    </div>
  );
}
