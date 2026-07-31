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
