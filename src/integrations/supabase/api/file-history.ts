import { supabase } from "@/integrations/supabase/client";

export async function insertFileHistory({ file_name, action, user_id }: { file_name: string; action: 'upload' | 'download'; user_id?: string | null }) {
  const { error } = await supabase.from('file_history').insert([
    { file_name, action, user_id: user_id || null }
  ]);
  if (error) throw error;
}

export async function fetchFileHistory({ limit = 50, action }: { limit?: number; action?: 'upload' | 'download' }) {
  let query = supabase
    .from('file_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (action) query = query.eq('action', action);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
