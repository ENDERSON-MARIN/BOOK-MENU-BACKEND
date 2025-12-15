# 🐳 Guia de Deploy Docker - Ubuntu 24.04 LTS

Este guia detalha o processo completo de deploy do Sistema BookMenu em uma VM Ubuntu 24.04 LTS usando Docker.

## 📋 Pré-requisitos

- VM Ubuntu 24.04 LTS com acesso SSH
- Mínimo 4GB RAM, 2 vCPUs, 40GB disco
- Acesso root ou usuário com sudo
- Porta 80, 443, 22 liberadas no firewall

---

## 🔧 Fase 1: Preparação do Servidor

### 1.1 Conectar ao Servidor

```bash
ssh usuario@seu-servidor-ip
```

### 1.2 Atualizar o Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop
```

### 1.3 Configurar Timezone

```bash
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
docker --version
docker compose version
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
mkdir -p monitoring/{grafana/dashboards,grafana/datasources}
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
# │   └── grafana
# │       ├── dashboards
# │       └── datasources
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

# Se backend e frontend estão no mesmo repositório
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
# Gerar senha do banco
openssl rand -base64 32

# Gerar JWT Secret
openssl rand -base64 64

# Atualizar .env.production com as senhas geradas
nano .env.production
```

---

## 🔐 Fase 5: Configurar SSL/TLS

### 5.1 Opção A: Certificado Auto-assinado (Desenvolvimento/Teste)

```bash
cd /opt/bookmenu-docker/volumes/nginx-ssl

# Gerar certificado auto-assinado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=BR/ST=Estado/L=Cidade/O=Empresa/CN=bookmenu.seudominio.com"

sudo chmod 644 cert.pem
sudo chmod 600 key.pem
```

### 5.2 Opção B: Let's Encrypt (Produção)

```bash
# Instalar Certbot
sudo apt install -y certbot

# Gerar certificado (antes de iniciar nginx)
sudo certbot certonly --standalone -d bookmenu.seudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/bookmenu.seudominio.com/fullchain.pem /opt/bookmenu-docker/volumes/nginx-ssl/cert.pem
sudo cp /etc/letsencrypt/live/bookmenu.seudominio.com/privkey.pem /opt/bookmenu-docker/volumes/nginx-ssl/key.pem
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

```bash
cat > /opt/bookmenu-docker/app/backend/Dockerfile << 'EOF'
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bookmenu -u 1001 -G nodejs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=bookmenu:nodejs /app/dist ./dist
COPY --from=builder --chown=bookmenu:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bookmenu:nodejs /app/prisma ./prisma
COPY --from=builder --chown=bookmenu:nodejs /app/package*.json ./

# Install security updates and dumb-init
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

# Create logs directory
RUN mkdir -p /app/logs && chown bookmenu:nodejs /app/logs

# Switch to non-root user
USER bookmenu

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
EOF
```

### 7.2 Frontend Dockerfile (Next.js)

```bash
cat > /opt/bookmenu-docker/app/frontend/Dockerfile << 'EOF'
# Dependencies stage
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
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

> **Importante**: Para o Next.js funcionar com standalone output, adicione no `next.config.js`:
>
> ```javascript
> module.exports = {
>   output: "standalone",
> }
> ```

---

## 📝 Fase 8: Docker Compose

### 8.1 Criar docker-compose.yml

```bash
cat > /opt/bookmenu-docker/app/docker-compose.yml << 'EOF'
version: "3.8"

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
      - /opt/bookmenu-docker/volumes/postgres-data:/var/lib/postgresql/data
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
      - /opt/bookmenu-docker/volumes/app-logs:/app/logs
    networks:
      - bookmenu-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
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
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://bookmenu.seudominio.com/api}
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
      - /opt/bookmenu-docker/volumes/app-logs:/var/log/nginx
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
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
  app_logs:
  nginx_ssl:
  backup_storage:
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
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

APP_DIR="/opt/bookmenu-docker/app"
ENV_FILE="$APP_DIR/.env.production"
BACKUP_DIR="/opt/bookmenu-docker/volumes/backups"

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
    log_info "Construindo imagens Docker..."
    cd "$APP_DIR"
    docker compose --env-file "$ENV_FILE" build --no-cache
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

    log_info "Containers iniciados"
}

# Verificar saúde
check_health() {
    log_info "Verificando saúde dos serviços..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker ps --filter "health=healthy" | grep -q bookmenu; then
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
    log_info "Migrações executadas"
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
    log_info "=========================================="
    log_info "  DEPLOY BOOKMENU - $(date)"
    log_info "=========================================="

    check_prerequisites
    backup_database
    build_images
    deploy

    if check_health; then
        run_migrations
        cleanup
        log_info "=========================================="
        log_info "  DEPLOY CONCLUÍDO COM SUCESSO!"
        log_info "=========================================="
    else
        log_error "Deploy falhou - verificar logs"
        docker compose logs
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
./deploy.sh
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
```

### 10.2 Testar Endpoints

```bash
# Health check
curl -k https://localhost/health

# API Health
curl -k https://localhost/api/health

# Verificar SSL
openssl s_client -connect localhost:443 -servername bookmenu.seudominio.com
```

### 10.3 Verificar Banco de Dados

```bash
# Conectar ao banco
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu

# Listar tabelas
\dt

# Sair
\q
```

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
cd /opt/bookmenu-docker/app
git pull
./scripts/deploy.sh

# Backup manual
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > backup.sql

# Restore backup
cat backup.sql | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu
```

### 11.2 Configurar Backup Automático

```bash
# Criar script de backup
cat > /opt/bookmenu-docker/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/bookmenu-docker/volumes/backups"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).sql"

docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "$BACKUP_DIR/$BACKUP_NAME"

# Manter apenas últimos 7 dias
find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete

echo "Backup criado: $BACKUP_NAME"
EOF

chmod +x /opt/bookmenu-docker/scripts/backup.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/bookmenu-docker/scripts/backup.sh") | crontab -
```

### 11.3 Renovação Automática SSL (Let's Encrypt)

```bash
# Criar script de renovação
cat > /opt/bookmenu-docker/scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/bookmenu.seudominio.com/fullchain.pem /opt/bookmenu-docker/volumes/nginx-ssl/cert.pem
cp /etc/letsencrypt/live/bookmenu.seudominio.com/privkey.pem /opt/bookmenu-docker/volumes/nginx-ssl/key.pem
docker exec bookmenu-proxy nginx -s reload
EOF

chmod +x /opt/bookmenu-docker/scripts/renew-ssl.sh

# Adicionar ao crontab (verificar renovação 2x por dia)
(crontab -l 2>/dev/null; echo "0 0,12 * * * /opt/bookmenu-docker/scripts/renew-ssl.sh") | crontab -
```

---

## 🔥 Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar status
sudo ufw status verbose
```

---

## 📊 Monitoramento (Opcional)

### Adicionar Prometheus + Grafana

```bash
# Criar docker-compose.monitoring.yml
cat > /opt/bookmenu-docker/app/docker-compose.monitoring.yml << 'EOF'
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: bookmenu-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - /opt/bookmenu-docker/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    networks:
      - bookmenu-network

  grafana:
    image: grafana/grafana:latest
    container_name: bookmenu-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - bookmenu-network
    depends_on:
      - prometheus

volumes:
  grafana_data:

networks:
  bookmenu-network:
    external: true
EOF

# Iniciar monitoramento
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

---

## 🎉 Conclusão

Após seguir todos os passos, você terá:

✅ Docker instalado e configurado
✅ Aplicação containerizada
✅ Banco de dados PostgreSQL
✅ Proxy reverso Nginx com SSL
✅ Backups automáticos
✅ Scripts de deploy automatizados
✅ Firewall configurado

### Acessos:

| Serviço               | URL                                 |
| --------------------- | ----------------------------------- |
| Aplicação             | https://bookmenu.seudominio.com     |
| API                   | https://bookmenu.seudominio.com/api |
| Grafana (opcional)    | http://seu-ip:3001                  |
| Prometheus (opcional) | http://seu-ip:9090                  |
