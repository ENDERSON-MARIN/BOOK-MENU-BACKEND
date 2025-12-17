# 🐳 Guia de Deploy Docker - Ubuntu 24.04 LTS

Este guia detalha o processo completo de deploy do Sistema BookMenu em uma VM Ubuntu 24.04 LTS usando Docker.

## 📋 Pré-requisitos

- VM Ubuntu 24.04 LTS com acesso SSH
- Mínimo 4GB RAM, 2 vCPUs, 40GB disco
- Acesso root ou usuário com sudo
- Porta 80, 443, 22 liberadas no firewall

---

## ⚠️ Importante: Onde Executar os Comandos

> **Todos os comandos deste guia devem ser executados no terminal do Ubuntu via SSH ou console direto.**
>
> **Como conectar ao servidor:**
>
> 1. Abra um terminal no seu computador local
> 2. Execute: `ssh usuario@seu-servidor-ip`
> 3. Digite sua senha quando solicitado

---

## 🔧 Fase 1: Preparação do Servidor

### 1.1 Conectar ao Servidor

```bash
ssh usuario@seu-servidor-ip
```

### 1.2 Atualizar o Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop tree
```

### 1.3 Configurar Timezone

```bash
# Verificar timezone atual
timedatectl

# Configurar timezone
sudo timedatectl set-timezone America/Sao_Paulo
```

### 1.4 Criar Usuário para Deploy (Opcional)

```bash
sudo adduser bookmenu
sudo usermod -aG sudo bookmenu
su - bookmenu
```

---

## 🐳 Fase 2: Instalação do Docker

### 2.1 Remover Versões Antigas

```bash
sudo apt remove docker docker-engine docker.io containerd runc 2>/dev/null
```

### 2.2 Instalar Dependências

```bash
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 2.3 Adicionar Repositório Docker

```bash
# Adicionar chave GPG oficial do Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 2.4 Instalar Docker Engine

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2.5 Configurar Docker para Usuário Não-Root

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### 2.6 Verificar Instalação

```bash
# Verificar versões
docker --version
docker compose version

# Testar Docker
docker run hello-world
```

---

## 📁 Fase 3: Estrutura de Diretórios

### 3.1 Criar Estrutura de Pastas

```bash
# Diretório principal
sudo mkdir -p /opt/bookmenu-docker
sudo chown -R $USER:$USER /opt/bookmenu-docker
cd /opt/bookmenu-docker

# Estrutura de volumes
mkdir -p volumes/{postgres-data,app-logs,nginx-ssl,backups}
mkdir -p nginx/conf.d
mkdir -p monitoring/{grafana/dashboards,grafana/datasources,prometheus}
mkdir -p secrets
mkdir -p scripts

# Estrutura da aplicação (backend e frontend separados)
mkdir -p app/{backend,frontend}
```

### 3.2 Verificar Estrutura

```bash
tree /opt/bookmenu-docker -L 3
# Resultado esperado:
# /opt/bookmenu-docker
# ├── app
# │   ├── backend        # Código da API
# │   ├── frontend       # Código do Next.js
# │   └── docker-compose.yml
# ├── monitoring
# │   ├── grafana
# │   │   ├── dashboards
# │   │   └── datasources
# │   └── prometheus
# ├── nginx
# │   └── conf.d
# ├── scripts
# ├── secrets
# └── volumes
#     ├── app-logs
#     ├── backups
#     ├── nginx-ssl
#     └── postgres-data
```

---

## 📦 Fase 4: Clonar e Configurar Projeto

### 4.1 Clonar Repositórios

```bash
cd /opt/bookmenu-docker/app

# Se backend e frontend estão em repositórios separados
git clone https://github.com/seu-usuario/bookmenu-api.git backend
git clone https://github.com/seu-usuario/bookmenu-frontend.git frontend

# OU se estão em um monorepo
git clone https://github.com/seu-usuario/bookmenu.git .
# Ajuste os paths no docker-compose conforme sua estrutura
```

### 4.2 Criar Arquivo de Ambiente

```bash
cat > /opt/bookmenu-docker/app/.env.production << 'EOF'
# ===========================================
# BOOKMENU - Variáveis de Ambiente Produção
# ===========================================

# Database
DB_NAME=bookmenu
DB_USER=bookmenu_user
DB_PASSWORD=SuaSenhaSegura123!
DB_PORT=5432

# Application
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_min_32_chars
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
VERSION=1.0.0

# URLs (ajuste para seu domínio)
FRONTEND_URL=https://bookmenu.seudominio.com
NEXT_PUBLIC_API_URL=https://bookmenu.seudominio.com/api

# Monitoring
GRAFANA_PASSWORD=admin_grafana_password

# Docker
COMPOSE_PROJECT_NAME=bookmenu
DOCKER_BUILDKIT=1
EOF
```

### 4.3 Gerar Senhas Seguras

```bash
# Gerar senha do banco (32 caracteres)
openssl rand -base64 32
# Exemplo de saída: K7xP9mN2vQ8rT5wY3zA1bC4dE6fG0hI=

# Gerar JWT Secret (64 caracteres)
openssl rand -base64 64
# Exemplo de saída: muito_longo_e_seguro...

# Atualizar .env.production com as senhas geradas
nano /opt/bookmenu-docker/app/.env.production
```

---

## 🔐 Fase 5: Configurar SSL/TLS

### 5.1 Opção A: Certificado Auto-assinado (Desenvolvimento/Teste)

```bash
cd /opt/bookmenu-docker/volumes/nginx-ssl

# Gerar certificado auto-assinado
# IMPORTANTE: Substitua os valores abaixo com suas informações reais
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=BR/ST=Santa Catarina/L=Rio do Sul/O=Cravil/CN=bookmenu.cravil.com"

sudo chmod 644 cert.pem
sudo chmod 600 key.pem
sudo chown $USER:$USER cert.pem key.pem

# Verificar certificado
openssl x509 -in cert.pem -text -noout
```

**Explicação dos campos (substitua com seus dados):**

| Campo | Significado            | Exemplo             |
| ----- | ---------------------- | ------------------- |
| C     | País (código 2 letras) | BR                  |
| ST    | Estado                 | Santa Catarina      |
| L     | Cidade (Locality)      | Rio do Sul          |
| O     | Organização/Empresa    | Cravil              |
| CN    | Domínio do certificado | bookmenu.cravil.com |

### 5.2 Opção B: Let's Encrypt (Produção)

```bash
# Instalar Certbot
sudo apt install -y certbot

# Gerar certificado (antes de iniciar nginx)
# Certifique-se de que a porta 80 está livre e o domínio aponta para o servidor
sudo certbot certonly --standalone -d bookmenu.seudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/bookmenu.seudominio.com/fullchain.pem /opt/bookmenu-docker/volumes/nginx-ssl/cert.pem
sudo cp /etc/letsencrypt/live/bookmenu.seudominio.com/privkey.pem /opt/bookmenu-docker/volumes/nginx-ssl/key.pem
sudo chown $USER:$USER /opt/bookmenu-docker/volumes/nginx-ssl/*.pem
```

---

## 🌐 Fase 6: Configurar Nginx

### 6.1 Criar Configuração Principal

```bash
cat > /opt/bookmenu-docker/nginx/nginx.conf << 'EOF'
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

### 6.2 Criar Configuração do Site

```bash
cat > /opt/bookmenu-docker/nginx/conf.d/bookmenu.conf << 'EOF'
upstream backend {
    least_conn;
    server bookmenu-api:8080 max_fails=3 fail_timeout=30s;
}

upstream frontend {
    least_conn;
    server bookmenu-web:3000 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS Server
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

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;

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

    # Frontend Routes
    location / {
        limit_req zone=web burst=50 nodelay;

        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Assets Caching
    location /_next/static/ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
```

---

## 🐳 Fase 7: Criar Dockerfiles

### 7.1 Backend Dockerfile

Crie o arquivo `/opt/bookmenu-docker/app/backend/Dockerfile`

**Opção A: Criar manualmente** - Abra o editor e cole o conteúdo abaixo

```bash
nano /opt/bookmenu-docker/app/backend/Dockerfile
```

**Opção B: Via terminal (automatizado)** - Cole o bloco completo:

```bash
cat > /opt/bookmenu-docker/app/backend/Dockerfile << 'EOF'
# Build stage
FROM node:22-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files (incluindo pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build application
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bookmenu -u 1001 -G nodejs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=bookmenu:nodejs /app/dist ./dist
COPY --from=builder --chown=bookmenu:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bookmenu:nodejs /app/prisma ./prisma
COPY --from=builder --chown=bookmenu:nodejs /app/package.json ./

# Install security updates and dumb-init
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

# Create logs directory
RUN mkdir -p /app/logs && chown bookmenu:nodejs /app/logs

# Switch to non-root user
USER bookmenu

# Expose port
EXPOSE 8080

# Health check (usando /api-docs pois a API não tem /health)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api-docs || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
EOF
```

> **Nota:** Este projeto usa `pnpm` como gerenciador de pacotes. O Dockerfile foi configurado para usar `pnpm install --frozen-lockfile` em vez de `npm ci`.

---

### 7.2 Frontend Dockerfile (Next.js)

Crie o arquivo `/opt/bookmenu-docker/app/frontend/Dockerfile`

> **Nota:** Este Dockerfile usa `npm`. Se o projeto frontend usar `pnpm`, substitua `npm ci` por `pnpm install --frozen-lockfile` e `npm run build` por `pnpm build`.

**Opção A: Criar manualmente**

```bash
nano /opt/bookmenu-docker/app/frontend/Dockerfile
```

**Opção B: Via terminal (automatizado)**

```bash
cat > /opt/bookmenu-docker/app/frontend/Dockerfile << 'EOF'
# Dependencies stage
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install security updates and dumb-init
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
EOF
```

> **⚠️ Importante - Configuração no código fonte (ANTES do build):**
>
> Para o Next.js funcionar com standalone output, adicione a configuração no arquivo `next.config.ts` (ou `.js`) na **raiz do projeto frontend**:
>
> **Se usar TypeScript (`next.config.ts`):**
>
> ```typescript
> import type { NextConfig } from "next"
>
> const nextConfig: NextConfig = {
>   output: "standalone",
>   // ... outras configurações existentes
> }
>
> export default nextConfig
> ```
>
> **Se usar JavaScript (`next.config.js`):**
>
> ```javascript
> /** @type {import('next').NextConfig} */
> const nextConfig = {
>   output: "standalone",
> }
>
> module.exports = nextConfig
> ```
>
> Essa configuração faz o Next.js gerar um build otimizado para containers Docker.

---

## 📝 Fase 8: Docker Compose

### 8.1 Criar docker-compose.yml

```bash
cat > /opt/bookmenu-docker/app/docker-compose.yml << 'EOF'
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
      - /opt/bookmenu-docker/volumes/backups:/backups
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
        reservations:
          memory: 512M
          cpus: "0.5"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    image: bookmenu/backend:${VERSION:-latest}
    container_name: bookmenu-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER:-bookmenu_user}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-bookmenu}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-24h}
      PORT: 8080
      LOG_LEVEL: ${LOG_LEVEL:-info}
      FRONTEND_URL: ${FRONTEND_URL}
    volumes:
      - app_logs:/app/logs
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
        reservations:
          memory: 256M
          cpus: "0.25"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: runner
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://localhost/api}
    image: bookmenu/frontend:${VERSION:-latest}
    container_name: bookmenu-web
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      HOSTNAME: "0.0.0.0"
    networks:
      - bookmenu-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 128M
          cpus: "0.1"
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
      - /opt/bookmenu-docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /opt/bookmenu-docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - /opt/bookmenu-docker/volumes/nginx-ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - bookmenu-network
    depends_on:
      - backend
      - frontend
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
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
  app_logs:
  nginx_logs:
EOF
```

---

## 🚀 Fase 9: Deploy

### 9.1 Criar Script de Deploy

```bash
cat > /opt/bookmenu-docker/scripts/deploy.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

APP_DIR="/opt/bookmenu-docker/app"
ENV_FILE="$APP_DIR/.env.production"
BACKUP_DIR="/opt/bookmenu-docker/volumes/backups"

# Flags
NO_BUILD=false
NO_BACKUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-build) NO_BUILD=true; shift ;;
        --no-backup) NO_BACKUP=true; shift ;;
        *) shift ;;
    esac
done

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi

    if [ ! -f "$ENV_FILE" ]; then
        log_error "Arquivo $ENV_FILE não encontrado"
        exit 1
    fi

    log_info "Pré-requisitos OK"
}

# Backup do banco
backup_database() {
    if [ "$NO_BACKUP" = true ]; then
        log_warn "Backup ignorado (flag --no-backup)"
        return
    fi

    log_info "Criando backup do banco..."

    if docker ps | grep -q bookmenu-db; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).sql"
        docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "$BACKUP_DIR/$BACKUP_NAME"
        log_info "Backup criado: $BACKUP_NAME"
    else
        log_warn "Container do banco não está rodando, pulando backup"
    fi
}

# Build das imagens
build_images() {
    if [ "$NO_BUILD" = true ]; then
        log_warn "Build ignorado (flag --no-build)"
        return
    fi

    log_info "Construindo imagens Docker..."
    cd "$APP_DIR"
    docker compose --env-file "$ENV_FILE" build --no-cache
    if [ $? -ne 0 ]; then
        log_error "Falha no build das imagens"
        exit 1
    fi
    log_info "Imagens construídas"
}

# Deploy
deploy() {
    log_info "Fazendo deploy..."
    cd "$APP_DIR"

    # Parar containers existentes
    docker compose --env-file "$ENV_FILE" down || true

    # Iniciar containers
    docker compose --env-file "$ENV_FILE" up -d
    if [ $? -ne 0 ]; then
        log_error "Falha ao iniciar containers"
        exit 1
    fi

    log_info "Containers iniciados"
}

# Verificar saúde
check_health() {
    log_info "Verificando saúde dos serviços..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        healthy_count=$(docker ps --filter "health=healthy" --format "{{.Names}}" | grep -c "bookmenu" || true)

        if [ "$healthy_count" -ge 3 ]; then
            log_info "Serviços estão saudáveis"
            return 0
        fi

        log_warn "Aguardando... (tentativa $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    log_error "Serviços não ficaram saudáveis"
    return 1
}

# Executar migrações
run_migrations() {
    log_info "Executando migrações..."
    docker exec bookmenu-api npx prisma migrate deploy
    if [ $? -ne 0 ]; then
        log_warn "Falha nas migrações (pode ser normal se já estão aplicadas)"
    else
        log_info "Migrações executadas"
    fi
}

# Limpeza
cleanup() {
    log_info "Limpando recursos não utilizados..."
    docker image prune -f
    docker system prune -f --volumes=false
    log_info "Limpeza concluída"
}

# Main
main() {
    echo -e "${CYAN}==========================================${NC}"
    echo -e "${CYAN}  DEPLOY BOOKMENU - $(date)${NC}"
    echo -e "${CYAN}==========================================${NC}"

    check_prerequisites
    backup_database
    build_images
    deploy

    if check_health; then
        run_migrations
        cleanup
        echo -e "${GREEN}==========================================${NC}"
        echo -e "${GREEN}  DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
        echo -e "${GREEN}==========================================${NC}"
    else
        log_error "Deploy falhou - verificar logs"
        docker compose --env-file "$ENV_FILE" logs
        exit 1
    fi
}

main "$@"
EOF

chmod +x /opt/bookmenu-docker/scripts/deploy.sh
```

### 9.2 Executar Deploy

```bash
cd /opt/bookmenu-docker/scripts

# Deploy completo
./deploy.sh

# Deploy sem rebuild
./deploy.sh --no-build

# Deploy sem backup
./deploy.sh --no-backup

# Deploy sem rebuild e sem backup
./deploy.sh --no-build --no-backup
```

---

## ✅ Fase 10: Verificação

### 10.1 Verificar Containers

```bash
# Status dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs em tempo real
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml logs -f

# Logs específicos
docker logs bookmenu-api -f
docker logs bookmenu-db -f
docker logs bookmenu-proxy -f
docker logs bookmenu-web -f

# Verificar uso de recursos
docker stats --no-stream
```

### 10.2 Testar Endpoints

```bash
# Health check (ignorar erro de certificado para auto-assinado)
curl -k https://localhost/health

# API Health
curl -k https://localhost/api/health

# Ou usando a rota de documentação
curl -k https://localhost/api/api-docs

# Verificar SSL
openssl s_client -connect localhost:443 -servername bookmenu.seudominio.com
```

### 10.3 Verificar Banco de Dados

```bash
# Conectar ao banco
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu

# Dentro do psql:
# \dt          -- Listar tabelas
# \l           -- Listar bancos
# \d tabela    -- Descrever tabela
# \q           -- Sair
```

### 10.4 Acessar via Navegador

Abra o navegador e acesse:

- **Aplicação**: https://seu-servidor-ip (aceite o aviso de certificado auto-assinado)
- **API**: https://seu-servidor-ip/api/api-docs

---

## 🔄 Fase 11: Manutenção

### 11.1 Comandos Úteis

```bash
# Reiniciar serviços
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml restart

# Parar serviços
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml down

# Ver logs
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml logs -f --tail=100

# Atualizar aplicação
cd /opt/bookmenu-docker/app/backend && git pull
cd /opt/bookmenu-docker/app/frontend && git pull
/opt/bookmenu-docker/scripts/deploy.sh

# Backup manual
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > /opt/bookmenu-docker/volumes/backups/backup-$TIMESTAMP.sql

# Restore backup
cat /opt/bookmenu-docker/volumes/backups/backup-XXXXXXXX-XXXXXX.sql | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu
```

### 11.2 Configurar Backup Automático

```bash
# Criar script de backup
cat > /opt/bookmenu-docker/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/bookmenu-docker/volumes/backups"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).sql"

# Criar backup
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "$BACKUP_DIR/$BACKUP_NAME"

# Comprimir backup
gzip "$BACKUP_DIR/$BACKUP_NAME"

# Manter apenas últimos 7 dias
find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete

echo "Backup criado: $BACKUP_NAME.gz"
EOF

chmod +x /opt/bookmenu-docker/scripts/backup.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/bookmenu-docker/scripts/backup.sh >> /opt/bookmenu-docker/volumes/app-logs/backup.log 2>&1") | crontab -

# Verificar crontab
crontab -l
```

### 11.3 Renovação Automática SSL (Let's Encrypt)

```bash
# Criar script de renovação
cat > /opt/bookmenu-docker/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet

# Copiar certificados renovados
cp /etc/letsencrypt/live/bookmenu.seudominio.com/fullchain.pem /opt/bookmenu-docker/volumes/nginx-ssl/cert.pem
cp /etc/letsencrypt/live/bookmenu.seudominio.com/privkey.pem /opt/bookmenu-docker/volumes/nginx-ssl/key.pem

# Recarregar nginx
docker exec bookmenu-proxy nginx -s reload

echo "SSL renovado em $(date)"
EOF

chmod +x /opt/bookmenu-docker/scripts/renew-ssl.sh

# Adicionar ao crontab (verificar renovação 2x por dia)
(crontab -l 2>/dev/null; echo "0 0,12 * * * /opt/bookmenu-docker/scripts/renew-ssl.sh >> /opt/bookmenu-docker/volumes/app-logs/ssl-renew.log 2>&1") | crontab -
```

### 11.4 Configurar Inicialização Automática

Os containers com `restart: unless-stopped` já reiniciam automaticamente. Para garantir:

```bash
# Habilitar Docker para iniciar no boot
sudo systemctl enable docker

# Verificar status
sudo systemctl status docker

# Criar script de startup (opcional)
cat > /opt/bookmenu-docker/scripts/startup.sh << 'EOF'
#!/bin/bash
sleep 30  # Aguardar Docker iniciar completamente
cd /opt/bookmenu-docker/app
docker compose --env-file .env.production up -d
EOF

chmod +x /opt/bookmenu-docker/scripts/startup.sh

# Adicionar ao crontab @reboot (opcional)
(crontab -l 2>/dev/null; echo "@reboot /opt/bookmenu-docker/scripts/startup.sh >> /opt/bookmenu-docker/volumes/app-logs/startup.log 2>&1") | crontab -
```

---

## 🔥 Firewall (UFW)

### Configurar Regras de Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (IMPORTANTE: fazer isso primeiro!)
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar status
sudo ufw status verbose

# Resultado esperado:
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

---

## 📊 Monitoramento (Opcional)

### Adicionar Prometheus + Grafana

```bash
# Criar configuração do Prometheus
cat > /opt/bookmenu-docker/monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'bookmenu-api'
    static_configs:
      - targets: ['bookmenu-api:8080']
    metrics_path: /metrics

  - job_name: 'docker'
    static_configs:
      - targets: ['172.17.0.1:9323']
EOF

# Criar docker-compose.monitoring.yml
cat > /opt/bookmenu-docker/app/docker-compose.monitoring.yml << 'EOF'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: bookmenu-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - /opt/bookmenu-docker/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - bookmenu-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    container_name: bookmenu-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - bookmenu-network
    depends_on:
      - prometheus

volumes:
  prometheus_data:
  grafana_data:

networks:
  bookmenu-network:
    external: true
EOF

# Criar a rede se não existir
docker network create bookmenu-network 2>/dev/null || true

# Iniciar monitoramento
cd /opt/bookmenu-docker/app
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml --env-file .env.production up -d
```

---

## 🌐 Configuração do Arquivo Hosts (Local)

Para acessar o servidor usando um domínio personalizado, configure o arquivo hosts na sua máquina local:

```bash
# No Linux/Mac (máquina local, não no servidor)
sudo nano /etc/hosts

# Adicionar entrada:
# SEU_IP_DO_SERVIDOR menu.cravil.com.br

# Exemplo:
# 192.168.1.100 menu.cravil.com.br

# Salvar e testar
ping menu.cravil.com.br
```

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Docker não inicia

```bash
# Verificar status do Docker
sudo systemctl status docker

# Reiniciar Docker
sudo systemctl restart docker

# Ver logs do Docker
sudo journalctl -u docker -f
```

#### 2. Erro de permissão em volumes

```bash
# Verificar permissões
ls -la /opt/bookmenu-docker/volumes/

# Corrigir permissões
sudo chown -R $USER:$USER /opt/bookmenu-docker/
sudo chmod -R 755 /opt/bookmenu-docker/volumes/
```

#### 3. Containers não se comunicam

```bash
# Verificar rede
docker network ls
docker network inspect app_bookmenu-network

# Recriar rede
docker network rm app_bookmenu-network
docker network create bookmenu-network

# Reiniciar containers
cd /opt/bookmenu-docker/app
docker compose --env-file .env.production down
docker compose --env-file .env.production up -d
```

#### 4. Porta já em uso

```bash
# Verificar processo usando a porta
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
sudo lsof -i :8080

# Matar processo (substitua PID)
sudo kill -9 <PID>

# Ou parar serviço que está usando
sudo systemctl stop nginx
sudo systemctl stop apache2
```

#### 5. Problemas de memória

```bash
# Verificar uso de memória
free -h
docker stats --no-stream

# Limpar cache do sistema
sudo sync && sudo sysctl -w vm.drop_caches=3

# Limpar recursos Docker não utilizados
docker system prune -a -f
```

#### 6. Logs de erro

```bash
# Ver logs de todos os containers
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml logs

# Ver logs de container específico
docker logs bookmenu-api --tail 100

# Seguir logs em tempo real
docker logs -f bookmenu-api

# Ver logs com timestamp
docker logs -t bookmenu-api --tail 50
```

#### 7. Banco de dados não conecta

```bash
# Verificar se o container está rodando
docker ps | grep bookmenu-db

# Verificar logs do banco
docker logs bookmenu-db --tail 50

# Testar conexão
docker exec bookmenu-db pg_isready -U bookmenu_user -d bookmenu

# Conectar manualmente
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu
```

#### 8. Nginx retorna 502 Bad Gateway

```bash
# Verificar se backend está rodando
docker ps | grep bookmenu-api

# Verificar logs do nginx
docker logs bookmenu-proxy --tail 50

# Testar conectividade interna
docker exec bookmenu-proxy curl -f http://bookmenu-api:8080/api-docs
docker exec bookmenu-proxy curl -f http://bookmenu-web:3000

# Verificar configuração do nginx
docker exec bookmenu-proxy nginx -t
```

#### 9. Certificado SSL inválido

```bash
# Verificar certificado
openssl x509 -in /opt/bookmenu-docker/volumes/nginx-ssl/cert.pem -text -noout

# Verificar data de expiração
openssl x509 -in /opt/bookmenu-docker/volumes/nginx-ssl/cert.pem -noout -dates

# Regenerar certificado auto-assinado
cd /opt/bookmenu-docker/volumes/nginx-ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=BR/ST=Estado/L=Cidade/O=Empresa/CN=seudominio.com"

# Recarregar nginx
docker exec bookmenu-proxy nginx -s reload
```

---

## 📋 Referência de Comandos Úteis

Esta seção contém todos os comandos mais utilizados durante o deploy e manutenção do sistema.

### 🐳 Docker Compose - Comandos Básicos

```bash
# Definir variáveis para facilitar (opcional)
export COMPOSE_FILE="/opt/bookmenu-docker/app/docker-compose.yml"
export ENV_FILE="/opt/bookmenu-docker/app/.env.production"

# Iniciar todos os containers
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d

# Parar todos os containers
docker compose -f $COMPOSE_FILE down

# Parar e remover volumes (CUIDADO: apaga dados do banco!)
docker compose -f $COMPOSE_FILE down -v

# Reiniciar todos os containers
docker compose -f $COMPOSE_FILE restart

# Ver status dos containers
docker compose -f $COMPOSE_FILE ps

# Ver logs de todos os containers
docker compose -f $COMPOSE_FILE logs -f

# Ver logs com limite de linhas
docker compose -f $COMPOSE_FILE logs -f --tail=100
```

### 🔨 Rebuild de Containers

```bash
# Rebuild completo (todos os serviços)
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production build --no-cache

# Rebuild apenas do backend
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production build --no-cache backend

# Rebuild apenas do frontend
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production build --no-cache frontend

# Rebuild e reiniciar um serviço específico
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production up -d --build backend
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production up -d --build frontend

# Rebuild completo e reiniciar tudo
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production up -d --build
```

### 📊 Logs e Monitoramento

```bash
# Logs do backend
docker logs bookmenu-api -f
docker logs bookmenu-api --tail=100

# Logs do frontend
docker logs bookmenu-web -f

# Logs do banco de dados
docker logs bookmenu-db -f

# Logs do nginx
docker logs bookmenu-proxy -f

# Ver uso de recursos (CPU, memória)
docker stats

# Ver uso de recursos sem atualização contínua
docker stats --no-stream

# Verificar saúde dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Ver eventos do Docker
docker events --since="1h"
```

### 🗄️ Prisma - Comandos de Banco de Dados

```bash
# Executar migrações pendentes
docker exec bookmenu-api npx prisma migrate deploy

# Gerar Prisma Client (após alterar schema)
docker exec bookmenu-api npx prisma generate

# Executar seed (popular banco com dados iniciais)
docker exec bookmenu-api npx prisma db seed

# Ver status das migrações
docker exec bookmenu-api npx prisma migrate status

# Reset do banco (CUIDADO: apaga todos os dados!)
docker exec bookmenu-api npx prisma migrate reset --force

# Abrir Prisma Studio (interface visual do banco)
# Nota: precisa expor porta adicional
docker exec -it bookmenu-api npx prisma studio
```

### 💾 Backup e Restore do Banco

```bash
# Backup manual
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "/opt/bookmenu-docker/volumes/backups/backup-$TIMESTAMP.sql"

# Backup comprimido
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu | gzip > "/opt/bookmenu-docker/volumes/backups/backup-$TIMESTAMP.sql.gz"

# Restore de backup
cat /opt/bookmenu-docker/volumes/backups/backup-XXXXXXXX-XXXXXX.sql | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu

# Restore de backup comprimido
gunzip -c /opt/bookmenu-docker/volumes/backups/backup-XXXXXXXX-XXXXXX.sql.gz | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu

# Conectar ao banco via psql
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu

# Comandos úteis dentro do psql:
# \dt          -- Listar tabelas
# \l           -- Listar bancos
# \d tabela    -- Descrever tabela
# \q           -- Sair
```

### ⚙️ Nginx - Atualizar Configuração

```bash
# Editar configuração do nginx
nano /opt/bookmenu-docker/nginx/nginx.conf
nano /opt/bookmenu-docker/nginx/conf.d/bookmenu.conf

# Testar configuração do nginx
docker exec bookmenu-proxy nginx -t

# Recarregar nginx sem reiniciar container
docker exec bookmenu-proxy nginx -s reload

# Ou reiniciar container do nginx
docker restart bookmenu-proxy
```

### 🔄 Variáveis de Ambiente

> **⚠️ IMPORTANTE sobre variáveis `NEXT_PUBLIC_*`:**
>
> - Variáveis `NEXT_PUBLIC_*` são injetadas no **build time** (durante `npm run build`)
> - Se alterar `NEXT_PUBLIC_API_URL`, precisa fazer **rebuild do frontend**
> - Variáveis do backend são **runtime** - basta reiniciar o container

```bash
# Editar arquivo de ambiente
nano /opt/bookmenu-docker/app/.env.production

# Após alterar variáveis do BACKEND (runtime):
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml restart backend

# Após alterar variáveis NEXT_PUBLIC_* (build time):
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml --env-file /opt/bookmenu-docker/app/.env.production up -d --build frontend

# Verificar variáveis de ambiente de um container
docker exec bookmenu-api env
docker exec bookmenu-web env
```

### 🧹 Limpeza e Manutenção

```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -f

# Remover imagens antigas (dangling)
docker image prune -a -f

# Remover volumes não utilizados (CUIDADO!)
docker volume prune -f

# Limpeza geral (containers, redes, imagens não usadas)
docker system prune -f

# Limpeza completa incluindo volumes (CUIDADO: apaga dados!)
docker system prune -a --volumes -f

# Ver uso de disco do Docker
docker system df

# Ver uso de disco detalhado
docker system df -v
```

### 🔍 Debug e Troubleshooting

```bash
# Entrar no container do backend
docker exec -it bookmenu-api sh

# Entrar no container do frontend
docker exec -it bookmenu-web sh

# Entrar no container do nginx
docker exec -it bookmenu-proxy sh

# Verificar se porta está em uso
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
sudo lsof -i :8080

# Testar conectividade interna (de dentro do nginx)
docker exec bookmenu-proxy curl -f http://bookmenu-api:8080/api-docs
docker exec bookmenu-proxy curl -f http://bookmenu-web:3000

# Verificar rede Docker
docker network ls
docker network inspect app_bookmenu-network

# Verificar health check
docker inspect --format='{{json .State.Health}}' bookmenu-api | jq
docker inspect --format='{{json .State.Health}}' bookmenu-web | jq

# Ver informações detalhadas do container
docker inspect bookmenu-api
```

### 📝 Exemplo de .env.production Completo

```ini
# ===========================================
# BOOKMENU - Variáveis de Ambiente Produção
# ===========================================

# Database
DB_NAME=bookmenu
DB_USER=bookmenu_user
DB_PASSWORD=SuaSenhaSegura123!
DB_PORT=5432

# Application
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_min_32_chars
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
VERSION=1.0.0

# URLs (ajuste para seu domínio)
FRONTEND_URL=https://menu.cravil.com.br
NEXT_PUBLIC_API_URL=https://menu.cravil.com.br/api

# Monitoring
GRAFANA_PASSWORD=admin_grafana_password

# Docker
COMPOSE_PROJECT_NAME=bookmenu
DOCKER_BUILDKIT=1
```

### 🚀 Fluxo Completo de Deploy

```bash
# 1. Navegar para o diretório
cd /opt/bookmenu-docker/app

# 2. Parar containers existentes
docker compose --env-file .env.production down

# 3. Atualizar código (se usando git)
cd backend && git pull && cd ..
cd frontend && git pull && cd ..

# 4. Rebuild das imagens
docker compose --env-file .env.production build --no-cache

# 5. Iniciar containers
docker compose --env-file .env.production up -d

# 6. Verificar status
docker ps

# 7. Executar migrações
docker exec bookmenu-api npx prisma migrate deploy

# 8. Verificar logs
docker compose --env-file .env.production logs -f --tail=50
```

---

## 🎉 Conclusão

Após seguir todos os passos, você terá:

✅ Docker instalado e configurado no Ubuntu 24.04 LTS
✅ Aplicação containerizada (Backend + Frontend)
✅ Banco de dados PostgreSQL
✅ Proxy reverso Nginx com SSL
✅ Backups automáticos via crontab
✅ Scripts de deploy automatizados
✅ Firewall configurado (UFW)

### Acessos:

| Serviço               | URL                                 |
| --------------------- | ----------------------------------- |
| Aplicação             | https://bookmenu.seudominio.com     |
| API                   | https://bookmenu.seudominio.com/api |
| Grafana (opcional)    | http://seu-ip:3001                  |
| Prometheus (opcional) | http://seu-ip:9090                  |

### Estrutura Final:

```
/opt/bookmenu-docker/
├── app/
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.monitoring.yml
│   └── .env.production
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       └── bookmenu.conf
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   ├── renew-ssl.sh
│   └── startup.sh
├── secrets/
└── volumes/
    ├── postgres-data/
    ├── app-logs/
    ├── nginx-ssl/
    │   ├── cert.pem
    │   └── key.pem
    └── backups/
```

### Comandos Rápidos:

```bash
# Deploy
/opt/bookmenu-docker/scripts/deploy.sh

# Status
docker ps

# Logs
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml logs -f

# Parar
docker compose -f /opt/bookmenu-docker/app/docker-compose.yml down

# Backup manual
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > backup.sql

# Reiniciar serviço específico
docker restart bookmenu-api
docker restart bookmenu-web
docker restart bookmenu-proxy
```

---

## 📚 Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
