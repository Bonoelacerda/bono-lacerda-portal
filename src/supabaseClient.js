// src/supabaseClient.js — Instância única do Supabase (evita "Multiple GoTrueClient instances")
import { createClient } from '@supabase/supabase-js';

export const SUPA_URL = "https://jrkreiidaxadwryjhdzu.supabase.co";
export const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impya3JlaWlkYXhhZHdyeWpoZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk3NTIsImV4cCI6MjA4OTM1NTc1Mn0.37Izlz1YVZlZadgXiL5xZC8ZofT3tob1VGPUr5m19jM";
export const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" };
export const supabase = createClient(SUPA_URL, SUPA_KEY);
