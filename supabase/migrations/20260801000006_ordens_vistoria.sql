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
