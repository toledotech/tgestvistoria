-- Permite ao SuperMaster criar um usuário (ex.: admin inicial) para
-- qualquer empresa, informando o empresa_id explicitamente. Diferente de
-- admin_create_user, que só cria usuários dentro da própria empresa de quem
-- chama (e por isso não serve para o SuperMaster, cujo empresa_id é null).

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

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  ) values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    p_email, extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
  ) returning id into v_user_id;

  update public.user_profiles
  set empresa_id = p_empresa_id, role = p_role, display_name = p_nome
  where user_id = v_user_id;

  return v_user_id;
end;
$$;
