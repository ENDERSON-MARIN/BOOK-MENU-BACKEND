# 🌐 Deploy Híbrido: Frontend Vercel + Backend Local

Este guia detalha como configurar o Sistema BookMenu com o **frontend na Vercel** e o **backend (API) rodando localmente** no servidor da empresa.

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐         HTTPS          ┌──────────────────────┐  │
│   │   Usuários   │ ◄─────────────────────►│   Vercel (Frontend)  │  │
│   │  (Qualquer   │                        │   - Next.js SSR      │  │
│   │    lugar)    │                        │   - CDN Global       │  │
│   └──────────────┘                        │   - Auto-scaling     │  │
│                                           └──────────┬───────────┘  │
│                                                      │              │
│                                                      │ HTTPS        │
│                                                      ▼              │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    SERVIDOR DA EMPRESA                        │  │
│   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐   │  │
│   │  │   Nginx     │───►│  Backend    │───►│   PostgreSQL    │   │  │
│   │  │  (Reverse   │    │  (API)      │    │   (Database)    │   │  │
│   │  │   Proxy)    │    │  :8080      │    │   :5432         │   │  │
│   │  │  :443/:80   │    └─────────────┘    └─────────────────┘   │  │
│   │  └─────────────┘                                              │  │
│   │       ▲                                                       │  │
│   │       │ IP Público ou Domínio                                 │  │
│   └───────┼──────────────────────────────────────────────────────┘  │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
      api.empresa.com.br
      (com SSL válido)
```

## ✅ Vantagens desta Arquitetura

| Aspecto                 | Benefício                                                    |
| ----------------------- | ------------------------------------------------------------ |
| **Acessibilidade**      | Funcionários acessam de qualquer lugar com internet          |
| **Performance**         | Frontend servido pela CDN global da Vercel                   |
| **Segurança dos Dados** | Banco de dados fica dentro da rede da empresa                |
| **Custo**               | Vercel tem plano gratuito generoso; servidor local já existe |
| **Escalabilidade**      | Frontend escala automaticamente na Vercel                    |
| **Compliance**          | Dados sensíveis não saem do servidor da empresa              |
| **Manutenção**          | Deploy do frontend é automático via Git                      |

## ⚠️ Requisitos Obrigatórios

1. **IP Público ou Domínio** - O servidor da empresa precisa ser acessível pela internet
2. **Certificado SSL válido** - Obrigatório para HTTPS (Let's Encrypt é gratuito)
3. **Porta 443 liberada** - No firewall/roteador da empresa
4. **Domínio configurado** - Apontando para o IP público da empresa

---

## 🔒 Considerações de Segurança

### Riscos e Mitigações

| Risco                   | Mitigação                                       |
| ----------------------- | ----------------------------------------------- |
| API exposta na internet | Rate limiting, autenticação JWT, CORS restrito  |
| Ataques DDoS            | Cloudflare (gratuito) como proxy, rate limiting |
| Dados em trânsito       | HTTPS obrigatório com TLS 1.2+                  |
| Acesso não autorizado   | JWT com expiração curta, refresh tokens         |
| SQL Injection           | Prisma ORM (queries parametrizadas)             |
| Brute force             | Rate limiting no login, bloqueio temporário     |

### Recomendações de Segurança

1. **Use Cloudflare** (gratuito) como proxy DNS - adiciona proteção DDoS e CDN
2. **Configure CORS** apenas para o domínio da Vercel
3. **Implemente rate limiting** agressivo na API
4. **Use JWT com expiração curta** (15-30 min) + refresh tokens
5. **Monitore logs** de acesso e erros
6. **Mantenha tudo atualizado** - Docker images, Node.js, dependências

---

## 📦 Fase 1: Preparar o Backend (Servidor Local)

### 1.1 Estrutura Simplificada (Sem Frontend)

Como o frontend estará na Vercel, o servidor local só precisa rodar:

- **Nginx** (reverse proxy + SSL)
- **Backend API** (Node.js)
- **PostgreSQL** (banco de dados)

```bash
# Criar estrutura
sudo mkdir -p /opt/bookmenu-api
sudo chown -R $USER:$USER /opt/bookmenu-api
cd /opt/bookmenu-api

mkdir -p {nginx/conf.d,volumes/{postgres-data,backups,nginx-ssl},scripts,app}
```

### 1.2 Clonar apenas o Backend

```bash
cd /opt/bookmenu-api/app
git clone https://github.com/seu-usuario/bookmenu-api.git .
```

### 1.3 Criar arquivo de ambiente

```bash
cat > /opt/bookmenu-api/app/.env.production << 'EOF'
# ===========================================
# BOOKMENU API - Produção (Backend Only)
# ===========================================

# Database
DB_NAME=bookmenu
DB_USER=bookmenu_user
DB_PASSWORD=GERAR_SENHA_SEGURA_AQUI
DB_PORT=5432

# Application
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
VERSION=1.0.0

# JWT - Use senhas fortes!
JWT_SECRET=GERAR_JWT_SECRET_64_CHARS_AQUI
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - IMPORTANTE: Apenas o domínio da Vercel!
CORS_ORIGIN=https://bookmenu.vercel.app
# Ou seu domínio customizado:
# CORS_ORIGIN=https://menu.suaempresa.com.br

# Frontend URL (para emails, links, etc)
FRONTEND_URL=https://bookmenu.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Docker
COMPOSE_PROJECT_NAME=bookmenu-api
DOCKER_BUILDKIT=1
EOF
```

### 1.4 Gerar senhas seguras

```bash
# Gerar senha do banco
echo "DB_PASSWORD: $(openssl rand -base64 32)"

# Gerar JWT Secret
echo "JWT_SECRET: $(openssl rand -base64 64)"

# Atualizar o arquivo com as senhas geradas
nano /opt/bookmenu-api/app/.env.production
```

---

## 🐳 Fase 2: Docker Compose (Backend Only)

### 2.1 Criar docker-compose.yml

```bash
cat > /opt/bookmenu-api/app/docker-compose.yml << 'EOF'
services:
  postgres:
    image: postgres:17-alpine
    container_name: bookmenu-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-bookmenu}
      POSTGRES_USER: ${DB_USER:-bookmenu_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - /opt/bookmenu-api/volumes/backups:/backups
    networks:
      - bookmenu-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-bookmenu_user} -d ${DB_NAME:-bookmenu}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: bookmenu/backend:${VERSION:-latest}
    container_name: bookmenu-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER:-bookmenu_user}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-bookmenu}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-15m}
      PORT: 8080
      LOG_LEVEL: ${LOG_LEVEL:-info}
      CORS_ORIGIN: ${CORS_ORIGIN}
      FRONTEND_URL: ${FRONTEND_URL}
      RATE_LIMIT_WINDOW_MS: ${RATE_LIMIT_WINDOW_MS:-900000}
      RATE_LIMIT_MAX_REQUESTS: ${RATE_LIMIT_MAX_REQUESTS:-100}
    networks:
      - bookmenu-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api-docs"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: bookmenu-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/bookmenu-api/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /opt/bookmenu-api/nginx/conf.d:/etc/nginx/conf.d:ro
      - /opt/bookmenu-api/volumes/nginx-ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - bookmenu-network
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  bookmenu-network:
    driver: bridge

volumes:
  postgres_data:
  nginx_logs:
EOF
```

### 2.2 Criar Dockerfile do Backend

```bash
cat > /opt/bookmenu-api/app/Dockerfile << 'EOF'
# Build stage
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup -g 1001 -S nodejs && \
    adduser -S bookmenu -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder --chown=bookmenu:nodejs /app/dist ./dist
COPY --from=builder --chown=bookmenu:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bookmenu:nodejs /app/prisma ./prisma
COPY --from=builder --chown=bookmenu:nodejs /app/package.json ./

RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

RUN mkdir -p /app/logs && chown bookmenu:nodejs /app/logs

USER bookmenu

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api-docs || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
EOF
```

---

## 🌐 Fase 3: Configurar Nginx (API Only)

### 3.1 Criar nginx.conf

```bash
cat > /opt/bookmenu-api/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;

    include /etc/nginx/conf.d/*.conf;
}
EOF
```

### 3.2 Criar configuração do site (API)

```bash
cat > /opt/bookmenu-api/nginx/conf.d/api.conf << 'EOF'
# Rate limiting - Proteção contra abuso
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=3r/s;

# Upstream do backend
upstream backend {
    least_conn;
    server bookmenu-api:8080 max_fails=3 fail_timeout=30s;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name _;

    # Permitir verificação do Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server - API Only
server {
    listen 443 ssl http2;
    server_name _;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CORS Headers - IMPORTANTE: Apenas domínio da Vercel!
    # Substitua pelo seu domínio real
    set $cors_origin "https://bookmenu.vercel.app";

    # Verificar se a origem é permitida
    if ($http_origin = $cors_origin) {
        set $cors_origin $http_origin;
    }

    # Rotas de autenticação - Rate limit mais restritivo
    location ~ ^/api/(auth|login|register) {
        limit_req zone=auth_limit burst=5 nodelay;

        # CORS
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 1728000 always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $cors_origin always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Routes - Rate limit padrão
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        # CORS
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 1728000 always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $cors_origin always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Swagger/API Docs (opcional - pode desabilitar em produção)
    location /api-docs {
        # Descomente para desabilitar em produção:
        # return 404;

        limit_req zone=api_limit burst=10 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }

    # Página padrão - redireciona para o frontend
    location = / {
        return 301 https://bookmenu.vercel.app;
    }
}
EOF
```

---

## 🔐 Fase 4: Configurar SSL (Let's Encrypt)

### 4.1 Pré-requisitos

- Domínio configurado apontando para o IP público do servidor
- Porta 80 e 443 liberadas no firewall/roteador

### 4.2 Instalar Certbot

```bash
sudo apt update
sudo apt install -y certbot
```

### 4.3 Gerar Certificado

```bash
# Parar nginx temporariamente (se estiver rodando)
docker stop bookmenu-proxy 2>/dev/null || true

# Gerar certificado
sudo certbot certonly --standalone \
  -d api.suaempresa.com.br \
  --email seu-email@empresa.com.br \
  --agree-tos \
  --no-eff-email

# Copiar certificados
sudo cp /etc/letsencrypt/live/api.suaempresa.com.br/fullchain.pem /opt/bookmenu-api/volumes/nginx-ssl/cert.pem
sudo cp /etc/letsencrypt/live/api.suaempresa.com.br/privkey.pem /opt/bookmenu-api/volumes/nginx-ssl/key.pem
sudo chown $USER:$USER /opt/bookmenu-api/volumes/nginx-ssl/*.pem
```

### 4.4 Configurar Renovação Automática

```bash
cat > /opt/bookmenu-api/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet --pre-hook "docker stop bookmenu-proxy" --post-hook "docker start bookmenu-proxy"

# Copiar certificados renovados
DOMAIN="api.suaempresa.com.br"
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/bookmenu-api/volumes/nginx-ssl/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/bookmenu-api/volumes/nginx-ssl/key.pem

echo "SSL renovado em $(date)"
EOF

chmod +x /opt/bookmenu-api/scripts/renew-ssl.sh

# Adicionar ao crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/bookmenu-api/scripts/renew-ssl.sh >> /opt/bookmenu-api/volumes/backups/ssl-renew.log 2>&1") | crontab -
```

---

## 🚀 Fase 5: Deploy do Backend

### 5.1 Criar Script de Deploy

```bash
cat > /opt/bookmenu-api/scripts/deploy.sh << 'EOF'
#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

APP_DIR="/opt/bookmenu-api/app"
ENV_FILE="$APP_DIR/.env.production"

cd "$APP_DIR"

log_info "Parando containers..."
docker compose --env-file "$ENV_FILE" down || true

log_info "Construindo imagens..."
docker compose --env-file "$ENV_FILE" build --no-cache

log_info "Iniciando containers..."
docker compose --env-file "$ENV_FILE" up -d

log_info "Aguardando serviços..."
sleep 30

log_info "Executando migrações..."
docker exec bookmenu-api npx prisma migrate deploy || log_warn "Migrações podem já estar aplicadas"

log_info "Verificando saúde..."
if curl -sf http://localhost:8080/api-docs > /dev/null; then
    log_info "✅ API está funcionando!"
else
    log_error "❌ API não respondeu"
    docker logs bookmenu-api --tail 50
    exit 1
fi

log_info "Deploy concluído!"
EOF

chmod +x /opt/bookmenu-api/scripts/deploy.sh
```

### 5.2 Executar Deploy

```bash
/opt/bookmenu-api/scripts/deploy.sh
```

### 5.3 Verificar

```bash
# Status dos containers
docker ps

# Testar API localmente
curl http://localhost:8080/api-docs

# Testar via HTTPS (após configurar SSL)
curl https://api.suaempresa.com.br/health
```

---

## ☁️ Fase 6: Deploy do Frontend na Vercel

### 6.1 Preparar o Projeto Frontend

No seu projeto frontend, configure a variável de ambiente para apontar para a API:

```bash
# .env.production (no projeto frontend)
NEXT_PUBLIC_API_URL=https://api.suaempresa.com.br/api
```

### 6.2 Configurar next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Não precisa de output: "standalone" para Vercel

  // Configurar rewrites se necessário (opcional)
  async rewrites() {
    return [
      // Exemplo: proxy local para desenvolvimento
      // {
      //   source: '/api/:path*',
      //   destination: 'http://localhost:8080/api/:path*',
      // },
    ]
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### 6.3 Deploy na Vercel

#### Opção A: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /caminho/do/frontend
vercel

# Para produção
vercel --prod
```

#### Opção B: Via GitHub (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:

```
NEXT_PUBLIC_API_URL = https://api.suaempresa.com.br/api
```

5. Clique em "Deploy"

### 6.4 Configurar Domínio Customizado (Opcional)

Na Vercel:

1. Vá em Settings > Domains
2. Adicione seu domínio: `menu.suaempresa.com.br`
3. Configure o DNS conforme instruções da Vercel

### 6.5 Atualizar CORS no Backend

Após saber o domínio final da Vercel, atualize o backend:

```bash
# Editar .env.production no servidor
nano /opt/bookmenu-api/app/.env.production

# Atualizar CORS_ORIGIN com o domínio correto
# CORS_ORIGIN=https://seu-projeto.vercel.app
# ou
# CORS_ORIGIN=https://menu.suaempresa.com.br

# Reiniciar backend
docker restart bookmenu-api
```

Também atualize o nginx:

```bash
# Editar configuração do nginx
nano /opt/bookmenu-api/nginx/conf.d/api.conf

# Alterar a linha:
# set $cors_origin "https://bookmenu.vercel.app";
# para:
# set $cors_origin "https://seu-dominio-real.vercel.app";

# Recarregar nginx
docker exec bookmenu-proxy nginx -s reload
```

---

## 🛡️ Fase 7: Configurações de Segurança Adicionais

### 7.1 Configurar Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar
sudo ufw status verbose
```

### 7.2 Usar Cloudflare (Recomendado)

Cloudflare adiciona uma camada extra de segurança gratuitamente:

1. Crie uma conta em [cloudflare.com](https://cloudflare.com)
2. Adicione seu domínio
3. Altere os nameservers no seu registrador
4. Configure:
   - **SSL/TLS**: Full (strict)
   - **Always Use HTTPS**: On
   - **Auto Minify**: On
   - **Brotli**: On

#### Configuração DNS no Cloudflare:

| Type | Name | Content        | Proxy                   |
| ---- | ---- | -------------- | ----------------------- |
| A    | api  | SEU_IP_PUBLICO | Proxied (nuvem laranja) |

### 7.3 Implementar Rate Limiting no Backend

Se ainda não tiver, adicione rate limiting no código da API:

```typescript
// src/middlewares/rate-limit.ts
import rateLimit from "express-rate-limit"

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: "Muitas requisições. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 tentativas de login
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
})
```

### 7.4 Configurar CORS no Backend

```typescript
// src/config/cors.ts
import cors from "cors"

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  // Adicione outros domínios se necessário
].filter(Boolean)

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Não permitido pelo CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}
```

### 7.5 Monitoramento de Logs

```bash
# Criar script de monitoramento
cat > /opt/bookmenu-api/scripts/monitor.sh << 'EOF'
#!/bin/bash

echo "=== Status dos Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Uso de Recursos ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "=== Últimos Logs da API ==="
docker logs bookmenu-api --tail 20

echo ""
echo "=== Últimos Logs do Nginx ==="
docker logs bookmenu-proxy --tail 10
EOF

chmod +x /opt/bookmenu-api/scripts/monitor.sh
```

---

## 🔧 Fase 8: Configuração de Rede da Empresa

### 8.1 Requisitos de Rede

Para que a API seja acessível pela internet:

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
│                            │                                     │
│                            ▼                                     │
│                    ┌───────────────┐                            │
│                    │   Roteador    │                            │
│                    │   da Empresa  │                            │
│                    │  (IP Público) │                            │
│                    └───────┬───────┘                            │
│                            │                                     │
│                    Port Forward                                  │
│                    80 → 192.168.x.x:80                          │
│                    443 → 192.168.x.x:443                        │
│                            │                                     │
│                            ▼                                     │
│                    ┌───────────────┐                            │
│                    │   Servidor    │                            │
│                    │   Ubuntu      │                            │
│                    │ 192.168.x.x   │                            │
│                    └───────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Configurar Port Forwarding no Roteador

Acesse o painel do roteador da empresa e configure:

| Porta Externa | Porta Interna | IP Interno  | Protocolo |
| ------------- | ------------- | ----------- | --------- |
| 80            | 80            | 192.168.x.x | TCP       |
| 443           | 443           | 192.168.x.x | TCP       |

> **Nota:** Substitua `192.168.x.x` pelo IP interno do servidor Ubuntu.

### 8.3 Configurar IP Fixo no Servidor

```bash
# Editar configuração de rede
sudo nano /etc/netplan/00-installer-config.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0: # ou ens18, enp0s3, etc
      dhcp4: no
      addresses:
        - 192.168.1.100/24 # IP fixo desejado
      gateway4: 192.168.1.1 # Gateway do roteador
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

```bash
# Aplicar configuração
sudo netplan apply
```

### 8.4 Configurar DNS (Domínio)

No painel do seu provedor de domínio, adicione:

| Tipo | Nome | Valor          | TTL  |
| ---- | ---- | -------------- | ---- |
| A    | api  | SEU_IP_PUBLICO | 3600 |

> **Dica:** Para descobrir seu IP público: `curl ifconfig.me`

### 8.5 IP Dinâmico? Use DDNS

Se a empresa tem IP dinâmico, use um serviço de DDNS:

1. **No-IP** (gratuito): [noip.com](https://noip.com)
2. **DuckDNS** (gratuito): [duckdns.org](https://duckdns.org)
3. **Cloudflare** (gratuito): Use a API para atualizar

Exemplo com DuckDNS:

```bash
# Criar script de atualização
cat > /opt/bookmenu-api/scripts/update-ddns.sh << 'EOF'
#!/bin/bash
DOMAIN="seu-subdominio"
TOKEN="seu-token-duckdns"

curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip="
EOF

chmod +x /opt/bookmenu-api/scripts/update-ddns.sh

# Adicionar ao crontab (atualizar a cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/bookmenu-api/scripts/update-ddns.sh") | crontab -
```

---

## 🧪 Fase 9: Testar a Integração

### 9.1 Testar API Externamente

```bash
# Do seu computador local (fora da rede da empresa)
curl https://api.suaempresa.com.br/health

# Testar endpoint da API
curl https://api.suaempresa.com.br/api/api-docs
```

### 9.2 Testar CORS

```javascript
// Execute no console do navegador (F12) estando no site da Vercel
fetch("https://api.suaempresa.com.br/api/health", {
  method: "GET",
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => console.log("Sucesso:", data))
  .catch((err) => console.error("Erro CORS:", err))
```

### 9.3 Verificar SSL

```bash
# Verificar certificado
openssl s_client -connect api.suaempresa.com.br:443 -servername api.suaempresa.com.br

# Verificar data de expiração
echo | openssl s_client -connect api.suaempresa.com.br:443 2>/dev/null | openssl x509 -noout -dates
```

### 9.4 Testar do Frontend na Vercel

Acesse o site na Vercel e verifique:

1. Login funciona
2. Dados são carregados
3. Operações CRUD funcionam
4. Não há erros de CORS no console

---

## 📋 Checklist Final

### Backend (Servidor Local)

- [ ] Docker instalado e funcionando
- [ ] Containers rodando (postgres, backend, nginx)
- [ ] SSL configurado com certificado válido
- [ ] Firewall configurado (portas 80, 443, 22)
- [ ] Port forwarding configurado no roteador
- [ ] Domínio apontando para IP público
- [ ] CORS configurado para domínio da Vercel
- [ ] Rate limiting ativo
- [ ] Backup automático configurado
- [ ] Renovação SSL automática configurada

### Frontend (Vercel)

- [ ] Projeto deployado na Vercel
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Domínio customizado (opcional)
- [ ] Build passando sem erros

### Testes

- [ ] API acessível externamente via HTTPS
- [ ] Frontend carrega corretamente
- [ ] Login/autenticação funciona
- [ ] Operações CRUD funcionam
- [ ] Sem erros de CORS
- [ ] Performance aceitável

---

## 🛠️ Troubleshooting

### Erro de CORS

```
Access to fetch at 'https://api...' from origin 'https://...' has been blocked by CORS policy
```

**Solução:**

1. Verifique se `CORS_ORIGIN` no `.env.production` está correto
2. Verifique se o nginx está configurado com o domínio correto
3. Reinicie os containers: `docker restart bookmenu-api bookmenu-proxy`

### API não acessível externamente

1. Verifique port forwarding no roteador
2. Verifique firewall: `sudo ufw status`
3. Verifique se o domínio resolve: `nslookup api.suaempresa.com.br`
4. Teste localmente: `curl http://localhost:8080/api-docs`

### Certificado SSL inválido

1. Verifique se o domínio está correto no certificado
2. Regenere com Let's Encrypt: `sudo certbot certonly --standalone -d api.suaempresa.com.br`
3. Copie os novos certificados para `/opt/bookmenu-api/volumes/nginx-ssl/`

### Frontend não conecta na API

1. Verifique `NEXT_PUBLIC_API_URL` na Vercel
2. Faça redeploy após alterar variáveis de ambiente
3. Verifique console do navegador para erros específicos

---

## 📊 Comparativo: Arquiteturas de Deploy

| Aspecto                  | Tudo Local                | Híbrido (Vercel + Local)  | Tudo na Nuvem       |
| ------------------------ | ------------------------- | ------------------------- | ------------------- |
| **Custo Mensal**         | ~R$0 (servidor existente) | ~R$0 (Vercel free)        | R$100-500+          |
| **Performance Frontend** | Depende do servidor       | Excelente (CDN global)    | Excelente           |
| **Performance API**      | Excelente (rede local)    | Boa (depende da internet) | Excelente           |
| **Segurança dos Dados**  | Máxima (dados locais)     | Alta (dados locais)       | Depende do provedor |
| **Disponibilidade**      | Depende da empresa        | Alta (Vercel 99.99%)      | Alta                |
| **Manutenção**           | Manual                    | Semi-automática           | Automática          |
| **Escalabilidade**       | Limitada                  | Frontend ilimitado        | Ilimitada           |
| **Complexidade**         | Média                     | Média                     | Baixa               |
| **Acesso Externo**       | Requer config             | ✅ Nativo                 | ✅ Nativo           |

---

## 🎯 Recomendações Finais

### Para Empresas Pequenas/Médias

A arquitetura **Híbrida (Vercel + Local)** é ideal porque:

1. **Custo zero ou muito baixo** - Vercel tem plano gratuito generoso
2. **Dados seguros** - Banco de dados fica na empresa
3. **Acesso de qualquer lugar** - Funcionários podem acessar de casa
4. **Manutenção simples** - Deploy do frontend é automático via Git
5. **Performance excelente** - CDN global da Vercel

### Configuração Recomendada

```
Frontend: Vercel (gratuito)
├── CDN Global
├── Deploy automático via GitHub
├── SSL automático
└── Domínio: menu.suaempresa.com.br

Backend: Servidor Local
├── Docker (PostgreSQL + API + Nginx)
├── SSL via Let's Encrypt
├── Cloudflare como proxy (proteção DDoS)
└── Domínio: api.suaempresa.com.br
```

### Custos Estimados

| Item                 | Custo         |
| -------------------- | ------------- |
| Vercel (Hobby)       | Gratuito      |
| Cloudflare (Free)    | Gratuito      |
| Let's Encrypt        | Gratuito      |
| Domínio (.com.br)    | ~R$40/ano     |
| Servidor (existente) | R$0           |
| **Total**            | **~R$40/ano** |

---

## 📚 Recursos Adicionais

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Cloudflare Setup](https://developers.cloudflare.com/fundamentals/get-started/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx CORS Configuration](https://enable-cors.org/server_nginx.html)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker logs bookmenu-api`
2. Consulte a seção de Troubleshooting acima
3. Verifique o console do navegador (F12)
4. Teste a API diretamente: `curl https://api.suaempresa.com.br/health`
