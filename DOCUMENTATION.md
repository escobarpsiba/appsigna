# SIGNA - Sistema de Gestão para Clínicas

> Sistema SaaS multi-tenant para gestão de consultórios e clínicas de psicologia e saúde mental.

## Visão Geral

O **SIGNA** é uma plataforma completa de gestão clínica que permite múltiplas clínicas (tenants) gerenciarem seus pacientes, agendamentos, pagamentos e atendimentos em um único sistema compartilhado, com isolamento completo de dados entre tenants.

---

## Índice

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Modelo de Dados](#modelo-de-dados)
5. [Funcionalidades](#funcionalidades)
6. [Autenticação e Autorização](#autenticação-e-autorização)
7. [Configuração e Execução](#configuração-e-execução)

---

## Arquitetura do Sistema

### Modelo Multi-Tenant

O SIGNA utiliza uma arquitetura multi-tenant com isolamento de dados no nível do banco de dados:

```
┌─────────────────────────────────────────────────────────────┐
│                    Aplicação Next.js                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Tenant A   │  │   Tenant B   │  │   Tenant N   │      │
│  │  (Clínica 1) │  │  (Clínica 2) │  │  (Clínica N)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    Supabase (PostgreSQL)                    │
│         Row Level Security (RLS) - Isolamento por          │
│                    tenant_id em cada tabela                │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Requisição

```
Usuário → Next.js App Router → Middleware (Auth) → Server Actions → Supabase (RLS)
```

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19, Next.js 16 (App Router) |
| **Estilização** | Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js Server Actions |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **Ícones** | Lucide React |
| **Datas** | date-fns, react-day-picker |
| **Gráficos** | Recharts |
| **Deploy** | Vercel |

---

## Estrutura de Diretórios

```
signa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Área logada (usuários)
│   │   │   ├── assistant/      # Assistente IA
│   │   │   ├── calendar/       # Calendário/agendamentos
│   │   │   ├── dashboard/      # Painel principal
│   │   │   ├── financial/      # Gestão financeira
│   │   │   ├── patients/       # Cadastro de pacientes
│   │   │   └── settings/       # Configurações
│   │   ├── (auth)/             # Área pública (auth)
│   │   │   ├── choice/         # Escolha de login/cadastro
│   │   │   ├── forgot-password/# Recuperação de senha
│   │   │   └── login/          # Login
│   │   ├── admin/              # Área administrativa
│   │   │   ├── dashboard/      # Dashboard admin
│   │   │   ├── tenants/        # Gestão de clínicas
│   │   │   └── users/          # Gestão de usuários
│   │   ├── auth/               # Ações de autenticação
│   │   └── c/[slug]/           # Página pública por subdomain
│   ├── components/            # Componentes reutilizáveis
│   │   ├── layout/             # Componentes de layout
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utilitários e clientes
│       └── supabase/           # Clientes Supabase
│           ├── admin.ts        # Cliente admin (service role)
│           ├── client.ts       # Cliente público
│           ├── middleware.ts  # Middleware de auth
│           └── server.ts       # Cliente server-side
├── supabase/
│   └── schema.sql              # Schema do banco de dados
└── appsigna-vite/              # App alternativo (Vite + React)
```

---

## Modelo de Dados

### Tabelas Principais

#### 1. `tenants` - Clínicas/Practices

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK - Identificador único |
| `name` | text | Nome da clínica |
| `status` | text | Status (active/inactive) |
| `created_at` | timestamp | Data de criação |

#### 2. `profiles` - Usuários

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK - FK para auth.users |
| `tenant_id` | uuid | FK para tenants |
| `role` | text | Papel (user/admin) |
| `name` | text | Nome do usuário |
| `email` | text | Email do usuário |
| `created_at` | timestamp | Data de criação |

#### 3. `patients` - Pacientes

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK - Identificador único |
| `tenant_id` | uuid | FK para tenants |
| `name` | text | Nome do paciente |
| `phone` | text | Telefone |
| `email` | text | Email |
| `price` | decimal | Valor da sessão |
| `frequency` | text | Frequência (Semanal, Quinzenal, etc) |
| `active` | boolean | Paciente ativo |
| `started_at` | timestamp | Data de início |

#### 4. `appointments` - Agendamentos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK - Identificador único |
| `tenant_id` | uuid | FK para tenants |
| `patient_id` | uuid | FK para patients |
| `starts_at` | timestamp | Data/hora início |
| `duration` | integer | Duração em minutos |
| `amount` | decimal | Valor |
| `modality` | text | Modalidade (Presencial/Online) |
| `status` | text | Status (scheduled/completed/cancelled) |
| `note` | text | Observações |
| `created_at` | timestamp | Data de criação |

#### 5. `payments` - Pagamentos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK - Identificador único |
| `tenant_id` | uuid | FK para tenants |
| `patient_id` | uuid | FK para patients |
| `appointment_id` | uuid | FK para appointments |
| `amount` | decimal | Valor |
| `method` | text | Método (PIX, Dinheiro, etc) |
| `status` | text | Status (pending/paid/overdue) |
| `paid_at` | timestamp | Data do pagamento |
| `created_at` | timestamp | Data de criação |

#### 6. `ai_logs` - Logs de Uso da IA

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK - Identificador único |
| `tenant_id` | uuid | FK para tenants |
| `user_id` | uuid | FK para profiles |
| `category` | text | Categoria do uso |
| `estimated_tokens` | integer | Tokens estimados |
| `created_at` | timestamp | Data de criação |

### Segurança (RLS)

O sistema utiliza **Row Level Security** do PostgreSQL para garantir isolamento completo entre tenants:

```sql
-- Função helper para obter tenant_id do usuário atual
create or replace function get_current_tenant_id()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid();
$$ language sql stable;

-- Política de isolamento para pacientes
create policy "Tenant isolation for patients" on patients 
for all using (tenant_id = get_current_tenant_id());
```

---

## Funcionalidades

### Módulos da Aplicação

#### 1. Dashboard
- Visão geral da clínica
- Próximos agendamentos
- Estatísticas rápidas
- Gráficos de desempenho

#### 2. Calendário
- Visualização mensal/semanal/diária
- Criação de agendamentos
- Edição de horários
- Modalidade presencial/online
- Status (agendado, realizado, cancelado)

#### 3. Pacientes
- Cadastro completo de pacientes
- Histórico de atendimentos
- Frequência de sessões
- Valor por sessão
- Ativação/desativação

#### 4. Financeiro
- Controle de pagamentos
- Status (pendente, pago, vencido)
- Métodos de pagamento (PIX, dinheiro, etc)
- Relatórios financeiros

#### 5. Assistente IA
- Chat com assistente virtual
- Registro de interações
- Controle de uso de tokens

#### 6. Configurações
- Perfil do usuário
- Preferências do sistema

### Área Administrativa

O sistema possui uma área administrativa para gestão central:

- **Dashboard Admin**: Visão geral do sistema
- **Gestão de Tenants**: Criação e gerenciamento de clínicas
- **Gestão de Usuários**: Administração de usuários globais

---

## Autenticação e Autorização

### Fluxo de Autenticação

```
1. Usuário acessa /login
2. Supabase Auth verifica credenciais
3. Sistema busca perfil em 'profiles'
4. Redireciona para área correspondente:
   - Admin → /admin/dashboard
   - Usuário → /(app)/dashboard
```

### Papéis (Roles)

| Role | Descrição | Acesso |
|------|-----------|--------|
| `admin` | Administrador da clínica | Todas funcionalidades + admin |
| `user` | Usuário padrão | Funcionalidades limitadas |

### Middleware

O middleware (`src/middleware.ts`) verifica a autenticação em todas as rotas protegidas e redireciona para login quando necessário.

---

## Configuração e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (para banco de dados)

### Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

### Build para Produção

```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start
```

### Configuração do Banco

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o schema em `supabase/schema.sql`
3. Configure as variáveis de ambiente
4. O sistema criará as políticas RLS automaticamente

---

## Estrutura de Arquivos Principais

### Autenticação

| Arquivo | Descrição |
|---------|-----------|
| `src/app/auth/actions.ts` | Ações server (signOut) |
| `src/lib/supabase/server.ts` | Cliente server-side |
| `src/lib/supabase/middleware.ts` | Middleware de auth |

### Componentes UI

| Arquivo | Descrição |
|---------|-----------|
| `src/components/ui/button.tsx` | Botões |
| `src/components/ui/dialog.tsx` | Diálogos modais |
| `src/components/ui/input.tsx` | Campos de entrada |
| `src/components/ui/table.tsx` | Tabelas |
| `src/components/ui/calendar.tsx` | Calendário |

### Layout

| Arquivo | Descrição |
|---------|-----------|
| `src/app/(app)/layout.tsx` | Layout área logada |
| `src/app/admin/layout.tsx` | Layout área admin |
| `src/components/layout/app-sidebar.tsx` | Sidebar principal |

---

## Licença

MIT License - see LICENSE file for details.

---

*Documentação gerada em Abril/2026*