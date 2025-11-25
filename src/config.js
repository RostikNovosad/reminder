import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://avswrbkiesqemhsfqoyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3dyYmtpZXNxZW1oc2Zxb3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2Nzg1MSwiZXhwIjoyMDc4NTQzODUxfQ.S_KbIOBETBo4RrpSl1wJck2CZJBUB2AjUkHaFyXP4iU'
);