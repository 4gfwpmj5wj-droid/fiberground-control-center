export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "mitarbeiter";
  jahresurlaub: number;
  team: string;
  sollstunden: number;
  aktiv: boolean;
  eintritt: string;
}

export const users: User[] = [
  { id: "1", name: "Marcel", email: "marcel@fiberground.de", role: "admin", jahresurlaub: 30, team: "Management", sollstunden: 40, aktiv: true, eintritt: "2023-01-01" },
  { id: "2", name: "Sarah Bauer", email: "sarah@fiberground.de", role: "mitarbeiter", jahresurlaub: 30, team: "Support", sollstunden: 40, aktiv: true, eintritt: "2024-05-15" },
  { id: "3", name: "Max Mustermann", email: "max@fiberground.de", role: "mitarbeiter", jahresurlaub: 28, team: "IT", sollstunden: 40, aktiv: true, eintritt: "2022-10-01" },
  { id: "4", name: "Anna Schmidt", email: "anna@fiberground.de", role: "mitarbeiter", jahresurlaub: 30, team: "Marketing", sollstunden: 30, aktiv: true, eintritt: "2025-02-01" },
  { id: "5", name: "Tim Weber", email: "tim@fiberground.de", role: "mitarbeiter", jahresurlaub: 30, team: "Sales", sollstunden: 40, aktiv: true, eintritt: "2025-08-01" },
  { id: "6", name: "Lisa König", email: "lisa@fiberground.de", role: "mitarbeiter", jahresurlaub: 28, team: "HR", sollstunden: 20, aktiv: true, eintritt: "2026-01-15" },
];

export type AbsenceType = "Urlaub" | "Krank" | "Kind krank" | "Homeoffice" | "Sonderurlaub" | "Unbezahlt frei" | "Schulung" | "Sonstiges";
export type AbsenceStatus = "Offen" | "Genehmigt" | "Abgelehnt";

export interface AbsenceRequest {
  id: string;
  user_id: string;
  type: AbsenceType;
  start_date: string;
  end_date: string;
  days: number;
  status: AbsenceStatus;
  comment: string;
  created_at: string;
}

// Initial mock data
export const initialRequests: AbsenceRequest[] = [
  { id: "r1", user_id: "2", type: "Urlaub", start_date: "2026-08-01", end_date: "2026-08-14", days: 10, status: "Offen", comment: "Sommerurlaub", created_at: "2026-04-20T10:00:00Z" },
  { id: "r2", user_id: "4", type: "Krank", start_date: "2026-04-28", end_date: "2026-04-30", days: 3, status: "Genehmigt", comment: "Grippe", created_at: "2026-04-28T08:00:00Z" },
  { id: "r3", user_id: "3", type: "Homeoffice", start_date: "2026-04-29", end_date: "2026-04-29", days: 1, status: "Genehmigt", comment: "Handwerker im Haus", created_at: "2026-04-28T14:00:00Z" },
  { id: "r4", user_id: "5", type: "Urlaub", start_date: "2026-05-10", end_date: "2026-05-12", days: 3, status: "Offen", comment: "Städtetrip", created_at: "2026-04-29T10:00:00Z" },
  { id: "r5", user_id: "6", type: "Kind krank", start_date: "2026-04-30", end_date: "2026-04-30", days: 1, status: "Offen", comment: "Kita zu", created_at: "2026-04-30T07:15:00Z" },
];

export type LiveStatus = "Nicht eingestempelt" | "Arbeitet" | "Pause" | "Feierabend" | "Offline";

export interface TimeEntry {
  id: string;
  user_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_minutes: number;
  worked_minutes: number;
  status: "Offen" | "Genehmigt" | "Abgelehnt";
  type: "Live" | "Manuell";
  comment: string;
  created_at: string;
}

const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const todayStr = new Date().toISOString().split('T')[0];

export const initialTimeEntries: TimeEntry[] = [
  { id: "t0", user_id: "1", date: yesterdayStr, clock_in: "08:00", clock_out: "16:30", break_minutes: 30, worked_minutes: 480, status: "Genehmigt", type: "Live", comment: "", created_at: "2026-04-28T16:30:00Z" },
  { id: "t1", user_id: "1", date: todayStr, clock_in: "08:00", clock_out: null, break_minutes: 0, worked_minutes: 0, status: "Offen", type: "Live", comment: "", created_at: "2026-04-29T08:00:00Z" },
  { id: "t2", user_id: "3", date: todayStr, clock_in: "07:30", clock_out: null, break_minutes: 30, worked_minutes: 0, status: "Offen", type: "Live", comment: "", created_at: "2026-04-29T07:30:00Z" },
  { id: "t3", user_id: "2", date: yesterdayStr, clock_in: "09:00", clock_out: null, break_minutes: 45, worked_minutes: 435, status: "Offen", type: "Live", comment: "Vergessen auszustempeln", created_at: "2026-04-28T18:00:00Z" },
  { id: "t4", user_id: "5", date: todayStr, clock_in: "08:15", clock_out: null, break_minutes: 0, worked_minutes: 0, status: "Offen", type: "Live", comment: "", created_at: "2026-04-30T08:15:00Z" },
];

export const userLiveStates: Record<string, { status: LiveStatus; since: string }> = {
  "1": { status: "Arbeitet", since: "08:00" },
  "2": { status: "Offline", since: "" }, 
  "3": { status: "Arbeitet", since: "07:30" },
  "4": { status: "Offline", since: "" }, // Krank
  "5": { status: "Arbeitet", since: "08:15" },
  "6": { status: "Offline", since: "" }, // Kind Krank
};

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  target_url: string;
  read: boolean;
  created_at: string;
  type?: "info" | "success" | "warning" | "error";
  category?: "kritisch" | "wichtig" | "info";
}

export interface WorkflowTask {
  id: string;
  assigned_to: string;
  type: string;
  title: string;
  description: string;
  status: "Offen" | "Erledigt";
  priority: "Hoch" | "Normal" | "Niedrig";
  created_at: string;
}

export const initialNotifications: Notification[] = [
  { id: "n1", user_id: "1", title: "Urlaubsantrag: Tim Weber", message: "Es liegt ein neuer Urlaubsantrag vor (3 Tage).", target_url: "/admin", read: false, created_at: new Date(Date.now() - 3600000).toISOString(), type: "info", category: "wichtig" },
  { id: "n2", user_id: "1", title: "Krankmeldung heute", message: "Lisa König hat sich für heute (Kind krank) gemeldet.", target_url: "/admin", read: false, created_at: new Date(Date.now() - 7200000).toISOString(), type: "warning", category: "kritisch" },
  { id: "n3", user_id: "1", title: "Fehlt Ausstempeln", message: "Sarah Bauer hat gestern nicht ausgestempelt.", target_url: "/workflows", read: false, created_at: new Date(Date.now() - 14400000).toISOString(), type: "error", category: "kritisch" },
  { id: "n4", user_id: "2", title: "Willkommen!", message: "Willkommen im Fiberground Control Center. Hier hast du alles im Blick.", target_url: "/", read: false, created_at: new Date(Date.now() - 86400000).toISOString(), type: "success", category: "info" },
];

export const initialWorkflowTasks: WorkflowTask[] = [
  { id: "wk1", assigned_to: "1", type: "Approval", title: "3 Urlaubsanträge prüfen", description: "Offene Freigaben für Sarah und Max", status: "Offen", priority: "Hoch", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "wk2", assigned_to: "1", type: "System", title: "Monatsabschluss April vorbereiten", description: "Zeitkonten kontrollieren und Berichte erzeugen", status: "Offen", priority: "Normal", created_at: new Date(Date.now() - 2400000).toISOString() },
];
