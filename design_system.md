# Design System — ToledoTech
**Versão:** 3.1.0
**Padrão Visual:** Claro Moderno (fundo creme, sidebar navy, acentos teal + laranja)
**Slogan Oficial:** "Sistemas inteligentes para mercados em evolução"

Este arquivo é a fonte única de verdade para cores, tipografia, componentes e regras de UI do ecossistema ToledoTech (Hub, Gestão, CRM, Financeiro e demais módulos `TGest*`). Qualquer projeto novo ou existente deve seguir estas diretrizes.

> **Nota de versão:** a partir da v3.0.0 o padrão visual mudou de escuro (v2.x) para claro. Projetos ainda no padrão escuro devem migrar assim que possível — ver seção 10.
>
> **v3.1.0:** o header deixou de ficar restrito à coluna de conteúdo e passou a ocupar 100% da largura da tela (por cima da sidebar também), com dropdown de usuário e ícones de ação sem fundo circular — ver seção 4. Projetos que ainda usam o header "baixo, dentro da coluna de conteúdo" (padrão v3.0.0) devem migrar para esse novo layout.

---

## 1. Tokens de Cor

```css
:root {
  /* Base */
  --pageBg: #FDF8F1;   /* fundo de página — creme quente, nunca branco puro */
  --surface: #FFFFFF;  /* cards, modais, inputs, tabelas */
  --border: #EFE4D3;   /* bordas, divisores, linhas de tabela */

  /* Texto */
  --textPrimary: #1E2A3B;  /* títulos, dados, texto corrido */
  --textMuted: #94A0B4;    /* labels, placeholders, legendas */

  /* Navy / Azul Profundo — sidebar, topbar e CTAs/botões escuros */
  --navy: #0B132B;
  --navyHover: #17213F;

  /* Marca / destaque primário */
  --teal: #14B8A6;
  --tealSoft: rgba(20,184,166,0.12);
  --shadow: 0 1px 2px rgba(30,42,59,0.04), 0 8px 24px rgba(30,42,59,0.06);

  /* Marca / destaque secundário */
  --orange: #F59E0B;
  --orangeSoft: rgba(245,158,11,0.14);

  /* Seleção / estado ativo (teal) */
  --selectBg: rgba(20,184,166,0.12);
  --selectBorder: rgba(20,184,166,0.35);
  --selectText: #0D9488;

  /* Estados semânticos */
  --green: #10B981;
  --greenBg: rgba(16,185,129,0.1);
  --greenBorder: rgba(16,185,129,0.25);

  --red: #EF4444;
  --redBg: rgba(239,68,68,0.1);
  --redBorder: rgba(239,68,68,0.25);

  --amber: #F59E0B;
  --amberBg: rgba(245,158,11,0.12);
  --amberBorder: rgba(245,158,11,0.3);

  --blue: #3B82F6;
  --blueBg: rgba(59,130,246,0.1);
  --blueBorder: rgba(59,130,246,0.25);
}

body { background: var(--pageBg); }
```

### Regras de uso
- **Fundo de página** (`body`): `var(--pageBg)` — creme quente (`#FDF8F1`), nunca branco puro nem cinza neutro.
- **Cards, sidebar, modais, inputs, tabelas**: `var(--surface)` (branco) com `border: 1px solid var(--border)` e `box-shadow: var(--shadow)`.
- **Teal** (`--teal`): cor de marca primária — CTA principal, série de dado primária em gráfico, ícone/estado ativo, saldo positivo. Nunca usar em texto corrido extenso.
- **Laranja** (`--orange`): destaque secundário — segunda série em gráfico, ícones de "a receber"/pendência neutra, botão de período/filtro. Não é cor de alerta aqui (isso é `--amber`, mesmo tom, uso semântico diferente).
- **Navy** (`--navy`): fundo da sidebar e de botões de ação "escuros" (ex: seletor de período). Nunca usar como cor de texto sobre `--surface` — para texto escuro use `--textPrimary`.
- **Seleção/estado ativo** (`--selectBg/--selectBorder/--selectText`): item de menu ativo com preenchimento sólido teal (ver seção 4), chip/filtro selecionado, input focado.
- **Verde/Vermelho/Âmbar/Azul semânticos**: exclusivos para status real (sucesso, erro, atenção, informação — variação de indicador, badge de status). Nunca usar como cor decorativa fora desse contexto.
- ⚠️ **Roxo (`#8A2BE2`) e qualquer variação de azul-elétrico continuam banidos.**

---

## 2. Tipografia

```css
font-family: 'Plus Jakarta Sans', Inter, sans-serif;       /* interface geral */
font-family: 'JetBrains Mono', 'Fira Code', monospace;      /* dados, valores, IDs, datas, placas */
```

- **Plus Jakarta Sans**: títulos, menus, labels, textos, nomes de cliente/produto. Pesos 400/500/600/700/800 — usar 800 só em títulos de página (`h1`).
- **JetBrains Mono**: qualquer valor numérico/alfanumérico tabular — preços, KPIs, datas, placas, RENAVAM, IDs, quilometragem. Obrigatório para alinhamento vertical em tabelas e relatórios financeiros. Usar `font-variant-numeric: tabular-nums`.

---

## 3. Regras de Componentes

### Border-radius
- Cards, modais: `16px`–`20px` (mais arredondado que o padrão antigo — assinatura visual do tema claro)
- Inputs, botões: `10px`–`12px`
- Badges/tags/chips: pílula (`border-radius: 20px`) ou `6px` quando quadrado
- Avatares: `50%`

### Sombra (substitui o glow do tema escuro)
Todo card usa a mesma sombra suave, nunca glow colorido:
```css
box-shadow: 0 1px 2px rgba(30,42,59,0.04), 0 8px 24px rgba(30,42,59,0.06);
```

### Estados de Input
| Estado | Aparência |
|---|---|
| Normal | `border: 1px solid var(--border)`, fundo `var(--surface)`, `box-shadow: var(--shadow)` |
| Focado | `border-color: var(--teal)` |
| Erro | `border-color: var(--redBorder)`; mensagem abaixo em `--red` |
| Válido | `border-color: var(--greenBorder)`; mensagem em `--green` |
| Desabilitado | `opacity: 0.5; cursor: not-allowed` |
| Aviso | `border-color: var(--amberBorder)`; mensagem em `--amber` |

### Tabelas
- Fundo do card da tabela: `var(--surface)`, `border-radius: 16px`, `box-shadow: var(--shadow)`
- Cabeçalho (`th`): uppercase, `10px`, `--textMuted`, `letter-spacing: 0.5px`, `border-bottom: 1px solid var(--border)`
- Células (`td`): `JetBrains Mono` para dado numérico, `12–13px`
- **Hover de linha**: `background: var(--pageBg)` (creme, não teal — teal fica reservado a seleção/ação)

### Botões
| Classe | Aparência | Uso |
|---|---|---|
| `.btn-primary` | fundo `var(--teal)`, texto `#06231A` | Ação primária (Salvar, Confirmar, Nova Venda) |
| `.btn-dark` | fundo `var(--navy)`, texto `#FFFFFF` | Ações de navegação/período (ex: seletor "Últimos 30 dias") |
| `.btn-ghost` | fundo `var(--surface)`, borda `var(--border)`, texto `--textPrimary` | Ação secundária (Cancelar, Filtros, Exportar) |
| `.btn-danger` | fundo `var(--redBg)`, texto `--red` | Ação destrutiva (Excluir) |

---

## 4. Header Global & Sidebar

### Estrutura geral da tela — padrão obrigatório em TODOS os sistemas (v3.1.0)
A tela é dividida em duas linhas: **um header global no topo, ocupando 100% da largura** (por cima da sidebar também), e abaixo dele o corpo em duas colunas — **sidebar à esquerda** (ocupando a altura restante da viewport, `position: sticky`) e **conteúdo à direita**.

```
┌─────────────────────────────────────┐
│  header global (largura total)       │
├────────┬──────────────────────────────┤
│sidebar │                              │
│(resto  │  conteúdo                    │
│da alt.)│                              │
└────────┴──────────────────────────────┘
```

- Header e sidebar usam o **mesmo fundo `var(--navy)` sólido** (`#0B132B`) — se fundem visualmente no canto superior esquerdo.
- Largura da sidebar: `220px`; altura = `calc(100vh - altura do header)`, sticky logo abaixo do header.
- Itens de menu em `#A9B4C7` (cinza-azulado claro sobre navy); ícone à esquerda do label.
- Item de menu ativo: fundo `rgba(20,184,166,0.14)`, **barra de destaque de 3px à esquerda** em `var(--teal)`, texto branco `#FFFFFF` em negrito, ícone em `#5EEAD4`.
- Rodapé da sidebar: badge de status/conexão (ex: "Modo Live", cargo do usuário) centralizado.

### Header Global (topo, largura total)
- **Fundo `var(--navy)` sólido**, altura ~`56px`, sticky `top: 0`, `z-index` acima da sidebar. Mesma cor em todo o ecossistema — Hub e todo módulo `TGest*`.
- Layout em 3 zonas (grid `1fr auto 1fr`):
  - **Esquerda**: botão hambúrguer (visível só em mobile, `<1280px`) — sem fundo circular, ícone `#E2E8F0`.
  - **Centro**: nome do sistema, centralizado, branco, `font-weight: 800` — opcionalmente seguido do slogan em `<span>` separado, cor `#A9B4C7`, `font-weight: 500` (some em telas `<860px` pra não quebrar layout).
  - **Direita**: ícone de notificação (sino) + ícone de usuário (avatar), lado a lado.
- **Ícones de ação do header** (sino, avatar): **sem fundo circular nem borda** — só o ícone em `#E2E8F0`, hover `#FFFFFF`. Badge de contagem (ex: notificações): pílula pequena `var(--orange)`, texto branco, posicionada no canto superior direito do ícone.
- **Dropdown do usuário** (abre ao clicar no ícone de avatar): painel `var(--surface)` + `var(--shadow)`, `border-radius: var(--radius-md)`, alinhado à direita do ícone.
  - Cabeçalho do dropdown: nome do usuário (`--text-primary`, bold) + cargo (`--teal`, uppercase, pequeno) + e-mail (`--text-muted`).
  - Divisor (`var(--border)`).
  - Itens: "Meu Perfil" (`--text-primary`) e "Sair" (`--red`) — cada um com ícone à esquerda, hover `var(--pageBg)` (ou `var(--redBg)` no item de sair).
  - Fecha ao clicar fora (overlay transparente full-screen atrás do painel).
- Logo do sistema: **não fica no header** — só na sidebar (topo) e/ou na tela de login. O header carrega apenas o nome do sistema em texto.

### Saudação do Dashboard (tela inicial, opcional)
A home/dashboard de cada sistema pode substituir o título de página simples por um bloco de saudação, no topo do conteúdo:
- Linha 1: data por extenso (`--text-muted`, pequeno) — ex: "Quarta-feira, 26 de agosto".
- Linha 2: saudação em negrito, tamanho maior (`1.5rem`, `font-weight: 800`), dinâmica conforme o horário local (`Bom dia` <12h / `Boa tarde` <18h / `Boa noite` demais) + nome da empresa/loja configurada.
- Linha 3: nome do usuário logado + cargo, separados por `·` (`--text-muted`, tamanho pequeno).
- Demais telas do sistema mantêm o título de página simples (`h2`, `--text-primary`, `font-weight: 700`).

---

## 5. Padrão de Dashboard

Layout de referência para telas internas densas em dado (visão geral, relatórios, home de módulo).

### Stat card
- `var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 18px`, padding 18–20px, `box-shadow: var(--shadow)`
- Label pequeno (`--textMuted`) + ícone pequeno colorido (teal ou laranja, soft bg) + valor grande (`JetBrains Mono`, `--textPrimary`, peso 700) + variação em pílula: `--green`/`--greenBg` se positiva, `--red`/`--redBg` se negativa — sempre com seta, nunca só cor

### Card de gráfico (linha, barra, donut, gauge)
- Mesmo container do stat card; título + legenda/filtro no header
- Séries: `--teal` primária, `--orange` secundária — grade de fundo em `#F1E9DA` (tom creme mais claro que o border), nunca cinza puro
- Gauge/donut: track de fundo em `var(--border)`, progresso em gradiente `linear-gradient(var(--orange) → var(--teal))` ou sólido `--teal`
- Tooltip: fundo `var(--navy)`, texto branco, valores em `JetBrains Mono`

### Feed de atividade / lista de prazos
- Item: ícone quadrado arredondado (`--tealSoft`/`--orangeSoft` conforme o tipo de evento) + texto + timestamp `--textMuted` à direita
- Lista de prazos: barra vertical de 4px à esquerda, cor semântica conforme urgência (`--red` vencido, `--amber` vence logo, `--teal`/`--green` tranquilo)
- Link "Ver tudo": pílula `var(--pageBg)`, texto `--navy`, `font-weight: 700`

---

## 6. Alertas & Notificações

### Alertas inline (`.alert`)
4 variações: `.error` (`--red`), `.warning` (`--amber`), `.info` (`--blue`), `.success` (`--green`) — fundo na cor `*Bg`, borda `*Border`, texto na cor sólida.

### Toasts
- Posição: canto inferior direito, `300px`, fundo `var(--surface)` + `box-shadow: var(--shadow)`
- Barra de progresso inferior na cor semântica do toast
- Auto-dismiss: 4 segundos

---

## 7. Densidade de Tabela

```css
.tbl-comfortable td { padding: 14px 10px; font-size: 12px; }
.tbl-normal td      { padding: 10px 10px; font-size: 12px; }
.tbl-compact td      { padding: 6px 10px;  font-size: 11px; }
```

---

## 8. Estrutura de Subdomínios (Branding)

| Sistema | Subdomínio |
|---|---|
| Hub / Super Admin | `sistemas.toledotech.com.br` |
| Financeiro | `fin.toledotech.com.br` |
| CRM | `crm.toledotech.com.br` |
| Veículos | `veic.toledotech.com.br` |
| (demais `TGest*`) | `{slug}.toledotech.com.br` |

Todos os módulos exibem o logo do módulo (ícone + gradiente teal) na sidebar, seguindo a seção 4.

---

## 9. Princípio Geral de Ergonomia

Calibrado pra telas usadas várias horas por dia. Ao adicionar cor ou componente novo:

- ❌ Nunca usar branco puro como fundo de página (`--pageBg` é sempre creme, não `#FFFFFF`)
- ❌ Nunca usar preto puro como texto (`--textPrimary` é slate escuro, `#1E2A3B`, não `#000000`)
- ❌ Evitar saturação 100% em qualquer cor de destaque
- ✅ Sombra suave (`--shadow`) no lugar de glow colorido — o glow era do tema escuro (v2.x) e não deve voltar
- ✅ Contraste alto o suficiente pra leitura, mas sem depender de preto/branco absolutos

---

## 10. Migração do tema escuro (v2.x → v3.0.0)

Projetos que ainda usam os tokens antigos (`--darkBg`, `--neonGreen`, `--selectBlue*` etc.) devem migrar substituindo:

| Token antigo (v2.x) | Token novo (v3.0.0) |
|---|---|
| `--darkBg` | `--pageBg` |
| `--surface` | `--surface` (mesmo nome, valor novo: `#FFFFFF`) |
| `--border` | `--border` (mesmo nome, valor novo: `#EFE4D3`) |
| `--textPrimary` | `--textPrimary` (mesmo nome, valor novo: `#1E2A3B`) |
| `--textMuted` | `--textMuted` (mesmo nome, valor novo: `#94A0B4`) |
| `--neonGreen` | `--teal` |
| `--glow-green` | `--shadow` (deixa de ser glow, vira sombra neutra) |
| `--selectBlue` / `--selectBlueBorder` / `--selectBlueText` | `--selectBg` / `--selectBorder` / `--selectText` |
| `--errorRed` | `--red` |
| `--warnAmber` | `--amber` |
| `--infoBlue` | `--blue` |

O **HubToledoTech** é o primeiro sistema migrado — usar `app/globals.css` e `app/launchpad/page.tsx` dele como referência viva de implementação.

---

## 11. Referência Visual

O arquivo `toledotech-mockup.html` ainda reflete o tema escuro (v2.x) e precisa ser atualizado. Para o header global v3.1.0 (seção 4), o **TGestVeic** é a referência viva de implementação em CSS puro (`src/App.tsx` + `src/index.css`); na família Tailwind/shadcn, o componente equivalente é o `AppShell`/`TopBar` do pacote `@toledotech/tgest-ui` (repo `TGestUI`).
