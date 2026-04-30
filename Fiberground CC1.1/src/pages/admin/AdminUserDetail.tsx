import React from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, Clock, Lock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAuth } from "../../components/auth/AuthContext";
import { useData } from "../../components/auth/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminUserDetail() {
  const { role } = useAuth();
  const { users, requests, timeEntries } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  if (role !== "admin") {
    return <Navigate to="/403" replace />;
  }

  const user = users.find(u => u.id === id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-slate-400">Nutzer nicht gefunden.</p>
        <Link to="/admin"><Button variant="outline" className="bg-slate-800 text-white border-slate-700">Zurück zum Admin Center</Button></Link>
      </div>
    );
  }

  const userRequests = requests.filter(r => r.user_id === user.id);
  const userTimeEntries = timeEntries.filter(t => t.user_id === user.id);

  const handleDelete = () => {
    toast.info("Nutzer in Demo-Modus archiviert.");
    navigate("/admin");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col h-full">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              {user.name}
              {user.aktiv ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aktiv</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">Inaktiv</span>
              )}
            </h1>
            <p className="text-slate-400 mt-1 capitalize">{user.role} • {user.team}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white" onClick={() => toast.success("Passwort Reset Link versendet.")}><Lock className="w-4 h-4 mr-2"/> Passwort Reset</Button>
           <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-0" onClick={() => toast.info("Bearbeitungs-Dialog (Mock)")}><Edit className="w-4 h-4 mr-2"/> Bearbeiten</Button>
           <Button className="bg-rose-600 hover:bg-rose-500 text-white border-0" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2"/> Löschen</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Linke Spalte - Stammdaten & Verträge */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 border-b border-slate-800 pb-2">Stammdaten</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-medium text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Eintrittsdatum</p>
                <p className="font-medium text-white">{user.eintritt ? new Date(user.eintritt).toLocaleDateString('de-DE') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Team</p>
                <p className="font-medium text-white">{user.team}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Systemrolle</p>
                <p className="font-medium text-white capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 border-b border-slate-800 pb-2">Vertrag & Zeit</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">Sollstunden / Woche</p>
                <p className="font-bold text-white">{user.sollstunden} h</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">Jahresurlaub</p>
                <p className="font-bold text-white">{user.jahresurlaub} Tage</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                <p className="text-sm text-slate-400">Aktuelles Saldo</p>
                <p className="font-bold text-emerald-400">+12.5 h</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
             <h3 className="text-sm font-semibold text-amber-500 mb-2">Interne Notizen (Nur Admin)</h3>
             <textarea 
               className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 min-h-[100px] outline-none focus:border-amber-500/50 resize-none placeholder-slate-600" 
               placeholder="Notizen zum Mitarbeiter..." 
               defaultValue="Sonderfreigabe für Homeoffice am Freitag genehmigt (bis Jahresende)." 
             />
             <Button size="sm" variant="outline" className="mt-2 w-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 h-8">Notiz Speichern</Button>
          </div>
        </div>

        {/* Rechte Spalte - Historie */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Urlaubs- und Krankenhistorie */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h3 className="font-semibold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400"/> Urlaubs- & Abwesenheitshistorie</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Typ</th>
                    <th className="px-4 py-2 font-semibold">Zeitraum</th>
                    <th className="px-4 py-2 font-semibold text-right">Tage</th>
                    <th className="px-4 py-2 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {userRequests.length > 0 ? userRequests.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/20">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                            r.type === 'Urlaub' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            r.type === 'Krank' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(r.start_date).toLocaleDateString('de-DE')} {r.start_date !== r.end_date && `- ${new Date(r.end_date).toLocaleDateString('de-DE')}`}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{r.days}</td>
                      <td className="px-4 py-3 text-center">
                        {r.status === "Genehmigt" ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : 
                         r.status === "Abgelehnt" ? <XCircle className="w-4 h-4 text-rose-400 mx-auto" /> :
                         <span className="text-amber-400 text-xs font-medium">Offen</span>}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center py-6 text-slate-500">Keine Einträge vorhanden.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Letzte Zeitbuchungen */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h3 className="font-semibold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400"/> Letzte Arbeitszeiten</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Datum</th>
                    <th className="px-4 py-2 font-semibold">Erfassung</th>
                    <th className="px-4 py-2 font-semibold text-right">Zeiten</th>
                    <th className="px-4 py-2 font-semibold text-right">Netto (h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {userTimeEntries.length > 0 ? userTimeEntries.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium text-white">{new Date(t.date).toLocaleDateString('de-DE')}</td>
                      <td className="px-4 py-3">
                         {t.type === 'Live' ? <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Live</span>
                         : <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Manuell</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs text-slate-400">
                         {t.clock_in} - {t.clock_out || '...'} <span className="text-[10px] ml-1">({t.break_minutes}m)</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-cyan-400">
                         {(t.worked_minutes / 60).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center py-6 text-slate-500">Keine Zeiteinträge vorhanden.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
