import { Sparkles } from "lucide-react";

export default function AiMailAssistant() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col h-full">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">KI Mail Assistent</h1>
        <p className="text-slate-400 mt-1">Lass die Fiberground KI deine E-Mails entwerfen.</p>
      </div>
      <div className="flex-1 flex items-center justify-center bg-slate-900/40 border border-dashed border-slate-700/50 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-blue-500/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="text-center p-8 relative z-10 max-w-sm">
           <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-6">
             <Sparkles className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">In Kürze verfügbar</h3>
           <p className="text-slate-400 text-sm">Die KI Generation für E-Mails wird in einem kommenden Update freigeschaltet.</p>
        </div>
      </div>
    </div>
  );
}
