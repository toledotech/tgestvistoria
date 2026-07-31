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
