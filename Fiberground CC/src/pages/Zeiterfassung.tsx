import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../components/auth/AuthContext";
import { useData } from "../components/auth/DataContext";
import { users } from "../lib/mock-data";
import { Clock, Play, Square, Pause, Plus, List, BarChart3, AlertCircle, CheckCircle2, ChevronRight, CheckSquare, XCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Zeiterfassung() {
  const { role, user } = useAuth();
  const userId = user?.id || "1";
  const { timeEntries, addTimeEntry, updateTimeEntryStatus, liveStates, updateLiveState } = useData();

  const [activeTab, setActiveTab] = useState("erfassen");
  
  // Realtime clock locally
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateWorkedMinutes = (start: string, end: string, pause: number) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let totalMins = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMins < 0) totalMins += 24 * 60; // handle overnight
    return Math.max(0, totalMins - pause);
  };

  const myState = liveStates[userId] || { status: "Nicht eingestempelt", since: null };
  const liveMins = (myState.status !== "Nicht eingestempelt" && myState.status !== "Feierabend" && myState.since) 
    ? calculateWorkedMinutes(myState.since, currentTime, 0) : 0;

  const handleLiveAction = (action: "start" | "pause" | "stop") => {
    let newStatus: any = "Nicht eingestempelt";
    if (action === "start") newStatus = myState.status === "Pause" ? "Arbeitet" : "Arbeitet";
    else if (action === "pause") newStatus = "Pause";
    else if (action === "stop") newStatus = "Feierabend";
    
    updateLiveState(userId, { status: newStatus, since: newStatus === "Feierabend" ? "" : (myState.since || new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })) });
    
    if (action === "stop") {
      const breakMins = 30; // mock default pause length for now
      const worked = calculateWorkedMinutes(myState.since || "08:00", currentTime, breakMins);
      addTimeEntry({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        clock_in: myState.since || "08:00",
        clock_out: currentTime,
        break_minutes: breakMins,
        worked_minutes: worked,
        status: "Genehmigt",
        type: "Live",
        comment: "Automatisch via Live Tracker",
      });
    }
  };

  // Forms
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start: "",
    end: "",
    pause: 30,
    comment: ""
  });

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.start || !manualForm.end) {
      toast.error("Start- und Endzeit sind Pflichtfelder.");
      return;
    }
    
    // Validate overlapping or duplicate entries roughly (by checking times on same date)
    const existingEntry = timeEntries.find(t => 
       t.user_id === userId && 
       t.date === manualForm.date && 
       ((manualForm.start >= t.clock_in && manualForm.start < (t.clock_out || "23:59")) ||
       (manualForm.end > t.clock_in && manualForm.end <= (t.clock_out || "23:59")))
    );

    if (existingEntry) {
      toast.error("Diese Zeit überschneidet sich mit einer bestehenden Buchung.");
      return;
    }

    const [sh, sm] = manualForm.start.split(':').map(Number);
    const [eh, em] = manualForm.end.split(':').map(Number);
    let totalMins = (eh * 60 + em) - (sh * 60 + sm);
    
    if (totalMins < 0) {
       toast.error("Die Endzeit darf nicht vor der Startzeit liegen (außer bei Nachtschichten, die hier manuell geprüft werden müssen).");
       return;
    }

    const worked = calculateWorkedMinutes(manualForm.start, manualForm.end, manualForm.pause);
    
    if (worked <= 0) {
      toast.error("Netto-Arbeitszeit kann nicht 0 oder negativ sein (Pause zu lang?).");
      return;
    }

    addTimeEntry({
      user_id: userId,
      date: manualForm.date,
      clock_in: manualForm.start,
      clock_out: manualForm.end,
      break_minutes: manualForm.pause,
      worked_minutes: worked,
      status: "Offen",
      type: "Manuell",
      comment: manualForm.comment
    });
    setManualForm({ date: new Date().toISOString().split('T')[0], start: "", end: "", pause: 30, comment: "" });
    toast.success("Manuelle Buchung eingereicht!");
  };

  const handleStatusUpdate = (id: string, status: "Genehmigt" | "Abgelehnt") => {
    updateTimeEntryStatus(id, status);
    toast.success(`Buchung wurde ${status.toLowerCase()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Arbeitet": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-emerald-500/20";
      case "Pause": return "bg-amber-500/10 text-amber-400 border-amber-500/30 ring-amber-500/20";
      case "Feierabend": return "bg-blue-500/10 text-blue-400 border-blue-500/30 ring-blue-500/20";
      case "Offline": return "bg-slate-500/10 text-slate-400 border-slate-500/30 ring-slate-500/20";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Zeiterfassung</h1>
        <p className="text-slate-400 mt-1">Arbeitszeiten, Pausen und Auswertungen.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900/60 border border-slate-800 mb-6">
          <TabsTrigger value="erfassen" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Erfassen</TabsTrigger>
          <TabsTrigger value="historie" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Meine Zeiten</TabsTrigger>
          {role === "admin" && (
            <TabsTrigger value="admin" className="data-[state=active]:bg-fuchsia-500/10 data-[state=active]:text-fuchsia-400">Team & Freigaben</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="erfassen" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LIVE TRACKER */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 bg-slate-900/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Clock className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col items-center py-8">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ring-4 mb-6 ${getStatusColor(myState.status)}`}>
                    {myState.status}
                  </div>
                  <h2 className="text-6xl font-bold text-white tracking-tighter tabular-nums">{currentTime}</h2>
                  {myState.since && myState.status !== "Feierabend" && (
                    <p className="text-slate-400 mt-3 font-medium">Seit {myState.since} Uhr eingestempelt</p>
                  )}
                  {myState.status === "Nicht eingestempelt" && (
                     <p className="text-slate-400 mt-3 font-medium">Noch keine Zeit erfasst heute.</p>
                  )}
                </div>
              </div>
              <div className="p-6 bg-slate-900/80">
                <div className="flex flex-col gap-4">
                  {myState.status === "Nicht eingestempelt" || myState.status === "Feierabend" ? (
                    <button onClick={() => handleLiveAction("start")} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 font-bold text-lg transition-colors">
                      <Play className="w-6 h-6 fill-emerald-500/50" /> Arbeitsbeginn
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myState.status === "Arbeitet" ? (
                        <button onClick={() => handleLiveAction("pause")} className="py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-3 font-bold text-lg transition-colors">
                          <Pause className="w-6 h-6 fill-amber-500/50" /> Pause starten
                        </button>
                      ) : (
                        <button onClick={() => handleLiveAction("start")} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 font-bold text-lg transition-colors">
                          <Play className="w-6 h-6 fill-emerald-500/50" /> Pause beenden
                        </button>
                      )}
                      
                      <button onClick={() => handleLiveAction("stop")} className="py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-900/20 flex items-center justify-center gap-3 font-bold text-lg transition-colors">
                        <Square className="w-6 h-6 fill-rose-500/50" /> Feierabend
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Arbeitszeit</p>
                    <p className="text-xl font-semibold text-white mt-1">{myState.status === "Nicht eingestempelt" || myState.status === "Feierabend" ? "0h 0m" : formatHours(liveMins)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pausen</p>
                    <p className="text-xl font-semibold text-white mt-1">{myState.status === "Nicht eingestempelt" || myState.status === "Feierabend" ? "0h 0m" : "0h 0m"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Netto</p>
                    <p className="text-xl font-semibold text-cyan-400 mt-1">{myState.status === "Nicht eingestempelt" || myState.status === "Feierabend" ? "0h 0m" : formatHours(liveMins)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MANUAL ENTRY */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2"><List className="w-5 h-5 text-slate-400"/> Nachtrag erfassen</h3>
              </div>
              <form onSubmit={submitManual} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Datum</label>
                  <input type="date" value={manualForm.date} onChange={e=>setManualForm({...manualForm, date: e.target.value})} className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none block" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Von</label>
                    <input type="time" value={manualForm.start} onChange={e=>setManualForm({...manualForm, start: e.target.value})} className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none block" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Bis</label>
                    <input type="time" value={manualForm.end} onChange={e=>setManualForm({...manualForm, end: e.target.value})} className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none block" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Pause (in Minuten)</label>
                  <input type="number" min="0" value={manualForm.pause} onChange={e=>setManualForm({...manualForm, pause: parseInt(e.target.value)})} className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none block" required />
                  {(manualForm.pause < 30 && manualForm.start && manualForm.end) && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3"/> Gesetzlich min. 30 Minuten bei &gt;6h</p>
                  )}
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase">Kommentar / Grund</label>
                   <textarea value={manualForm.comment} onChange={e=>setManualForm({...manualForm, comment: e.target.value})} placeholder="Fehlbuchung, Hardware-Absturz..." className="mt-1 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none h-16 resize-none block" />
                </div>
                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white mt-2 border border-slate-700">
                  Zeiten einreichen
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historie" className="space-y-6 mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl col-span-2">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><BarChart3 className="w-4 h-4"/> Dieser Monat</p>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-3xl font-bold text-white leading-none">
                  {(timeEntries.filter(t => t.user_id === userId && t.status === "Genehmigt").reduce((acc, curr) => acc + curr.worked_minutes, 0) / 60).toFixed(1)}<span className="text-lg text-slate-500 font-medium ml-1">/ 160h</span></p>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-cyan-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: `${Math.min(100, (timeEntries.filter(t => t.user_id === userId && t.status === "Genehmigt").reduce((acc, curr) => acc + curr.worked_minutes, 0) / 60) / 160 * 100)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Gestern</p>
              <p className="text-2xl font-bold text-white mt-1">8.5<span className="text-sm font-medium text-slate-500 ml-1">h</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Diese Woche</p>
              <p className="text-2xl font-bold text-white mt-1">24.5<span className="text-sm font-medium text-slate-500 ml-1">h</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Überstunden</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">+12.5<span className="text-sm font-medium ml-1">h</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Urlaub/Krank</p>
              <p className="text-2xl font-bold text-slate-300 mt-1">10 <span className="text-sm font-medium ml-1">Tage</span></p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <h2 className="font-semibold text-white">Buchungshistorie</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Datum</th>
                    <th className="px-4 py-3 font-semibold text-center">Zeiten</th>
                    <th className="px-4 py-3 font-semibold text-center">Pause</th>
                    <th className="px-4 py-3 font-semibold text-center">Netto</th>
                    <th className="px-4 py-3 font-semibold">Typ</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {timeEntries.filter(t => t.user_id === userId).map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-300">{new Date(entry.date).toLocaleDateString('de-DE')}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{entry.clock_in} - {entry.clock_out || "?"}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{entry.break_minutes} Min</td>
                      <td className="px-4 py-3 text-center font-semibold text-cyan-400">{formatHours(entry.worked_minutes)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs border ${entry.type === 'Live' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                         {entry.status === "Offen" && <span className="flex items-center gap-1 text-amber-400"><Clock className="w-3 h-3"/> Offen</span>}
                         {entry.status === "Genehmigt" && <span className="flex items-center gap-1 text-emerald-400"><CheckSquare className="w-3 h-3"/> Genehmigt</span>}
                         {entry.status === "Abgelehnt" && <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3"/> Abgelehnt</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                         <button className="text-xs text-slate-400 hover:text-white underline">Korrektur</button>
                      </td>
                    </tr>
                  ))}
                  {timeEntries.filter(t => t.user_id === userId).length === 0 && (
                    <tr><td colSpan={7} className="text-center p-8 text-slate-500">Keine Einträge vorhanden.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {role === "admin" && (
          <TabsContent value="admin" className="space-y-6 mt-0">
            
            {/* ADMIN ACTIONS ROW */}
            <div className="flex gap-4 items-center justify-end">
               <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm gap-2">
                 <FileText className="w-4 h-4" /> PDF Report
               </Button>
               <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm gap-2">
                 <Download className="w-4 h-4" /> CSV Export
               </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TEAM LIVE STATUS */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
                  <h2 className="font-semibold text-white">Team Live Status</h2>
                  <span className="text-xs text-emerald-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Live</span>
                </div>
                <div className="p-2 space-y-1">
                  {users.map(u => {
                    const statusObj = liveStates[u.id] || { status: "Offline", since: "" };
                    return (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${statusObj.status === 'Arbeitet' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : statusObj.status === 'Pause' ? 'bg-amber-400' : 'bg-slate-600'}`}></div>
                           <p className="text-sm font-medium text-white">{u.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${getStatusColor(statusObj.status)}`}>
                             {statusObj.status} {statusObj.since ? `(${statusObj.since})` : ''}
                           </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* OFFENE KORREKTUREN */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
                  <h2 className="font-semibold text-white">Offene Korrekturen / Manuelle Buchungen</h2>
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                    {timeEntries.filter(t => t.status === "Offen" && t.type === "Manuell").length}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {timeEntries.filter(t => t.status === "Offen" && t.type === "Manuell").map(req => {
                    const u = users.find(x => x.id === req.user_id);
                    return (
                      <div key={req.id} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-white">{u?.name} <span className="text-slate-400 font-normal text-xs ml-2">{req.date}</span></p>
                            <p className="text-xs text-slate-400 mt-0.5">{req.clock_in} - {req.clock_out} ({req.break_minutes} Min Pause)</p>
                          </div>
                          <p className="text-xs text-cyan-400 font-bold">{formatHours(req.worked_minutes)} Netto</p>
                        </div>
                        {req.comment && <p className="text-xs text-slate-500 mb-3 bg-slate-900/50 p-2 rounded">"{req.comment}"</p>}
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusUpdate(req.id, "Genehmigt")} className="flex-1 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs rounded-md font-bold hover:bg-emerald-600/40 transition-colors">Genehmigen</button>
                          <button onClick={() => handleStatusUpdate(req.id, "Abgelehnt")} className="flex-1 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs rounded-md font-bold hover:bg-rose-600/40 transition-colors">Ablehnen</button>
                        </div>
                      </div>
                    )
                  })}
                  {timeEntries.filter(t => t.status === "Offen" && t.type === "Manuell").length === 0 && (
                    <p className="text-sm text-slate-500 py-4 text-center">Keine offenen Anträge.</p>
                  )}
                </div>
              </div>

            </div>

             {/* ADMIN TEAM ÜBERSICHT TABELLE */}
             <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/60">
                  <h2 className="font-semibold text-white">Stundenübersicht (Gesamtwerte berechnet)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Mitarbeiter</th>
                        <th className="px-6 py-3 font-semibold text-center">Soll (h)</th>
                        <th className="px-6 py-3 font-semibold text-center">Ist (h)</th>
                        <th className="px-6 py-3 font-semibold text-center">Abweichung</th>
                        <th className="px-6 py-3 font-semibold text-center">Überstundenkonto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {users.map(u => {
                        const userEntries = timeEntries.filter(t => t.user_id === u.id && t.status === "Genehmigt");
                        const totalMins = userEntries.reduce((acc, curr) => acc + curr.worked_minutes, 0);
                        const isth = (totalMins / 60).toFixed(1);
                        const sollh = 160; // Mock Soll
                        const abweichung = (totalMins / 60) - sollh;
                        
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                            <td className="px-6 py-4 text-center tabular-nums">{sollh}</td>
                            <td className="px-6 py-4 text-center text-cyan-400 font-bold tabular-nums">{isth}</td>
                            <td className={`px-6 py-4 text-center tabular-nums ${abweichung >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {abweichung > 0 ? '+' : ''}{abweichung.toFixed(1)}
                            </td>
                            <td className={`px-6 py-4 text-center font-bold tabular-nums ${abweichung >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                               {abweichung > 0 ? '+' : ''}{abweichung.toFixed(1)}
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
