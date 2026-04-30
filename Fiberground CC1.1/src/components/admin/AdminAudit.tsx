import React, { useState } from "react";
import { Search, Filter, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockAuditLogs = [
  { id: "1", date: "2026-04-29T10:15:00Z", user: "Marcel (Admin)", action: "Urlaub genehmigt", entity: "Max Mustermann", details: "2 Tage (Mai)" },
  { id: "2", date: "2026-04-28T16:45:00Z", user: "Marcel (Admin)", action: "Zeitbuchung korrigiert", entity: "Sarah Bauer", details: "Pause angepasst (auf 45m)" },
  { id: "3", date: "2026-04-28T09:00:00Z", user: "System", action: "User angelegt", entity: "Anna Schmidt", details: "Rolle: Mitarbeiter, Urlaub: 30" },
  { id: "4", date: "2026-04-27T11:20:00Z", user: "Max Mustermann (Admin)", action: "Settings geändert", entity: "Global", details: "Standardurlaub von 28 auf 30" },
  { id: "5", date: "2026-04-25T14:10:00Z", user: "System", action: "Minusstunden-Warnung", entity: "Peter Lustig", details: "Über -20h erreicht" },
];

export default function AdminAudit() {
  const [search, setSearch] = useState("");

  const filteredLogs = mockAuditLogs.filter(l => 
    l.user.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden w-full md:w-96">
          <div className="pl-3 flex items-center justify-center">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Logs durchsuchen..."
            className="w-full bg-transparent border-0 text-sm px-3 py-2 text-white focus:outline-none focus:ring-0 placeholder-slate-600"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white" onClick={() => alert('Filter Funktion nicht aktiv in Demo')}><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Datum / Zeit</th>
                <th className="px-4 py-3 font-semibold">Akteur</th>
                <th className="px-4 py-3 font-semibold">Aktion</th>
                <th className="px-4 py-3 font-semibold">Betroffenes Objekt</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">{new Date(log.date).toLocaleString('de-DE')}</td>
                  <td className="px-4 py-3 font-medium text-white">{log.user}</td>
                  <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                        log.action.includes('Warnung') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        log.action.includes('System') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                     }`}>
                       {log.action}
                     </span>
                  </td>
                  <td className="px-4 py-3 text-cyan-400">{log.entity}</td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                 <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500">Keine Logs in diesem Zeitraum gefunden.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
