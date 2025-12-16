# 🐳 Guia de Deploy Docker - Windows 11

Este guia detalha o processo completo de deploy do Sistema BookMenu em uma VM Windows 11 usando Docker Desktop.

## 📋 Pré-requisitos

- VM Windows 11 Pro/Enterprise (64-bit)
- Mínimo 8GB RAM, 4 vCPUs, 60GB disco
- Virtualização habilitada na BIOS (VT-x/AMD-V)
- Acesso de Administrador
- Portas 80, 443, 3389 (RDP) liberadas no firewall

---

## ⚠️ Importante: Onde Executar os Comandos

> **Todos os comandos deste guia devem ser executados no PowerShell do Windows (como Administrador), NÃO no WSL/Ubuntu.**
>
> O WSL2 é instalado apenas como backend para o Docker Desktop rodar containers Linux de forma mais eficiente. Você não precisa abrir o terminal do WSL para nada.
>
> **Como abrir o PowerShell como Administrador:**
>
> 1. Pressione `Win + X`
> 2. Clique em "Terminal (Admin)" ou "Windows PowerShell (Admin)"
> 3. Confirme o UAC se solicitado

---

## 🔧 Fase 1: Preparação do Servidor

### 1.1 Conectar ao Servidor

```powershell
# Via RDP (Remote Desktop)
mstsc /v:seu-servidor-ip

# Ou via PowerShell Remoting
Enter-PSSession -ComputerName seu-servidor-ip -Credential (Get-Credential)
```

### 1.2 Habilitar Recursos do Windows

Abra o PowerShell como Administrador:

```powershell
# Habilitar WSL2
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Habilitar Hyper-V (alternativa)
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All -NoRestart

# Habilitar Containers
Enable-WindowsOptionalFeature -Online -FeatureName Containers -All -NoRestart

# Reiniciar o sistema
Restart-Computer
```

### 1.3 Instalar WSL2 (Recomendado)

Após reiniciar, abra o PowerShell como Administrador:

```powershell
# Instalar WSL2
wsl --install

# Definir WSL2 como padrão
wsl --set-default-version 2

# Instalar Ubuntu (opcional, mas útil)
wsl --install -d Ubuntu-22.04
```

### 1.4 Configurar Timezone

```powershell
# Verificar timezone atual
Get-TimeZone

# Configurar timezone
Set-TimeZone -Id "E. South America Standard Time"
```

### 1.5 Instalar Ferramentas Essenciais

```powershell
# Instalar Chocolatey (gerenciador de pacotes)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar ferramentas úteis
choco install git -y
choco install vscode -y
choco install openssl -y
choco install curl -y

# Atualizar PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

---

## 🐳 Fase 2: Instalação do Docker Desktop

### 2.1 Download e Instalação

```powershell
# Baixar Docker Desktop
$dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
Invoke-WebRequest -Uri $dockerUrl -OutFile $installerPath

# Instalar Docker Desktop (silencioso)
Start-Process -FilePath $installerPath -ArgumentList "install", "--quiet", "--accept-license" -Wait

# Ou instalar via Chocolatey
choco install docker-desktop -y
```

### 2.2 Configurar Docker Desktop

Após instalação, reinicie o computador e configure:

1. Abra Docker Desktop
2. Vá em **Settings** > **General**:
   - ✅ Use WSL 2 based engine
   - ✅ Start Docker Desktop when you sign in
3. Vá em **Settings** > **Resources** > **WSL Integration**:
   - ✅ Enable integration with my default WSL distro

### 2.3 Configurar Recursos do WSL2

Com WSL2, os recursos são gerenciados pelo Windows via arquivo `.wslconfig`:

```powershell
# Criar/editar arquivo .wslconfig no diretório do usuário
notepad "$env:USERPROFILE\.wslconfig"
```

Cole o seguinte conteúdo e salve:

```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
localhostForwarding=true
```

Após salvar, reinicie o WSL:

```powershell
wsl --shutdown
# O Docker Desktop reiniciará automaticamente o WSL quando necessário
```

> **Nota:** Ajuste `memory` e `processors` conforme os recursos disponíveis na sua VM. Recomendado: 50-75% da RAM total.

### 2.3 Verificar Instalação

```powershell
# Verificar versões
docker --version
docker compose version

# Testar Docker
docker run hello-world

# Verificar WSL
wsl --list --verbose
```

---

## 📁 Fase 3: Estrutura de Diretórios

### 3.1 Criar Estrutura de Pastas

```powershell
# Definir diretório base
$BASE_DIR = "C:\bookmenu-docker"

# Criar estrutura de diretórios
$directories = @(
    "$BASE_DIR\app\backend",
    "$BASE_DIR\app\frontend",
    "$BASE_DIR\volumes\postgres-data",
    "$BASE_DIR\volumes\app-logs",
    "$BASE_DIR\volumes\nginx-ssl",
    "$BASE_DIR\volumes\backups",
    "$BASE_DIR\nginx\conf.d",
    "$BASE_DIR\monitoring\grafana\dashboards",
    "$BASE_DIR\monitoring\grafana\datasources",
    "$BASE_DIR\scripts",
    "$BASE_DIR\secrets"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Host "Criado: $dir" -ForegroundColor Green
}
```

### 3.2 Verificar Estrutura

```powershell
# Visualizar estrutura
tree $BASE_DIR /F

# Resultado esperado:
# C:\bookmenu-docker
# ├── app
# │   ├── backend
# │   ├── frontend
# │   └── docker-compose.yml
# ├── monitoring
# │   └── grafana
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

```powershell
Set-Location C:\bookmenu-docker\app

# Se backend e frontend estão em repositórios separados
git clone https://github.com/seu-usuario/bookmenu-api.git backend
git clone https://github.com/seu-usuario/bookmenu-frontend.git frontend

# OU se estão em um monorepo
git clone https://github.com/seu-usuario/bookmenu.git .
```

### 4.2 Criar Arquivo de Ambiente

```powershell
$envContent = @"
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

# URLs (ajuste para seu domínio/IP)
FRONTEND_URL=https://bookmenu.seudominio.com
NEXT_PUBLIC_API_URL=https://bookmenu.seudominio.com/api

# Monitoring
GRAFANA_PASSWORD=admin_grafana_password

# Docker
COMPOSE_PROJECT_NAME=bookmenu
DOCKER_BUILDKIT=1
"@

$envContent | Out-File -FilePath "C:\bookmenu-docker\app\.env.production" -Encoding UTF8
```

### 4.3 Gerar Senhas Seguras

```powershell
# Gerar senha do banco (32 caracteres)
$dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "DB_PASSWORD: $dbPassword" -ForegroundColor Cyan

# Gerar JWT Secret (64 caracteres)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET: $jwtSecret" -ForegroundColor Cyan

# Ou usando OpenSSL (se instalado)
openssl rand -base64 32
openssl rand -base64 64
```

Atualize o arquivo `.env.production` com as senhas geradas:

```powershell
notepad C:\bookmenu-docker\app\.env.production
```

---

## 🔐 Fase 5: Configurar SSL/TLS

### 5.1 Opção A: Certificado Auto-assinado (Desenvolvimento/Teste)

```powershell
Set-Location C:\bookmenu-docker\volumes\nginx-ssl

# Gerar certificado auto-assinado com OpenSSL
# IMPORTANTE: Substitua os valores abaixo com suas informações reais
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout key.pem `
  -out cert.pem `
  -subj "/C=BR/ST=Santa Catarina/L=Rio do Sul/O=Cravil/CN=bookmenu.cravil.com"

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

> **Nota:** Espaços são permitidos nos valores. O OpenSSL aceita normalmente.

### 5.2 Opção B: Usando PowerShell (Sem OpenSSL)

```powershell
# Criar certificado auto-assinado
$cert = New-SelfSignedCertificate `
    -DnsName "bookmenu.seudominio.com", "localhost" `
    -CertStoreLocation "Cert:\LocalMachine\My" `
    -NotAfter (Get-Date).AddYears(1) `
    -KeyAlgorithm RSA `
    -KeyLength 2048

# Exportar certificado (PFX)
$pfxPassword = ConvertTo-SecureString -String "senha123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "C:\bookmenu-docker\volumes\nginx-ssl\cert.pfx" -Password $pfxPassword

# Converter PFX para PEM (requer OpenSSL)
openssl pkcs12 -in cert.pfx -out cert.pem -nodes -nokeys
openssl pkcs12 -in cert.pfx -out key.pem -nodes -nocerts
```

### 5.3 Opção C: Let's Encrypt com win-acme

```powershell
# Baixar win-acme
$wacmeUrl = "https://github.com/win-acme/win-acme/releases/download/v2.2.9.1701/win-acme.v2.2.9.1701.x64.pluggable.zip"
Invoke-WebRequest -Uri $wacmeUrl -OutFile "$env:TEMP\win-acme.zip"
Expand-Archive -Path "$env:TEMP\win-acme.zip" -DestinationPath "C:\tools\win-acme"

# Executar win-acme (interativo)
C:\tools\win-acme\wacs.exe

# Copiar certificados gerados para o diretório do nginx
# Os certificados ficam em: C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates
```

---

## 🌐 Fase 6: Configurar Nginx

### 6.1 Criar Configuração Principal

```powershell
$nginxConf = @"
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

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
"@

$nginxConf | Out-File -FilePath "C:\bookmenu-docker\nginx\nginx.conf" -Encoding UTF8 -NoNewline
```

### 6.2 Criar Configuração do Site

```powershell
$siteConf = @'
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
'@

$siteConf | Out-File -FilePath "C:\bookmenu-docker\nginx\conf.d\bookmenu.conf" -Encoding UTF8 -NoNewline
```

---

## 🐳 Fase 7: Criar Dockerfiles

### 7.1 Backend Dockerfile

Crie o arquivo `C:\bookmenu-docker\app\backend\Dockerfile`

**Opção A: Criar manualmente**

1. Abra o VS Code ou Notepad
2. Crie um novo arquivo em `C:\bookmenu-docker\app\backend\Dockerfile` (sem extensão)
3. Cole o conteúdo abaixo e salve

**Opção B: Via PowerShell (automatizado)**
Cole o bloco completo abaixo no PowerShell:

```powershell
$backendDockerfile = @'
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
'@

$backendDockerfile | Out-File -FilePath "C:\bookmenu-docker\app\backend\Dockerfile" -Encoding UTF8 -NoNewline
```

**Conteúdo do Dockerfile (para criar manualmente):**

```dockerfile
# Build stage
FROM node:22-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files (incluindo pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client e build
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
```

> **Nota:** Este projeto usa `pnpm` como gerenciador de pacotes. O Dockerfile foi configurado para usar `pnpm install --frozen-lockfile` em vez de `npm ci`.

---

### 7.2 Frontend Dockerfile (Next.js)

Crie o arquivo `C:\bookmenu-docker\app\frontend\Dockerfile`

> **Nota:** Este Dockerfile usa `npm`. Se o projeto frontend usar `pnpm`, substitua `npm ci` por `pnpm install --frozen-lockfile` e `npm run build` por `pnpm build`.

**Opção A: Criar manualmente** - Crie o arquivo e cole o conteúdo do Dockerfile abaixo

**Opção B: Via PowerShell** - Cole o bloco completo no PowerShell:

```powershell
$frontendDockerfile = @'
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
'@

$frontendDockerfile | Out-File -FilePath "C:\bookmenu-docker\app\frontend\Dockerfile" -Encoding UTF8 -NoNewline
```

**Conteúdo do Dockerfile (para criar manualmente):**

```dockerfile
# Dependencies stage
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

> **Nota:** Este Dockerfile também usa `pnpm`. Certifique-se de que o projeto frontend tenha o arquivo `pnpm-lock.yaml`. Se o frontend usar `npm`, substitua os comandos `pnpm` por `npm ci` e `npm run build`.

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

```powershell
$dockerCompose = @'
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
      - //c/bookmenu-docker/volumes/backups:/backups
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
      - //c/bookmenu-docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - //c/bookmenu-docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - //c/bookmenu-docker/volumes/nginx-ssl:/etc/nginx/ssl:ro
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
'@

$dockerCompose | Out-File -FilePath "C:\bookmenu-docker\app\docker-compose.yml" -Encoding UTF8 -NoNewline
```

> **Nota sobre paths no Windows**: No Docker Desktop com WSL2, use `//c/` para mapear caminhos do Windows (ex: `//c/bookmenu-docker/...`). Alternativamente, use volumes nomeados para melhor performance.

---

## 🚀 Fase 9: Deploy

### 9.1 Criar Script de Deploy (PowerShell)

```powershell
$deployScript = @'
#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Script de deploy do BookMenu para Windows
.DESCRIPTION
    Automatiza o processo de build e deploy dos containers Docker
#>

param(
    [switch]$NoBuild,
    [switch]$NoBackup
)

$ErrorActionPreference = "Stop"

# Configurações
$APP_DIR = "C:\bookmenu-docker\app"
$ENV_FILE = "$APP_DIR\.env.production"
$BACKUP_DIR = "C:\bookmenu-docker\volumes\backups"

# Funções de log
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Green }
function Write-Warn { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Err { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Verificar pré-requisitos
function Test-Prerequisites {
    Write-Info "Verificando pré-requisitos..."

    # Verificar Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Err "Docker não está instalado ou não está no PATH"
        exit 1
    }

    # Verificar se Docker está rodando
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Docker não está rodando. Inicie o Docker Desktop."
        exit 1
    }

    # Verificar arquivo de ambiente
    if (-not (Test-Path $ENV_FILE)) {
        Write-Err "Arquivo $ENV_FILE não encontrado"
        exit 1
    }

    Write-Info "Pré-requisitos OK"
}

# Backup do banco
function Backup-Database {
    if ($NoBackup) {
        Write-Warn "Backup ignorado (flag -NoBackup)"
        return
    }

    Write-Info "Criando backup do banco..."

    $containerRunning = docker ps --filter "name=bookmenu-db" --format "{{.Names}}" 2>$null
    if ($containerRunning) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupName = "backup-$timestamp.sql"
        docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "$BACKUP_DIR\$backupName"
        Write-Info "Backup criado: $backupName"
    } else {
        Write-Warn "Container do banco não está rodando, pulando backup"
    }
}

# Build das imagens
function Build-Images {
    if ($NoBuild) {
        Write-Warn "Build ignorado (flag -NoBuild)"
        return
    }

    Write-Info "Construindo imagens Docker..."
    Set-Location $APP_DIR
    docker compose --env-file $ENV_FILE build --no-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Falha no build das imagens"
        exit 1
    }
    Write-Info "Imagens construídas"
}

# Deploy
function Start-Deploy {
    Write-Info "Fazendo deploy..."
    Set-Location $APP_DIR

    # Parar containers existentes
    docker compose --env-file $ENV_FILE down 2>$null

    # Iniciar containers
    docker compose --env-file $ENV_FILE up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Falha ao iniciar containers"
        exit 1
    }

    Write-Info "Containers iniciados"
}

# Verificar saúde
function Test-Health {
    Write-Info "Verificando saúde dos serviços..."

    $maxAttempts = 30
    $attempt = 1

    while ($attempt -le $maxAttempts) {
        $healthyContainers = docker ps --filter "health=healthy" --format "{{.Names}}" | Where-Object { $_ -like "bookmenu*" }

        if ($healthyContainers.Count -ge 3) {
            Write-Info "Serviços estão saudáveis"
            return $true
        }

        Write-Warn "Aguardando... (tentativa $attempt/$maxAttempts)"
        Start-Sleep -Seconds 10
        $attempt++
    }

    Write-Err "Serviços não ficaram saudáveis"
    return $false
}

# Executar migrações
function Invoke-Migrations {
    Write-Info "Executando migrações..."
    docker exec bookmenu-api npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Falha nas migrações (pode ser normal se já estão aplicadas)"
    } else {
        Write-Info "Migrações executadas"
    }
}

# Limpeza
function Clear-Resources {
    Write-Info "Limpando recursos não utilizados..."
    docker image prune -f
    docker system prune -f --volumes=false
    Write-Info "Limpeza concluída"
}

# Main
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  DEPLOY BOOKMENU - $(Get-Date)" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan

    Test-Prerequisites
    Backup-Database
    Build-Images
    Start-Deploy

    if (Test-Health) {
        Invoke-Migrations
        Clear-Resources
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "  DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
    } else {
        Write-Err "Deploy falhou - verificar logs"
        docker compose --env-file $ENV_FILE logs
        exit 1
    }
}

Main
'@

$deployScript | Out-File -FilePath "C:\bookmenu-docker\scripts\deploy.ps1" -Encoding UTF8
```

### 9.2 Executar Deploy

```powershell
# Executar como Administrador
Set-Location C:\bookmenu-docker\scripts

# Deploy completo
.\deploy.ps1

# Deploy sem rebuild
.\deploy.ps1 -NoBuild

# Deploy sem backup
.\deploy.ps1 -NoBackup
```

---

## ✅ Fase 10: Verificação

### 10.1 Verificar Containers

```powershell
# Status dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs em tempo real
docker compose -f C:\bookmenu-docker\app\docker-compose.yml logs -f

# Logs específicos
docker logs bookmenu-api -f
docker logs bookmenu-db -f
docker logs bookmenu-proxy -f

# Verificar uso de recursos
docker stats --no-stream
```

### 10.2 Testar Endpoints

```powershell
# Health check (ignorar erro de certificado para auto-assinado)
Invoke-WebRequest -Uri "https://localhost/health" -SkipCertificateCheck

# API Health
Invoke-WebRequest -Uri "https://localhost/api/health" -SkipCertificateCheck

# Ou usando curl
curl -k https://localhost/health
curl -k https://localhost/api/health
```

### 10.3 Verificar Banco de Dados

```powershell
# Conectar ao banco
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu

# Dentro do psql:
# \dt          -- Listar tabelas
# \l           -- Listar bancos
# \q           -- Sair
```

### 10.4 Acessar via Navegador

Abra o navegador e acesse:

- **Aplicação**: https://localhost (aceite o aviso de certificado auto-assinado)
- **API**: https://localhost/api/health

---

## 🔄 Fase 11: Manutenção

### 11.1 Comandos Úteis

```powershell
# Reiniciar serviços
docker compose -f C:\bookmenu-docker\app\docker-compose.yml restart

# Parar serviços
docker compose -f C:\bookmenu-docker\app\docker-compose.yml down

# Ver logs
docker compose -f C:\bookmenu-docker\app\docker-compose.yml logs -f --tail=100

# Atualizar aplicação
Set-Location C:\bookmenu-docker\app
git pull
C:\bookmenu-docker\scripts\deploy.ps1

# Backup manual
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "C:\bookmenu-docker\volumes\backups\backup-$timestamp.sql"

# Restore backup
Get-Content "C:\bookmenu-docker\volumes\backups\backup.sql" | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu
```

### 11.2 Configurar Backup Automático (Task Scheduler)

```powershell
# Criar script de backup
$backupScript = @'
$BACKUP_DIR = "C:\bookmenu-docker\volumes\backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "backup-$timestamp.sql"

# Criar backup
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "$BACKUP_DIR\$backupName"

# Manter apenas últimos 7 dias
Get-ChildItem -Path $BACKUP_DIR -Filter "backup-*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
    Remove-Item -Force

Write-Host "Backup criado: $backupName"
'@

$backupScript | Out-File -FilePath "C:\bookmenu-docker\scripts\backup.ps1" -Encoding UTF8

# Criar tarefa agendada (backup diário às 2h)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-docker\scripts\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName "BookMenu-Backup" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Backup diário do banco BookMenu"
```

### 11.3 Configurar Inicialização Automática

O Docker Desktop já inicia automaticamente com o Windows se configurado. Para garantir que os containers iniciem:

```powershell
# Os containers com restart: unless-stopped já reiniciam automaticamente

# Ou criar tarefa para iniciar containers após boot
$startupScript = @'
Start-Sleep -Seconds 60  # Aguardar Docker iniciar
Set-Location C:\bookmenu-docker\app
docker compose --env-file .env.production up -d
'@

$startupScript | Out-File -FilePath "C:\bookmenu-docker\scripts\startup.ps1" -Encoding UTF8

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-docker\scripts\startup.ps1"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "BookMenu-Startup" -Action $action -Trigger $trigger -Principal $principal -Description "Iniciar containers BookMenu"
```

---

## 🔥 Firewall do Windows

### Configurar Regras de Firewall

```powershell
# Permitir HTTP
New-NetFirewallRule -DisplayName "BookMenu HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Permitir HTTPS
New-NetFirewallRule -DisplayName "BookMenu HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Permitir Docker (se necessário)
New-NetFirewallRule -DisplayName "Docker" -Direction Inbound -Program "C:\Program Files\Docker\Docker\resources\com.docker.backend.exe" -Action Allow

# Verificar regras
Get-NetFirewallRule -DisplayName "BookMenu*" | Format-Table Name, DisplayName, Enabled, Direction
```

---

## 📊 Monitoramento (Opcional)

### Adicionar Prometheus + Grafana

```powershell
$monitoringCompose = @'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: bookmenu-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - //c/bookmenu-docker/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
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
'@

$monitoringCompose | Out-File -FilePath "C:\bookmenu-docker\app\docker-compose.monitoring.yml" -Encoding UTF8

# Criar configuração do Prometheus
$prometheusConfig = @'
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
      - targets: ['host.docker.internal:9323']
'@

$prometheusConfig | Out-File -FilePath "C:\bookmenu-docker\monitoring\prometheus.yml" -Encoding UTF8

# Iniciar monitoramento
docker compose -f C:\bookmenu-docker\app\docker-compose.yml -f C:\bookmenu-docker\app\docker-compose.monitoring.yml up -d
```

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Docker não inicia

```powershell
# Verificar se WSL2 está instalado
wsl --status

# Reiniciar serviço Docker
Restart-Service docker

# Ou reiniciar Docker Desktop via interface
```

#### 2. Erro de permissão em volumes

```powershell
# Verificar compartilhamento de drives no Docker Desktop
# Settings > Resources > File Sharing

# Ou usar volumes nomeados em vez de bind mounts
```

#### 3. Containers não se comunicam

```powershell
# Verificar rede
docker network ls
docker network inspect bookmenu-network

# Recriar rede
docker network rm bookmenu-network
docker network create bookmenu-network
```

#### 4. Porta já em uso

```powershell
# Verificar processo usando a porta
netstat -ano | findstr :80
netstat -ano | findstr :443

# Matar processo (substitua PID)
taskkill /PID <PID> /F

# Ou parar IIS se estiver rodando
iisreset /stop
```

#### 5. Problemas de memória

```powershell
# Verificar uso de memória dos containers
docker stats

# Ajustar limites do WSL2 (editar .wslconfig)
notepad "$env:USERPROFILE\.wslconfig"
# Depois: wsl --shutdown
```

#### 6. Logs de erro

```powershell
# Ver logs de todos os containers
docker compose -f C:\bookmenu-docker\app\docker-compose.yml logs

# Ver logs de container específico
docker logs bookmenu-api --tail 100

# Seguir logs em tempo real
docker logs -f bookmenu-api
```

---

## 🎉 Conclusão

Após seguir todos os passos, você terá:

✅ Docker Desktop instalado e configurado no Windows 11
✅ WSL2 habilitado para melhor performance
✅ Aplicação containerizada (Backend + Frontend)
✅ Banco de dados PostgreSQL
✅ Proxy reverso Nginx com SSL
✅ Backups automáticos via Task Scheduler
✅ Scripts de deploy automatizados em PowerShell
✅ Firewall configurado

### Acessos:

| Serviço               | URL                   |
| --------------------- | --------------------- |
| Aplicação             | https://localhost     |
| API                   | https://localhost/api |
| Grafana (opcional)    | http://localhost:3001 |
| Prometheus (opcional) | http://localhost:9090 |

### Estrutura Final:

```
C:\bookmenu-docker\
├── app\
│   ├── backend\
│   │   └── Dockerfile
│   ├── frontend\
│   │   └── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.monitoring.yml
│   └── .env.production
├── nginx\
│   ├── nginx.conf
│   └── conf.d\
│       └── bookmenu.conf
├── monitoring\
│   └── prometheus.yml
├── scripts\
│   ├── deploy.ps1
│   ├── backup.ps1
│   └── startup.ps1
├── secrets\
└── volumes\
    ├── postgres-data\
    ├── app-logs\
    ├── nginx-ssl\
    │   ├── cert.pem
    │   └── key.pem
    └── backups\
```

### Comandos Rápidos:

```powershell
# Deploy
C:\bookmenu-docker\scripts\deploy.ps1

# Status
docker ps

# Logs
docker compose -f C:\bookmenu-docker\app\docker-compose.yml logs -f

# Parar
docker compose -f C:\bookmenu-docker\app\docker-compose.yml down

# Backup manual
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > backup.sql
```

---

## 📋 Referência de Comandos Úteis

Esta seção contém todos os comandos mais utilizados durante o deploy e manutenção do sistema.

### 🐳 Docker Compose - Comandos Básicos

```powershell
# Definir variável para facilitar (opcional)
$COMPOSE_FILE = "C:\bookmenu-docker\app\docker-compose.yml"
$ENV_FILE = "C:\bookmenu-docker\app\.env.production"

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

```powershell
# Rebuild completo (todos os serviços)
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production build --no-cache

# Rebuild apenas do backend
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production build --no-cache backend

# Rebuild apenas do frontend
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production build --no-cache frontend

# Rebuild e reiniciar um serviço específico
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production up -d --build backend
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production up -d --build frontend

# Rebuild completo e reiniciar tudo
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production up -d --build
```

### 📊 Logs e Monitoramento

```powershell
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
```

### 🗄️ Prisma - Comandos de Banco de Dados

```powershell
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
# Nota: precisa expor porta adicional ou executar localmente
docker exec -it bookmenu-api npx prisma studio
```

### 💾 Backup e Restore do Banco

```powershell
# Backup manual
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "C:\bookmenu-docker\volumes\backups\backup-$timestamp.sql"

# Restore de backup
Get-Content "C:\bookmenu-docker\volumes\backups\backup-XXXXXXXX-XXXXXX.sql" | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu

# Conectar ao banco via psql
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu

# Comandos úteis dentro do psql:
# \dt          -- Listar tabelas
# \l           -- Listar bancos
# \d tabela    -- Descrever tabela
# \q           -- Sair
```

### 🌐 Configuração do Arquivo Hosts

```powershell
# Abrir arquivo hosts como Administrador
notepad C:\Windows\System32\drivers\etc\hosts

# Adicionar entrada (exemplo):
# 127.0.0.1 menu.cravil.com.br

# Ou via PowerShell (como Administrador):
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1 menu.cravil.com.br"

# Verificar se a entrada foi adicionada
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "menu.cravil"

# Limpar cache DNS após alterar hosts
ipconfig /flushdns
```

### 🔐 Certificados SSL

```powershell
# Gerar certificado auto-assinado
Set-Location C:\bookmenu-docker\volumes\nginx-ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout key.pem `
  -out cert.pem `
  -subj "/C=BR/ST=Santa Catarina/L=Rio do Sul/O=Cravil/CN=menu.cravil.com.br"

# Verificar certificado
openssl x509 -in cert.pem -text -noout

# Verificar data de expiração
openssl x509 -in cert.pem -noout -dates
```

### ⚙️ Nginx - Atualizar Configuração

> **⚠️ IMPORTANTE:** Arquivos de configuração do nginx devem ser criados SEM BOM (Byte Order Mark) para evitar erros de parsing.

```powershell
# Método correto para criar/atualizar nginx.conf (sem BOM)
$nginxContent = @'
# Seu conteúdo nginx aqui...
'@

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("C:\bookmenu-docker\nginx\nginx.conf", $nginxContent, $utf8NoBom)

# Método correto para criar/atualizar bookmenu.conf (sem BOM)
$siteContent = @'
# Seu conteúdo do site aqui...
'@

[System.IO.File]::WriteAllText("C:\bookmenu-docker\nginx\conf.d\bookmenu.conf", $siteContent, $utf8NoBom)

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

```powershell
# Editar arquivo de ambiente
notepad C:\bookmenu-docker\app\.env.production

# Após alterar variáveis do BACKEND (runtime):
docker compose -f C:\bookmenu-docker\app\docker-compose.yml restart backend

# Após alterar variáveis NEXT_PUBLIC_* (build time):
docker compose -f C:\bookmenu-docker\app\docker-compose.yml --env-file C:\bookmenu-docker\app\.env.production up -d --build frontend

# Verificar variáveis de ambiente de um container
docker exec bookmenu-api env
docker exec bookmenu-web env
```

### 🧹 Limpeza e Manutenção

```powershell
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
```

### 🔍 Debug e Troubleshooting

```powershell
# Entrar no container do backend
docker exec -it bookmenu-api sh

# Entrar no container do frontend
docker exec -it bookmenu-web sh

# Entrar no container do nginx
docker exec -it bookmenu-proxy sh

# Verificar se porta está em uso
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Testar conectividade interna (de dentro do nginx)
docker exec bookmenu-proxy curl -f http://bookmenu-api:8080/api-docs/
docker exec bookmenu-proxy curl -f http://bookmenu-web:3000

# Verificar rede Docker
docker network ls
docker network inspect app_bookmenu-network

# Verificar health check
docker inspect --format='{{json .State.Health}}' bookmenu-api | ConvertFrom-Json
docker inspect --format='{{json .State.Health}}' bookmenu-web | ConvertFrom-Json

# Ver eventos do Docker
docker events --since="1h"
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

```powershell
# 1. Navegar para o diretório
Set-Location C:\bookmenu-docker\app

# 2. Parar containers existentes
docker compose --env-file .env.production down

# 3. Atualizar código (se usando git)
Set-Location backend; git pull; Set-Location ..
Set-Location frontend; git pull; Set-Location ..

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
