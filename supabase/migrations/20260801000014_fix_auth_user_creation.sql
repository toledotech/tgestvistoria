-- Corrige a criação manual de usuários via SQL: inserir só em auth.users não
-- é suficiente para login por e-mail/senha funcionar — o GoTrue também exige
-- uma linha em auth.identities (provider='email') e os campos de token como
-- string vazia em vez de NULL (bug conhecido de inserts manuais que causam
-- falha de login com erro genérico). Centraliza isso num helper interno e
-- corrige os usuários já criados que ficaram sem login funcional.

create or replace function public.create_auth_user(p_email text, p_password text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token,
    reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    p_email, extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '', '', '', '', ''
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    v_user_id::text, v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email),
    'email', now(), now(), now()
  );

  return v_user_id;
end;
$$;

-- Só pode ser chamada de dentro de outras funções SECURITY DEFINER já
-- protegidas por checagem de role — nunca diretamente pelo cliente.
revoke all on function public.create_auth_user(text, text) from public, anon, authenticated;

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
    v_user_id := public.create_auth_user(p_admin_email, p_admin_password);

    update public.user_profiles
    set empresa_id = v_empresa_id, role = 'admin', display_name = coalesce(p_admin_nome, p_admin_email)
    where user_id = v_user_id;
  end if;

  return v_empresa_id;
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

  v_user_id := public.create_auth_user(p_email, p_password);

  update public.user_profiles
  set empresa_id = v_caller_empresa_id, role = p_role, display_name = p_nome
  where user_id = v_user_id;

  return v_user_id;
end;
$$;

create or replace function public.supermaster_create_user(
  p_empresa_id uuid,
  p_email text,
  p_password text,
  p_nome text,
  p_role public.user_role default 'admin'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_super_master() then
    raise exception 'Acesso negado';
  end if;

  if p_role = 'super_admin' then
    raise exception 'Não é permitido criar super_admin por este formulário';
  end if;

  v_user_id := public.create_auth_user(p_email, p_password);

  update public.user_profiles
  set empresa_id = p_empresa_id, role = p_role, display_name = p_nome
  where user_id = v_user_id;

  return v_user_id;
end;
$$;

-- Repara usuários já criados pelas versões anteriores dessas RPCs, que
-- ficaram sem conseguir logar.
update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where confirmation_token is null or recovery_token is null or email_change_token_new is null
   or email_change is null or email_change_token_current is null or phone_change is null
   or phone_change_token is null or reauthentication_token is null;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now()
from auth.users u
where not exists (
  select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
);
