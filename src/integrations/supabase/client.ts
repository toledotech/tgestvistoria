import { createClient } from '@supabase/supabase-js';
// NOTA: types.ts é um placeholder vazio (Tables: Record<string, never>) — nunca foi
// gerado de verdade a partir do projeto Supabase real (`supabase gen types typescript`).
// Por isso o client não é parametrizado com <Database> aqui: com o placeholder, TUDO
// vira `never` e quebra o build inteiro. Sem a parametrização, volta ao comportamento
// efetivo de antes (chamadas ao Supabase não têm autotype), só que agora sem strict
// mode escondendo isso silenciosamente. Gerar os tipos reais é um passo separado.

function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env."
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
