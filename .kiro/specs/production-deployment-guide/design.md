# Design Document - Guia de Deploy em Produção

## Overview

Este documento detalha o design para criar um guia completo de deploy em produção do Sistema de Reservas de Almoço Corporativo. O sistema será deployado em um servidor Ubuntu Linux local para acesso via rede interna da empresa, com duas abordagens principais: deploy tradicional (direto no SO) e deploy containerizado (Docker). O design prioriza segurança, performance, monitoramento e facilidade de manutenção.

## Architecture

### Arquitetura Geral do Sistema

```mermaid
graph TB
    subgraph "Rede Interna da Empresa"
        Users[Funcionários] --> LB[Load Balancer/Nginx]
    end

    subgraph "Servidor Ubuntu"
        LB --> Frontend[Frontend Next.js :3000]
        LB --> Backend[Backend API :8080]
        Backend --> DB[(PostgreSQL :5432)]

        subgraph "Serviços de Infraestrutura"
            PM2[Process Manager PM2]
            Monitor[Monitoring Prometheus/Grafana]
            Backup[Backup Service]
            Logs[Log Management]
        end

        PM2 --> Frontend
        PM2 --> Backend
        Monitor --> Frontend
        Monitor --> Backend
        Monitor --> DB
        Backup --> DB
    end

    subgraph "Segurança"
        Firewall[UFW Firewall]
        SSL[SSL/TLS Certificates]
        Auth[Authentication JWT]
    end
```

### Arquitetura Docker (Alternativa)

```mermaid
graph TB
    subgraph "Rede Interna da Empresa"
        Users[Funcionários] --> Nginx[Nginx Container]
    end

    subgraph "Docker Host Ubuntu"
        Nginx --> Frontend[Frontend Container :3000]
        Nginx --> Backend[Backend Container :8080]
        Backend --> DB[PostgreSQL Container :5432]

        subgraph "Docker Volumes"
            DBData[Database Data]
            AppLogs[Application Logs]
            Backups[Backup Storage]
        end

        subgraph "Docker Network"
            Internal[app-network]
        end

        DB --> DBData
        Frontend --> AppLogs
        Backend --> AppLogs
        DB --> Backups
    end
```

## Components and Interfaces

### 1. Deploy Tradicional (Ubuntu)

#### 1.1 Componentes de Sistema

- **Node.js 22+**: Runtime para backend e frontend
- **PostgreSQL 16**: Sistema de banco de dados
- **Nginx**: Reverse proxy e servidor web
- **PM2**: Gerenciador de processos
- **UFW**: Firewall
- **Certbot**: Gerenciamento de certificados SSL

#### 1.2 Estrutura de Diretórios

```
/opt/bookmenu/
├── backend/                 # API Backend
│   ├── dist/               # Código compilado
│   ├── node_modules/       # Dependências
│   ├── .env.production     # Variáveis de ambiente
│   └── ecosystem.config.js # Configuração PM2
├── frontend/               # Frontend Next.js
│   ├── .next/             # Build otimizado
│   ├── node_modules/      # Dependências
│   └── .env.production    # Variáveis de ambiente
├── scripts/               # Scripts de automação
│   ├── deploy.sh         # Script de deploy
│   ├── backup.sh         # Script de backup
│   ├── update.sh         # Script de atualização
│   └── healthcheck.sh    # Script de verificação
├── backups/              # Backups do sistema
├── logs/                 # Logs centralizados
└── ssl/                  # Certificados SSL
```

### 2. Deploy Docker

#### 2.1 Componentes Docker

- **Frontend Container**: Next.js em container Node.js Alpine
- **Backend Container**: API em container Node.js Alpine
- **Database Container**: PostgreSQL oficial
- **Nginx Container**: Proxy reverso
- **Monitoring Stack**: Prometheus + Grafana (opcional)

#### 2.2 Estrutura Docker

```
/opt/bookmenu-docker/
├── docker-compose.yml          # Orquestração principal
├── docker-compose.prod.yml     # Override para produção
├── .env.production            # Variáveis de ambiente
├── nginx/
│   ├── nginx.conf            # Configuração Nginx
│   └── ssl/                  # Certificados SSL
├── backend/
│   ├── Dockerfile           # Imagem do backend
│   └── .dockerignore       # Arquivos ignorados
├── frontend/
│   ├── Dockerfile          # Imagem do frontend
│   └── .dockerignore      # Arquivos ignorados
├── scripts/
│   ├── deploy-docker.sh   # Deploy com Docker
│   ├── backup-docker.sh   # Backup containers
│   └── update-docker.sh   # Atualização containers
└── volumes/
    ├── postgres-data/     # Dados PostgreSQL
    ├── app-logs/         # Logs aplicação
    └── backups/          # Backups
```

## Data Models

### 1. Configurações de Ambiente

#### 1.1 Backend Environment Variables

```typescript
interface BackendConfig {
  // Database
  DATABASE_URL: string // postgresql://user:pass@host:port/db

  // Server
  PORT: number // 8080
  NODE_ENV: "production"

  // Security
  JWT_SECRET: string // Token seguro gerado
  JWT_EXPIRES_IN: string // '24h'

  // CORS
  FRONTEND_URL: string // https://bookmenu.empresa.local

  // Monitoring
  LOG_LEVEL: "info" | "error"
  ENABLE_METRICS: boolean
}
```

#### 1.2 Frontend Environment Variables

```typescript
interface FrontendConfig {
  // API
  NEXT_PUBLIC_API_URL: string // https://api.bookmenu.empresa.local

  // Build
  NODE_ENV: "production"

  // Performance
  NEXT_TELEMETRY_DISABLED: "1"
}
```

### 2. Configurações de Infraestrutura

#### 2.1 Nginx Configuration

```nginx
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name bookmenu.empresa.local;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bookmenu.empresa.local;

    # SSL Configuration
    ssl_certificate /opt/bookmenu/ssl/cert.pem;
    ssl_certificate_key /opt/bookmenu/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # API Routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Routes
    location / {
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

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

#### 2.2 PM2 Ecosystem Configuration

```javascript
module.exports = {
  apps: [
    {
      name: "bookmenu-backend",
      script: "./dist/server.js",
      cwd: "/opt/bookmenu/backend",
      instances: "max",
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      log_file: "/opt/bookmenu/logs/backend-combined.log",
      out_file: "/opt/bookmenu/logs/backend-out.log",
      error_file: "/opt/bookmenu/logs/backend-error.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
    },
    {
      name: "bookmenu-frontend",
      script: "npm",
      args: "start",
      cwd: "/opt/bookmenu/frontend",
      instances: 2,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_file: "/opt/bookmenu/logs/frontend-combined.log",
      out_file: "/opt/bookmenu/logs/frontend-out.log",
      error_file: "/opt/bookmenu/logs/frontend-error.log",
      time: true,
      max_memory_restart: "512M",
    },
  ],
}
```

### 3. Docker Compose Configuration

#### 3.1 Docker Compose Principal

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: bookmenu-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bookmenu-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 8080
    volumes:
      - app_logs:/app/logs
    ports:
      - "8080:8080"
    networks:
      - app-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: bookmenu-web
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://bookmenu.empresa.local/api
    ports:
      - "3000:3000"
    networks:
      - app-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: bookmenu-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - app-network
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
    driver: local
  app_logs:
    driver: local

networks:
  app-network:
    driver: bridge
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Database Security Configuration

_For any_ PostgreSQL installation following the deployment guide, the database should have secure authentication configured, restricted access permissions, and strong password policies enforced.
**Validates: Requirements 2.3**

### Property 2: API Accessibility and Performance

_For any_ backend API deployment, when accessed from the internal network, the API should respond within acceptable time limits and handle concurrent requests efficiently.
**Validates: Requirements 1.3**

### Property 3: Firewall Port Restriction

_For any_ UFW firewall configuration, only the necessary ports (80, 443, 22, 5432) should be accessible, and all other ports should be blocked from external access.
**Validates: Requirements 2.1**

### Property 4: HTTPS Encryption

_For any_ SSL certificate installation, all HTTP traffic should be redirected to HTTPS, and all communications should use strong encryption protocols (TLS 1.2+).
**Validates: Requirements 2.2**

### Property 5: Environment Variable Protection

_For any_ system deployment, sensitive information (database passwords, JWT secrets) should be stored in environment variables and not exposed in logs, error messages, or public interfaces.
**Validates: Requirements 2.4**

### Property 6: Security Event Logging

_For any_ security logging configuration, authentication attempts, access violations, and suspicious activities should be recorded with timestamps and relevant details.
**Validates: Requirements 2.5**

### Property 7: Process Auto-Restart

_For any_ PM2 process manager configuration, when application processes crash or fail, they should automatically restart within a reasonable time frame.
**Validates: Requirements 3.1**

### Property 8: Database Query Performance

_For any_ optimized PostgreSQL configuration, common application queries should execute within acceptable time limits under normal load conditions.
**Validates: Requirements 3.2**

### Property 9: Cache Performance Improvement

_For any_ caching configuration, response times for cached content should be significantly faster than non-cached content.
**Validates: Requirements 3.3**

### Property 10: Network Traffic Compression

_For any_ compression configuration, HTTP responses should be compressed when appropriate, reducing bandwidth usage compared to uncompressed responses.
**Validates: Requirements 3.4**

### Property 11: Resource Usage Efficiency

_For any_ resource limit configuration, applications should operate within defined CPU and memory limits without degrading performance.
**Validates: Requirements 3.5**

### Property 12: Real-time Health Metrics

_For any_ monitoring system configuration, system health metrics (CPU, memory, disk, network) should be collected and updated in real-time.
**Validates: Requirements 4.1**

### Property 13: Automated Backup Creation

_For any_ backup strategy implementation, database backups should be created automatically at scheduled intervals and stored securely.
**Validates: Requirements 4.2**

### Property 14: Critical Alert Notifications

_For any_ alerting system configuration, when critical thresholds are exceeded or services fail, notifications should be sent to administrators promptly.
**Validates: Requirements 4.3**

### Property 15: Log Information Completeness

_For any_ logging configuration, system operations should be recorded with sufficient detail for troubleshooting, including timestamps, user actions, and error details.
**Validates: Requirements 4.5**

### Property 16: Docker Data Persistence

_For any_ Docker volume configuration, application data should persist across container restarts and updates without data loss.
**Validates: Requirements 5.3**

### Property 17: Docker Service Communication

_For any_ Docker network configuration, containers should be able to communicate securely within the defined network while being isolated from external networks.
**Validates: Requirements 5.4**

### Property 18: Zero-Downtime Updates

_For any_ system update process, the application should remain available to users during updates, with downtime not exceeding acceptable limits.
**Validates: Requirements 5.5**

### Property 19: Update Data Integrity

_For any_ system update, existing data should remain intact and compatible with the new version after the update process completes.
**Validates: Requirements 6.1**

### Property 20: Maintenance Downtime Minimization

_For any_ maintenance operation, system unavailability should be kept to the minimum necessary time for the operation.
**Validates: Requirements 6.2**

### Property 21: Database Migration Automation

_For any_ database schema update, migrations should be applied automatically and consistently without manual intervention.
**Validates: Requirements 6.3**

### Property 22: Network Policy Compliance

_For any_ corporate network integration, the system should respect existing network security policies and access controls.
**Validates: Requirements 7.4**

### Property 23: Load Distribution

_For any_ load balancer configuration, incoming requests should be distributed evenly across available application instances.
**Validates: Requirements 7.5**

### Property 24: Component Redundancy

_For any_ high availability configuration, critical system components should have backup instances ready to take over in case of failure.
**Validates: Requirements 10.1**

### Property 25: Automatic Failover

_For any_ failover configuration, when a primary component fails, the system should automatically switch to backup components without manual intervention.
**Validates: Requirements 10.2**

### Property 26: Database Replication

_For any_ database cluster configuration, data changes should be replicated consistently across all database nodes.
**Validates: Requirements 10.3**

### Property 27: Load Balancer Distribution

_For any_ load balancer setup, requests should be distributed across multiple application instances according to the configured algorithm.
**Validates: Requirements 10.4**

### Property 28: Disaster Recovery Time

_For any_ disaster recovery test, the system should be restored to operational state within the defined recovery time objective (RTO).
**Validates: Requirements 10.5**

## Error Handling

### 1. Deploy Tradicional - Tratamento de Erros

#### 1.1 Falhas de Instalação

- **Dependências não encontradas**: Scripts verificam disponibilidade antes da instalação
- **Permissões insuficientes**: Validação de privilégios sudo antes de executar
- **Portas em uso**: Verificação de portas disponíveis antes de configurar serviços
- **Espaço em disco**: Verificação de espaço disponível antes de instalação

#### 1.2 Falhas de Configuração

- **Banco de dados inacessível**: Retry automático com backoff exponencial
- **Certificados SSL inválidos**: Validação de certificados antes de aplicar
- **Configuração de rede**: Testes de conectividade após configuração
- **Variáveis de ambiente**: Validação de formato e valores obrigatórios

#### 1.3 Falhas de Runtime

- **Processo crashado**: PM2 reinicia automaticamente com limite de tentativas
- **Memória insuficiente**: Alertas e restart automático quando limites são atingidos
- **Disco cheio**: Rotação automática de logs e limpeza de arquivos temporários
- **Conexão de banco perdida**: Reconnect automático com pool de conexões

### 2. Deploy Docker - Tratamento de Erros

#### 2.1 Falhas de Container

- **Container não inicia**: Health checks e restart policies automáticos
- **Imagem não encontrada**: Build automático local se pull falhar
- **Volume não montado**: Verificação de volumes antes de iniciar containers
- **Rede não acessível**: Criação automática de redes se não existirem

#### 2.2 Falhas de Orquestração

- **Docker Compose falha**: Rollback automático para versão anterior
- **Dependências não atendidas**: Ordem de inicialização com health checks
- **Recursos insuficientes**: Alertas e scaling automático quando possível
- **Conflitos de porta**: Detecção e resolução automática de conflitos

### 3. Estratégias de Recuperação

#### 3.1 Backup e Restore

- **Backup automático**: Execução diária com retenção de 30 dias
- **Backup incremental**: Backup de mudanças a cada 6 horas
- **Teste de restore**: Validação mensal da integridade dos backups
- **Restore rápido**: Scripts automatizados para restauração em emergência

#### 3.2 Monitoramento e Alertas

- **Health checks**: Verificação contínua de saúde dos serviços
- **Métricas de performance**: Coleta e análise de métricas em tempo real
- **Alertas proativos**: Notificações antes que problemas se tornem críticos
- **Dashboard centralizado**: Visão unificada do status do sistema

## Testing Strategy

### 1. Testes de Infraestrutura

#### 1.1 Testes de Conectividade

- **Teste de portas**: Verificar se portas necessárias estão abertas e acessíveis
- **Teste de DNS**: Validar resolução de nomes internos
- **Teste de SSL**: Verificar certificados e criptografia
- **Teste de proxy**: Validar funcionamento do reverse proxy

#### 1.2 Testes de Performance

- **Load testing**: Simular carga de usuários simultâneos
- **Stress testing**: Testar limites do sistema
- **Benchmark de banco**: Medir performance de consultas
- **Teste de cache**: Validar eficiência do cache

#### 1.3 Testes de Segurança

- **Penetration testing**: Testes de invasão básicos
- **Vulnerability scanning**: Varredura de vulnerabilidades
- **Access control testing**: Validar controles de acesso
- **Audit logging testing**: Verificar logs de auditoria

### 2. Testes de Deploy

#### 2.1 Testes de Instalação

- **Fresh install testing**: Teste em sistema limpo
- **Upgrade testing**: Teste de atualização de versões
- **Rollback testing**: Teste de volta à versão anterior
- **Migration testing**: Teste de migração de dados

#### 2.2 Testes de Configuração

- **Environment testing**: Validar variáveis de ambiente
- **Service testing**: Verificar inicialização de serviços
- **Integration testing**: Testar integração entre componentes
- **End-to-end testing**: Teste completo do fluxo de usuário

### 3. Testes Automatizados

#### 3.1 Scripts de Validação

```bash
#!/bin/bash
# healthcheck.sh - Script de verificação de saúde

# Verificar serviços
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo "✓ $service está rodando"
        return 0
    else
        echo "✗ $service não está rodando"
        return 1
    fi
}

# Verificar conectividade
check_connectivity() {
    local host=$1
    local port=$2
    if nc -z $host $port; then
        echo "✓ $host:$port está acessível"
        return 0
    else
        echo "✗ $host:$port não está acessível"
        return 1
    fi
}

# Verificar espaço em disco
check_disk_space() {
    local threshold=80
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -lt $threshold ]; then
        echo "✓ Espaço em disco OK ($usage%)"
        return 0
    else
        echo "✗ Espaço em disco baixo ($usage%)"
        return 1
    fi
}

# Executar verificações
echo "=== Health Check do Sistema ==="
check_service nginx
check_service postgresql
check_connectivity localhost 3000
check_connectivity localhost 8080
check_connectivity localhost 5432
check_disk_space

echo "=== Verificação completa ==="
```

#### 3.2 Testes de Property-Based Testing

Para validar as propriedades de correção definidas, utilizaremos uma abordagem de testes baseada em propriedades usando ferramentas como:

- **Bash testing framework**: Para testes de infraestrutura
- **Docker health checks**: Para validação de containers
- **Monitoring alerts**: Para testes contínuos de propriedades
- **Automated testing scripts**: Para validação de deploy

### 4. Estratégia de Testes Dual

#### 4.1 Unit Tests

- Testes específicos para scripts de deploy
- Validação de configurações individuais
- Testes de funções de backup e restore
- Verificação de parsing de configurações

#### 4.2 Property-Based Tests

- Validação de propriedades universais do sistema
- Testes de invariantes de segurança
- Verificação de propriedades de performance
- Testes de propriedades de alta disponibilidade

Os testes de propriedades serão executados com no mínimo 100 iterações para garantir robustez, e cada teste será marcado com comentários referenciando as propriedades específicas do design document.
