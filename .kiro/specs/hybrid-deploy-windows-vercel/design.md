# Design Document: Deploy Híbrido Windows 11 + Vercel

## Overview

Este documento detalha a arquitetura e implementação do deploy híbrido do Sistema BookMenu, com backend no servidor Windows 11 local e frontend na Vercel. A solução permite acesso global mantendo dados sensíveis na infraestrutura da empresa, utilizando exclusivamente PowerShell para gerenciamento no Windows 11.

### Arquitetura de Alto Nível

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

## Architecture

### Componentes do Sistema

#### 1. Servidor Windows 11 (Backend)

| Componente       | Tecnologia                  | Porta   | Função                                      | Gerenciamento                  |
| ---------------- | --------------------------- | ------- | ------------------------------------------- | ------------------------------ |
| Nginx            | Docker (nginx:alpine)       | 80, 443 | Reverse proxy, SSL termination, CORS        | docker compose via PowerShell  |
| Backend API      | Docker (Node.js 22 + pnpm)  | 8080    | API REST, autenticação JWT, Prisma ORM      | docker compose via PowerShell  |
| PostgreSQL       | Docker (postgres:17-alpine) | 5432    | Banco de dados relacional                   | docker compose via PowerShell  |
| Docker Desktop   | WSL2 backend                | -       | Orquestração de containers Linux no Windows | Interface gráfica + PowerShell |
| win-acme         | Cliente ACME nativo Windows | -       | Obtenção e renovação de certificados SSL    | wacs.exe + Task Scheduler      |
| Windows Firewall | Firewall nativo             | 80, 443 | Controle de tráfego inbound                 | New-NetFirewallRule cmdlet     |
| Task Scheduler   | Agendador Windows           | -       | Automação de backups, SSL, DDNS             | Register-ScheduledTask cmdlet  |

#### 2. Vercel (Frontend)

| Componente  | Tecnologia                 | Função                           | Gerenciamento             |
| ----------- | -------------------------- | -------------------------------- | ------------------------- |
| Next.js App | Next.js 15 (App Router)    | Interface do usuário             | Deploy automático via Git |
| CDN         | Vercel Edge Network        | Distribuição global de assets    | Automático                |
| SSL         | Automático (Let's Encrypt) | Certificado HTTPS                | Automático                |
| Build       | Node.js (sem standalone)   | Compilação otimizada para Vercel | Automático no deploy      |

### Fluxo de Requisições

```mermaid
sequenceDiagram
    participant U as Usuário
    participant V as Vercel (Frontend)
    participant R as Roteador Empresa
    participant F as Windows Firewall
    participant N as Nginx (Docker)
    participant B as Backend (Docker)
    participant D as PostgreSQL (Docker)

    U->>V: Acessa https://menu.empresa.com.br
    V->>U: Retorna HTML/JS (CDN)
    U->>V: Requisição API
    V->>R: HTTPS para api.empresa.com.br
    R->>F: Port Forward 443
    F->>N: Permite tráfego (regra firewall)
    N->>N: SSL Termination + CORS
    N->>B: Proxy para :8080
    B->>D: Query SQL via Prisma
    D->>B: Resultado
    B->>N: Response JSON
    N->>F: Response + CORS Headers
    F->>R: Response
    R->>V: Response
    V->>U: Dados renderizados
```

## Components and Interfaces

### 1. Estrutura de Diretórios Windows

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
│   └── update-ddns.ps1
└── volumes\
    ├── postgres-data\
    ├── backups\
    └── nginx-ssl\
        ├── cert.pem
        └── key.pem
```

### 2. Configuração de Rede Windows

#### IP Fixo via PowerShell

```powershell
# Obter nome do adaptador
Get-NetAdapter

# Configurar IP fixo
New-NetIPAddress -InterfaceAlias "Ethernet" `
    -IPAddress 192.168.1.100 `
    -PrefixLength 24 `
    -DefaultGateway 192.168.1.1

# Configurar DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
    -ServerAddresses ("8.8.8.8","8.8.4.4")
```

#### Port Forwarding (Roteador)

```
┌─────────────────────────────────────────┐
│           ROTEADOR DA EMPRESA           │
├─────────────────────────────────────────┤
│  Porta Externa  │  Porta Interna  │ IP  │
├─────────────────┼─────────────────┼─────┤
│       80        │       80        │ .100│
│      443        │      443        │ .100│
└─────────────────┴─────────────────┴─────┘
```

#### Firewall Windows via PowerShell

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
Get-NetFirewallRule -DisplayName "BookMenu*" | Format-Table
```

### 3. Docker Compose (Backend Only)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: bookmenu-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-bookmenu}
      POSTGRES_USER: ${DB_USER:-bookmenu_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - //c/bookmenu-api/volumes/backups:/backups
    networks:
      - bookmenu-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: bookmenu-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    networks:
      - bookmenu-network
    depends_on:
      postgres:
        condition: service_healthy

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

networks:
  bookmenu-network:
    driver: bridge

volumes:
  postgres_data:
```

> **Nota:** No Windows com Docker Desktop + WSL2, use `//c/` para bind mounts de paths do Windows.

### 4. Configuração SSL com win-acme

#### Instalação via PowerShell

```powershell
# Baixar win-acme
$wacmeUrl = "https://github.com/win-acme/win-acme/releases/download/v2.2.9.1701/win-acme.v2.2.9.1701.x64.pluggable.zip"
Invoke-WebRequest -Uri $wacmeUrl -OutFile "$env:TEMP\win-acme.zip"

# Extrair
Expand-Archive -Path "$env:TEMP\win-acme.zip" -DestinationPath "C:\tools\win-acme"

# Executar interativamente
C:\tools\win-acme\wacs.exe
```

#### Localização dos Certificados

```
C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates\
├── api.empresa.com.br-chain.pem
├── api.empresa.com.br-key.pem
└── api.empresa.com.br.pem
```

#### Copiar para Volume do Nginx

```powershell
# Copiar certificados
Copy-Item "C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates\api.empresa.com.br.pem" `
    -Destination "C:\bookmenu-api\volumes\nginx-ssl\cert.pem"

Copy-Item "C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates\api.empresa.com.br-key.pem" `
    -Destination "C:\bookmenu-api\volumes\nginx-ssl\key.pem"

# Reiniciar Nginx
docker restart bookmenu-proxy
```

### 5. Configuração Nginx (CORS + SSL)

```nginx
# Rate limiting
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

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # CORS - Domínio da Vercel
    set $cors_origin "https://bookmenu.vercel.app";

    # API Routes
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        # CORS Headers
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
```

> **Importante:** Criar arquivos Nginx sem BOM usando PowerShell:

```powershell
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("C:\bookmenu-api\nginx\conf.d\api.conf", $content, $utf8NoBom)
```

### 6. Variáveis de Ambiente

#### Backend (.env.production)

```env
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/bookmenu

# JWT
JWT_SECRET=<64-chars-secret>
JWT_EXPIRES_IN=15m

# CORS - Domínio da Vercel
CORS_ORIGIN=https://bookmenu.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (Vercel Environment Variables)

```env
NEXT_PUBLIC_API_URL=https://api.empresa.com.br/api
```

> **Importante:** `NEXT_PUBLIC_*` são injetadas no build time. Mudanças requerem redeploy na Vercel.

## Data Models

### Configuração SSL

| Campo     | Tipo       | Descrição                 | Localização Windows                 |
| --------- | ---------- | ------------------------- | ----------------------------------- |
| cert.pem  | Arquivo    | Certificado público       | C:\bookmenu-api\volumes\nginx-ssl\  |
| key.pem   | Arquivo    | Chave privada             | C:\bookmenu-api\volumes\nginx-ssl\  |
| Validade  | 90 dias    | Let's Encrypt padrão      | -                                   |
| Renovação | Automática | Task Scheduler + win-acme | Task: "BookMenu-SSL-Renew"          |

### Configuração CORS

| Header                           | Valor                                  | Descrição                 |
| -------------------------------- | -------------------------------------- | ------------------------- |
| Access-Control-Allow-Origin      | https://vercel-domain                  | Domínio permitido         |
| Access-Control-Allow-Methods     | GET, POST, PUT, DELETE, PATCH, OPTIONS | Métodos HTTP              |
| Access-Control-Allow-Headers     | Content-Type, Authorization            | Headers permitidos        |
| Access-Control-Allow-Credentials | true                                   | Permite cookies/auth      |
| Access-Control-Max-Age           | 1728000                                | Cache preflight (20 dias) |

### Scripts PowerShell

| Script          | Função             | Agendamento      | Localização               |
| --------------- | ------------------ | ---------------- | ------------------------- |
| deploy.ps1      | Deploy completo    | Manual           | C:\bookmenu-api\scripts\  |
| backup.ps1      | Backup PostgreSQL  | Diário 2:00 AM   | C:\bookmenu-api\scripts\  |
| monitor.ps1     | Status e logs      | Manual           | C:\bookmenu-api\scripts\  |
| renew-ssl.ps1   | Renovar SSL        | Diário 3:00 AM   | C:\bookmenu-api\scripts\  |
| update-ddns.ps1 | Atualizar DDNS     | A cada 5 min     | C:\bookmenu-api\scripts\  |
| startup.ps1     | Iniciar containers | Na inicialização | C:\bookmenu-api\scripts\  |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: CORS Rejection for Unauthorized Origins

_For any_ HTTP request with an Origin header that is not in the configured allowed origins list, the Nginx proxy should either omit CORS headers or return an error, preventing the browser from accepting the response.

**Validates: Requirements 3.1**

### Property 2: Security Headers Presence

_For any_ HTTP response from the API (via Nginx), the response should include all required security headers: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, and X-XSS-Protection.

**Validates: Requirements 5.3**

## Error Handling

### Cenários de Erro e Mitigações (Windows 11)

| Cenário                   | Causa                          | Mitigação PowerShell                                     |
| ------------------------- | ------------------------------ | -------------------------------------------------------- |
| Docker Desktop não inicia | WSL2 não instalado             | `wsl --install` e reiniciar                              |
| Porta já em uso           | IIS ou outro serviço           | `netstat -ano \| findstr :80` e `taskkill /PID <PID> /F` |
| Certificado inválido      | Expiração ou domínio incorreto | Executar `C:\tools\win-acme\wacs.exe --renew`            |
| Container não inicia      | Erro de configuração           | `docker logs bookmenu-api --tail 100`                    |
| Firewall bloqueando       | Regra não criada               | `New-NetFirewallRule` para portas 80/443                 |
| Path não encontrado       | Sintaxe incorreta              | Usar `//c/` para bind mounts no Docker                   |

### Códigos de Erro HTTP

| Código | Significado         | Ação                                           |
| ------ | ------------------- | ---------------------------------------------- |
| 429    | Too Many Requests   | Rate limit atingido, aguardar                  |
| 502    | Bad Gateway         | Backend não respondendo, verificar `docker ps` |
| 503    | Service Unavailable | Serviço em manutenção                          |
| 504    | Gateway Timeout     | Backend lento, verificar logs                  |

### Logs e Diagnóstico via PowerShell

```powershell
# Logs do backend
docker logs bookmenu-api --tail 100

# Logs do Nginx
docker logs bookmenu-proxy --tail 100

# Status de todos os containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar portas em uso
netstat -ano | findstr :80
netstat -ano | findstr :443

# Verificar regras de firewall
Get-NetFirewallRule -DisplayName "BookMenu*"

# Verificar IP fixo
Get-NetIPAddress -InterfaceAlias "Ethernet"
```

## Testing Strategy

### Testes Manuais de Infraestrutura

Como este é um projeto de infraestrutura/deploy, a maioria dos testes são verificações manuais via PowerShell:

1. **Teste de Conectividade Externa**

   ```powershell
   # De fora da rede da empresa
   Invoke-WebRequest -Uri "https://api.empresa.com.br/health" -UseBasicParsing
   ```

2. **Teste de CORS**

   ```javascript
   // No console do navegador (F12) no site da Vercel
   fetch("https://api.empresa.com.br/api/health", {
     method: "GET",
     credentials: "include",
   }).then((r) => console.log("OK:", r.status))
   ```

3. **Teste de SSL**

   ```powershell
   # Verificar certificado (requer OpenSSL)
   openssl s_client -connect api.empresa.com.br:443 -servername api.empresa.com.br
   ```

4. **Teste de Redirecionamento HTTP→HTTPS**

   ```powershell
   Invoke-WebRequest -Uri "http://api.empresa.com.br" -MaximumRedirection 0
   # Deve retornar 301 para https://
   ```

5. **Teste de Firewall**
   ```powershell
   # Verificar se regras estão ativas
   Get-NetFirewallRule -DisplayName "BookMenu*" | Where-Object {$_.Enabled -eq $true}
   ```

### Checklist de Validação

#### Backend (Servidor Windows 11)

- [ ] Docker Desktop rodando (`docker --version`)
- [ ] Containers healthy (`docker ps --filter "health=healthy"`)
- [ ] SSL configurado e válido (verificar data de expiração)
- [ ] Firewall permite portas 80, 443 (`Get-NetFirewallRule`)
- [ ] Port forwarding configurado no roteador
- [ ] CORS configurado para domínio Vercel
- [ ] Rate limiting ativo (testar com múltiplas requisições)
- [ ] Backup automático configurado (verificar Task Scheduler)
- [ ] Scripts PowerShell funcionando (`.\deploy.ps1 -NoBuild`)

#### Frontend (Vercel)

- [ ] Deploy automático funcionando
- [ ] NEXT_PUBLIC_API_URL configurado
- [ ] Requisições à API funcionando
- [ ] Sem erros CORS no console (F12)

#### Integração

- [ ] Login funciona
- [ ] CRUD de dados funciona
- [ ] Tokens JWT válidos
- [ ] Refresh token funciona

### Property-Based Testing

Para os testes de propriedades identificados, utilizaremos verificações via scripts PowerShell que podem ser executados periodicamente:

**Biblioteca de Testes:** Scripts PowerShell com validações automatizadas

```powershell
# Exemplo: Verificar headers de segurança em todas as respostas
$response = Invoke-WebRequest -Uri "https://api.empresa.com.br/api/health" -UseBasicParsing
$headers = $response.Headers

# Verificar presença de headers obrigatórios
$requiredHeaders = @("X-Frame-Options", "X-Content-Type-Options", "Strict-Transport-Security")
foreach ($header in $requiredHeaders) {
    if (-not $headers.ContainsKey($header)) {
        Write-Error "Header ausente: $header"
    }
}
```

### Automação de Testes via Task Scheduler

```powershell
# Criar tarefa para executar testes diariamente
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\bookmenu-api\scripts\test-health.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 6:00AM

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" `
    -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "BookMenu-Health-Check" `
    -Action $action -Trigger $trigger -Principal $principal
```
