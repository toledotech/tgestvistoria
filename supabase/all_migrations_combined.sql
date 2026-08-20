-- ===== 20260801000001_extensions_and_enums.sql =====
-- Extensões e enums base do sistema

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('super_admin', 'admin', 'gerente', 'funcionario');

create type public.tipo_vistoria as enum ('seguradora', 'detran', 'tecnica_engenharia');

create type public.vistoria_status as enum ('agendada', 'em_andamento', 'concluida', 'cancelada');

create type public.status_pagamento as enum ('pendente', 'pago', 'cancelado');

create type public.metodo_pagamento as enum ('pix', 'cartao');

-- Função genérica reaproveitada por todos os triggers de updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ===== 20260801000002_empresas_user_profiles.sql =====
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


-- ===== 20260801000003_set_empresa_id_trigger.sql =====
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


-- ===== 20260801000004_clientes_veiculos.sql =====
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  cpf_cnpj text,
  telefone text,
  email text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_empresa_id_idx on public.clientes(empresa_id);

create trigger set_clientes_empresa_id
  before insert on public.clientes
  for each row execute function public.set_empresa_id_from_user();

create trigger set_clientes_updated_at
  before update on public.clientes
  for each row execute function public.update_updated_at_column();

alter table public.clientes enable row level security;

create policy "clientes_isolada_por_empresa"
  on public.clientes for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  marca text,
  modelo text,
  ano integer,
  placa text,
  chassi text,
  renavam text,
  cor text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index veiculos_empresa_id_idx on public.veiculos(empresa_id);
create index veiculos_cliente_id_idx on public.veiculos(cliente_id);

create trigger set_veiculos_empresa_id
  before insert on public.veiculos
  for each row execute function public.set_empresa_id_from_user();

create trigger set_veiculos_updated_at
  before update on public.veiculos
  for each row execute function public.update_updated_at_column();

alter table public.veiculos enable row level security;

create policy "veiculos_isolado_por_empresa"
  on public.veiculos for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- ===== 20260801000005_checklist_templates.sql =====
-- Modelos de checklist configuráveis por tipo de vistoria (seguradora, DETRAN,
-- técnica/engenharia). "itens" é um array JSONB de:
--   { "label": string, "tipo_resposta": "ok_nao_na" | "texto" | "numero", "aceita_foto": boolean, "ordem": number }

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  tipo_vistoria public.tipo_vistoria not null,
  nome text not null,
  itens jsonb not null default '[]'::jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index checklist_templates_empresa_id_idx on public.checklist_templates(empresa_id);
create index checklist_templates_tipo_idx on public.checklist_templates(tipo_vistoria);

create trigger set_checklist_templates_empresa_id
  before insert on public.checklist_templates
  for each row execute function public.set_empresa_id_from_user();

create trigger set_checklist_templates_updated_at
  before update on public.checklist_templates
  for each row execute function public.update_updated_at_column();

alter table public.checklist_templates enable row level security;

create policy "checklist_templates_isolado_por_empresa"
  on public.checklist_templates for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- ===== 20260801000006_ordens_vistoria.sql =====
-- Ordens de Vistoria: núcleo operacional do sistema.
-- Numeração de protocolo automática no formato AAAA###### (ano + sequência).

create sequence public.protocolo_vistoria_seq;

create table public.ordens_vistoria (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  numero_protocolo text,
  tipo_vistoria public.tipo_vistoria not null,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  vistoriador_id uuid references public.user_profiles(id) on delete set null,
  checklist_template_id uuid references public.checklist_templates(id) on delete set null,
  status public.vistoria_status not null default 'agendada',
  data_agendada timestamptz,
  data_realizada timestamptz,
  valor numeric(10,2) not null default 0,
  status_pagamento public.status_pagamento not null default 'pendente',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ordens_vistoria_protocolo_unique unique (empresa_id, numero_protocolo)
);

create index ordens_vistoria_empresa_id_idx on public.ordens_vistoria(empresa_id);
create index ordens_vistoria_cliente_id_idx on public.ordens_vistoria(cliente_id);
create index ordens_vistoria_veiculo_id_idx on public.ordens_vistoria(veiculo_id);
create index ordens_vistoria_status_idx on public.ordens_vistoria(status);

create trigger set_ordens_vistoria_empresa_id
  before insert on public.ordens_vistoria
  for each row execute function public.set_empresa_id_from_user();

create trigger set_ordens_vistoria_updated_at
  before update on public.ordens_vistoria
  for each row execute function public.update_updated_at_column();

create or replace function public.generate_protocolo_vistoria()
returns trigger
language plpgsql
as $$
begin
  if new.numero_protocolo is null then
    new.numero_protocolo := to_char(now(), 'YYYY') || lpad(nextval('public.protocolo_vistoria_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger set_ordens_vistoria_protocolo
  before insert on public.ordens_vistoria
  for each row execute function public.generate_protocolo_vistoria();

alter table public.ordens_vistoria enable row level security;

create policy "ordens_vistoria_isolado_por_empresa"
  on public.ordens_vistoria for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- ===== 20260801000007_checklist_respostas.sql =====
-- Preenchimento do checklist de uma ordem de vistoria específica.
-- "respostas" é um objeto JSONB indexado pelo mesmo "label"/id de item do
-- template: { "<item_id>": { "valor": ..., "fotos": ["path1", "path2"] } }

create table public.checklist_respostas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  ordem_vistoria_id uuid not null references public.ordens_vistoria(id) on delete cascade,
  template_id uuid references public.checklist_templates(id) on delete set null,
  respostas jsonb not null default '{}'::jsonb,
  fotos text[] not null default '{}',
  assinatura_vistoriador text,
  laudo_pdf_path text,
  concluido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint checklist_respostas_ordem_unique unique (ordem_vistoria_id)
);

create index checklist_respostas_empresa_id_idx on public.checklist_respostas(empresa_id);
create index checklist_respostas_ordem_idx on public.checklist_respostas(ordem_vistoria_id);

create trigger set_checklist_respostas_empresa_id
  before insert on public.checklist_respostas
  for each row execute function public.set_empresa_id_from_user();

create trigger set_checklist_respostas_updated_at
  before update on public.checklist_respostas
  for each row execute function public.update_updated_at_column();

alter table public.checklist_respostas enable row level security;

create policy "checklist_respostas_isolado_por_empresa"
  on public.checklist_respostas for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- ===== 20260801000008_financeiro_pagamentos.sql =====
create type public.tipo_transacao as enum ('receita', 'despesa');
create type public.status_transacao as enum ('pendente', 'confirmada', 'cancelada');

create table public.transacoes_financeiras (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  ordem_vistoria_id uuid references public.ordens_vistoria(id) on delete set null,
  cliente_id uuid references public.clientes(id) on delete set null,
  tipo public.tipo_transacao not null,
  categoria text,
  descricao text,
  valor numeric(10,2) not null,
  status public.status_transacao not null default 'pendente',
  data_vencimento date,
  data_pagamento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transacoes_financeiras_empresa_id_idx on public.transacoes_financeiras(empresa_id);
create index transacoes_financeiras_ordem_idx on public.transacoes_financeiras(ordem_vistoria_id);

create trigger set_transacoes_financeiras_empresa_id
  before insert on public.transacoes_financeiras
  for each row execute function public.set_empresa_id_from_user();

create trigger set_transacoes_financeiras_updated_at
  before update on public.transacoes_financeiras
  for each row execute function public.update_updated_at_column();

alter table public.transacoes_financeiras enable row level security;

create policy "transacoes_financeiras_isolado_por_empresa"
  on public.transacoes_financeiras for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- Cobranças reais via gateway (Mercado Pago) vinculadas a uma ordem de vistoria.
-- Populada pela edge function de checkout, atualizada pela edge function de
-- webhook (que roda com service role e não passa pelas policies abaixo).

create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  ordem_vistoria_id uuid not null references public.ordens_vistoria(id) on delete cascade,
  gateway text not null default 'mercadopago',
  gateway_payment_id text,
  metodo public.metodo_pagamento,
  status text not null default 'pending',
  qr_code text,
  qr_code_base64 text,
  link_pagamento text,
  valor numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pagamentos_empresa_id_idx on public.pagamentos(empresa_id);
create index pagamentos_ordem_idx on public.pagamentos(ordem_vistoria_id);
create index pagamentos_gateway_payment_id_idx on public.pagamentos(gateway_payment_id);

create trigger set_pagamentos_empresa_id
  before insert on public.pagamentos
  for each row execute function public.set_empresa_id_from_user();

create trigger set_pagamentos_updated_at
  before update on public.pagamentos
  for each row execute function public.update_updated_at_column();

alter table public.pagamentos enable row level security;

create policy "pagamentos_isolado_por_empresa"
  on public.pagamentos for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- ===== 20260801000009_compromissos_configuracoes.sql =====
create table public.compromissos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  titulo text not null,
  descricao text,
  data_hora timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index compromissos_empresa_id_idx on public.compromissos(empresa_id);

create trigger set_compromissos_empresa_id
  before insert on public.compromissos
  for each row execute function public.set_empresa_id_from_user();

create trigger set_compromissos_updated_at
  before update on public.compromissos
  for each row execute function public.update_updated_at_column();

alter table public.compromissos enable row level security;

create policy "compromissos_isolado_por_empresa"
  on public.compromissos for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


create table public.configuracoes_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null unique references public.empresas(id) on delete cascade,
  nome_empresa text,
  cnpj text,
  endereco text,
  telefone text,
  email text,
  logo_url text,
  cor_tema text default '#2563EB',
  configuracoes_notificacao jsonb not null default '{}'::jsonb,
  configuracoes_sistema jsonb not null default '{}'::jsonb,
  mercadopago_public_key text,
  mercadopago_access_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_configuracoes_empresa_empresa_id
  before insert on public.configuracoes_empresa
  for each row execute function public.set_empresa_id_from_user();

create trigger set_configuracoes_empresa_updated_at
  before update on public.configuracoes_empresa
  for each row execute function public.update_updated_at_column();

alter table public.configuracoes_empresa enable row level security;

create policy "configuracoes_empresa_isolado_por_empresa"
  on public.configuracoes_empresa for all
  using (empresa_id = public.get_current_empresa_id())
  with check (empresa_id = public.get_current_empresa_id());


-- Storage buckets

insert into storage.buckets (id, name, public)
values
  ('logos-empresa', 'logos-empresa', true),
  ('fotos-vistoria', 'fotos-vistoria', false),
  ('laudos-pdf', 'laudos-pdf', false)
on conflict (id) do nothing;

create policy "logos_empresa_public_read"
  on storage.objects for select
  using (bucket_id = 'logos-empresa');

create policy "logos_empresa_auth_write"
  on storage.objects for insert
  with check (bucket_id = 'logos-empresa' and auth.role() = 'authenticated');

create policy "logos_empresa_auth_update"
  on storage.objects for update
  using (bucket_id = 'logos-empresa' and auth.role() = 'authenticated');

create policy "fotos_vistoria_auth_all"
  on storage.objects for all
  using (bucket_id = 'fotos-vistoria' and auth.role() = 'authenticated')
  with check (bucket_id = 'fotos-vistoria' and auth.role() = 'authenticated');

create policy "laudos_pdf_auth_all"
  on storage.objects for all
  using (bucket_id = 'laudos-pdf' and auth.role() = 'authenticated')
  with check (bucket_id = 'laudos-pdf' and auth.role() = 'authenticated');


-- ===== 20260801000010_admin_rpcs.sql =====
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


-- ===== 20260801000011_realtime_publication.sql =====
-- Habilita Realtime (postgres_changes) na tabela de pagamentos, usada pelo
-- CobrancaPanel para refletir o status assim que o webhook do Mercado Pago
-- atualizar o registro.

alter publication supabase_realtime add table public.pagamentos;
alter publication supabase_realtime add table public.ordens_vistoria;




-- ===== 20260801000012_supermaster_delete_empresa.sql =====
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


-- ===== 20260801000013_supermaster_create_user.sql =====
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
