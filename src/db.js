import { supabase } from './config.js';

export async function upsertUser(user) {
  const { error } = await supabase.from('users').upsert(
    {
      tg_id: user.id,
      first_name: user.first_name,
      username: user.username || null
    },
    { onConflict: 'tg_id' }
  );
  if (error) throw error;
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

export async function saveResponse(user, responseText) {
  const date = new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('statistics').insert({
    tg_id: user.id,
    user_name: user.first_name,
    description: responseText,
    date: date,
    created_at: new Date()
  });
  if (error) throw error;
}
