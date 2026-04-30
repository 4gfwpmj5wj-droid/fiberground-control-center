import React, { useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminOverview from "../components/admin/AdminOverview";
import AdminEmployees from "../components/admin/AdminEmployees";
import AdminApprovals from "../components/admin/AdminApprovals";
import AdminReports from "../components/admin/AdminReports";
import AdminSettings from "../components/admin/AdminSettings";
import AdminAudit from "../components/admin/AdminAudit";

export default function Admin() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState("uebersicht");
  
  if (role !== "admin") {
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex-1 flex flex-col h-full">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">HR Control Center</h1>
        <p className="text-slate-400 mt-1">Verwaltung, Freigaben und Reports.</p>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-slate-900/60 border border-slate-800 justify-start overflow-x-auto w-full mb-6">
            <TabsTrigger value="uebersicht" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Übersicht</TabsTrigger>
            <TabsTrigger value="mitarbeiter" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Mitarbeiter</TabsTrigger>
            <TabsTrigger value="freigaben" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Freigaben</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Reports</TabsTrigger>
            <TabsTrigger value="einstellungen" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Einstellungen</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Audit Logs</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="uebersicht" className="m-0 h-full"><AdminOverview /></TabsContent>
            <TabsContent value="mitarbeiter" className="m-0 h-full"><AdminEmployees /></TabsContent>
            <TabsContent value="freigaben" className="m-0 h-full"><AdminApprovals /></TabsContent>
            <TabsContent value="reports" className="m-0 h-full"><AdminReports /></TabsContent>
            <TabsContent value="einstellungen" className="m-0 h-full"><AdminSettings /></TabsContent>
            <TabsContent value="audit" className="m-0 h-full"><AdminAudit /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
