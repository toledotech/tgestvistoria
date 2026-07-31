// Placeholder types file — replace by running:
// npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts
// once the Supabase project and migrations for this app exist.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
