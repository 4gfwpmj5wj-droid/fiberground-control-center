import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6">
      <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 shadow-xl mb-4 relative">
        <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full"></div>
        <ShieldAlert className="w-10 h-10 relative z-10" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">Zugriff verweigert</h1>
      <p className="text-slate-400 max-w-md">Sie haben keine Berechtigung, auf diese Seite zuzugreifen. Bitte kontaktieren Sie Ihren Administrator, wenn Sie glauben, dass dies ein Fehler ist.</p>
      <Link to="/">
         <Button className="bg-cyan-600 hover:bg-cyan-500 text-white mt-4 border-0">
           <Home className="w-4 h-4 mr-2" /> Zurück zum Dashboard
         </Button>
      </Link>
    </div>
  );
}
