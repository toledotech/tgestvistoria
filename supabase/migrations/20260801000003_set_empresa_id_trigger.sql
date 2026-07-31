-- Trigger genérico: preenche empresa_id automaticamente no INSERT com base
-- no usuário logado, para qualquer tabela de dado do tenant. Evita que o
-- client precise (ou consiga) passar empresa_id manualmente.

create or replace function public.set_empresa_id_from_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.empresa_id is null then
    new.empresa_id = public.get_current_empresa_id();
  end if;
  return new;
end;
$$;
