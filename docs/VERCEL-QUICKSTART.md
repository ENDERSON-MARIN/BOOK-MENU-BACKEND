# 🚀 Deploy Rápido na Vercel

## Pré-requisitos

1. Conta na Vercel
2. PostgreSQL hospedado (Neon, Supabase, Railway, etc.)
3. Vercel CLI instalado: `npm i -g vercel`

## Deploy em 5 passos

### 1. Login na Vercel

```bash
vercel login
```

### 2. Configurar variáveis de ambiente

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CRON_SECRET
```

**Gerar CRON_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Verificar Cron Job

No dashboard da Vercel:

- Vá em **Deployments** → **Cron Jobs**
- Confirme que `/api/cron/auto-reservations` está configurado
- Schedule: `0 0 * * *` (diariamente à meia-noite UTC)

### 5. Testar

```bash
# Ver logs
vercel logs --prod --follow

# Testar localmente antes
pnpm dev
pnpm test:cron
```

## ⚠️ Limitações da Vercel

- ❌ WebSockets não funcionam
- ⏱️ Timeout: 10s (gratuito) / 60s (pago)
- 🔄 Cron jobs só em produção

## 📚 Documentação Completa

- **Deploy geral:** `DEPLOY.md`
- **Configuração de Cron:** `CRON-SETUP.md`

## 🆘 Problemas?

```bash
# Ver logs de erro
vercel logs --prod

# Redeployar
vercel --prod --force
```
