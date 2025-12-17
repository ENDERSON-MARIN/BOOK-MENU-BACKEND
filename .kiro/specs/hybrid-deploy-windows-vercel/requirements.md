# Requirements Document

## Introduction

Este documento especifica os requisitos para configurar um deploy híbrido do Sistema BookMenu, onde o backend (API) permanece no servidor Windows 11 local da empresa e o frontend é hospedado na Vercel. Esta arquitetura permite que funcionários acessem o sistema de qualquer lugar com internet, mantendo os dados sensíveis dentro da infraestrutura da empresa.

O deploy será realizado exclusivamente via PowerShell no Windows 11, utilizando Docker Desktop com WSL2 como backend, e win-acme para gerenciamento de certificados SSL.

## Glossary

- **Backend**: Servidor API Node.js/Express que processa requisições e gerencia dados
- **Frontend**: Aplicação Next.js que fornece a interface do usuário
- **Vercel**: Plataforma de hospedagem para aplicações frontend com CDN global
- **Nginx**: Servidor web usado como reverse proxy para rotear requisições (rodando em container Docker)
- **SSL/TLS**: Protocolo de segurança para criptografar comunicações HTTPS
- **CORS**: Cross-Origin Resource Sharing - mecanismo de segurança para requisições entre domínios
- **win-acme**: Cliente ACME para Windows que automatiza obtenção de certificados Let's Encrypt
- **Port Forwarding**: Redirecionamento de portas do roteador para o servidor interno Windows
- **DDNS**: Dynamic DNS - serviço que mapeia IP dinâmico para um domínio fixo
- **Rate Limiting**: Limitação de requisições por IP para prevenir abusos
- **Docker Desktop**: Plataforma de containerização para Windows com interface gráfica
- **WSL2**: Windows Subsystem for Linux 2 - backend para Docker Desktop rodar containers Linux
- **PowerShell**: Shell de linha de comando e linguagem de script para Windows
- **Task Scheduler**: Agendador de tarefas nativo do Windows para automação
- **Windows Firewall**: Firewall nativo do Windows para controle de tráfego de rede
- **Chocolatey**: Gerenciador de pacotes para Windows (similar ao apt/yum do Linux)
- **IP Fixo Local**: Endereço IP estático configurado no adaptador de rede do Windows

## Requirements

### Requirement 1: Configuração de Rede e Acesso Externo no Windows 11

**User Story:** Como administrador de TI, quero configurar o servidor Windows 11 para ser acessível pela internet via PowerShell, para que a API possa receber requisições do frontend na Vercel.

#### Acceptance Criteria

1. WHEN o administrador executa comandos PowerShell para configurar IP fixo THEN o Sistema SHALL atribuir um endereço IP estático ao adaptador de rede do Windows 11
2. WHEN o administrador configura port forwarding no roteador THEN o Sistema SHALL redirecionar as portas 80 e 443 para o IP interno fixo do servidor Windows 11
3. WHEN o servidor recebe requisições nas portas 80 ou 443 THEN o Sistema SHALL processar as requisições através do Nginx containerizado no Docker Desktop
4. WHEN a empresa possui IP dinâmico THEN o Sistema SHALL executar script PowerShell via Task Scheduler para atualizar serviço DDNS a cada 5 minutos
5. WHEN o administrador executa comandos New-NetFirewallRule no PowerShell THEN o Sistema SHALL criar regras no Windows Firewall permitindo tráfego HTTP (80) e HTTPS (443) inbound

### Requirement 2: Configuração SSL/TLS com win-acme no Windows 11

**User Story:** Como administrador de TI, quero configurar certificados SSL válidos usando win-acme no Windows 11, para que a comunicação entre o frontend na Vercel e o backend local seja segura.

#### Acceptance Criteria

1. WHEN o administrador baixa e executa win-acme via PowerShell THEN o Sistema SHALL instalar o cliente ACME em C:\tools\win-acme
2. WHEN o administrador executa wacs.exe interativamente THEN o Sistema SHALL obter certificados Let's Encrypt válidos para o domínio configurado
3. WHEN os certificados são gerados THEN o Sistema SHALL armazenar os arquivos .pem em C:\ProgramData\win-acme\acme-v02.api.letsencrypt.org\Certificates
4. WHEN o administrador copia certificados para o volume do Nginx THEN o Sistema SHALL copiar cert.pem e key.pem para C:\bookmenu-api\volumes\nginx-ssl
5. WHEN o Nginx container inicia com certificados configurados THEN o Sistema SHALL servir a API exclusivamente via HTTPS na porta 443
6. WHEN uma requisição HTTP chega na porta 80 THEN o Sistema SHALL redirecionar com código 301 para HTTPS na porta 443
7. WHEN um certificado está próximo da expiração THEN o Sistema SHALL executar script PowerShell via Task Scheduler para renovar automaticamente usando win-acme
8. WHEN a renovação é bem-sucedida THEN o Sistema SHALL copiar novos certificados para o volume do Nginx e recarregar o container

### Requirement 3: Configuração CORS

**User Story:** Como desenvolvedor, quero configurar CORS corretamente, para que apenas o frontend autorizado na Vercel possa acessar a API.

#### Acceptance Criteria

1. WHEN uma requisição chega de um domínio não autorizado THEN o Sistema SHALL rejeitar a requisição com erro CORS
2. WHEN uma requisição chega do domínio da Vercel configurado THEN o Sistema SHALL permitir a requisição e incluir headers CORS apropriados
3. WHEN uma requisição OPTIONS (preflight) é recebida THEN o Sistema SHALL responder com os headers CORS permitidos
4. WHEN o domínio da Vercel muda THEN o Sistema SHALL permitir atualização da configuração CORS sem rebuild dos containers

### Requirement 4: Configuração Docker Backend-Only no Windows 11

**User Story:** Como administrador de TI, quero configurar apenas os containers necessários para o backend via PowerShell e Docker Desktop, para que o servidor local rode de forma otimizada sem o frontend.

#### Acceptance Criteria

1. WHEN o administrador cria estrutura de diretórios via PowerShell THEN o Sistema SHALL criar C:\bookmenu-api com subpastas app, nginx, volumes, scripts usando New-Item cmdlet
2. WHEN o administrador executa docker compose via PowerShell THEN o Sistema SHALL iniciar apenas os containers de PostgreSQL, Backend API e Nginx (sem container de frontend)
3. WHEN o docker-compose.yml é configurado THEN o Sistema SHALL usar volumes nomeados do Docker para postgres_data e bind mounts com sintaxe //c/ para paths do Windows
4. WHEN o container do backend inicia THEN o Sistema SHALL conectar ao PostgreSQL via rede Docker e executar npx prisma migrate deploy
5. WHEN o container do Nginx inicia THEN o Sistema SHALL rotear requisições /api/\* para o backend na porta 8080
6. WHEN um container falha THEN o Sistema SHALL reiniciar automaticamente devido à política restart: unless-stopped
7. WHEN o administrador verifica status via PowerShell THEN o Sistema SHALL exibir containers rodando com comando docker ps

### Requirement 5: Rate Limiting e Segurança

**User Story:** Como administrador de segurança, quero implementar rate limiting e proteções, para que a API exposta na internet esteja protegida contra abusos.

#### Acceptance Criteria

1. WHEN um IP excede 10 requisições por segundo na API THEN o Sistema SHALL bloquear temporariamente requisições adicionais desse IP
2. WHEN um IP excede 3 tentativas de login em 15 minutos THEN o Sistema SHALL bloquear tentativas de autenticação desse IP
3. WHEN headers de segurança são configurados THEN o Sistema SHALL incluir X-Frame-Options, X-Content-Type-Options, HSTS e X-XSS-Protection
4. WHEN uma requisição maliciosa é detectada THEN o Sistema SHALL registrar o evento nos logs do Nginx

### Requirement 6: Deploy Frontend na Vercel

**User Story:** Como desenvolvedor, quero fazer deploy do frontend na Vercel, para que os usuários possam acessar a aplicação de qualquer lugar com internet.

#### Acceptance Criteria

1. WHEN o código é enviado ao repositório Git THEN o Sistema SHALL iniciar deploy automático na Vercel
2. WHEN o deploy é executado THEN o Sistema SHALL configurar a variável NEXT_PUBLIC_API_URL apontando para a API local
3. WHEN o frontend é acessado THEN o Sistema SHALL carregar a aplicação via CDN global da Vercel
4. WHEN o frontend faz requisições à API THEN o Sistema SHALL enviar requisições HTTPS para o domínio configurado

### Requirement 7: Scripts de Manutenção PowerShell para Windows 11

**User Story:** Como administrador de TI, quero ter scripts PowerShell para manutenção, para que eu possa gerenciar o sistema facilmente no Windows 11.

#### Acceptance Criteria

1. WHEN o script deploy.ps1 é executado como Administrador THEN o Sistema SHALL verificar pré-requisitos, parar containers, rebuild imagens e reiniciar serviços usando docker compose
2. WHEN o script backup.ps1 é executado THEN o Sistema SHALL criar dump do PostgreSQL com timestamp usando docker exec e pg_dump, salvando em C:\bookmenu-api\volumes\backups
3. WHEN o script backup.ps1 limpa backups antigos THEN o Sistema SHALL remover arquivos .sql com mais de 7 dias usando Get-ChildItem e Where-Object
4. WHEN o script monitor.ps1 é executado THEN o Sistema SHALL exibir status dos containers com docker ps, uso de recursos com docker stats e logs recentes com docker logs
5. WHEN o script renew-ssl.ps1 é executado THEN o Sistema SHALL executar win-acme para renovar certificados, copiar para volume do Nginx e executar docker restart
6. WHEN scripts são agendados via Task Scheduler THEN o Sistema SHALL criar tarefas usando New-ScheduledTaskAction e Register-ScheduledTask cmdlets
7. WHEN o script startup.ps1 é executado na inicialização THEN o Sistema SHALL aguardar 60 segundos para Docker Desktop iniciar e então executar docker compose up -d

### Requirement 8: Documentação e Guia de Deploy para Windows 11

**User Story:** Como administrador de TI, quero uma documentação completa em português adaptada para Windows 11, para que eu possa seguir o processo de deploy passo a passo usando PowerShell.

#### Acceptance Criteria

1. WHEN o administrador consulta a documentação THEN o Sistema SHALL fornecer instruções claras para cada fase do deploy com comandos PowerShell específicos para Windows 11
2. WHEN comandos PowerShell são fornecidos THEN o Sistema SHALL incluir nota sobre executar como Administrador (Win + X > Terminal Admin)
3. WHEN ocorre um erro comum THEN o Sistema SHALL fornecer seção de troubleshooting com soluções específicas para Windows (netstat, taskkill, Get-NetFirewallRule)
4. WHEN configurações de rede são necessárias THEN o Sistema SHALL fornecer diagramas e instruções para configurar IP fixo via PowerShell e port forwarding no roteador
5. WHEN paths do Windows são usados THEN o Sistema SHALL usar sintaxe correta (C:\, //c/ para Docker, $env:USERPROFILE)
6. WHEN arquivos de configuração são criados THEN o Sistema SHALL usar Out-File com -Encoding UTF8 -NoNewline para evitar BOM
7. WHEN Task Scheduler é configurado THEN o Sistema SHALL fornecer comandos completos com New-ScheduledTaskAction, New-ScheduledTaskTrigger e Register-ScheduledTask
8. WHEN win-acme é configurado THEN o Sistema SHALL fornecer instruções para download, instalação em C:\tools\win-acme e configuração interativa
