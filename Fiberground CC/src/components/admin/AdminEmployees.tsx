import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus, User, MoreVertical, Edit, Shield, ShieldOff, Lock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useData } from "../auth/DataContext";
import { toast } from "sonner";

export default function AdminEmployees() {
  const { liveStates, users, addUser } = useData();
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: "asc" | "desc" } | null>({ key: "name", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "mitarbeiter", team: "Support", jahresurlaub: 30, sollstunden: 40 });
  const itemsPerPage = 5;

  const filteredUsers = useMemo(() => {
    let sortableItems = [...users];
    
    if (search) {
      sortableItems = sortableItems.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.team.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableItems;
  }, [search, sortConfig, users]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      team: newUser.team,
      jahresurlaub: newUser.jahresurlaub,
      sollstunden: newUser.sollstunden,
      aktiv: true
    });
    toast.success("Mitarbeiter erfolgreich angelegt");
    setIsAddUserOpen(false);
    setNewUser({ name: "", email: "", role: "mitarbeiter", team: "Support", jahresurlaub: 30, sollstunden: 40 });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Rolle,Team,Status,Urlaub,Soll/Wo,Aktiv\n"
      + filteredUsers.map(u => `${u.name},${u.role},${u.team},${liveStates[u.id]?.status || 'Offline'},${u.jahresurlaub},${u.sollstunden},${u.aktiv ? 'Aktiv' : 'Inaktiv'}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fiberground-mitarbeiter-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Mitarbeiterliste erfolgreich exportiert");
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentData = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown className="w-3 h-3 text-slate-600 ml-1 inline" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3 text-cyan-400 ml-1 inline" /> : <ChevronDown className="w-3 h-3 text-cyan-400 ml-1 inline" />;
  }

  return (
    <div className="space-y-4 flex flex-col h-full min-h-[500px]">
      <div className="flex flex-col md:flex-row justify-between gap-4 shrink-0">
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden w-full md:w-96 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="pl-3 flex items-center justify-center">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Mitarbeiter suchen..."
            className="w-full bg-transparent border-0 text-sm px-3 py-2 text-white focus:outline-none focus:ring-0 placeholder-slate-600"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
           <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
           <Button className="bg-cyan-600 hover:bg-cyan-500 text-white border-0" onClick={() => setIsAddUserOpen(true)}><Plus className="w-4 h-4 mr-2" /> Mitarbeiter anlegen</Button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1 relative">
        <div className="overflow-x-auto flex-1 border-b border-slate-800/50">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800 tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => requestSort('name')}>
                  Name <SortIcon columnKey="name" />
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => requestSort('role')}>
                  Rolle <SortIcon columnKey="role" />
                </th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-200 transition-colors" onClick={() => requestSort('team')}>
                  Team <SortIcon columnKey="team" />
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-200 transition-colors" onClick={() => requestSort('jahresurlaub')}>
                  Urlaub <SortIcon columnKey="jahresurlaub" />
                </th>
                <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-slate-200 transition-colors" onClick={() => requestSort('sollstunden')}>
                  Soll/Wo <SortIcon columnKey="sollstunden" />
                </th>
                <th className="px-4 py-3 font-semibold text-center cursor-pointer hover:text-slate-200 transition-colors" onClick={() => requestSort('aktiv')}>
                  Aktiv <SortIcon columnKey="aktiv" />
                </th>
                <th className="px-4 py-3 font-semibold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {currentData.map(user => {
                const ls = liveStates[user.id]?.status || "Offline";
                return (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-3">
                       <Link to={`/admin/users/${user.id}`} className="font-medium text-white hover:text-cyan-400 transition-colors flex items-center gap-2 w-max">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.aktiv ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                             {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          {user.name}
                       </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">
                       <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border w-max ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                         {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                         {user.role}
                       </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{user.team}</td>
                    <td className="px-4 py-3">
                       <div className="flex items-center gap-1.5 w-max">
                         <div className={`w-2 h-2 rounded-full ${ls === 'Arbeitet' ? 'bg-emerald-500 animate-pulse' : ls === 'Pause' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                         <span className="text-xs">{ls}</span>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className="text-blue-400 font-medium">{user.jahresurlaub}</span> <span className="text-xs text-slate-500">Tage</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className="text-white font-medium">{user.sollstunden}h</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                       {user.aktiv ? <span className="text-emerald-400 text-xs font-medium w-max px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Aktiv</span> : <span className="text-rose-400 text-xs font-medium w-max px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">Inaktiv</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                       <Link to={`/admin/users/${user.id}`}>
                         <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white px-2 hover:bg-slate-800 transition-colors">
                           <Edit className="w-4 h-4" />
                         </Button>
                       </Link>
                    </td>
                  </tr>
                )
              })}
              {currentData.length === 0 && (
                 <tr>
                    <td colSpan={8} className="text-center p-12 text-slate-500 bg-slate-900/20">
                      <div className="flex flex-col items-center justify-center">
                         <Search className="w-8 h-8 mb-3 opacity-20" />
                         <p>Keine Mitarbeiter gefunden.</p>
                      </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="p-3 bg-slate-900/60 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium ml-2">
              Zeige {((currentPage - 1) * itemsPerPage) + 1} bis {Math.min(currentPage * itemsPerPage, filteredUsers.length)} von {filteredUsers.length} Einträgen
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 bg-slate-800 border-slate-700 text-slate-400 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
                 {Array.from({length: totalPages}).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-colors ${currentPage === i + 1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 bg-slate-800 border-slate-700 text-slate-400 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Neuen Mitarbeiter anlegen</DialogTitle>
            <DialogDescription className="text-slate-400">
              Geben Sie die Daten für den neuen Mitarbeiter ein.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Vor- und Nachname</label>
              <input type="text" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">E-Mail Adresse</label>
              <input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Rolle</label>
                <select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none">
                  <option value="mitarbeiter">Mitarbeiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Team</label>
                <select value={newUser.team} onChange={e=>setNewUser({...newUser, team: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none">
                  <option value="Tiefbau">Tiefbau</option>
                  <option value="Support">Support</option>
                  <option value="Planung">Planung</option>
                  <option value="IT">IT</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Sollstunden / Wo.</label>
                <input type="number" min="1" max="60" value={newUser.sollstunden} onChange={e=>setNewUser({...newUser, sollstunden: parseInt(e.target.value)})} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Jahresurlaub</label>
                <input type="number" min="0" max="40" value={newUser.jahresurlaub} onChange={e=>setNewUser({...newUser, jahresurlaub: parseInt(e.target.value)})} required className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/40 outline-none" />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
              <Button type="button" variant="outline" className="bg-transparent border-slate-700 text-slate-300" onClick={() => setIsAddUserOpen(false)}>Abbrechen</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white">Anlegen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
