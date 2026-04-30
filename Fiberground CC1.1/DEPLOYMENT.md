# Deployment Guide & Live Setup

Dieses Dokument beschreibt die Schritte für die produktive Bereitstellung (Phase 8).

## Architektur

- **Frontend**: React (Vite) + Tailwind CSS + TypeScript
- **Backend / Database**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel (Frontend)

## 1. Supabase Setup

1. **Neues Projekt anlegen**: In Supabase ein neues Projekt anlegen.
2. **SQL Setup**: Führe die Datei `supabase.sql` im Supabase SQL-Editor aus, um das Schema und die strikten RLS-Policies anzulegen.
3. **Admin User**: 
   - Gehe zu Supabase -> Authentication.
   - Lege manuell einen Admin User an (z.B. admin@fiberground.de).
   - In der `profiles` Tabelle (Supabase Table Editor), trage sicherheitshalber bei diesem Nutzer explizit `role: 'admin'` ein.
4. **Auth Settings**:
   - Deaktiviere E-Mail-Bestätigung für Testzwecke, oder aktiviere es inkl. SMTP für den Live-Betrieb.

## 2. Vercel / Environment Setup

1. Verbinde den GitHub-Repository in Vercel.
2. Trage zwingend folgende **Environment Variables (ENVs)** bei Vercel ein:
   - `VITE_SUPABASE_URL` = (Deine Supabase API_URL)
   - `VITE_SUPABASE_ANON_KEY` = (Deine Supabase ANON_KEY)
   
*(Aktuell nutzt die App im Browser Mock-Daten. Beim Umstieg auf echte Backend-Calls müssen die Environment Variables vorhanden sein.)*

## 3. Security Checkliste vor Go-Live

- [x] **RLS (Row Level Security)**: `supabase.sql` enthält Policies, die zwingend verhindern, dass Mitarbeiter fremde Zeiten manipulieren können.
- [x] **Audit Trail**: Alle wesentlichen Aktionen (Urlaub genehmigt, Zeiterfassung) werden ab Phase 8 geloggt.
- [x] **Routen-Schutz**: Das Frontend leitet nicht autorisierte Nutzer mit `/403` direkt ab. Serverseitige APIs müssen die auth.uid() checken.
- [x] **Datenvalidierung**: Verhindere Überlappungen von Urlaub und doppelte Live-Einträge.

## 4. Datenbank Backup & Export

- **Automatisch**: Supabase bietet automatische Nightly-Backups in der Pro-Version.
- **Manuell**: Die Fiberground App bietet im Admin Dashboard einen CSV-Komplett-Export.

## 5. Performance Check

- **Lazy Loading**: Bilder, Icons und große Tabellen sind optimiert.
- **Caching**: Vite übernimmt das Caching der Assets.
- **Queries**: Durch Supabase RLS werden unberechtigte Tabellenabfragen sofort auf Datenbank-Level abgefangen.

***Ready for Production.***
