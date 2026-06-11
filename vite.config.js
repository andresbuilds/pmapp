import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nmjmdkurzrcaomvrlnsl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tam1ka3VyenJjYW9tdnJsbnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODQ3MTQsImV4cCI6MjA5Njc2MDcxNH0.df5UUdpF_5l0KO0oXDiRtOrRa4hEYXkBnX1r0X4Y2NM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
