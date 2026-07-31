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
