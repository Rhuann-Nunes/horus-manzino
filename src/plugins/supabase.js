import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jiuzasakghhavzecrjix.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdXphc2FrZ2hoYXZ6ZWNyaml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3NDM5NzgsImV4cCI6MjA0NTMxOTk3OH0.RUPUXm8V9t3CYWSgb1ynulQzRkaOUuO3JxkKRFpnchY'

export const supabase = createClient(supabaseUrl, supabaseKey) 