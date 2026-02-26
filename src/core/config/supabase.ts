import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Cria a conexão com o banco usando as chaves validadas
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);