# ⏰ Configuração de Cron Jobs na Vercel

## 📋 O que foi configurado

O scheduler de auto-reservas que rodava continuamente no servidor foi convertido para **Vercel Cron Jobs**.

### Arquivos criados/modificados:

1. **`src/infrastructure/http/routes/cron.routes.ts`** - Endpoints para cron jobs
2. **`vercel.json`** - Configuração do cron job
3. **`src/infrastructure/http/routes/applicationRouter.ts`** - Rotas de cron adicionadas

## 🕐 Configuração do Cron Job

No `vercel.json`, o cron está configurado para executar **diariamente à meia-noite (00:00 UTC)**:

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

### Formato do Schedule (Cron Expression)

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── dia do mês (1 - 31)
│ │ │ ┌───────────── mês (1 - 12)
│ │ │ │ ┌───────────── dia da semana (0 - 6) (Domingo = 0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Exemplos:**

- `0 0 * * *` - Diariamente à meia-noite (00:00)
- `0 3 * * *` - Diariamente às 3h da manhã
- `0 */6 * * *` - A cada 6 horas
- `0 9 * * 1-5` - Dias úteis às 9h
- `30 8 * * *` - Diariamente às 8:30

## 🔐 Segurança

### 1. Configurar CRON_SECRET

Gere um secret aleatório forte:

```bash
# Gerar secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou use um gerador online
# https://www.uuidgenerator.net/
```

### 2. Adicionar na Vercel

**Via Dashboard:**

1. Acesse seu projeto na Vercel
2. Settings → Environment Variables
3. Adicione: `CRON_SECRET` = `seu-secret-gerado`

**Via CLI:**

```bash
vercel env add CRON_SECRET
# Cole o secret quando solicitado
```

### 3. Como funciona a segurança

A Vercel automaticamente adiciona o header `Authorization: Bearer <CRON_SECRET>` nas requisições de cron. O endpoint valida esse header antes de executar.

## 🚀 Endpoints Disponíveis

### 1. Auto Reservations (Cron Job)

```
POST /api/cron/auto-reservations
```

- Executado automaticamente pela Vercel
- Requer `Authorization: Bearer <CRON_SECRET>`
- Processa todas as reservas automáticas do dia

### 2. Manual Trigger (Development)

```
POST /api/cron/auto-reservations/manual
```

- Apenas em desenvolvimento
- Permite testar o cron manualmente
- Não requer autenticação

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/cron/auto-reservations/manual
```

### 3. Reservas para Data Específica

```
POST /api/cron/auto-reservations/date
Content-Type: application/json

{
  "date": "2024-12-25"
}
```

- Cria reservas para uma data específica
- Útil para recuperar dias perdidos

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/cron/auto-reservations/date \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-25"}'
```

## 📊 Monitoramento

### Ver logs do Cron Job

```bash
# Logs em tempo real
vercel logs --follow

# Logs de produção
vercel logs --prod

# Filtrar por função
vercel logs --prod | grep "cron"
```

### Dashboard da Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Deployments** → **Functions**
4. Veja execuções do cron em **Cron Jobs**

## 🧪 Testando Localmente

### 1. Testar endpoint manual (desenvolvimento)

```bash
# Iniciar servidor
pnpm dev

# Em outro terminal, executar
curl -X POST http://localhost:3000/api/cron/auto-reservations/manual
```

### 2. Testar com data específica

```bash
curl -X POST http://localhost:3000/api/cron/auto-reservations/date \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-10"}'
```

## ⚙️ Configurações Avançadas

### Múltiplos Cron Jobs

Adicione mais jobs no `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-reservations",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/reports",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

### Timezone

Por padrão, os cron jobs da Vercel usam **UTC**. Para ajustar:

1. **Opção 1:** Ajuste o horário no schedule
   - Se quer 00:00 BRT (UTC-3), use `0 3 * * *`

2. **Opção 2:** Calcule no código
   ```typescript
   const now = new Date()
   const brazilTime = new Date(
     now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
   )
   ```

## 🔧 Troubleshooting

### Cron não está executando

1. Verifique se está em produção (crons não rodam em preview)
2. Confirme que o `vercel.json` está no root do projeto
3. Verifique logs: `vercel logs --prod`

### Erro 401 Unauthorized

1. Verifique se `CRON_SECRET` está configurado na Vercel
2. Confirme que o secret está correto
3. Redeploy após adicionar variáveis de ambiente

### Timeout

Cron jobs têm limite de:

- **10 segundos** (Hobby plan)
- **60 segundos** (Pro plan)
- **900 segundos** (Enterprise)

Se ultrapassar, otimize o processamento ou divida em múltiplos jobs.

## 📝 Notas Importantes

1. **Cron jobs só funcionam em produção** - Não executam em preview deployments
2. **Limite de execuções:** Hobby plan tem limite de invocações
3. **Não há garantia de execução exata** - Pode haver atraso de alguns segundos
4. **Idempotência:** Garanta que múltiplas execuções não causem problemas

## 🔗 Recursos

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [Vercel Pricing](https://vercel.com/pricing)
