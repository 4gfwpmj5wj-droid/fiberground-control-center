import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Palmtree, UserMinus, FileText, Monitor, CheckCircle, Clock, Filter, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "../components/auth/AuthContext";
import { useData } from "../components/auth/DataContext";
import { users } from "../lib/mock-data";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, subMonths, addMonths, format, isSameMonth, isSameDay, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const COLOR_MAP: Record<string, string> = {
  "Urlaub": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Krank": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "Kind krank": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "Homeoffice": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Sonderurlaub": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Schulung": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Gearbeitet": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Pause": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Fehlend": "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function Kalender() {
  const { role, user } = useAuth();
  const { requests, timeEntries, liveStates } = useData();

  const [currentDate, setCurrentDate] = useState(new Date("2026-04-29T10:00:00Z"));
  const [view, setView] = useState("monat");
  const [filterUser, setFilterUser] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date("2026-04-29T10:00:00Z"));

  const allEvents = useMemo(() => {
    const events: any[] = [];
    
    requests.forEach(req => {
      if (req.status === "Abgelehnt") return;
      const u = users.find(u => u.id === req.user_id);
      
      let dt = parseISO(req.start_date);
      const end = parseISO(req.end_date);
      
      while (dt <= end) {
        if (dt.getDay() !== 0 && dt.getDay() !== 6) {
          events.push({
            id: `req-${req.id}-${dt.getTime()}`,
            date: dt,
            type: req.type,
            name: u?.name || "Unbekannt",
            userId: req.user_id,
            status: req.status,
            color: COLOR_MAP[req.type] || "bg-slate-500/20 text-slate-500",
            isAbsence: true
          });
        }
        dt = addDays(dt, 1);
      }
    });

    timeEntries.forEach(te => {
      const u = users.find(u => u.id === te.user_id);
      const dt = parseISO(te.date);
      events.push({
        id: `te-${te.id}`,
        date: dt,
        type: "Gearbeitet",
        name: u?.name || "Unbekannt",
        userId: te.user_id,
        status: te.status,
        color: COLOR_MAP["Gearbeitet"],
        isAbsence: false
      });
    });

    return events;
  }, [requests, timeEntries]);

  const monthStart = startOfMonth(currentDate);
  let startDate, endDate;
  if (view === "monat") {
    const monthEnd = endOfMonth(monthStart);
    startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  } else if (view === "woche") {
    startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  } else {
    startDate = currentDate;
    endDate = currentDate;
  }

  const dateFormat = view === "monat" ? "MMMM yyyy" : view === "woche" ? "'KW' w yyyy" : "dd. MMMM yyyy";

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (d: Date) => {
    return allEvents.filter(e => {
      if (!isSameDay(e.date, d)) return false;
      
      if (role !== "admin" && e.userId !== user?.id) {
         if (!e.isAbsence) return false;
      }
      
      if (filterUser !== "all" && e.userId !== filterUser) return false;
      if (filterType === "absences" && !e.isAbsence) return false;
      if (filterType === "work" && e.isAbsence) return false;

      return true;
    });
  };

  const capToday = new Date("2026-04-29T10:00:00Z");
  const missingToday = requests.filter(req => req.status === "Genehmigt" && req.type === "Krank" && new Date(req.start_date) <= capToday && new Date(req.end_date) >= capToday).length;
  const vacationToday = requests.filter(req => req.status === "Genehmigt" && req.type === "Urlaub" && new Date(req.start_date) <= capToday && new Date(req.end_date) >= capToday).length;
  const homeofficeToday = requests.filter(req => req.status === "Genehmigt" && req.type === "Homeoffice" && new Date(req.start_date) <= capToday && new Date(req.end_date) >= capToday).length;
  const clockedIn = Object.values(liveStates).filter((s: any) => s.status === "Arbeitet" || s.status === "Pause").length;

  const prevStep = () => {
    if (view === "monat") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "woche") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const nextStep = () => {
    if (view === "monat") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "woche") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col h-full">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-white">Kalender & Planung</h1>
           <p className="text-slate-400 mt-1">Urlaub, Krankheit, Homeoffice und Arbeitszeiten in der Übersicht.</p>
        </div>
        
        {role === "admin" && (
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Link to="/urlaub"><Button variant="outline" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"><Palmtree className="w-4 h-4 mr-2 text-blue-400" /> Urlaub eintragen</Button></Link>
            <Link to="/urlaub"><Button variant="outline" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"><UserMinus className="w-4 h-4 mr-2 text-rose-400" /> Krank melden</Button></Link>
            <Link to="/urlaub"><Button variant="outline" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"><Home className="w-4 h-4 mr-2 text-cyan-400" /> Homeoffice</Button></Link>
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-0" onClick={() => toast.success("Report wird generiert...")}>Report</Button>
          </div>
        )}
      </div>

      {/* Admin Board */}
      {role === "admin" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><Palmtree className="w-3 h-3"/> Urlaub</p>
               <p className="text-2xl font-bold text-white mt-1">{vacationToday}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><UserMinus className="w-3 h-3"/> Krank</p>
               <p className="text-2xl font-bold text-rose-400 mt-1">{missingToday}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><Home className="w-3 h-3"/> Homeoffice</p>
               <p className="text-2xl font-bold text-cyan-400 mt-1">{homeofficeToday}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><CheckCircle className="w-3 h-3"/> Eingestempelt</p>
               <p className="text-2xl font-bold text-emerald-400 mt-1">{clockedIn} / {users.length}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><FileText className="w-3 h-3"/> Offene Anträge</p>
               <p className="text-2xl font-bold text-amber-400 mt-1">{requests.filter(r => r.status === "Offen").length}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5"><Monitor className="w-3 h-3"/> Kapazität</p>
               <p className="text-2xl font-bold text-white mt-1">{Math.round(((users.length - vacationToday - missingToday) / users.length) * 100)}%</p>
            </div>
          </div>

          {view === "woche" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden mt-4">
              <div className="p-3 border-b border-slate-800 bg-slate-900/80">
                <h3 className="text-sm font-semibold text-white">Kapazitätsauslastung (Aktuelle Woche)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Tag</th>
                      <th className="px-4 py-2 font-semibold text-center">Verfügbar</th>
                      <th className="px-4 py-2 font-semibold text-center">Abwesend</th>
                      <th className="px-4 py-2 font-semibold text-center">Auslastung %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {calendarDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6).map(day => {
                       const dEvents = getEventsForDay(day);
                       const abs = dEvents.filter(e => e.isAbsence && e.type !== "Homeoffice").length;
                       const avail = users.length - abs;
                       const cap = Math.round((avail / users.length) * 100);
                       return (
                          <tr key={`cap-${day.toISOString()}`} className="hover:bg-slate-800/30">
                            <td className="px-4 py-2 font-medium">{format(day, "EEEE, dd.MM", { locale: de })}</td>
                            <td className="px-4 py-2 text-center text-emerald-400 font-medium">{avail}</td>
                            <td className="px-4 py-2 text-center text-rose-400 font-medium">{abs}</td>
                            <td className="px-4 py-2 text-center text-white font-bold">{cap}%</td>
                          </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-2 rounded-xl border border-slate-800">
        
        <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
          <TabsList className="bg-slate-900/60 border border-slate-800">
            <TabsTrigger value="monat" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Monat</TabsTrigger>
            <TabsTrigger value="woche" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Woche</TabsTrigger>
            <TabsTrigger value="tag" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Tag</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
           {role === "admin" && (
             <div className="flex gap-2">
               <select className="bg-slate-900 border border-slate-700 rounded text-sm text-slate-300 px-2 py-1.5" value={filterUser} onChange={e=>setFilterUser(e.target.value)}>
                 <option value="all">Alle Mitarbeiter</option>
                 {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
               <select className="bg-slate-900 border border-slate-700 rounded text-sm text-slate-300 px-2 py-1.5" value={filterType} onChange={e=>setFilterType(e.target.value)}>
                 <option value="all">Alle Einträge</option>
                 <option value="absences">Nur Abwesenheiten</option>
                 <option value="work">Nur Arbeitszeiten</option>
               </select>
             </div>
           )}

           <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-1">
              <Button variant="ghost" size="icon" onClick={prevStep} className="h-8 w-8 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-semibold text-white min-w-[120px] text-center capitalize">{format(currentDate, dateFormat, { locale: de })}</span>
              <Button variant="ghost" size="icon" onClick={nextStep} className="h-8 w-8 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
           </div>
           
           <Button onClick={goToday} variant="outline" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">Heute</Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[600px]">
        {/* Days Header */}
        {(view === "monat" || view === "woche") && (
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/80">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(day => (
              <div key={day} className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                {day}
              </div>
            ))}
          </div>
        )}
        
        {/* Days Grid */}
        <div className={`grid flex-1 auto-rows-fr ${view === "tag" ? "grid-cols-1" : "grid-cols-7"}`}>
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date("2026-04-29T10:00:00Z"));
            const dayEvents = getEventsForDay(day);

            return (
              <div key={day.toISOString()} onClick={() => setSelectedDay(day)} className={`border-b border-r border-slate-800/50 p-2 ${view === 'tag' ? 'min-h-[400px] p-6' : 'min-h-[120px]'} transition-colors hover:bg-slate-800/30 ${(view === "monat" && !isCurrentMonth) ? 'bg-slate-900/10 opacity-50' : 'bg-slate-900/40'} ${isToday ? 'bg-cyan-500/5' : ''} cursor-pointer`}>
                <div className={`flex justify-between items-start mb-4 ${view === 'tag' ? 'border-b border-slate-800 pb-4' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium flex items-center justify-center rounded-full ${view === 'tag' ? 'w-10 h-10 text-xl' : 'w-7 h-7'} ${isToday ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 font-bold'}`}>
                      {format(day, "d")}
                    </span>
                    {view === "tag" && (
                       <span className="text-xl font-medium text-slate-300">{format(day, "EEEE", { locale: de })}</span>
                    )}
                  </div>
                </div>
                <div className={`space-y-1.5 h-full ${view === 'tag' ? 'max-h-full space-y-3' : 'max-h-[80px]'} overflow-y-auto no-scrollbar`}>
                  {dayEvents.map((ev) => (
                    <div key={ev.id} onClick={(e) => { e.stopPropagation(); setSelectedProfileId(ev.userId); }} className={`cursor-pointer text-[10px] px-2 py-1 rounded border font-semibold truncate flex items-center gap-1.5 ${ev.color} ${ev.status === 'Offen' ? 'opacity-70 border-dashed' : ''} ${view === 'tag' ? 'text-sm px-4 py-3 rounded-lg shadow-sm' : ''}`} title={`${ev.name}: ${ev.type}`}>
                      {ev.isAbsence ? (
                        ev.type === "Urlaub" ? <Palmtree className={`shrink-0 ${view === 'tag' ? 'w-5 h-5 mr-1' : 'w-3 h-3'}`} /> : <UserMinus className={`shrink-0 ${view === 'tag' ? 'w-5 h-5 mr-1' : 'w-3 h-3'}`} />
                      ) : (
                         <CheckCircle className={`shrink-0 ${view === 'tag' ? 'w-5 h-5 mr-1' : 'w-3 h-3'}`} />
                      )}
                      <span className="truncate">{ev.name} {view === 'tag' && <span className="ml-2 font-normal opacity-80">({ev.type})</span>}</span>
                    </div>
                  ))}
                  {view === "tag" && dayEvents.length === 0 && (
                    <p className="text-slate-500 mt-8 text-center text-sm">Keine Einträge für diesen Tag.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center text-xs text-slate-400 pb-4">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></div> Urlaub</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30"></div> Krankheit</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/30"></div> Homeoffice</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></div> Gearbeitet</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30"></div> Schulung</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-500/20 border border-slate-500/30 border-dashed"></div> Offene Anträge (gestrichelt)</div>
      </div>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Details für den {selectedDay && format(selectedDay, "dd. MMMM yyyy", { locale: de })}</DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="mt-4 space-y-4">
              {getEventsForDay(selectedDay).length > 0 ? (
                <div className="space-y-3">
                   <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Einträge</h3>
                   <div className="space-y-2">
                     {getEventsForDay(selectedDay).map(ev => (
                        <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ev.color.split(' ')[0]} ${ev.color.split(' ')[1]}`}>
                               {ev.isAbsence ? (ev.type === 'Urlaub' ? <Palmtree className="w-4 h-4"/> : <UserMinus className="w-4 h-4"/>) : <CheckCircle className="w-4 h-4"/>}
                             </div>
                             <div className="cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedProfileId(ev.userId); }}>
                               <p className="text-sm font-medium text-white">{ev.name}</p>
                               <p className="text-xs text-slate-400">{ev.type}</p>
                             </div>
                          </div>
                        </div>
                     ))}
                   </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Keine Einträge für diesen Tag vorhanden.</p>
              )}
              {role === "admin" && (
                <div className="pt-4 border-t border-slate-800">
                   <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Schnellaktionen</h3>
                   <div className="grid grid-cols-2 gap-2">
                     <Link to="/urlaub" className="w-full"><Button variant="outline" className="bg-slate-800 hover:bg-slate-700 border-slate-700 w-full text-xs text-blue-400"><Palmtree className="w-3 h-3 mr-2"/> Urlaub</Button></Link>
                     <Link to="/urlaub" className="w-full"><Button variant="outline" className="bg-slate-800 hover:bg-slate-700 border-slate-700 w-full text-xs text-rose-400"><UserMinus className="w-3 h-3 mr-2"/> Krank</Button></Link>
                   </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profilkarte Dialog */}
      <Dialog open={!!selectedProfileId} onOpenChange={(open) => !open && setSelectedProfileId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Mitarbeiterprofil</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {selectedProfileId && users.find(u => u.id === selectedProfileId) && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl font-bold uppercase truncate">
                    {users.find(u => u.id === selectedProfileId)?.name?.substring(0,2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{users.find(u => u.id === selectedProfileId)?.name}</h2>
                    <p className="text-sm text-slate-400 capitalize">{users.find(u => u.id === selectedProfileId)?.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-center">
                     <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">Resturlaub</p>
                     <p className="text-2xl font-black text-blue-400">{users.find(u => u.id === selectedProfileId)?.jahresurlaub} <span className="text-sm">Tage</span></p>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-center">
                     <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1">Status</p>
                     <p className="text-sm font-black text-emerald-400 py-1">{liveStates[selectedProfileId]?.status || 'Offline'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
