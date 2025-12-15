# 🚀 Guia Completo de Deploy - API Node.js + Express + TypeScript + PostgreSQL + Prisma

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração do TypeScript](#configuração-do-typescript)
4. [Configuração do Prisma](#configuração-do-prisma)
5. [Configuração do Express](#configuração-do-express)
6. [Preparação para Deploy](#preparação-para-deploy)
7. [Deploy na Vercel](#deploy-na-vercel)
8. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
9. [Variáveis de Ambiente](#variáveis-de-ambiente)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Ferramentas Necessárias

- Node.js >= 20.x
- pnpm >= 7.x (ou npm/yarn)
- Git
- Conta na Vercel
- Banco de dados PostgreSQL (Supabase, Neon, Railway, etc.)

### Instalação das Ferramentas

```bash
# Instalar Node.js (via nvm recomendado)
nvm install 20
nvm use 20

# Instalar pnpm
npm install -g pnpm

# Verificar instalações
node --version
pnpm --version
```

---

## 📁 Estrutura do Projeto

### Estrutura Recomendada

```
project-root/
├── api/
│   └── index.ts              # Entry point para Vercel
├── src/
│   ├── server.ts             # Servidor local
│   ├── infrastructure/
│   │   └── http/
│   │       ├── server.ts     # Configuração Express
│   │       ├── routes/
│   │       │   ├── index.ts
│   │       │   └── *.routes.ts
│   │       ├── controllers/
│   │       └── middlewares/
│   └── app/
│       └── modules/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── dist/                     # Arquivos compilados
├── package.json
├── tsconfig.json
├── vercel.json
└── .env
```

---

## ⚙️ Configuração do TypeScript

### 1. Instalar Dependências

```bash
pnpm add express cors dotenv
pnpm add -D typescript @types/node @types/express @types/cors
pnpm add -D tsx tsc-alias
```

### 2. Criar `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es2024",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2024"],
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/app/*": ["app/*"],
      "@/infrastructure/*": ["infrastructure/*"],
      "@/config/*": ["config/*"]
    },
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. Configurar Scripts no `package.json`

```json
{
  "scripts": {
    "build": "prisma generate && tsc && tsc-alias",
    "start": "node dist/server.js",
    "dev": "tsx --watch --env-file=.env src/server.ts",
    "vercel-build": "prisma generate && prisma migrate deploy && tsc && tsc-alias"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=7"
  }
}
```

---

## 🗄️ Configuração do Prisma

### 1. Instalar Prisma

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

### 2. Inicializar Prisma

```bash
npx prisma init
```

### 3. Configurar `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Criar Migrations

```bash
# Desenvolvimento
npx prisma migrate dev --name init

# Produção (executado automaticamente no vercel-build)
npx prisma migrate deploy
```

### 5. Gerar Prisma Client

```bash
npx prisma generate
```

---

## 🌐 Configuração do Express

### 1. Criar `src/infrastructure/http/server.ts`

```typescript
import express, { Express } from "express"
import cors from "cors"

export function createServer(appRouter: express.Router): Express {
  const app = express()

  // Middlewares
  app.use(cors())
  app.use(express.json())

  // Rotas
  app.use("/api", appRouter)

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok" })
  })

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err)
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    })
  })

  return app
}
```

### 2. Criar Rotas `src/infrastructure/http/routes/index.ts`

```typescript
import { Router, type IRouter } from "express"

export function applicationRouter(): IRouter {
  const router: IRouter = Router()

  // Health check
  router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  // Suas rotas aqui
  // router.use("/users", userRouter)
  // router.use("/auth", authRouter)

  return router
}
```

### 3. Criar `src/server.ts` (Desenvolvimento Local)

```typescript
import { createServer } from "./infrastructure/http/server"
import { applicationRouter } from "./infrastructure/http/routes"

const appRouter = applicationRouter()
const app = createServer(appRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
```

---

## 📦 Preparação para Deploy

### 1. Criar `api/index.ts` (Entry Point Vercel)

```typescript
import { Express } from "express"
import { createServer } from "../dist/infrastructure/http/server"
import { applicationRouter } from "../dist/infrastructure/http/routes"

// Create Main Router
const appRouter = applicationRouter()

// Create Express app
const app: Express = createServer(appRouter)

// Export for Vercel serverless
export default app
```

### 2. Criar `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["gru1"]
}
```

### 3. Criar `.vercelignore`

```
node_modules
.env
.env.local
tests
*.test.ts
*.spec.ts
coverage
.git
```

### 4. Criar `.env.example`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# JWT (se usar autenticação)
JWT_SECRET="your-jwt-secret-here"

# Environment
NODE_ENV="development"
PORT=3000
```

---

## 🚀 Deploy na Vercel

### Opção 1: Deploy via CLI

#### 1. Instalar Vercel CLI

```bash
pnpm add -g vercel
```

#### 2. Login na Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

### Opção 2: Deploy via GitHub (Recomendado)

#### 1. Criar Repositório no GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

#### 2. Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

---

## 🗃️ Configuração do Banco de Dados

### Opção 1: Supabase (Recomendado)

#### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde a criação do banco

#### 2. Obter Connection String

1. Vá em Settings > Database
2. Copie a "Connection string" (modo "Transaction")
3. Substitua `[YOUR-PASSWORD]` pela senha do projeto

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Opção 2: Neon

#### 1. Criar Projeto

1. Acesse [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string

### Opção 3: Railway

#### 1. Criar Projeto

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string

---

## 🔐 Variáveis de Ambiente

### 1. Configurar na Vercel

#### Via Dashboard

1. Acesse seu projeto na Vercel
2. Vá em Settings > Environment Variables
3. Adicione cada variável:

```
DATABASE_URL = postgresql://user:password@host:5432/database
JWT_SECRET = seu-secret-super-seguro
NODE_ENV = production
```

#### Via CLI

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

### 2. Diferentes Ambientes

```bash
# Production
vercel env add DATABASE_URL production

# Preview
vercel env add DATABASE_URL preview

# Development
vercel env add DATABASE_URL development
```

---

## 🐛 Troubleshooting

### Erro: "Property 'use' does not exist on type 'Router'"

**Causa:** Tipagem incorreta do Router do Express

**Solução:**

```typescript
// ❌ Errado
import { Router, type Router as ExpressRouter } from "express"
const router: ExpressRouter = Router()

// ✅ Correto
import { Router, type IRouter } from "express"
const router: IRouter = Router()
```

### Erro: "Cannot find module '@/...'"

**Causa:** Path aliases não resolvidos no build

**Solução:**

1. Instalar `tsc-alias`:

```bash
pnpm add -D tsc-alias
```

2. Atualizar script de build:

```json
{
  "scripts": {
    "build": "tsc && tsc-alias",
    "vercel-build": "prisma generate && prisma migrate deploy && tsc && tsc-alias"
  }
}
```

3. Garantir que `api/index.ts` importa de `dist/`:

```typescript
import { createServer } from "../dist/infrastructure/http/server"
```

### Erro: "Prisma Client not generated"

**Causa:** Prisma Client não foi gerado antes do build

**Solução:**

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && tsc && tsc-alias"
  }
}
```

### Erro: "Database connection failed"

**Causa:** Connection string incorreta ou banco inacessível

**Solução:**

1. Verificar se a connection string está correta
2. Verificar se o IP da Vercel está na whitelist (Supabase/Neon)
3. Testar conexão localmente:

```bash
npx prisma db pull
```

### Erro: "Function timeout"

**Causa:** Função serverless excedeu o tempo limite (10s no plano free)

**Solução:**

1. Otimizar queries do banco
2. Adicionar índices no Prisma:

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique

  @@index([email])
}
```

3. Usar connection pooling:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Erro: "Cold start lento"

**Causa:** Prisma Client demora para inicializar

**Solução:**

1. Usar Prisma Accelerate (cache)
2. Implementar connection pooling
3. Considerar usar Prisma Data Proxy

---

## ✅ Checklist Final

Antes de fazer deploy, verifique:

- [ ] `tsconfig.json` configurado corretamente
- [ ] `vercel.json` criado
- [ ] `api/index.ts` importando de `dist/`
- [ ] Script `vercel-build` inclui `prisma generate` e `tsc-alias`
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Connection string do banco configurada
- [ ] Migrations aplicadas (`prisma migrate deploy`)
- [ ] `.vercelignore` criado
- [ ] Rotas usando `IRouter` ao invés de `Router` como tipo
- [ ] Build local funciona: `pnpm run build`
- [ ] Servidor local funciona: `pnpm run dev`

---

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Express](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. Configurar domínio customizado
2. Implementar CI/CD com GitHub Actions
3. Configurar monitoramento (Sentry, LogRocket)
4. Implementar rate limiting
5. Adicionar testes automatizados
6. Configurar backup do banco de dados
7. Implementar cache (Redis)

---

**Criado em:** Dezembro 2025
**Última atualização:** Dezembro 2025
