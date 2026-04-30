import React from "react";
import { Download, FileText, BarChart2, PieChart, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminReports() {
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
             <Calendar className="w-4 h-4 text-slate-400" />
             <input type="date" className="bg-transparent border-0 text-sm text-white focus:ring-0 outline-none w-[120px]" defaultValue="2026-04-01" />
           </div>
           <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
             <span className="text-slate-500 text-sm">bis</span>
             <input type="date" className="bg-transparent border-0 text-sm text-white focus:ring-0 outline-none w-[120px]" defaultValue="2026-04-30" />
           </div>
           <Button variant="outline" className="bg-slate-800 border-slate-700 text-white" onClick={() => toast.success("Filter angewendet")}><Filter className="w-4 h-4 mr-2"/> Filter anwenden</Button>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-slate-800 border-slate-700 text-white" onClick={() => toast.success("CSV Download gestartet")}><Download className="w-3 h-3 mr-2"/> CSV</Button>
           <Button variant="outline" className="bg-slate-800 border-slate-700 text-white" onClick={() => toast.success("PDF Download gestartet")}><Download className="w-3 h-3 mr-2"/> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
           <BarChart2 className="w-12 h-12 text-slate-700 mb-4" />
           <h3 className="text-lg font-medium text-white">Anwesenheitsquote / Überstunden</h3>
           <p className="text-sm text-slate-500 mt-2 text-center max-w-xs">Die Diagramm-Ansicht wird in Phase 5 implementiert und zeigt die aggregierten Stunden an.</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
           <PieChart className="w-12 h-12 text-slate-700 mb-4" />
           <h3 className="text-lg font-medium text-white">Krankheits- & Urlaubsquote</h3>
           <p className="text-sm text-slate-500 mt-2 text-center max-w-xs">Aggregierte Abwesenheiten für den gewählten Zeitraum gruppiert nach Teams.</p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-medium text-white">Detaillierter Mitarbeiterreport (Vorschau)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Mitarbeiter</th>
                <th className="px-4 py-3 font-semibold text-right">Soll (h)</th>
                <th className="px-4 py-3 font-semibold text-right">Ist (h)</th>
                <th className="px-4 py-3 font-semibold text-right">Saldo</th>
                <th className="px-4 py-3 font-semibold text-right">Urlaubst.</th>
                <th className="px-4 py-3 font-semibold text-right">Kranktage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                 <td className="px-4 py-3 font-medium text-white">Marcel</td>
                 <td className="px-4 py-3 text-right">160.0</td>
                 <td className="px-4 py-3 text-right">164.5</td>
                 <td className="px-4 py-3 text-right text-emerald-400">+4.5</td>
                 <td className="px-4 py-3 text-right">0</td>
                 <td className="px-4 py-3 text-right">0</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                 <td className="px-4 py-3 font-medium text-white">Max Mustermann</td>
                 <td className="px-4 py-3 text-right">140.0</td>
                 <td className="px-4 py-3 text-right">132.0</td>
                 <td className="px-4 py-3 text-right text-rose-400">-8.0</td>
                 <td className="px-4 py-3 text-right">2</td>
                 <td className="px-4 py-3 text-right">0</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                 <td className="px-4 py-3 font-medium text-white">Sarah Bauer</td>
                 <td className="px-4 py-3 text-right">160.0</td>
                 <td className="px-4 py-3 text-right">160.0</td>
                 <td className="px-4 py-3 text-right text-slate-400">0.0</td>
                 <td className="px-4 py-3 text-right">5</td>
                 <td className="px-4 py-3 text-right">2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
