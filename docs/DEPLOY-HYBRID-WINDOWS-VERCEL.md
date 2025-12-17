# 🌐 Deploy Híbrido Windows 11: Frontend Vercel + Backend Local

Este guia detalha como configurar o Sistema BookMenu com o **frontend na Vercel** e o **backend (API) rodando localmente** no servidor Windows 11 da empresa.

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
│   │              SERVIDOR WINDOWS 11 DA EMPRESA                   │  │
│   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐   │  │
│   │  │   Nginx     │───►│  Backend    │───►│   PostgreSQL    │   │  │
│   │  │  (Docker)   │    │  (Docker)   │    │   (Docker)      │   │  │
│   │  │  :443/:80   │    │  :8080      │    │   :5432         │   │  │
│   │  └─────────────┘    └─────────────┘    └─────────────────┘   │  │
│   │       ▲                                                       │  │
│   │       │ Port Forward (Roteador)                               │  │
│   └───────┼──────────────────────────────────────────────────────┘  │
│           │                                                          │
│     api.empresa.com.br (SSL via win-acme)                           │
└──────────────────────────────────────────────────────────────────────┘
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

1. **Windows 11 Pro/Enterprise** - 64-bit com virtualização habilitada
2. **IP Público ou Domínio** - O servidor precisa ser acessível pela internet
3. **Certificado SSL válido** - Obrigatório para HTTPS (Let's Encrypt via win-acme)
4. **Porta 443 liberada** - No firewall/roteador da empresa
5. **Domínio configurado** - Apontando para o IP público da empresa
6. **Acesso de Administrador** - Para executar comandos PowerShell

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

## 🔧 Fase 1: Preparação do Servidor Windows 11

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

### 1.3 Instalar WSL2

Após reiniciar, abra o PowerShell como Administrador:

```powershell
# Instalar WSL2
wsl --install

# Definir WSL2 como padrão
wsl --set-default-version 2

# Instalar Ubuntu (opcional, mas útil)
wsl --install -d Ubuntu-22.04

# Verificar instalação
wsl --list --verbose
```

### 1.4 Configurar Timezone

```powershell
# Verificar timezone atual
Get-TimeZone

# Configurar timezone (exemplo: Brasília)
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

```powershell
# Criar/editar arquivo .wslconfig
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

> **Nota:** Ajuste `memory` e `processors` conforme os recursos disponíveis. Recomendado: 50-75% da RAM total.

### 2.4 Verificar Instalação

```powershell
# Verificar versões
docker --version
docker compose version

# Testar Docker
docker run hello-world
```

---

## 📁 Fase 3: Estrutura de Diretórios e Configuração de Rede

### 3.1 Criar Estrutura de Pastas

```powershell
# Definir diretório base
$BASE_DIR = "C:\bookmenu-api"

# Criar estrutura de diretórios
$directories = @(
    "$BASE_DIR\app",
    "$BASE_DIR\volumes\postgres-data",
    "$BASE_DIR\volumes\backups",
    "$BASE_DIR\volumes\nginx-ssl",
    "$BASE_DIR\nginx\conf.d",
    "$BASE_DIR\scripts"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Host "Criado: $dir" -ForegroundColor Green
}

# Visualizar estrutura
tree $BASE_DIR /F
```

### 3.2 Configurar IP Fixo

```powershell
# Obter nome do adaptador de rede
Get-NetAdapter

# Configurar IP fixo (ajuste conforme sua rede)
New-NetIPAddress -InterfaceAlias "Ethernet" `
    -IPAddress 192.168.1.100 `
    -PrefixLength 24 `
    -DefaultGateway 192.168.1.1

# Configurar DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
    -ServerAddresses ("8.8.8.8","8.8.4.4")

# Verificar configuração
Get-NetIPAddress -InterfaceAlias "Ethernet"
```

### 3.3 Configurar Firewall do Windows

```powershell
# Permitir HTTP
New-NetFirewallRule -DisplayName "BookMenu HTTP" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 80 `
    -Action Allow

# Permitir HTTPS
New-NetFirewallRule -DisplayName "BookMenu HTTPS" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 443 `
    -Action Allow

# Verificar regras
Get-NetFirewallRule -DisplayName "BookMenu*" | Format-Table Name, DisplayName, Enabled, Direction
```

### 3.4 Configurar Port Forwarding no Roteador

Acesse o painel do roteador da empresa e configure:

| Porta Externa | Porta Interna | IP Interno    | Protocolo |
| ------------- | ------------- | ------------- | --------- |
| 80            | 80            | 192.168.1.100 | TCP       |
| 443           | 443           | 192.168.1.100 | TCP       |

> **Nota:** Substitua `192.168.1.100` pelo IP fixo configurado no passo 3.2.

---

## 🔐 Fase 4: Configurar SSL com win-acme

### 4.1 Baixar e Instalar win-acme

```powershell
# Baixar win-acme
$wacmeUrl = "https://github.com/win-acme/win-acme/releases/download/v2.2.9.1701/win-acme.v2.2.9.1701.x64.pluggable.zip"
Invoke-WebRequest -Uri $wacmeUrl -OutFile "$env:TEMP\win-acme.zip"

# Extrair
Expand-Archive -Path "$env:TEMP\win-acme.zip" -DestinationPath "C:\tools\win-acme"

# Verificar instalação
C:\tools\win-acme\wacs.exe --version
```

### 4.2 Obter Certificados Let's Encrypt

```powershell
# Executar win-acme interativamente
C:\tools\win-acme\wacs.exe

# Siga as instruções:
# 1. Escolha "N" para criar novo certificado
# 2. Escolha "2" para validação HTTP
# 3. Digite seu domínio: api.empresa.com.br
# 4. Digite seu email
# 5. Aceite os termos
```

> **Importante:** A porta 80 deve estar aberta e acessível pela internet para validação HTTP.

### 4.3 Copiar Certificados para Volume do Nginx

```powershell
# Localização dos certificados gerados
$certPath = "C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates"

# Copiar certificados
Copy-Item "$certPath\api.empresa.com.br.pem" `
    -Destination "C:\bookmenu-api\volumes\nginx-ssl\cert.pem"

Copy-Item "$certPath\api.empresa.com.br-key.pem" `
    -Destination "C:\bookmenu-api\volumes\nginx-ssl\key.pem"

# Verificar
Get-ChildItem "C:\bookmenu-api\volumes\nginx-ssl"
```

### 4.4 Configurar Renovação Automática

```powershell
# Criar script de renovação
$renewScript = @'
# Renovar certificados
C:\tools\win-acme\wacs.exe --renew --baseuri https://acme-v02.api.letsencrypt.org/

# Copiar novos certificados
$certPath = "C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates"
Copy-Item "$certPath\api.empresa.com.br.pem" -Destination "C:\bookmenu-api\volumes\nginx-ssl\cert.pem" -Force
Copy-Item "$certPath\api.empresa.com.br-key.pem" -Destination "C:\bookmenu-api\volumes\nginx-ssl\key.pem" -Force

# Reiniciar Nginx
docker restart bookmenu-proxy

Write-Host "SSL renovado em $(Get-Date)"
'@

$renewScript | Out-File -FilePath "C:\bookmenu-api\scripts\renew-ssl.ps1" -Encoding UTF8

# Agendar renovação diária às 3:00 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-api\scripts\renew-ssl.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 3:00AM

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" `
    -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName "BookMenu-SSL-Renew" `
    -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
    -Description "Renovação automática de certificados SSL"
```

---

## 🐳 Fase 5: Configurar Docker Backend-Only

### 5.1 Clonar Repositório do Backend

```powershell
Set-Location C:\bookmenu-api\app
git clone https://github.com/seu-usuario/bookmenu-api.git .
```

### 5.2 Criar Arquivo de Ambiente

```powershell
# Gerar senhas seguras
$dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "DB_PASSWORD: $dbPassword" -ForegroundColor Cyan
Write-Host "JWT_SECRET: $jwtSecret" -ForegroundColor Cyan

# Criar arquivo .env.production
$envContent = @"
# ===========================================
# BOOKMENU API - Produção (Backend Only)
# ===========================================

# Database
DB_NAME=bookmenu
DB_USER=bookmenu_user
DB_PASSWORD=$dbPassword
DB_PORT=5432

# Application
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
VERSION=1.0.0

# JWT
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - IMPORTANTE: Apenas o domínio da Vercel!
CORS_ORIGIN=https://bookmenu.vercel.app

# Frontend URL
FRONTEND_URL=https://bookmenu.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Docker
COMPOSE_PROJECT_NAME=bookmenu-api
DOCKER_BUILDKIT=1
"@

$envContent | Out-File -FilePath "C:\bookmenu-api\app\.env.production" -Encoding UTF8
```

### 5.3 Criar docker-compose.yml

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
      - //c/bookmenu-api/volumes/backups:/backups
    networks:
      - bookmenu-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-bookmenu_user} -d ${DB_NAME:-bookmenu}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

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

  nginx:
    image: nginx:alpine
    container_name: bookmenu-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - //c/bookmenu-api/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - //c/bookmenu-api/nginx/conf.d:/etc/nginx/conf.d:ro
      - //c/bookmenu-api/volumes/nginx-ssl:/etc/nginx/ssl:ro
    networks:
      - bookmenu-network
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  bookmenu-network:
    driver: bridge

volumes:
  postgres_data:
'@

$dockerCompose | Out-File -FilePath "C:\bookmenu-api\app\docker-compose.yml" -Encoding UTF8 -NoNewline
```

> **Nota:** No Windows com Docker Desktop + WSL2, use `//c/` para bind mounts de paths do Windows.

---

## 🌐 Fase 6: Configurar Nginx (API Only)

### 6.1 Criar nginx.conf

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

    log_format main '\`$remote_addr - \`$remote_user [\`$time_local] "\`$request" '
                    '\`$status \`$body_bytes_sent "\`$http_referer" '
                    '"\`$http_user_agent" "\`$http_x_forwarded_for"';

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

# Criar arquivo SEM BOM (importante!)
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("C:\bookmenu-api\nginx\nginx.conf", $nginxConf, $utf8NoBom)
```

### 6.2 Criar api.conf

```powershell
$apiConf = @'
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
    return 301 https://$host$request_uri;
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
    set $cors_origin "https://bookmenu.vercel.app";

    # API Routes
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
'@

# Criar arquivo SEM BOM (importante!)
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("C:\bookmenu-api\nginx\conf.d\api.conf", $apiConf, $utf8NoBom)
```

> **Importante:** Arquivos de configuração do Nginx devem ser criados SEM BOM (Byte Order Mark) para evitar erros de parsing.

---

## 🚀 Fase 7: Scripts PowerShell de Manutenção

### 7.1 Script de Deploy

```powershell
$deployScript = @'
#Requires -RunAsAdministrator
param([switch]$NoBuild, [switch]$NoBackup)

$ErrorActionPreference = "Stop"
$APP_DIR = "C:\bookmenu-api\app"
$ENV_FILE = "$APP_DIR\.env.production"

function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Green }
function Write-Warn { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }

Write-Info "Iniciando deploy..."
Set-Location $APP_DIR

if (-not $NoBackup) {
    Write-Info "Criando backup..."
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "C:\bookmenu-api\volumes\backups\backup-$timestamp.sql"
}

if (-not $NoBuild) {
    Write-Info "Construindo imagens..."
    docker compose --env-file $ENV_FILE build --no-cache
}

Write-Info "Parando containers..."
docker compose --env-file $ENV_FILE down

Write-Info "Iniciando containers..."
docker compose --env-file $ENV_FILE up -d

Write-Info "Executando migrações..."
Start-Sleep -Seconds 30
docker exec bookmenu-api npx prisma migrate deploy

Write-Info "Deploy concluído!"
'@

$deployScript | Out-File -FilePath "C:\bookmenu-api\scripts\deploy.ps1" -Encoding UTF8
```

### 7.2 Script de Backup

```powershell
$backupScript = @'
$BACKUP_DIR = "C:\bookmenu-api\volumes\backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "backup-$timestamp.sql"

docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "$BACKUP_DIR\$backupName"

# Manter apenas últimos 7 dias
Get-ChildItem -Path $BACKUP_DIR -Filter "backup-*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
    Remove-Item -Force

Write-Host "Backup criado: $backupName"
'@

$backupScript | Out-File -FilePath "C:\bookmenu-api\scripts\backup.ps1" -Encoding UTF8

# Agendar backup diário às 2:00 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-api\scripts\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "BookMenu-Backup" `
    -Action $action -Trigger $trigger -Principal $principal `
    -Description "Backup diário do banco BookMenu"
```

### 7.3 Script de Monitoramento

```powershell
$monitorScript = @'
Write-Host "=== Status dos Containers ===" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n=== Uso de Recursos ===" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

Write-Host "`n=== Últimos Logs da API ===" -ForegroundColor Cyan
docker logs bookmenu-api --tail 20

Write-Host "`n=== Últimos Logs do Nginx ===" -ForegroundColor Cyan
docker logs bookmenu-proxy --tail 10
'@

$monitorScript | Out-File -FilePath "C:\bookmenu-api\scripts\monitor.ps1" -Encoding UTF8
```

### 7.4 Script de Startup

```powershell
$startupScript = @'
Start-Sleep -Seconds 60  # Aguardar Docker Desktop iniciar
Set-Location C:\bookmenu-api\app
docker compose --env-file .env.production up -d
Write-Host "Containers iniciados em $(Get-Date)"
'@

$startupScript | Out-File -FilePath "C:\bookmenu-api\scripts\startup.ps1" -Encoding UTF8

# Agendar para inicialização do sistema
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-api\scripts\startup.ps1"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "BookMenu-Startup" `
    -Action $action -Trigger $trigger -Principal $principal `
    -Description "Iniciar containers BookMenu na inicialização"
```

---

## 🎯 Fase 8: Deploy do Backend

### 8.1 Executar Deploy

```powershell
# Executar como Administrador
Set-Location C:\bookmenu-api\scripts

# Deploy completo
.\deploy.ps1

# Ou deploy sem rebuild
.\deploy.ps1 -NoBuild
```

### 8.2 Verificar Status

```powershell
# Status dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Testar API localmente
curl http://localhost:8080/api-docs

# Ver logs
docker logs bookmenu-api --tail 50
```

---

## ☁️ Fase 9: Deploy do Frontend na Vercel

### 9.1 Preparar Projeto Frontend

No repositório do frontend, configure a variável de ambiente:

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.empresa.com.br/api
```

### 9.2 Configurar next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Não precisa de output: "standalone" para Vercel

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
```

### 9.3 Deploy via GitHub (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_API_URL = https://api.empresa.com.br/api
   ```
5. Clique em "Deploy"

### 9.4 Atualizar CORS no Backend

Após saber o domínio final da Vercel:

```powershell
# Editar .env.production
notepad C:\bookmenu-api\app\.env.production
# Atualizar: CORS_ORIGIN=https://seu-projeto.vercel.app

# Editar nginx/conf.d/api.conf
notepad C:\bookmenu-api\nginx\conf.d\api.conf
# Atualizar: set $cors_origin "https://seu-projeto.vercel.app";

# Reiniciar containers
docker restart bookmenu-api bookmenu-proxy
```

---

## 🔄 Fase 10: Configurar DDNS (Opcional - IP Dinâmico)

Se a empresa tem IP dinâmico, use um serviço de DDNS:

### 10.1 Opções de Serviços DDNS Gratuitos

1. **No-IP** (gratuito): [noip.com](https://noip.com)
2. **DuckDNS** (gratuito): [duckdns.org](https://duckdns.org)
3. **Cloudflare** (gratuito): Use a API para atualizar

### 10.2 Exemplo com DuckDNS

```powershell
# Criar script de atualização
$ddnsScript = @'
$DOMAIN = "seu-subdominio"
$TOKEN = "seu-token-duckdns"

$response = Invoke-WebRequest -Uri "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=" -UseBasicParsing

if ($response.Content -eq "OK") {
    Write-Host "DDNS atualizado: $(Get-Date)"
} else {
    Write-Error "Falha ao atualizar DDNS"
}
'@

$ddnsScript | Out-File -FilePath "C:\bookmenu-api\scripts\update-ddns.ps1" -Encoding UTF8

# Agendar atualização a cada 5 minutos
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-api\scripts\update-ddns.ps1"

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "BookMenu-DDNS-Update" `
    -Action $action -Trigger $trigger -Principal $principal `
    -Description "Atualizar DDNS a cada 5 minutos"
```

---

## 🧪 Fase 11: Testes de Integração

### 11.1 Testar API Externamente

```powershell
# Do seu computador local (fora da rede da empresa)
Invoke-WebRequest -Uri "https://api.empresa.com.br/health" -UseBasicParsing

# Testar endpoint da API
Invoke-WebRequest -Uri "https://api.empresa.com.br/api/api-docs" -UseBasicParsing
```

### 11.2 Testar CORS

```javascript
// Execute no console do navegador (F12) estando no site da Vercel
fetch("https://api.empresa.com.br/api/health", {
  method: "GET",
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => console.log("Sucesso:", data))
  .catch((err) => console.error("Erro CORS:", err))
```

### 11.3 Verificar SSL

```powershell
# Verificar certificado (requer OpenSSL)
openssl s_client -connect api.empresa.com.br:443 -servername api.empresa.com.br

# Verificar data de expiração
openssl x509 -in C:\bookmenu-api\volumes\nginx-ssl\cert.pem -noout -dates
```

### 11.4 Testar do Frontend na Vercel

Acesse o site na Vercel e verifique:

1. ✅ Login funciona
2. ✅ Dados são carregados
3. ✅ Operações CRUD funcionam
4. ✅ Não há erros de CORS no console (F12)

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Docker Desktop não inicia

```powershell
# Verificar se WSL2 está instalado
wsl --status

# Reiniciar Docker Desktop
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

#### 2. Porta já em uso

```powershell
# Verificar processo usando a porta
netstat -ano | findstr :80
netstat -ano | findstr :443

# Matar processo (substitua <PID>)
taskkill /PID <PID> /F

# Ou parar IIS se estiver rodando
iisreset /stop
```

#### 3. Erro de CORS

```
Access to fetch at 'https://api...' from origin 'https://...' has been blocked by CORS policy
```

**Solução:**

```powershell
# 1. Verificar CORS_ORIGIN no .env.production
notepad C:\bookmenu-api\app\.env.production

# 2. Verificar nginx/conf.d/api.conf
notepad C:\bookmenu-api\nginx\conf.d\api.conf

# 3. Reiniciar containers
docker restart bookmenu-api bookmenu-proxy
```

#### 4. API não acessível externamente

1. Verificar port forwarding no roteador
2. Verificar firewall: `Get-NetFirewallRule -DisplayName "BookMenu*"`
3. Verificar se o domínio resolve: `nslookup api.empresa.com.br`
4. Testar localmente: `curl http://localhost:8080/api-docs`

#### 5. Certificado SSL inválido

```powershell
# Regenerar certificado
C:\tools\win-acme\wacs.exe --renew

# Copiar novos certificados
$certPath = "C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates"
Copy-Item "$certPath\api.empresa.com.br.pem" -Destination "C:\bookmenu-api\volumes\nginx-ssl\cert.pem" -Force
Copy-Item "$certPath\api.empresa.com.br-key.pem" -Destination "C:\bookmenu-api\volumes\nginx-ssl\key.pem" -Force

# Reiniciar Nginx
docker restart bookmenu-proxy
```

#### 6. Frontend não conecta na API

1. Verificar `NEXT_PUBLIC_API_URL` na Vercel
2. Fazer redeploy após alterar variáveis de ambiente
3. Verificar console do navegador (F12) para erros específicos

---

## 📋 Comandos Úteis PowerShell

### Docker Compose

```powershell
# Definir variáveis para facilitar
$COMPOSE_FILE = "C:\bookmenu-api\app\docker-compose.yml"
$ENV_FILE = "C:\bookmenu-api\app\.env.production"

# Iniciar containers
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d

# Parar containers
docker compose -f $COMPOSE_FILE down

# Reiniciar containers
docker compose -f $COMPOSE_FILE restart

# Ver logs
docker compose -f $COMPOSE_FILE logs -f --tail=100

# Rebuild completo
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE build --no-cache
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
```

### Logs e Monitoramento

```powershell
# Logs do backend
docker logs bookmenu-api -f

# Logs do Nginx
docker logs bookmenu-proxy -f

# Status dos containers
docker ps

# Uso de recursos
docker stats --no-stream

# Executar script de monitoramento
C:\bookmenu-api\scripts\monitor.ps1
```

### Backup e Restore

```powershell
# Backup manual
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec bookmenu-db pg_dump -U bookmenu_user bookmenu > "C:\bookmenu-api\volumes\backups\backup-$timestamp.sql"

# Restore de backup
Get-Content "C:\bookmenu-api\volumes\backups\backup-XXXXXXXX-XXXXXX.sql" | docker exec -i bookmenu-db psql -U bookmenu_user -d bookmenu

# Conectar ao banco
docker exec -it bookmenu-db psql -U bookmenu_user -d bookmenu
```

### Prisma

```powershell
# Executar migrações
docker exec bookmenu-api npx prisma migrate deploy

# Ver status das migrações
docker exec bookmenu-api npx prisma migrate status

# Gerar Prisma Client
docker exec bookmenu-api npx prisma generate
```

### Nginx

```powershell
# Testar configuração
docker exec bookmenu-proxy nginx -t

# Recarregar configuração
docker exec bookmenu-proxy nginx -s reload

# Reiniciar container
docker restart bookmenu-proxy
```

---

## 📋 Checklist Final

### Backend (Servidor Windows 11)

- [ ] Docker Desktop instalado e funcionando
- [ ] WSL2 habilitado e configurado
- [ ] Containers rodando (postgres, backend, nginx)
- [ ] SSL configurado com certificado válido (win-acme)
- [ ] Firewall configurado (portas 80, 443)
- [ ] Port forwarding configurado no roteador
- [ ] Domínio apontando para IP público
- [ ] CORS configurado para domínio da Vercel
- [ ] Rate limiting ativo
- [ ] Backup automático configurado (Task Scheduler)
- [ ] Renovação SSL automática configurada (Task Scheduler)
- [ ] Scripts PowerShell funcionando

### Frontend (Vercel)

- [ ] Projeto deployado na Vercel
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Build passando sem erros
- [ ] Domínio customizado (opcional)

### Testes

- [ ] API acessível externamente via HTTPS
- [ ] Frontend carrega corretamente
- [ ] Login/autenticação funciona
- [ ] Operações CRUD funcionam
- [ ] Sem erros de CORS no console (F12)
- [ ] Performance aceitável

---

## 🎉 Conclusão

Após seguir todos os passos, você terá:

✅ **Backend seguro no Windows 11** - Docker Desktop + WSL2 + win-acme
✅ **Frontend global na Vercel** - CDN mundial + deploy automático
✅ **SSL válido e renovação automática** - Let's Encrypt via win-acme
✅ **CORS configurado** - Apenas domínio Vercel autorizado
✅ **Rate limiting ativo** - Proteção contra abusos
✅ **Backups automáticos** - Task Scheduler + PostgreSQL dumps
✅ **Scripts de manutenção** - PowerShell para deploy, backup, monitor
✅ **Acesso global** - Funcionários podem acessar de qualquer lugar

### Acessos:

| Serviço           | URL                                 |
| ----------------- | ----------------------------------- |
| Frontend (Vercel) | https://seu-projeto.vercel.app      |
| API (Local)       | https://api.empresa.com.br/api      |
| API Docs (Local)  | https://api.empresa.com.br/api-docs |

### Estrutura Final:

```
C:\bookmenu-api\
├── app\
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.production
│   └── [código fonte backend]
├── nginx\
│   ├── nginx.conf
│   └── conf.d\
│       └── api.conf
├── scripts\
│   ├── deploy.ps1
│   ├── backup.ps1
│   ├── monitor.ps1
│   ├── renew-ssl.ps1
│   ├── startup.ps1
│   └── update-ddns.ps1
└── volumes\
    ├── postgres-data\
    ├── backups\
    └── nginx-ssl\
        ├── cert.pem
        └── key.pem
```

### Comandos Rápidos:

```powershell
# Deploy
C:\bookmenu-api\scripts\deploy.ps1

# Status
docker ps

# Logs
docker logs bookmenu-api -f

# Backup manual
C:\bookmenu-api\scripts\backup.ps1

# Monitoramento
C:\bookmenu-api\scripts\monitor.ps1
```

### Custos Estimados

| Item                 | Custo         |
| -------------------- | ------------- |
| Vercel (Hobby)       | Gratuito      |
| Let's Encrypt        | Gratuito      |
| Domínio (.com.br)    | ~R$40/ano     |
| Servidor (existente) | R$0           |
| **Total**            | **~R$40/ano** |

---

## 📚 Recursos Adicionais

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [win-acme Documentation](https://www.win-acme.com/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [PowerShell Documentation](https://docs.microsoft.com/powershell/)

---

## 🔧 Troubleshooting Avançado Windows 11

### Problemas Específicos do Windows

#### 1. WSL2 não funciona após instalação

```powershell
# Verificar se virtualização está habilitada no BIOS
Get-ComputerInfo | Select-Object -Property "HyperV*"

# Verificar se WSL2 está definido como padrão
wsl --status

# Forçar atualização do kernel WSL2
wsl --update

# Reiniciar WSL2
wsl --shutdown
```

#### 2. Docker Desktop falha ao iniciar

```powershell
# Verificar se Hyper-V está habilitado
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Verificar se containers estão habilitados
Get-WindowsOptionalFeature -Online -FeatureName Containers

# Limpar dados do Docker Desktop (CUIDADO: remove todos os containers)
# Vá em Docker Desktop > Settings > Troubleshoot > Clean / Purge data
```

#### 3. Problemas com bind mounts (//c/ não funciona)

```powershell
# Verificar se WSL integration está habilitada
# Docker Desktop > Settings > Resources > WSL Integration

# Testar bind mount manualmente
docker run --rm -v //c/bookmenu-api:/test alpine ls -la /test

# Alternativa: usar volumes nomeados
docker volume create nginx-config
docker cp C:\bookmenu-api\nginx\nginx.conf nginx-config:/nginx.conf
```

#### 4. Task Scheduler não executa scripts

```powershell
# Verificar se a tarefa existe
Get-ScheduledTask -TaskName "BookMenu*"

# Verificar histórico da tarefa
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-TaskScheduler/Operational'; ID=201}

# Testar execução manual
Start-ScheduledTask -TaskName "BookMenu-Backup"

# Verificar permissões do script
Get-Acl "C:\bookmenu-api\scripts\backup.ps1"
```

#### 5. win-acme não consegue validar domínio

```powershell
# Verificar se porta 80 está acessível externamente
Test-NetConnection -ComputerName api.empresa.com.br -Port 80

# Verificar se IIS está rodando (pode conflitar)
Get-Service -Name W3SVC

# Parar IIS temporariamente
Stop-Service -Name W3SVC -Force

# Verificar logs do win-acme
Get-Content "C:\ProgramData\win-acme\log.txt" -Tail 50
```

#### 6. Problemas de encoding em arquivos de configuração

```powershell
# Verificar encoding do arquivo
Get-Content "C:\bookmenu-api\nginx\nginx.conf" -Encoding Byte | Select-Object -First 3

# Se mostrar EF BB BF (BOM), recriar sem BOM
$content = Get-Content "C:\bookmenu-api\nginx\nginx.conf" -Raw
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("C:\bookmenu-api\nginx\nginx.conf", $content, $utf8NoBom)
```

### Scripts de Diagnóstico

#### Script de Health Check Completo

```powershell
# Criar script de diagnóstico completo
$healthScript = @'
Write-Host "=== DIAGNÓSTICO COMPLETO BOOKMENU ===" -ForegroundColor Yellow

# 1. Verificar Docker Desktop
Write-Host "`n1. Docker Desktop:" -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado" -ForegroundColor Red
}

# 2. Verificar WSL2
Write-Host "`n2. WSL2:" -ForegroundColor Cyan
try {
    $wslStatus = wsl --status
    Write-Host "✅ WSL2 funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ WSL2 com problemas" -ForegroundColor Red
}

# 3. Verificar containers
Write-Host "`n3. Containers:" -ForegroundColor Cyan
$containers = docker ps --format "{{.Names}}: {{.Status}}"
if ($containers) {
    $containers | ForEach-Object { Write-Host "✅ $_" -ForegroundColor Green }
} else {
    Write-Host "❌ Nenhum container rodando" -ForegroundColor Red
}

# 4. Verificar portas
Write-Host "`n4. Portas:" -ForegroundColor Cyan
$ports = @(80, 443, 8080, 5432)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Porta $port aberta" -ForegroundColor Green
    } else {
        Write-Host "❌ Porta $port fechada" -ForegroundColor Red
    }
}

# 5. Verificar certificados SSL
Write-Host "`n5. Certificados SSL:" -ForegroundColor Cyan
$certPath = "C:\bookmenu-api\volumes\nginx-ssl\cert.pem"
if (Test-Path $certPath) {
    try {
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath)
        $daysUntilExpiry = ($cert.NotAfter - (Get-Date)).Days
        if ($daysUntilExpiry -gt 30) {
            Write-Host "✅ Certificado válido por $daysUntilExpiry dias" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Certificado expira em $daysUntilExpiry dias" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erro ao ler certificado" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Certificado não encontrado" -ForegroundColor Red
}

# 6. Verificar firewall
Write-Host "`n6. Firewall:" -ForegroundColor Cyan
$firewallRules = Get-NetFirewallRule -DisplayName "BookMenu*" -ErrorAction SilentlyContinue
if ($firewallRules) {
    $firewallRules | ForEach-Object {
        $status = if ($_.Enabled) { "✅" } else { "❌" }
        Write-Host "$status $($_.DisplayName): $($_.Enabled)" -ForegroundColor $(if ($_.Enabled) { "Green" } else { "Red" })
    }
} else {
    Write-Host "❌ Regras de firewall não encontradas" -ForegroundColor Red
}

# 7. Verificar Task Scheduler
Write-Host "`n7. Tarefas Agendadas:" -ForegroundColor Cyan
$tasks = Get-ScheduledTask -TaskName "BookMenu*" -ErrorAction SilentlyContinue
if ($tasks) {
    $tasks | ForEach-Object {
        $status = if ($_.State -eq "Ready") { "✅" } else { "❌" }
        Write-Host "$status $($_.TaskName): $($_.State)" -ForegroundColor $(if ($_.State -eq "Ready") { "Green" } else { "Red" })
    }
} else {
    Write-Host "❌ Tarefas agendadas não encontradas" -ForegroundColor Red
}

# 8. Teste de conectividade externa (se possível)
Write-Host "`n8. Conectividade Externa:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.empresa.com.br/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API acessível externamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API retornou código $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API não acessível externamente: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIM DO DIAGNÓSTICO ===" -ForegroundColor Yellow
'@

$healthScript | Out-File -FilePath "C:\bookmenu-api\scripts\health-check.ps1" -Encoding UTF8
```

#### Script de Limpeza de Emergência

```powershell
# Criar script para limpeza em caso de problemas
$cleanupScript = @'
#Requires -RunAsAdministrator
Write-Host "=== LIMPEZA DE EMERGÊNCIA BOOKMENU ===" -ForegroundColor Yellow

# Parar todos os containers
Write-Host "Parando containers..." -ForegroundColor Cyan
docker stop $(docker ps -q) 2>$null

# Remover containers
Write-Host "Removendo containers..." -ForegroundColor Cyan
docker rm $(docker ps -aq) 2>$null

# Remover imagens não utilizadas
Write-Host "Limpando imagens..." -ForegroundColor Cyan
docker image prune -f

# Remover volumes não utilizados
Write-Host "Limpando volumes..." -ForegroundColor Cyan
docker volume prune -f

# Remover redes não utilizadas
Write-Host "Limpando redes..." -ForegroundColor Cyan
docker network prune -f

# Reiniciar Docker Desktop
Write-Host "Reiniciando Docker Desktop..." -ForegroundColor Cyan
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "✅ Limpeza concluída. Aguarde Docker Desktop reiniciar." -ForegroundColor Green
'@

$cleanupScript | Out-File -FilePath "C:\bookmenu-api\scripts\emergency-cleanup.ps1" -Encoding UTF8
```

### Logs Centralizados

#### Script para Coletar Todos os Logs

```powershell
# Script para coletar logs para suporte
$logCollectorScript = @'
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logDir = "C:\bookmenu-api\logs-$timestamp"
New-Item -ItemType Directory -Path $logDir -Force

Write-Host "Coletando logs em: $logDir"

# Logs do Docker
docker logs bookmenu-api > "$logDir\backend.log" 2>&1
docker logs bookmenu-proxy > "$logDir\nginx.log" 2>&1
docker logs bookmenu-db > "$logDir\postgres.log" 2>&1

# Logs do Windows
Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=(Get-Date).AddHours(-24)} |
    Where-Object {$_.ProviderName -like "*Docker*"} |
    Export-Csv "$logDir\windows-docker.csv" -NoTypeInformation

# Logs do Task Scheduler
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-TaskScheduler/Operational'; StartTime=(Get-Date).AddHours(-24)} |
    Export-Csv "$logDir\task-scheduler.csv" -NoTypeInformation

# Configurações atuais
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" > "$logDir\containers-status.txt"
Get-NetFirewallRule -DisplayName "BookMenu*" | Format-Table > "$logDir\firewall-rules.txt"
Get-ScheduledTask -TaskName "BookMenu*" | Format-Table > "$logDir\scheduled-tasks.txt"

# Compactar logs
Compress-Archive -Path $logDir -DestinationPath "$logDir.zip"
Remove-Item -Path $logDir -Recurse -Force

Write-Host "✅ Logs coletados em: $logDir.zip"
'@

$logCollectorScript | Out-File -FilePath "C:\bookmenu-api\scripts\collect-logs.ps1" -Encoding UTF8
```

---

## 🆘 Suporte

Se encontrar problemas:

1. **Execute o diagnóstico completo**: `C:\bookmenu-api\scripts\health-check.ps1`
2. **Verifique os logs**: `docker logs bookmenu-api`
3. **Execute o monitoramento**: `C:\bookmenu-api\scripts\monitor.ps1`
4. **Consulte a seção de Troubleshooting Avançado** acima
5. **Colete logs para suporte**: `C:\bookmenu-api\scripts\collect-logs.ps1`
6. **Em caso de emergência**: `C:\bookmenu-api\scripts\emergency-cleanup.ps1`

### Comandos de Diagnóstico Rápido

```powershell
# Status geral
docker ps && docker stats --no-stream

# Verificar conectividade
Test-NetConnection -ComputerName api.empresa.com.br -Port 443

# Verificar certificado
openssl x509 -in C:\bookmenu-api\volumes\nginx-ssl\cert.pem -noout -dates

# Verificar CORS
Invoke-WebRequest -Uri "https://api.empresa.com.br/health" -UseBasicParsing

# Verificar logs recentes
docker logs bookmenu-api --tail 50
```

**Arquitetura Híbrida = Melhor dos dois mundos! 🚀**
