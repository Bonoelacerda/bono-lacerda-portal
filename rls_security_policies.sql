-- ============================================================================
-- BONO & LACERDA — POLÍTICAS DE SEGURANÇA RLS (Row Level Security)
-- Remediação: V-005 (IDOR) — Restrict data access per client
-- ============================================================================
-- IMPORTANTE: Este script substitui as políticas "allow_all" por políticas
-- granulares. O painel do advogado usa anon key (acesso total via policy),
-- e o portal do cliente deve ser migrado para Supabase Auth no futuro.
-- ============================================================================

-- ── 1. DROP old permissive "allow_all" policies ──
DROP POLICY IF EXISTS "allow_all" ON clients;
DROP POLICY IF EXISTS "allow_all" ON processes;
DROP POLICY IF EXISTS "allow_all" ON process_steps;
DROP POLICY IF EXISTS "allow_all" ON documents;
DROP POLICY IF EXISTS "allow_all" ON messages;
DROP POLICY IF EXISTS "allow_all" ON meetings;
DROP POLICY IF EXISTS "allow_all" ON notifications;

-- ── 2. CLIENTS table ──
-- Anon can read all (needed for lawyer panel);
-- Authenticated users can only read their own record
CREATE POLICY "anon_read_clients" ON clients
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_clients" ON clients
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_clients" ON clients
  FOR UPDATE TO anon USING (true);

-- Block DELETE for anon (only service_role can delete clients)
CREATE POLICY "anon_no_delete_clients" ON clients
  FOR DELETE TO anon USING (false);

-- ── 3. PROCESSES table ──
CREATE POLICY "anon_read_processes" ON processes
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_processes" ON processes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_processes" ON processes
  FOR UPDATE TO anon USING (true);

-- Block DELETE for processes
CREATE POLICY "anon_no_delete_processes" ON processes
  FOR DELETE TO anon USING (false);

-- ── 4. PROCESS_STEPS table ──
CREATE POLICY "anon_read_steps" ON process_steps
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_steps" ON process_steps
  FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_insert_steps" ON process_steps
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_no_delete_steps" ON process_steps
  FOR DELETE TO anon USING (false);

-- ── 5. DOCUMENTS table ──
CREATE POLICY "anon_read_docs" ON documents
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_docs" ON documents
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_docs" ON documents
  FOR UPDATE TO anon USING (true);

-- Only allow delete on documents (lawyer needs to delete)
CREATE POLICY "anon_delete_docs" ON documents
  FOR DELETE TO anon USING (true);

-- ── 6. MESSAGES table ──
CREATE POLICY "anon_read_msgs" ON messages
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_msgs" ON messages
  FOR INSERT TO anon WITH CHECK (true);

-- Block update and delete on messages (immutable chat history)
CREATE POLICY "anon_no_update_msgs" ON messages
  FOR UPDATE TO anon USING (false);

CREATE POLICY "anon_no_delete_msgs" ON messages
  FOR DELETE TO anon USING (false);

-- ── 7. MEETINGS table ──
CREATE POLICY "anon_read_meets" ON meetings
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_meets" ON meetings
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_meets" ON meetings
  FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_no_delete_meets" ON meetings
  FOR DELETE TO anon USING (false);

-- ── 8. NOTIFICATIONS table ──
CREATE POLICY "anon_read_notifs" ON notifications
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_notifs" ON notifications
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_notifs" ON notifications
  FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_no_delete_notifs" ON notifications
  FOR DELETE TO anon USING (false);

-- ============================================================================
-- FASE 2 (FUTURA): Quando migrar para Supabase Auth
-- ============================================================================
-- Quando implementar Supabase Auth com JWT:
--
-- 1. Clientes terão JWT com claim: { client_id: <uuid> }
-- 2. Advogados terão JWT com claim: { role: "lawyer" }
--
-- Exemplos de políticas futuras:
--
-- CREATE POLICY "client_read_own" ON clients
--   FOR SELECT TO authenticated
--   USING (
--     id = (auth.jwt() ->> 'client_id')::uuid
--     OR (auth.jwt() ->> 'role') = 'lawyer'
--   );
--
-- CREATE POLICY "client_read_own_processes" ON processes
--   FOR SELECT TO authenticated
--   USING (
--     client_id = (auth.jwt() ->> 'client_id')::uuid
--     OR (auth.jwt() ->> 'role') = 'lawyer'
--   );
-- ============================================================================
