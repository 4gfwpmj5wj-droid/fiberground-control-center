import React, { useState, useEffect } from "react";
import { X, CalendarDays, Watch, Workflow, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../ui/Logo";

export default function OnboardingModal({ user }: { user: { name: string } | null }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("fiberground_onboarding_seen");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("fiberground_onboarding_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 sm:p-10 space-y-8">
           <div className="flex justify-center mb-6">
             <Logo className="w-12 h-12 text-cyan-400" />
           </div>

           <div className="text-center space-y-3">
             <h2 className="text-2xl sm:text-3xl font-bold text-white">Willkommen im Fiberground Control Center, <span className="text-cyan-400">{user?.name?.split(' ')[0] || 'Teammitglied'}</span>!</h2>
             <p className="text-slate-400 leading-relaxed max-w-lg mx-auto">
               Hier steuerst du in Zukunft alles rund um deine Arbeitszeit, deinen Urlaub und weitere HR-Themen. Komm schnell und intuitiv ans Ziel.
             </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl text-center space-y-3">
                 <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <Watch className="w-6 h-6" />
                 </div>
                 <h4 className="font-semibold text-white">Zeiterfassung</h4>
                 <p className="text-xs text-slate-400 leading-relaxed">Mit 1 Klick einstempeln, pausieren und den Tag beenden. Alles im Blick.</p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl text-center space-y-3">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <CalendarDays className="w-6 h-6" />
                 </div>
                 <h4 className="font-semibold text-white">Urlaub & Fehltage</h4>
                 <p className="text-xs text-slate-400 leading-relaxed">Urlaub beantragen, Krankmeldungen abschicken und Feiertage prüfen.</p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl text-center space-y-3">
                 <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                    <Workflow className="w-6 h-6" />
                 </div>
                 <h4 className="font-semibold text-white">Workflows</h4>
                 <p className="text-xs text-slate-400 leading-relaxed">Als Admin oder Teamleiter siehst du hier alle anstehenden Freigaben auf einen Blick.</p>
              </div>
           </div>

           <div className="pt-6 flex justify-center">
             <Button onClick={handleClose} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2 group px-8 py-6 rounded-xl">
               Loslegen <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
