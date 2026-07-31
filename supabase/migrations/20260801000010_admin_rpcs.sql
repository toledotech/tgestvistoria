-- RPCs administrativas SECURITY DEFINER. Cada uma verifica a role de quem
-- chama antes de agir — evita precisar de service role no client.

create or replace function public.supermaster_list_empresas()
returns setof public.empresas
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_master() then
    raise exception 'Acesso negado';
  end if;
  return query select * from public.empresas order by created_at desc;
end;
$$;

create or replace function public.supermaster_create_empresa(
  p_nome text,
  p_admin_email text default null,
  p_admin_password text default null,
  p_admin_nome text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_user_id uuid;
begin
  if not public.is_super_master() then
    raise exception 'Acesso negado';
  end if;

  insert into public.empresas (nome) values (p_nome) returning id into v_empresa_id;

  if p_admin_email is not null and p_admin_password is not null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      p_admin_email, extensions.crypt(p_admin_password, extensions.gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
    ) returning id into v_user_id;

    update public.user_profiles
    set empresa_id = v_empresa_id, role = 'admin', display_name = coalesce(p_admin_nome, p_admin_email)
    where user_id = v_user_id;
  end if;

  return v_empresa_id;
end;
$$;

create or replace function public.supermaster_update_empresa(
  p_empresa_id uuid,
  p_nome text default null,
  p_plano text default null,
  p_ativo boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_master() then
    raise exception 'Acesso negado';
  end if;

  update public.empresas
  set
    nome = coalesce(p_nome, nome),
    plano = coalesce(p_plano, plano),
    ativo = coalesce(p_ativo, ativo)
  where id = p_empresa_id;
end;
$$;

create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_nome text,
  p_role public.user_role default 'funcionario'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_empresa_id uuid;
  v_caller_role public.user_role;
  v_user_id uuid;
begin
  select empresa_id, role into v_caller_empresa_id, v_caller_role
  from public.user_profiles where user_id = auth.uid();

  if v_caller_role not in ('admin', 'super_admin') or v_caller_empresa_id is null then
    raise exception 'Acesso negado';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  ) values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    p_email, extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
  ) returning id into v_user_id;

  update public.user_profiles
  set empresa_id = v_caller_empresa_id, role = p_role, display_name = p_nome
  where user_id = v_user_id;

  return v_user_id;
end;
$$;

create or replace function public.admin_update_user_role(
  p_user_profile_id uuid,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_empresa_id uuid;
  v_caller_role public.user_role;
  v_target_empresa_id uuid;
begin
  select empresa_id, role into v_caller_empresa_id, v_caller_role
  from public.user_profiles where user_id = auth.uid();

  if v_caller_role not in ('admin', 'super_admin') or v_caller_empresa_id is null then
    raise exception 'Acesso negado';
  end if;

  select empresa_id into v_target_empresa_id from public.user_profiles where id = p_user_profile_id;

  if v_target_empresa_id is distinct from v_caller_empresa_id then
    raise exception 'Usuário não pertence à sua empresa';
  end if;

  update public.user_profiles set role = p_role where id = p_user_profile_id;
end;
$$;
