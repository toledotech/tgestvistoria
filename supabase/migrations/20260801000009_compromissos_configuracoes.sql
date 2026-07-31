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
