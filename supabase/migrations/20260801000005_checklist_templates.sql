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
