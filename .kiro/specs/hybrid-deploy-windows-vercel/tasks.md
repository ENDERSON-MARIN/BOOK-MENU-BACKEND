# Implementation Plan: Deploy Híbrido Windows 11 + Vercel

Este plano detalha as tarefas para implementar o deploy híbrido do Sistema BookMenu com backend no Windows 11 local e frontend na Vercel.

## Tarefas

- [ ] 1. Preparar Servidor Windows 11
  - Instalar e configurar Docker Desktop com WSL2
  - Configurar ferramentas essenciais via Chocolatey
  - Criar estrutura de diretórios
  - _Requirements: 1.1, 1.5, 4.1_

- [ ] 1.1 Habilitar recursos do Windows via PowerShell
  - Executar comandos dism.exe para habilitar WSL2 e VirtualMachinePlatform
  - Executar Enable-WindowsOptionalFeature para Hyper-V e Containers
  - Reiniciar sistema
  - _Requirements: 1.1_

- [ ] 1.2 Instalar WSL2 e Docker Desktop
  - Executar `wsl --install` e configurar WSL2 como padrão
  - Baixar e instalar Docker Desktop via PowerShell
  - Configurar Docker Desktop (WSL2 engine, auto-start)
  - Criar arquivo .wslconfig para limitar recursos
  - _Requirements: 1.1_

- [ ] 1.3 Instalar ferramentas essenciais via Chocolatey
  - Instalar Chocolatey via PowerShell
  - Instalar git, vscode, openssl, curl via choco
  - Atualizar variável PATH
  - _Requirements: 1.5_

- [ ] 1.4 Criar estrutura de diretórios via PowerShell
  - Criar C:\bookmenu-api com subpastas usando New-Item
  - Criar pastas: app, nginx/conf.d, volumes/{backups,nginx-ssl}, scripts
  - Verificar estrutura com tree
  - _Requirements: 4.1_

- [ ] 2. Configurar Rede e Firewall Windows
  - Configurar IP fixo via PowerShell
  - Configurar regras de firewall
  - Documentar configuração de port forwarding
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 2.1 Configurar IP fixo no adaptador de rede
  - Obter nome do adaptador com Get-NetAdapter
  - Configurar IP estático com New-NetIPAddress
  - Configurar DNS com Set-DnsClientServerAddress
  - Verificar configuração com Get-NetIPAddress
  - _Requirements: 1.1_

- [ ] 2.2 Criar regras de firewall para HTTP e HTTPS
  - Executar New-NetFirewallRule para porta 80 (HTTP)
  - Executar New-NetFirewallRule para porta 443 (HTTPS)
  - Verificar regras com Get-NetFirewallRule
  - _Requirements: 1.5_

- [ ] 2.3 Documentar configuração de port forwarding
  - Criar documento com instruções para acessar painel do roteador
  - Documentar configuração: porta 80→IP_FIXO:80, porta 443→IP_FIXO:443
  - Incluir diagrama de rede
  - _Requirements: 1.2_

- [ ] 3. Configurar SSL com win-acme
  - Baixar e instalar win-acme
  - Obter certificados Let's Encrypt
  - Copiar certificados para volume do Nginx
  - Configurar renovação automática
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 2.8_

- [ ] 3.1 Baixar e instalar win-acme via PowerShell
  - Baixar win-acme com Invoke-WebRequest
  - Extrair com Expand-Archive para C:\tools\win-acme
  - Verificar instalação executando wacs.exe --version
  - _Requirements: 2.1_

- [ ] 3.2 Obter certificados Let's Encrypt interativamente
  - Executar C:\tools\win-acme\wacs.exe
  - Configurar domínio api.empresa.com.br
  - Validar via HTTP (porta 80 deve estar aberta)
  - Verificar certificados em C:\ProgramData\win-acme\
  - _Requirements: 2.2, 2.3_

- [ ] 3.3 Copiar certificados para volume do Nginx
  - Copiar .pem para C:\bookmenu-api\volumes\nginx-ssl\cert.pem
  - Copiar -key.pem para C:\bookmenu-api\volumes\nginx-ssl\key.pem
  - Verificar permissões dos arquivos
  - _Requirements: 2.4_

- [ ] 3.4 Criar script de renovação SSL
  - Criar renew-ssl.ps1 que executa win-acme --renew
  - Script deve copiar novos certificados para volume do Nginx
  - Script deve executar docker restart bookmenu-proxy
  - Testar script manualmente
  - _Requirements: 2.7, 2.8_

- [ ] 3.5 Agendar renovação SSL via Task Scheduler
  - Criar tarefa com New-ScheduledTaskAction
  - Configurar trigger diário às 3:00 AM
  - Configurar principal como SYSTEM com RunLevel Highest
  - Registrar tarefa com Register-ScheduledTask
  - _Requirements: 2.7_

- [ ] 4. Configurar Docker Backend-Only
  - Criar arquivo .env.production
  - Criar docker-compose.yml (apenas backend)
  - Criar Dockerfile do backend
  - Configurar Nginx para API only
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 4.1 Criar arquivo .env.production com variáveis
  - Gerar senhas seguras com openssl rand -base64
  - Configurar DATABASE_URL, JWT_SECRET, CORS_ORIGIN
  - Configurar CORS_ORIGIN para domínio Vercel
  - Salvar em C:\bookmenu-api\app\.env.production
  - _Requirements: 3.1, 3.2_

- [ ] 4.2 Criar docker-compose.yml para backend only
  - Configurar serviço postgres com volumes nomeados
  - Configurar serviço backend com build context
  - Configurar serviço nginx com bind mounts usando //c/
  - Configurar rede bookmenu-network
  - Remover serviço frontend (não necessário)
  - _Requirements: 4.2, 4.3_

- [ ] 4.3 Criar Dockerfile do backend
  - Stage builder: instalar pnpm, copiar package.json, build
  - Stage production: copiar dist, node_modules, prisma
  - Configurar healthcheck para /api-docs
  - Configurar USER bookmenu (non-root)
  - _Requirements: 4.4_

- [ ] 4.4 Criar configuração Nginx para API only
  - Criar nginx.conf principal
  - Criar api.conf com upstream backend
  - Configurar rate limiting (api_limit, auth_limit)
  - Configurar redirect HTTP→HTTPS
  - Configurar CORS headers para domínio Vercel
  - Configurar proxy_pass para /api/\* → backend:8080
  - Usar encoding UTF8 sem BOM ao criar arquivos
  - _Requirements: 3.2, 3.3, 4.5, 5.1, 5.2, 5.3_

- [ ] 4.5 Testar containers localmente
  - Executar docker compose up -d via PowerShell
  - Verificar status com docker ps
  - Verificar logs com docker logs
  - Testar API localmente: curl http://localhost:8080/api-docs
  - _Requirements: 4.6, 4.7_

- [ ] 5. Criar Scripts PowerShell de Manutenção
  - Criar script de deploy
  - Criar script de backup
  - Criar script de monitoramento
  - Criar script de startup
  - _Requirements: 7.1, 7.2, 7.3, 7.7_

- [ ] 5.1 Criar script deploy.ps1
  - Implementar função Test-Prerequisites (verificar Docker, .env)
  - Implementar função Backup-Database (pg_dump)
  - Implementar função Build-Images (docker compose build)
  - Implementar função Start-Deploy (docker compose up -d)
  - Implementar função Test-Health (verificar containers healthy)
  - Implementar função Invoke-Migrations (prisma migrate deploy)
  - Adicionar parâmetros -NoBuild e -NoBackup
  - _Requirements: 7.1_

- [ ] 5.2 Criar script backup.ps1
  - Executar docker exec pg_dump com timestamp
  - Salvar em C:\bookmenu-api\volumes\backups\
  - Limpar backups com mais de 7 dias usando Get-ChildItem
  - Adicionar logging
  - _Requirements: 7.2, 7.3_

- [ ] 5.3 Criar script monitor.ps1
  - Exibir status com docker ps --format
  - Exibir uso de recursos com docker stats --no-stream
  - Exibir logs recentes com docker logs --tail
  - Formatar output de forma legível
  - _Requirements: 7.4_

- [ ] 5.4 Criar script startup.ps1
  - Aguardar 60 segundos para Docker Desktop iniciar
  - Executar docker compose up -d
  - Adicionar logging
  - _Requirements: 7.7_

- [ ] 5.5 Agendar scripts via Task Scheduler
  - Agendar backup.ps1 diariamente às 2:00 AM
  - Agendar startup.ps1 na inicialização do sistema
  - Configurar tarefas com SYSTEM user e RunLevel Highest
  - Testar tarefas manualmente
  - _Requirements: 7.6_

- [ ] 6. Configurar DDNS (Opcional para IP Dinâmico)
  - Criar conta em serviço DDNS
  - Criar script de atualização
  - Agendar atualização periódica
  - _Requirements: 1.4_

- [ ] 6.1 Criar script update-ddns.ps1
  - Configurar domínio e token do serviço DDNS
  - Executar curl para atualizar IP
  - Adicionar logging
  - _Requirements: 1.4_

- [ ] 6.2 Agendar atualização DDNS a cada 5 minutos
  - Criar tarefa com trigger a cada 5 minutos
  - Configurar com SYSTEM user
  - Testar execução manual
  - _Requirements: 1.4, 7.6_

- [ ] 7. Deploy Frontend na Vercel
  - Configurar variáveis de ambiente
  - Configurar next.config.ts
  - Fazer deploy via GitHub
  - Atualizar CORS no backend
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 7.1 Configurar variáveis de ambiente na Vercel
  - Acessar vercel.com e criar projeto
  - Importar repositório do GitHub
  - Adicionar variável NEXT_PUBLIC_API_URL=https://api.empresa.com.br/api
  - _Requirements: 6.2_

- [ ] 7.2 Configurar next.config.ts para Vercel
  - Remover output: "standalone" (não necessário para Vercel)
  - Adicionar headers de segurança
  - Configurar rewrites se necessário
  - _Requirements: 6.2_

- [ ] 7.3 Fazer deploy na Vercel via GitHub
  - Push código para GitHub
  - Vercel detecta e inicia build automaticamente
  - Verificar build logs
  - Testar acesso ao domínio Vercel
  - _Requirements: 6.1, 6.3_

- [ ] 7.4 Atualizar CORS no backend com domínio Vercel
  - Editar .env.production: CORS_ORIGIN=https://seu-projeto.vercel.app
  - Editar nginx/conf.d/api.conf: set $cors_origin
  - Reiniciar containers: docker restart bookmenu-api bookmenu-proxy
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 8. Testes de Integração
  - Testar API externamente
  - Testar CORS
  - Testar SSL
  - Testar frontend na Vercel
  - _Requirements: Todos_

- [ ] 8.1 Testar API externamente via HTTPS
  - De fora da rede: curl https://api.empresa.com.br/health
  - Verificar resposta 200
  - Verificar certificado SSL válido
  - _Requirements: 1.3, 2.5, 2.6_

- [ ] 8.2 Testar CORS do frontend Vercel
  - Acessar site na Vercel
  - Abrir console do navegador (F12)
  - Fazer requisição fetch para API
  - Verificar ausência de erros CORS
  - _Requirements: 3.2, 3.3_

- [ ] 8.3 Testar funcionalidades end-to-end
  - Login funciona
  - CRUD de dados funciona
  - Tokens JWT válidos
  - Refresh token funciona
  - _Requirements: Todos_

- [ ] 9. Documentação Final
  - Criar guia de deploy completo
  - Documentar troubleshooting
  - Documentar comandos úteis
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 9.1 Criar documento DEPLOY-HYBRID-WINDOWS.md
  - Adaptar guia Linux para Windows 11
  - Incluir todos os comandos PowerShell
  - Incluir screenshots de configurações importantes
  - Incluir seção de troubleshooting específica para Windows
  - Incluir referência de comandos úteis
  - Incluir exemplos de .env.production completo
  - Incluir instruções para win-acme
  - Incluir instruções para Task Scheduler
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 10. Checkpoint Final
  - Verificar todos os serviços rodando
  - Verificar backups automáticos funcionando
  - Verificar renovação SSL agendada
  - Verificar documentação completa
  - _Requirements: Todos_
