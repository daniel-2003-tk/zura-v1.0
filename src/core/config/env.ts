import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

// Valida as variáveis no momento que o sistema inicia
const _env = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!_env.success) {
  console.error("❌ Variáveis de ambiente inválidas:", _env.error.format());
  throw new Error("Variáveis de ambiente inválidas. Verifique seu arquivo .env.local");
}

export const env = _env.data;