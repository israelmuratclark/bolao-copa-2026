# Bolão Copa 2026 — Guia de Instalação e Configuração

## Pré-requisitos

- Node.js 18+ instalado ([nodejs.org](https://nodejs.org))
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Mercado Pago Developers](https://developers.mercadopago.com) (gratuita)
- Conta no [Resend](https://resend.com) para e-mails (100/dia grátis)
- Conta no [Vercel](https://vercel.com) para deploy (gratuita)

---

## 1. Instalar Node.js

Baixe e instale em [nodejs.org](https://nodejs.org/en/download).

---

## 2. Instalar dependências

```bash
cd /Users/amandaclark/Downloads/Copa
npm install
```

---

## 3. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. **Importante:** Escolha a região **South America (São Paulo)** para menor latência
3. Após a criação, vá em **Project Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`
4. Vá em **Project Settings → Database** e copie a Connection String:
   - Selecione **Nodejs** e copie a string → `DATABASE_URL`
   - Para `DIRECT_URL`, use a mesma string (sem pooler)

---

## 4. Configurar Mercado Pago

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Crie ou use um aplicativo existente
3. Em **Credenciais de Teste**, copie:
   - `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
   - `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
4. Configure um **Webhook** apontando para:
   `https://SEU-DOMINIO.vercel.app/api/webhooks/mercadopago`
5. Copie o **segredo do webhook** → `MERCADOPAGO_WEBHOOK_SECRET`

> Para testar localmente, use o [Mercado Pago Sandbox](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/make-test-purchase) e o [ngrok](https://ngrok.com) para expor o localhost.

---

## 5. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus valores reais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com os valores obtidos nos passos anteriores.

---

## 6. Rodar migrações e seed do banco

```bash
# Criar tabelas no banco
npx prisma migrate dev --name init

# Popular com os 48 times e 104 jogos
npx tsx prisma/seed.ts
```

---

## 7. Configurar funções SQL no Supabase

No **Supabase Dashboard → SQL Editor**, execute o conteúdo do arquivo:
```
prisma/supabase-functions.sql
```

Isso configura:
- Row Level Security (RLS) em todas as tabelas
- Canal Realtime para o leaderboard e confirmação de pagamentos
- View `placar_geral` para a classificação
- Função `calcular_pontos_aposta` para uso avançado
- Função `recalcular_pontuacao_usuario` para recálculo manual

---

## 8. Configurar Supabase Auth

No **Supabase Dashboard → Authentication → Providers**:

1. **Email** (já habilitado por padrão):
   - Habilite "Enable Email OTP / Magic Link"
   - Desative "Confirm email" para facilitar testes

2. **Google** (opcional):
   - Crie credenciais OAuth no [Google Cloud Console](https://console.cloud.google.com)
   - Adicione em **Authentication → Providers → Google**

Em **Authentication → URL Configuration**:
- Site URL: `https://SEU-DOMINIO.vercel.app` (ou `http://localhost:3000` para dev)
- Redirect URLs: adicione `http://localhost:3000/**` e `https://SEU-DOMINIO.vercel.app/**`

---

## 9. Criar usuário admin

Após rodar o app localmente e criar sua conta, execute no SQL Editor do Supabase:

```sql
UPDATE usuarios SET role = 'admin' WHERE email = 'seu@email.com';
```

---

## 10. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 11. Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Ou conecte o repositório GitHub em [vercel.com](https://vercel.com) e adicione todas as variáveis de ambiente.

---

## Estrutura do Projeto

```
Copa/
├── prisma/
│   ├── schema.prisma          # Modelo de dados completo
│   ├── seed.ts                # 48 seleções + 104 jogos
│   └── supabase-functions.sql # RLS, Realtime, triggers
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── entrar/            # Login/cadastro
│   │   ├── regulamento/       # Regras
│   │   ├── classificacao/     # Leaderboard público
│   │   ├── dashboard/         # Painel do usuário
│   │   ├── apostas/           # Todos os 104 jogos
│   │   ├── inscricao/         # Pagamento PIX
│   │   ├── perfil/            # Dados do usuário
│   │   ├── admin/             # Painel admin
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   ├── lib/
│   │   ├── pontuacao.ts       # Algoritmo de pontuação
│   │   ├── prize.ts           # Cálculo de prêmios
│   │   ├── email.ts           # E-mails transacionais
│   │   └── supabase/          # Clientes Supabase
│   └── middleware.ts          # Proteção de rotas
└── SETUP.md                   # Este arquivo
```

---

## Sistema de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | **10 pts** |
| Vencedor correto (placar errado) | **5 pts** |
| Empate correto (placar errado) | **3 pts** |
| Resultado errado | **0 pts** |

**Desempate:** acertos exatos → acertos parciais → jogos apostados → data de cadastro

---

## Distribuição de Prêmios (padrão, configurável)

| Colocação | % do Pool |
|-----------|-----------|
| 🥇 1º lugar | 50% |
| 🥈 2º lugar | 30% |
| 🥉 3º lugar | 20% |

Com 20 participantes: pool = **R$ 200** → 1º: R$ 100 · 2º: R$ 60 · 3º: R$ 40
