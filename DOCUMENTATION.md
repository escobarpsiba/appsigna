# Signa — Documentação Completa

Plataforma SaaS premium para gestão de clínicas de psicanálise.

---

## Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Componentes | @base-ui/react (shadcn-like) |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth + SSR Cookies |
| IA | Google Gemini 2.5 Flash |
| Deploy | Vercel |
| Temas | next-themes (Light/Dark) |

---

## Arquitetura Multi-Tenant

O sistema isola dados por clínica usando `tenant_id` em todas as tabelas:

```
tenants (clínicas)
  ├── profiles (usuários vinculados)
  ├── patients (pacientes)
  ├── appointments (sessões)
  ├── payments (pagamentos)
  └── ai_logs (uso de IA)
```

**Regras de Segurança (RLS):**
- Cada usuário só vê dados do seu `tenant_id`
- Função `get_current_tenant_id()` filtra automaticamente
- Políticas de Row Level Security no Supabase

---

## Rotas e Funcionalidades

### Autenticação (`/auth`)

#### `/login` — Página de Login
- Formulário com email e senha
- Usa Supabase Auth (`signInWithPassword`)
- Redireciona baseado no role:
  - **Admin com clínica** → `/choice`
  - **Admin sem clínica** → `/admin/dashboard`
  - **Usuário comum** → `/c/[slug]` ou `/dashboard`
- Exibe erros via query params (`?error=clinica-nao-encontrada`)

#### `/forgot-password` — Recuperação de Senha
- Formulário para reset de senha via Supabase Auth
- Envia email de recuperação

#### `/choice` — Escolha de Acesso (Admin)
- Admin com clínica vinculada escolhe entre:
  - Painel Administrativo (`/admin/dashboard`)
  - Painel da Clínica (`/c/[slug]`)
- Cards com animações hover

#### `/auth` (actions) — Sign Out
- `signOut()`: encerra sessão e redireciona para `/login`

### Aplicação Principal (`(app)`)

#### `/dashboard` — Painel Principal
**Métricas em tempo real:**
- Sessões hoje (contagem + lista)
- Pacientes ativos (contagem)
- Receita do mês (total em R$)
- Pagamentos pendentes (contagem)

**Seções:**
- Agenda de Hoje (lista de sessões com horário, paciente, modalidade)
- Insights da Signa (alertas de pagamentos pendentes, faturamento)
- Link rápido para Assistente IA

#### `/calendar` — Agenda Semanal
**Visualização:**
- Grade semanal (segunda a sábado) com horários 08h–20h
- Navegação entre semanas (botões ← → e "Hoje")
- Sessões coloridas por status:
  - **Verde** = Concluída
  - **Azul** = Agendada
  - **Cinza** = Cancelada
- Indicador `↻` para sessões recorrentes

**Funcionalidades:**
- Criar sessão clicando em slot vazio ou botão "Nova Sessão"
- Editar sessão clicando na sessão existente
- **Sessões recorrentes**: checkbox "Repetir semanalmente" cria 26 sessões (6 meses)
- Sidebar com resumo das sessões de hoje

#### `/patients` — Gestão de Pacientes
**Lista:**
- Tabela com: Nome, Telefone, Email, Valor/Sessão, Frequência, Cobrança, Status
- Busca por nome
- Botões: Editar, Excluir

**Cadastro (modal):**
- Nome, Telefone, Email
- Frequência: Semanal, Quinzenal, Mensal, Variável
- Tipo de Cobrança:
  - **Por Sessão** → valor individual
  - **Pacote Mensal** → valor do pacote + dia de vencimento (1–28)
- Toggle Ativo/Inativo

#### `/financial` — Painel Financeiro
**Dashboard:**
- Gráfico de barras: Faturamento mensal (últimos 4 meses)
- Gráfico de pizza: Distribuição por status (Pago/Pendente/Atrasado)

**Tabela de Pagamentos:**
- Colunas: Paciente, Vencimento, Valor, Método, Status, Ações
- Status com badges coloridos:
  - **Pago** (verde)
  - **Pendente** (amarelo)
  - **Atrasado** (vermelho) — calculado por `due_date < hoje`
- Ações:
  - Pagamentos pendentes: botão "Confirmar" ou "Marcar Pago"
  - Pagamentos pagos: `—` (nenhuma ação)

**Registrar Pagamento Manual:**
- Selecionar paciente, valor, método (PIX/Dinheiro/Cartão/Transferência), data de vencimento, status

#### `/assistant` — Assistente IA
**Chat com Google Gemini 2.5 Flash:**
- Interface de chat com bolhas de mensagem
- Botão copiar resposta
- Sugestões pré-definidas:
  - "Gerar mensagem de cobrança cordial"
  - "Quem está há mais de 15 dias sem vir?"
  - "Confirmar sessão para amanhã"
  - "Quanto faturei este mês?"

**Contexto injetado automaticamente:**
- Lista de pacientes da clínica
- Próximas sessões
- Pagamentos recentes
- **Base de Conhecimento personalizada** (definida em Configurações)

#### `/settings` — Configurações
**Perfil Profissional:**
- Nome, Email, WhatsApp
- Alteração de senha

**Prática Clínica:**
- Fuso horário
- Moeda (BRL)
- Notificações por WhatsApp (placeholder)

**Assistente IA — Base de Conhecimento:**
- Textarea para instruções personalizadas
- Define tom, estilo de comunicação, regras de abordagem
- Exemplo: "Use tom acolhedor", "Sempre se refira ao profissional como Doutor"
- Salva na tabela `tenants.ai_knowledge_base`
- Usado pelo Assistente IA em todas as respostas

### Rotas Dinâmicas

#### `/c/[slug]` — Link Direto da Clínica
- Verifica se a clínica existe (pelo slug)
- Verifica se o usuário pertence à clínica
- Redireciona para o dashboard
- Tratamento de erros: clínica não encontrada, sem acesso

### Painel Administrativo (`/admin`)

#### `/admin/dashboard` — Dashboard Admin
- Total de usuários
- Clínicas ativas
- Uso de IA (tokens)
- MRR estimado

#### `/admin/tenants` — Gestão de Clínicas
- Lista todas as clínicas com:
  - Nome, slug, status (ativo/inativo), número de usuários, data de criação
- Criar nova clínica
- Gerar link amigável (slug a partir do nome)
- Ações: Editar dados, Ver usuários, Suspender clínica

#### `/admin/users` — Gestão de Usuários
- Lista todos os perfis com:
  - Nome/Email, role (admin/user), clínica vinculada, data de cadastro
- Criar novo usuário
- Busca por email
- Ações por usuário:
  - Editar dados
  - Alterar role (admin/user)
  - Vincular a outra clínica
  - Redefinir senha

---

## Server Actions

| Arquivo | Função | Descrição |
|---|---|---|
| `auth/actions.ts` | `signOut()` | Encerra sessão e redireciona |
| `(auth)/login/actions.ts` | `login()` | Autentica usuário + redireciona por role |
| `(app)/patients/actions.ts` | `savePatient()` | Cria/atualiza paciente |
| `(app)/patients/actions.ts` | `deletePatient()` | Remove paciente |
| `(app)/calendar/actions.ts` | `saveAppointment()` | Cria sessão (suporte a recorrente — 26 semanas) |
| `(app)/calendar/actions.ts` | `cancelRecurringSeries()` | Cancela série inteira de sessões |
| `(app)/calendar/actions.ts` | `updateAppointmentStatus()` | Altera status da sessão + gera pagamento |
| `(app)/financial/actions.ts` | `markAsPaid()` | Marca pagamento como recebido |
| `(app)/financial/actions.ts` | `createManualPayment()` | Registra pagamento avulso |
| `(app)/assistant/actions.ts` | `askAssistant()` | Consulta Gemini com contexto da clínica |
| `(app)/settings/actions.ts` | `updatePassword()` | Altera senha do usuário |
| `(app)/settings/actions.ts` | `saveKnowledgeBase()` | Salva instruções personalizadas da IA |
| `admin/tenants/actions.ts` | `createTenant()` | Cria nova clínica |
| `admin/tenants/actions.ts` | `updateTenantSlug()` | Gera slug a partir do nome |
| `admin/tenants/actions.ts` | `updateTenantStatus()` | Ativa/suspende clínica |
| `admin/users/actions.ts` | `createUser()` | Cria usuário com role e clínica |
| `admin/users/actions.ts` | `updateUserRole()` | Altera permissão do usuário |
| `admin/users/actions.ts` | `assignTenant()` | Vincula usuário a clínica |

---

## Banco de Dados

### `tenants`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | Nome da clínica |
| `slug` | TEXT | URL amigável |
| `status` | TEXT | `active` / `inactive` |
| `ai_knowledge_base` | TEXT | Instruções para o assistente IA |
| `created_at` | TIMESTAMP | Data de criação |

### `profiles`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | FK → auth.users |
| `tenant_id` | UUID | FK → tenants |
| `role` | TEXT | `admin` / `user` |
| `name` | TEXT | Nome do usuário |
| `email` | TEXT | Email |
| `created_at` | TIMESTAMP | Data de criação |

### `patients`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `name` | TEXT | Nome |
| `phone` | TEXT | Telefone |
| `email` | TEXT | Email |
| `price` | DECIMAL | Valor por sessão |
| `frequency` | TEXT | Semanal/Quinzenal/Mensal/Variável |
| `billing_type` | TEXT | `per_session` / `monthly_package` |
| `monthly_price` | DECIMAL | Valor do pacote mensal |
| `payment_day` | INTEGER | Dia de vencimento (1–28) |
| `active` | BOOLEAN | Status do paciente |
| `started_at` | TIMESTAMP | Data de início |

### `appointments`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `patient_id` | UUID | FK → patients |
| `starts_at` | TIMESTAMPTZ | Data/hora da sessão |
| `duration` | INTEGER | Duração em minutos (padrão: 50) |
| `amount` | DECIMAL | Valor da sessão |
| `modality` | TEXT | `Presencial` / `Online` |
| `status` | TEXT | `scheduled` / `completed` / `cancelled` |
| `note` | TEXT | Observações |
| `recurrence_group_id` | UUID | Grupo de sessões recorrentes |
| `is_recurring` | BOOLEAN | Identifica sessão recorrente |
| `created_at` | TIMESTAMP | Data de criação |

### `payments`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `patient_id` | UUID | FK → patients |
| `appointment_id` | UUID | FK → appointments |
| `amount` | DECIMAL | Valor |
| `method` | TEXT | `PIX` / `Dinheiro` / `Cartão` / `Transferência` |
| `status` | TEXT | `pending` / `paid` / `overdue` |
| `due_date` | DATE | Data de vencimento |
| `paid_at` | TIMESTAMP | Data do pagamento |
| `created_at` | TIMESTAMP | Data de criação |

### `ai_logs`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `user_id` | UUID | FK → profiles |
| `category` | TEXT | Categoria do uso |
| `estimated_tokens` | INTEGER | Tokens consumidos |
| `created_at` | TIMESTAMP | Data de uso |

---

## Fluxos Principais

### 1. Login + Redirecionamento
```
Usuário entra → Supabase Auth → Busca perfil
  ├── role = admin + tem clínica → /choice
  ├── role = admin + sem clínica → /admin/dashboard
  └── role = user → /c/[slug] ou /dashboard
```

### 2. Criar Sessão Recorrente
```
Agendar Sessão → Marcar "Repetir semanalmente"
  → Server action cria 26 appointments (1 por semana)
  → Mesmo recurrence_group_id
  → Primeira sessão com status definido, demais "scheduled"
```

### 3. Pagamento Automático ao Completar Sessão
```
Sessão marcada como "completed"
  → Cria payment com status "pending"
  → due_date = data da sessão (per_session)
  → due_date = payment_day do mês (monthly_package)
```

### 4. Assistente IA
```
Usuário envia pergunta → Server action busca:
  - Dados do paciente logado
  - Pacientes, sessões, pagamentos da clínica
  - Base de conhecimento (tenants.ai_knowledge_base)
  → Monta prompt com contexto → Gemini → Resposta
```

### 5. Detecção de Pagamento Atrasado
```
Frontend calcula:
  overdue = (due_date < hoje) AND (status != 'paid')
  → Badge vermelho na tabela
  → Botão "Marcar Pago" em destaque
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin (server-side) |
| `GOOGLE_GEMINI_API_KEY` | Chave da API Google Gemini |

---

## Proxy (Middleware)

Arquivo: `src/proxy.ts`
- Executa em Edge Runtime
- Renova tokens de sessão do Supabase
- Manipula cookies de autenticação
- Ignora: `_next/static`, `_next/image`, `favicon.ico`, arquivos de imagem

---

## Migrations Pendentes

Para funcionalidades novas, rodar no Supabase SQL Editor:

```sql
-- Sessões recorrentes
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_group_id UUID DEFAULT NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Base de conhecimento IA
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_knowledge_base TEXT DEFAULT '';

-- Datas de vencimento
ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS payment_day INTEGER DEFAULT NULL;
```
