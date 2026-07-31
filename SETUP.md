# Configuração inicial — TGestVistoria

Este projeto foi criado com o mesmo padrão arquitetural do TGestDesp
(Vite + React + TS + shadcn/ui + Supabase, multi-tenant com RLS). Falta só
plugar as credenciais reais para rodar de verdade.

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com/dashboard e crie um novo projeto (ex: `tgestvistoria`).
2. Em **Project Settings → API**, copie:
   - `Project URL` → cole em `VITE_SUPABASE_URL` no arquivo `.env`
   - `anon public key` → cole em `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env`
3. Rode as migrations em `supabase/migrations/` (em ordem, pelo nome do
   arquivo) via SQL Editor do Supabase, ou instale a Supabase CLI e rode:
   ```bash
   npx supabase login
   npx supabase link --project-ref <seu-project-ref>
   npx supabase db push
   ```
4. Gere os tipos TypeScript reais (substitui o placeholder em
   `src/integrations/supabase/types.ts`):
   ```bash
   npx supabase gen types typescript --project-id <seu-project-ref> > src/integrations/supabase/types.ts
   ```
5. Nas Edge Functions (`supabase/functions/mercadopago-checkout` e
   `mercadopago-webhook`), configure a env var `MERCADOPAGO_ACCESS_TOKEN`
   em **Project Settings → Edge Functions → Secrets**, e faça o deploy:
   ```bash
   npx supabase functions deploy mercadopago-checkout
   npx supabase functions deploy mercadopago-webhook
   ```

## 2. Criar conta Mercado Pago Developers (sandbox)

1. Acesse https://www.mercadopago.com.br/developers e crie/entre na conta.
2. Em **Suas integrações → Criar aplicação**, pegue as credenciais de
   **teste** (sandbox): Access Token e Public Key.
3. Configure `MERCADOPAGO_ACCESS_TOKEN` nas Edge Functions (passo acima) e
   `VITE_MERCADOPAGO_PUBLIC_KEY` no `.env` do frontend.
4. Valide o fluxo completo em sandbox antes de trocar pelas credenciais de
   produção.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:8081, clique em "Cadastro", crie a primeira conta —
ela vira automaticamente **Administrador** da empresa que você nomear no
próprio formulário (ou na tela de onboarding, se a confirmação de e-mail
estiver ativada no Supabase Auth).

## 4. Virar SuperMaster (opcional)

Para gerenciar todas as empresas (multi-tenant) pelo painel `/admin`, rode
no SQL Editor do Supabase (trocando o e-mail):

```sql
update public.user_profiles
set role = 'super_admin', empresa_id = null
where user_id = (select id from auth.users where email = 'seu-email@exemplo.com');
```
