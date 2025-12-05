# 🚀 Deploy da API na Vercel

## ⚠️ Limitações Importantes

A Vercel é otimizada para serverless functions, o que traz algumas limitações:

- **WebSockets não funcionam** - Considere usar Pusher, Ably ou Socket.io com Redis adapter
- **Schedulers/Cron Jobs** - Use Vercel Cron Jobs (configuração abaixo)
- **Timeout**: 10s (gratuito) ou 60s (pago)
- **Cold starts** - Primeira requisição pode ser lenta

## 📋 Passo a Passo

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Configurar Banco de Dados PostgreSQL

Você precisa de um PostgreSQL hospedado. Opções recomendadas:

- **Vercel Postgres** (integrado)
- **Neon** (gratuito, serverless)
- **Supabase** (gratuito)
- **Railway** (gratuito com limites)

### 3. Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel ou via CLI, adicione:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="seu-secret-aqui"
NODE_ENV="production"
PORT="3000"
```

Via CLI:

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

### 4. Deploy

```bash
# Login na Vercel
vercel login

# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

## 🔧 Configuração de Cron Jobs (Schedulers)

Para substituir os schedulers que rodam no servidor, crie `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-reservations",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Você precisará criar endpoints específicos para os cron jobs em:
`src/infrastructure/http/routes/cron.routes.ts`

## 🔌 Alternativas para WebSockets

Como a Vercel não suporta WebSockets, considere:

1. **Pusher** (gratuito até 100 conexões)
2. **Ably** (gratuito até 3M mensagens/mês)
3. **Socket.io com Redis adapter** + servidor separado
4. **Server-Sent Events (SSE)** - Funciona na Vercel

## 🗄️ Migrações do Prisma

As migrações rodam automaticamente no build via `vercel-build` script.

Se precisar rodar manualmente:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## 📊 Monitoramento

- Logs: `vercel logs`
- Dashboard: https://vercel.com/dashboard
- Analytics: Disponível no dashboard

## 🔄 CI/CD Automático

Conecte seu repositório GitHub/GitLab:

1. Acesse https://vercel.com/new
2. Importe seu repositório
3. Configure as variáveis de ambiente
4. Deploy automático em cada push

## 🚨 Troubleshooting

### Erro de timeout

- Otimize queries do banco
- Use indexes no Prisma
- Considere cache (Redis)

### Cold starts lentos

- Use Vercel Pro para reduzir cold starts
- Implemente warming requests
- Otimize bundle size

### WebSocket não funciona

- Remova dependências de WebSocket para deploy
- Use alternativas mencionadas acima

## 📝 Notas Adicionais

- O arquivo `api/index.ts` é o entry point para Vercel
- WebSockets e schedulers foram removidos da versão serverless
- Para funcionalidades completas, considere Railway, Render ou AWS
