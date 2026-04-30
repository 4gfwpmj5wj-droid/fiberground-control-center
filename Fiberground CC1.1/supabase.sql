-- Supabase Schema for Fiberground Control Center Phase 3

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'mitarbeiter',
  jahresurlaub INT NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE absence_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Offen',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE work_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  weekly_hours NUMERIC NOT NULL DEFAULT 40,
  valid_from DATE NOT NULL,
  valid_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_minutes INT DEFAULT 0,
  worked_minutes INT DEFAULT 0,
  status TEXT DEFAULT 'Offen',
  type TEXT DEFAULT 'Live',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE break_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE time_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) NOT NULL,
  adjusted_by UUID REFERENCES auth.users(id) NOT NULL,
  old_clock_in TIMESTAMP WITH TIME ZONE,
  old_clock_out TIMESTAMP WITH TIME ZONE,
  new_clock_in TIMESTAMP WITH TIME ZONE,
  new_clock_out TIMESTAMP WITH TIME ZONE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE monthly_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month DATE NOT NULL, -- usually 1st of month
  target_minutes INT NOT NULL,
  actual_minutes INT NOT NULL,
  balance_minutes INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic RLS for new tables
ALTER TABLE work_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;

-- Block direct URL access by ensuring authenticated users only and proper roles

-- Profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Absence requests
CREATE POLICY "Admins can manage all absence requests" ON absence_requests FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can view own absence requests" ON absence_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own absence requests" ON absence_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Time Entries
CREATE POLICY "Admins can manage all time entries" ON time_entries FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can view own time entries" ON time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time entries" ON time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time entries (live)" ON time_entries FOR UPDATE USING (auth.uid() = user_id AND status = 'Arbeitet');

-- Break Entries
CREATE POLICY "Admins can manage all break entries" ON break_entries FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can view own break entries" ON break_entries FOR SELECT USING (EXISTS (SELECT 1 FROM time_entries WHERE time_entries.id = break_entries.time_entry_id AND time_entries.user_id = auth.uid()));
CREATE POLICY "Users can insert own break entries" ON break_entries FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM time_entries WHERE time_entries.id = break_entries.time_entry_id AND time_entries.user_id = auth.uid()));

-- Audit Logs (Only Admin)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Company Settings
CREATE POLICY "Anyone can view company settings" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Admin Notes
CREATE POLICY "Admins can manage admin notes" ON admin_notes FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Workflow Tasks
CREATE POLICY "Users can view assigned tasks" ON workflow_tasks FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can manage workflow tasks" ON workflow_tasks FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can update own task status" ON workflow_tasks FOR UPDATE USING (auth.uid() = assigned_to);

CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'Aktiv',
  source_module TEXT DEFAULT 'Calendar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Users can view team calendar events" ON calendar_events
  FOR SELECT USING (true); -- visibility depends on logic, default viewable

CREATE POLICY "Admins can manage all calendar events" ON calendar_events
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Users can insert own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE company_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE workflow_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_to UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Offen',
  priority TEXT DEFAULT 'Normal',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


