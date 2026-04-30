import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../components/auth/AuthContext";
import { useData } from "../components/auth/DataContext";
import { users } from "../lib/mock-data";
import { CalendarDays, Clock, CheckSquare, XCircle, Palmtree, UserMinus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Urlaub() {
  const { role, user } = useAuth();
  const { requests, addRequest, updateRequestStatus } = useData();

  // Simple form states
  const [formData, setFormData] = useState({
    type: "Urlaub",
    start_date: "",
    end_date: "",
    comment: "",
    halfDay: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      toast.error("Bitte Start- und Enddatum eingeben.");
      return;
    }
    
    // Calculate dummy days
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (end < start) {
      toast.error("Enddatum darf nicht vor dem Startdatum liegen.");
      return;
    }

    // Overlap validation
    const overlapping = requests.find(r => 
      r.user_id === user?.id && 
      r.status !== "Abgelehnt" && // only care about active requests
      ((formData.start_date >= r.start_date && formData.start_date <= r.end_date) ||
       (formData.end_date >= r.start_date && formData.end_date <= r.end_date) ||
       (formData.start_date <= r.start_date && formData.end_date >= r.end_date))
    );

    if (overlapping) {
      toast.error("Überschneidung mit einem bestehenden Antrag!");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (formData.halfDay) diffDays -= 0.5;

    addRequest({
      user_id: user?.id || "2", 
      type: formData.type as any,
      start_date: formData.start_date,
      end_date: formData.end_date,
      days: diffDays,
      status: "Offen",
      comment: formData.comment
    });

    setFormData({ type: "Urlaub", start_date: "", end_date: "", comment: "", halfDay: false });
    toast.success("Antrag erfolgreich eingereicht.");
  };

  const handleStatusUpdate = (id: string, status: "Genehmigt" | "Abgelehnt") => {
    updateRequestStatus(id, status);
    toast.success(`Antrag wurde ${status.toLowerCase()}`);
  }

  const myRequests = requests.filter(r => r.user_id === user?.id);
  const myApprovedDays = myRequests.filter(r => r.type === "Urlaub" && r.status === "Genehmigt").reduce((acc, curr) => acc + curr.days, 0);
  const myOpenRequestsCount = myRequests.filter(r => r.status === "Offen").length;
  const mySickDays = myRequests.filter(r => r.type === "Krank" && r.status === "Genehmigt").reduce((acc, curr) => acc + curr.days, 0);
  const mySpecialLeave = myRequests.filter(r => r.type === "Sonderurlaub" && r.status === "Genehmigt").reduce((acc, curr) => acc + curr.days, 0);

  const myTotalVacationDays = users.find(u => u.id === user?.id)?.jahresurlaub || 24;

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Abwesenheiten</h1>
        <p className="text-slate-400 mt-1">Beantrage Urlaub und melde Abwesenheiten.</p>
      </div>

      <Tabs defaultValue="meine" className="w-full">
        <TabsList className="bg-slate-900/60 border border-slate-800 mb-6">
          <TabsTrigger value="meine" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Meine Abwesenheiten</TabsTrigger>
          {role === "admin" && (
            <TabsTrigger value="team" className="data-[state=active]:bg-fuchsia-500/10 data-[state=active]:text-fuchsia-400">Team Verwaltung</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="meine" className="space-y-6 mt-0">
          {/* User KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Mein Resturlaub</p>
              <p className="text-2xl font-bold text-white mt-1">{myTotalVacationDays - myApprovedDays} <span className="text-sm font-medium text-slate-500">Tage</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Genommen</p>
              <p className="text-2xl font-bold text-white mt-1">{myApprovedDays} <span className="text-sm font-medium text-slate-500">Tage</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Offene Anträge</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{myOpenRequestsCount}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Kranktage Jahr</p>
              <p className="text-2xl font-bold text-white mt-1">{mySickDays} <span className="text-sm font-medium text-slate-500">Tage</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Sonderurlaub</p>
              <p className="text-2xl font-bold text-white mt-1">{mySpecialLeave} <span className="text-sm font-medium text-slate-500">Tage</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl h-fit">
              <h2 className="font-semibold text-white mb-4">Neuer Antrag / Meldung</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Typ</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none"
                  >
                    <option value="Urlaub">Urlaub</option>
                    <option value="Krank">Krank</option>
                    <option value="Kind krank">Kind krank</option>
                    <option value="Homeoffice">Homeoffice</option>
                    <option value="Sonderurlaub">Sonderurlaub</option>
                    <option value="Schulung">Schulung</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Von</label>
                    <input 
                      type="date"
                      value={formData.start_date}
                      onChange={e => setFormData({...formData, start_date: e.target.value})}
                      required
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none block"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Bis</label>
                    <input 
                      type="date"
                      value={formData.end_date}
                      onChange={e => setFormData({...formData, end_date: e.target.value})}
                      required
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none block"
                    />
                  </div>
                </div>
                {formData.type === "Urlaub" && (
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="half" 
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500" 
                      checked={formData.halfDay}
                      onChange={e => setFormData({...formData, halfDay: e.target.checked})}
                    />
                    <label htmlFor="half" className="text-sm text-slate-300">Halber Tag?</label>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Kommentar</label>
                  <textarea 
                    value={formData.comment}
                    onChange={e => setFormData({...formData, comment: e.target.value})}
                    placeholder="Optional..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none h-20 resize-none"
                  ></textarea>
                </div>
                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
                  Einreichen
                </Button>
              </form>
            </div>

            {/* History */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-semibold text-white">Historie & Aktuelle Anträge</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Zeitraum</th>
                      <th className="px-4 py-3 font-semibold">Typ</th>
                      <th className="px-4 py-3 font-semibold text-center">Tage</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {myRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 tabular-nums">{req.start_date} <span className="text-slate-500">bis</span> {req.end_date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs border ${
                            req.type === 'Urlaub' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                            req.type === 'Krank' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {req.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{req.days}</td>
                        <td className="px-4 py-3">
                           {req.status === "Offen" && <span className="flex items-center gap-1 text-amber-400"><Clock className="w-3 h-3"/> Offen</span>}
                           {req.status === "Genehmigt" && <span className="flex items-center gap-1 text-emerald-400"><CheckSquare className="w-3 h-3"/> Genehmigt</span>}
                           {req.status === "Abgelehnt" && <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3"/> Abgelehnt</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{req.comment || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {myRequests.length === 0 && (
                  <div className="p-8 text-center text-slate-500">Keine Daten vorhanden.</div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {role === "admin" && (
          <TabsContent value="team" className="space-y-6 mt-0">
             {/* Admin: Offene Anträge */}
             <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="font-semibold text-white">Offene Anträge ({requests.filter(r=>r.status==='Offen').length})</h2>
                </div>
                <div className="p-4 space-y-3">
                  {requests.filter(r => r.status === "Offen").map(req => {
                    const reqUser = users.find(u => u.id === req.user_id);
                    return (
                      <div key={req.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex flex-col items-center justify-center text-cyan-400 shrink-0 leading-none">
                          <span className="font-bold text-sm text-white">{req.days}</span>
                          <span className="text-[8px] uppercase">Tage</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{reqUser?.name} <span className="font-normal text-slate-400 text-xs ml-2">beantragt {req.type}</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">{req.start_date} bis {req.end_date} • {req.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusUpdate(req.id, "Genehmigt")} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs rounded-md font-bold hover:bg-emerald-600/40 transition-colors">Genehmigen</button>
                          <button onClick={() => handleStatusUpdate(req.id, "Abgelehnt")} className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs rounded-md font-bold hover:bg-rose-600/40 transition-colors">Ablehnen</button>
                        </div>
                      </div>
                    )
                  })}
                  {requests.filter(r => r.status === "Offen").length === 0 && (
                    <div className="text-sm text-slate-500 py-2">Keine offenen Anträge.</div>
                  )}
                </div>
             </div>

             {/* Admin: Mitarbeiter Übersicht */}
             <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="font-semibold text-white">Mitarbeiter Übersicht</h2>
                  <Button variant="outline" size="sm" className="h-8 border-slate-700 text-slate-300 hover:text-white bg-slate-800/50" onClick={() => toast.success("Export gestartet...")}>
                    CSV Export
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold text-center">Jahresurlaub</th>
                        <th className="px-6 py-3 font-semibold text-center">Genommen</th>
                        <th className="px-6 py-3 font-semibold text-center">Rest</th>
                        <th className="px-6 py-3 font-semibold text-center">Kranktage</th>
                        <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {users.map(u => {
                        const approvedVacation = requests.filter(r => r.user_id === u.id && r.type === "Urlaub" && r.status === "Genehmigt").reduce((acc, curr) => acc + curr.days, 0);
                        const sickDays = requests.filter(r => r.user_id === u.id && r.type === "Krank" && r.status === "Genehmigt").reduce((acc, curr) => acc + curr.days, 0);
                        
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                            <td className="px-6 py-4 text-center">{u.jahresurlaub}</td>
                            <td className="px-6 py-4 text-center">{approvedVacation}</td>
                            <td className="px-6 py-4 text-center font-bold text-cyan-400">{u.jahresurlaub - approvedVacation}</td>
                            <td className="px-6 py-4 text-center text-red-400/80">{sickDays}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-xs text-slate-400 hover:text-white underline">Anpassen</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
             </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
