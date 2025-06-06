import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lgiqlrliauiubrupuxjg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaXFscmxpYXVpdWJydXB1eGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjkyODIsImV4cCI6MjA2NDcwNTI4Mn0.a3pGzAoWNCiDKzL2z8HpYzrDqu9Cqp7hG-m1Xqb3QzY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;