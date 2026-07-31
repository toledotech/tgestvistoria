-- Habilita Realtime (postgres_changes) na tabela de pagamentos, usada pelo
-- CobrancaPanel para refletir o status assim que o webhook do Mercado Pago
-- atualizar o registro.

alter publication supabase_realtime add table public.pagamentos;
alter publication supabase_realtime add table public.ordens_vistoria;
