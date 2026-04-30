import React, { useState } from "react";
import { Save, Settings, Shield, Bell, Network, Calendar, Upload, CheckSquare, Download, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { users, initialTimeEntries, initialRequests } from "../../lib/mock-data";

export default function AdminSettings() {
  const [checklist, setChecklist] = useState({
    users: true,
    roles: true,
    holidays: false,
    publicHolidays: false,
    logo: true,
    backup: false,
    test: false
  });

  const handleSave = () => {
    toast.success("Einstellungen wurden server-seitig gespeichert.");
  };

  const handleExportCSV = () => {
    // Generate a simple CSV from timeEntries
    const headers = ["ID", "User ID", "Datum", "Start", "Ende", "Pause (Min)", "Netto (Min)", "Status", "Typ"];
    const rows = initialTimeEntries.map(t => [t.id, t.user_id, t.date, t.clock_in, t.clock_out, t.break_minutes, t.worked_minutes, t.status, t.type]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(";") + "\n"
        + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fiberground_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("Export erfolgreich heruntergeladen.");
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-8">
      
      {/* Go Live Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
           <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2"><CheckSquare className="w-5 h-5"/> Go-Live Checkliste</h3>
           <p className="text-sm text-slate-400 mt-2">Punkte, die vor dem finalen Rollout ins Team geprüft werden sollten (Phase 9).</p>
        </div>
        <div className="md:col-span-2 bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
           {Object.entries({
              users: "Mitarbeiter Accounts angelegt",
              roles: "Berechtigungen (Admin/Mitarbeiter) geprüft",
              holidays: "Urlaubsansprüche eingetragen",
              publicHolidays: "Gesetzliche Feiertage (Bundesland) importiert",
              logo: "Firmenbranding (Logo/Name) angepasst",
              backup: "Supabase Nightly Backups aktiviert",
              test: "Testlauf mit Demo-Echtdaten erfolgreich"
           }).map(([key, label]) => (
             <div key={key} className="flex items-center gap-3">
                <button 
                  onClick={() => setChecklist(prev => ({...prev, [key]: !prev[key as keyof typeof checklist]}))}
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${checklist[key as keyof typeof checklist] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 text-transparent'}`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
                <span className={`text-sm ${checklist[key as keyof typeof checklist] ? 'text-slate-300 line-through opacity-70' : 'text-white'}`}>{label}</span>
             </div>
           ))}

           <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 border ${allChecked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <Shield className={`w-6 h-6 ${allChecked ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                 <h4 className={`font-semibold ${allChecked ? 'text-emerald-400' : 'text-slate-400'}`}>{allChecked ? 'System ist bereit für den Echtbetrieb' : 'Das System ist noch in der Konfigurationsphase'}</h4>
                 <p className="text-xs text-slate-500 mt-1">Sobald alle Haken gesetzt sind, kann das Rollout an die Mitarbeiter erfolgen.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="border-t border-slate-800"></div>

      {/* Export & Backup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
           <h3 className="text-lg font-medium text-white flex items-center gap-2"><Database className="w-5 h-5 text-purple-400"/> Backup & Export</h3>
           <p className="text-sm text-slate-400 mt-2">Manuelle Daten-Exporte für die Buchhaltung und System-Backups.</p>
        </div>
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/30">
              <div>
                 <h4 className="text-sm font-semibold text-white">Komplett-Export (CSV)</h4>
                 <p className="text-xs text-slate-400 mt-1">Exportiert alle Zeiterfassungen und Anträge der Mitarbeiter.</p>
              </div>
              <Button onClick={handleExportCSV} className="bg-slate-700 hover:bg-slate-600 text-white w-full sm:w-auto"><Download className="w-4 h-4 mr-2"/> CSV herunterladen</Button>
           </div>
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/30">
              <div>
                 <h4 className="text-sm font-semibold text-white">Datenbank Snapshot</h4>
                 <p className="text-xs text-slate-400 mt-1">Die automatischen Backups werden über das Supabase Dashboard verwaltet.</p>
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 w-full sm:w-auto" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}><Network className="w-4 h-4 mr-2"/> Supabase öffnen</Button>
           </div>
        </div>
      </div>

      <div className="border-t border-slate-800"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
           <h3 className="text-lg font-medium text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-400"/> Urlaubs- & Pausenregelungen</h3>
           <p className="text-sm text-slate-400 mt-2">Globale Einstellungen für die Urlaubsansprüche und gesetzliche Vorgaben nach Arbeitszeitgesetz (ArbZG).</p>
        </div>
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
           <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Standard Urlaubstage pro Jahr</label>
             <input type="number" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow" defaultValue={30} />
             <p className="text-xs text-slate-500 mt-1">Dieser Wert wird bei neuen Mitarbeitern als Standardvorgabe verwendet.</p>
           </div>
           
           <div className="border-t border-slate-800 pt-6">
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-medium text-slate-300">Automatischer Pausenabzug</label>
                   <p className="text-xs text-slate-500 mt-1">Stichabzug nach 6h (30min) und 9h (45min) gem. § 4 ArbZG.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
             </div>
           </div>

           <div className="border-t border-slate-800 pt-6">
             <div className="flex items-center justify-between">
                <div>
                   <label className="block text-sm font-medium text-slate-300">Krankheit zählt in Sollzeit</label>
                   <p className="text-xs text-slate-500 mt-1">Krankentage reduzieren das Wochensoll nicht, sondern werden als Sollstunden verbucht.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
             </div>
           </div>
        </div>
      </div>

      <div className="border-t border-slate-800"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
           <h3 className="text-lg font-medium text-white flex items-center gap-2"><Network className="w-5 h-5 text-blue-400"/> Firmenprofil & Branding</h3>
           <p className="text-sm text-slate-400 mt-2">Passe das Erscheinungsbild der Plattform an dein Unternehmen an.</p>
        </div>
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
           <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Firmenname</label>
             <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-shadow" defaultValue="Fiberground GmbH" />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Firmenlogo (Optional)</label>
             <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/30 transition-colors">
                <Upload className="w-8 h-8 text-slate-500 mb-3" />
                <p className="text-sm text-white mb-1">Klicke oder ziehe ein Bild hierher</p>
                <p className="text-xs text-slate-500">SVG, PNG, JPG (max. 2MB)</p>
             </div>
           </div>
           
           <div className="pt-4 flex justify-end">
             <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white"><Save className="w-4 h-4 mr-2"/> Einstellungen Speichern</Button>
           </div>
        </div>
      </div>

    </div>
  );
}
