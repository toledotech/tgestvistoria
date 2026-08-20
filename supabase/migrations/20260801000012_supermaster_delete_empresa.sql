-- Exclusão de empresa pelo SuperMaster. Cascateia (via FKs on delete cascade)
-- para todos os dados da empresa (clientes, veículos, vistorias, financeiro,
-- checklists, compromissos, configurações e user_profiles); os logins em
-- auth.users dos usuários dessa empresa são removidos à parte, já que não há
-- FK entre empresas e auth.users.

create or replace function public.supermaster_delete_empresa(p_empresa_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_ids uuid[];
begin
  if not public.is_super_master() then
    raise exception 'Acesso negado';
  end if;

  select array_agg(user_id) into v_user_ids
  from public.user_profiles
  where empresa_id = p_empresa_id;

  delete from public.empresas where id = p_empresa_id;

  if v_user_ids is not null then
    delete from auth.users where id = any(v_user_ids);
  end if;
end;
$$;
