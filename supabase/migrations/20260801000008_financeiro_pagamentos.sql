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
