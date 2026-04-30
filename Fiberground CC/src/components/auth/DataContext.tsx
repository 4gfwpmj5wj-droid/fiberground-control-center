import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  initialRequests, AbsenceRequest, 
  TimeEntry, initialTimeEntries, 
  LiveStatus, userLiveStates,
  users as initialUsers, User,
  initialNotifications, Notification,
  initialWorkflowTasks, WorkflowTask
} from "../../lib/mock-data";

export interface Feedback {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
}

interface DataState {
  users: User[];
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  
  requests: AbsenceRequest[];
  addRequest: (req: Omit<AbsenceRequest, "id" | "created_at">) => void;
  updateRequestStatus: (id: string, status: "Genehmigt" | "Abgelehnt") => void;
  deleteRequest: (id: string) => void;
  
  timeEntries: TimeEntry[];
  addTimeEntry: (req: Omit<TimeEntry, "id" | "created_at">) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  updateTimeEntryStatus: (id: string, status: "Genehmigt" | "Abgelehnt") => void;
  
  liveStates: Record<string, { status: LiveStatus; since: string }>;
  updateLiveState: (userId: string, state: { status: LiveStatus; since: string }) => void;

  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, "id" | "created_at" | "read">) => void;

  workflowTasks: WorkflowTask[];
  updateTaskStatus: (id: string, status: "Offen" | "Erledigt") => void;

  feedbacks: Feedback[];
  addFeedback: (f: Omit<Feedback, "id" | "created_at">) => void;
}

const DataContext = createContext<DataState | undefined>(undefined);

// Mock Audit Logger
const logAudit = (action: string, entityType: string, details: any) => {
   console.info(`[AUDIT TRAIL] 🛡️ ${new Date().toISOString()} | Action: ${action} | Entity: ${entityType} |`, details);
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [requests, setRequests] = useState<AbsenceRequest[]>(initialRequests);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [liveStates, setLiveStates] = useState(userLiveStates);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>(initialWorkflowTasks);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // ---- USERS ----
  const addUser = (user: Omit<User, "id">) => {
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    setUsers(prev => [...prev, newUser]);
    logAudit("create_user", "users", { email: user.email });
  };
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    logAudit("update_user", "users", { id, updates });
  };

  // ---- REQUESTS ----
  const addRequest = (req: Omit<AbsenceRequest, "id" | "created_at">) => {
    const newReq: AbsenceRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    logAudit("create_absence_request", "absence_requests", { userId: req.user_id, type: req.type });
  };
  const updateRequestStatus = (id: string, status: "Genehmigt" | "Abgelehnt") => {
    setRequests((prev) => prev.map(r => r.id === id ? { ...r, status } : r));
    logAudit("update_absence_status", "absence_requests", { requestId: id, status });
  };
  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter(r => r.id !== id));
    logAudit("delete_absence_request", "absence_requests", { requestId: id });
  };
  
  // ---- TIME ENTRIES ----
  const addTimeEntry = (req: Omit<TimeEntry, "id" | "created_at">) => {
    const newReq: TimeEntry = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setTimeEntries((prev) => [newReq, ...prev]);
    logAudit("create_time_entry", "time_entries", { userId: req.user_id, date: req.date, duration: req.worked_minutes });
  };
  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries((prev) => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    logAudit("update_time_entry", "time_entries", { entryId: id, updates });
  };
  const updateTimeEntryStatus = (id: string, status: "Genehmigt" | "Abgelehnt") => {
    setTimeEntries((prev) => prev.map(r => r.id === id ? { ...r, status } : r));
    logAudit("update_time_entry_status", "time_entries", { entryId: id, status });
  };

  const updateLiveState = (userId: string, state: { status: LiveStatus; since: string }) => {
    setLiveStates((prev) => ({ ...prev, [userId]: state }));
    if (state.status !== "Nicht eingestempelt") {
       logAudit("live_state_change", "live_status", { userId, newStatus: state.status });
    }
  };

  // ---- NOTIFICATIONS ----
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const addNotification = (n: Omit<Notification, "id" | "created_at" | "read">) => {
    const newN: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // ---- WORKFLOWS ----
  const updateTaskStatus = (id: string, status: "Offen" | "Erledigt") => {
    setWorkflowTasks((prev) => prev.map(t => t.id === id ? { ...t, status } : t));
    logAudit("update_task_status", "workflow_tasks", { taskId: id, status });
  };

  // ---- FEEDBACKS ----
  const addFeedback = (f: Omit<Feedback, "id" | "created_at">) => {
    const newF: Feedback = {
      ...f,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setFeedbacks(prev => [newF, ...prev]);
  };

  return (
    <DataContext.Provider value={{ 
      users, addUser, updateUser,
      requests, addRequest, updateRequestStatus, deleteRequest,
      timeEntries, addTimeEntry, updateTimeEntryStatus, updateTimeEntry,
      liveStates, updateLiveState,
      notifications, markNotificationRead, addNotification,
      workflowTasks, updateTaskStatus,
      feedbacks, addFeedback
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
