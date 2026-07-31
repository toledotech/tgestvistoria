-- Multi-tenant: empresas (tenants) + perfis de usuário

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  plano text not null default 'freemium',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_empresas_updated_at
  before update on public.empresas
  for each row execute function public.update_updated_at_column();

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'funcionario',
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at_column();

-- Função central de isolamento multi-tenant: resolve o empresa_id do usuário logado.
-- SECURITY DEFINER + STABLE para poder ser usada em toda policy de RLS sem
-- recursão (não reconsulta user_profiles via RLS).
create or replace function public.get_current_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.user_profiles where user_id = auth.uid();
$$;

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where user_id = auth.uid();
$$;

create or replace function public.is_super_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where user_id = auth.uid() and role = 'super_admin' and empresa_id is null
  );
$$;

-- Trigger: cria automaticamente um user_profile no cadastro (signup).
-- O primeiro usuário de uma empresa nova é sempre 'admin' — a empresa em si
-- é criada explicitamente pelo fluxo de registro (ver RPC register_empresa).
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name, role, empresa_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    'admin',
    null
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- RPC chamada pelo fluxo de cadastro: cria a empresa e vincula o usuário
-- recém-criado (cujo profile já existe com empresa_id = null) como admin dela.
create or replace function public.register_empresa(p_nome_empresa text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
begin
  if not exists (select 1 from public.user_profiles where user_id = auth.uid()) then
    raise exception 'Perfil de usuário não encontrado';
  end if;

  insert into public.empresas (nome) values (p_nome_empresa)
  returning id into v_empresa_id;

  update public.user_profiles
  set empresa_id = v_empresa_id, role = 'admin'
  where user_id = auth.uid();

  return v_empresa_id;
end;
$$;

alter table public.empresas enable row level security;
alter table public.user_profiles enable row level security;

-- empresas: só SuperMaster enxerga a lista inteira; membros veem a própria.
create policy "empresas_select_own_or_supermaster"
  on public.empresas for select
  using (id = public.get_current_empresa_id() or public.is_super_master());

create policy "empresas_supermaster_all"
  on public.empresas for all
  using (public.is_super_master())
  with check (public.is_super_master());

-- user_profiles: cada um vê/edita o próprio perfil; admins veem a empresa toda.
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (
    user_id = auth.uid()
    or empresa_id = public.get_current_empresa_id()
    or public.is_super_master()
  );

create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_profiles_insert_self"
  on public.user_profiles for insert
  with check (user_id = auth.uid());
