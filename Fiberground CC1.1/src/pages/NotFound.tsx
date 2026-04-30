import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6">
      <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 shadow-xl mb-4">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">404 - Nicht gefunden</h1>
      <p className="text-slate-400 max-w-md">Die gesuchte Seite existiert leider nicht oder wurde verschoben.</p>
      <Link to="/">
         <Button className="bg-cyan-600 hover:bg-cyan-500 text-white mt-4 border-0">
           <Home className="w-4 h-4 mr-2" /> Zurück zum Dashboard
         </Button>
      </Link>
    </div>
  );
}
