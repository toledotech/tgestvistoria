# TGestVistoria

Sistema de gestão de vistorias veiculares — cadastro de clientes e veículos,
checklists de vistoria configuráveis, agenda de compromissos, cobrança via
Mercado Pago e controle financeiro, com suporte multi-tenant (múltiplas
empresas na mesma base).

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [shadcn/ui](https://ui.shadcn.com/) + Radix UI + Tailwind CSS
- [Supabase](https://supabase.com/) (Postgres, Auth, RLS multi-tenant, Edge Functions)
- [Mercado Pago](https://www.mercadopago.com.br/developers) (checkout e webhook de cobrança)
- React Query, React Hook Form + Zod, React Router, React PDF Renderer

## Funcionalidades

- **Autenticação e multi-tenant**: cada empresa tem seus próprios dados,
  isolados por RLS no Supabase. O primeiro usuário de uma empresa vira
  administrador automaticamente.
- **Clientes e veículos**: cadastro e gestão vinculados à empresa.
- **Checklists de vistoria**: templates configuráveis por empresa e respostas
  registradas por vistoria.
- **Vistorias**: abertura, execução do checklist, detalhe e geração de laudo
  em PDF.
- **Agenda**: compromissos relacionados às vistorias.
- **Financeiro e cobrança**: pagamentos e integração com Mercado Pago
  (checkout + webhook via Edge Functions).
- **Painel admin**: gestão de empresas e usuários para o perfil
  `super_admin`.

## Estrutura do projeto

```
src/
  components/       componentes de UI e de domínio (vistorias, configurações, layout)
  contexts/         contexto de autenticação
  hooks/            hooks de dados (clientes, veículos, vistorias, financeiro, ...)
  integrations/     cliente e tipos do Supabase
  pages/            páginas roteadas (Dashboard, Clientes, Vistorias, Financeiro, ...)
supabase/
  migrations/       migrations SQL (schema, RLS, RPCs)
  functions/        Edge Functions (checkout e webhook do Mercado Pago)
```

## Como rodar localmente

Pré-requisitos: Node.js e um projeto Supabase configurado (veja
[SETUP.md](SETUP.md) para o passo a passo completo de Supabase e Mercado
Pago).

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

Acesse `http://localhost:8081`, clique em "Cadastro" e crie a primeira
conta — ela vira automaticamente administradora da empresa informada no
formulário.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run build:dev` — build em modo development
- `npm run lint` — lint do projeto
- `npm run preview` — preview do build de produção

## Configuração detalhada

Consulte [SETUP.md](SETUP.md) para criar o projeto no Supabase, rodar as
migrations, gerar os tipos TypeScript e configurar as credenciais sandbox do
Mercado Pago.
