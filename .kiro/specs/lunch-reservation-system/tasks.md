# Plano de Implementação - Sistema de Reservas de Almoço (BookMenu)

- [x] 1. Configurar estrutura base do módulo e modelos de dados
  - Criar estrutura de pastas do módulo lunch-reservation seguindo padrão existente
  - Implementar schema Prisma com todas as entidades e relacionamentos
  - Executar migrations para criar tabelas no banco de dados
  - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 2. Implementar entidades de domínio e interfaces base
  - [x] 2.1 Criar entidades de domínio (User, Category, MenuItem, WeekDay, Menu, MenuComposition, MenuVariation, Reservation)
    - Definir interfaces TypeScript para todas as entidades seguindo padrão do módulo device
    - Implementar enums para UserRole, UserType, UserStatus, DayOfWeek, VariationType, ReservationStatus
    - Criar tipos para dados de criação e atualização (DTOs)
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [x] 2.2 Definir interfaces de repositórios
    - Criar interfaces para UserRepository, CategoryRepository, MenuItemRepository, WeekDayRepository, MenuRepository, ReservationRepository
    - Definir métodos de CRUD e consultas específicas para cada repositório
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 3. Implementar repositórios Prisma
  - [x] 3.1 Implementar PrismaUserRepository
    - Criar métodos findByCpf, findById, create, update, findAll seguindo padrão PrismaDeviceRepository
    - Implementar validações e tratamento de erros
    - _Requisitos: 1.1, 1.2, 2.2, 2.3, 2.4_

  - [x] 3.2 Implementar PrismaCategoryRepository
    - Criar métodos CRUD para categorias de alimentos
    - Implementar ordenação por displayOrder
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 3.3 Implementar PrismaMenuItemRepository
    - Criar métodos CRUD para itens de menu
    - Implementar filtros por categoria e status ativo
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 3.4 Implementar PrismaWeekDayRepository (somente consultas)
    - Criar métodos de consulta para dias da semana (findAll, findByDayOfWeek)
    - Dados serão criados via seed inicial, sem necessidade de CRUD
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 3.5 Implementar PrismaMenuRepository
    - Criar métodos CRUD para menus com composições
    - Implementar consultas por data, semana e dia
    - Incluir relacionamentos com variações e composições
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_

  - [x] 3.6 Implementar PrismaReservationRepository
    - Criar métodos CRUD para reservas
    - Implementar consultas por usuário, data e status
    - Incluir relacionamentos com menu e variações
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Implementar serviços de domínio
  - [x] 4.1 Implementar AuthenticationService
    - Criar validação de CPF e senha
    - Implementar geração e validação de tokens JWT
    - Adicionar gerenciamento de sessões
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Implementar UserManagementService
    - Criar CRUD de usuários com validações seguindo padrão DeviceService
    - Implementar controle de tipos de usuário (FIXO, NAO_FIXO)
    - Adicionar gestão de status ativo/inativo
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Implementar CategoryManagementService
    - Criar CRUD de categorias de alimentos
    - Implementar ordenação e ativação/desativação
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 4.4 Implementar MenuItemManagementService
    - Criar CRUD de itens de menu
    - Implementar filtros por categoria e validações
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 4.5 Implementar WeekDayManagementService (somente consultas)
    - Criar serviço para consulta de dias da semana (Segunda a Domingo)
    - Implementar utilitários para calcular semana do ano baseada em data
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 4.6 Implementar MenuManagementService
    - Criar CRUD de menus com composições
    - Implementar geração automática de variações (padrão e ovo)
    - Adicionar validações de dias úteis e itens obrigatórios
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.7 Implementar ReservationService
    - Criar lógica de reservas com validações de horário limite (8:30 AM)
    - Implementar validação de datas futuras
    - Adicionar controle de alterações e cancelamentos
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.8 Implementar AutoReservationService
    - Criar geração automática de reservas para usuários fixos
    - Implementar processamento em lote para múltiplos usuários
    - Adicionar lógica de interrupção quando usuário muda de tipo
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Implementar controllers e middlewares
  - [x] 5.1 Implementar AuthController
    - Criar endpoint de login com validação de CPF seguindo padrão DeviceController
    - Implementar logout e refresh de tokens
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.2 Implementar middlewares de autenticação e autorização
    - Criar authMiddleware para validação de tokens
    - Implementar roleMiddleware para controle de acesso por role
    - _Requisitos: 1.1, 1.4, 2.1_

  - [x] 5.3 Implementar UserController (apenas para ADMIN)
    - Criar endpoints CRUD para gestão de usuários
    - Implementar controle de tipos e status de usuários
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 5.4 Implementar CategoryController (apenas para ADMIN)
    - Criar endpoints CRUD para categorias
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 5.5 Implementar MenuItemController (apenas para ADMIN)
    - Criar endpoints CRUD para itens de menu
    - Implementar filtros por categoria
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 5.6 Implementar WeekDayController (somente consultas)
    - Criar endpoint de consulta de dias da semana (Segunda a Domingo)
    - Não necessário CRUD, dados são gerenciados via seed
    - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 5.7 Implementar MenuController
    - Criar endpoints CRUD para menus (ADMIN)
    - Implementar endpoint de consulta de cardápios disponíveis (USER)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1_

  - [x] 5.8 Implementar ReservationController
    - Criar endpoints para criação de reservas (USER)
    - Implementar endpoints para alteração e cancelamento (USER)
    - Adicionar endpoint de consulta de reservas do usuário (USER)
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implementar sistema de agendamento automático
  - [x] 6.1 Implementar AutoReservationScheduler
    - Criar job scheduler para execução diária
    - Implementar lógica de criação de reservas para usuários fixos
    - Adicionar tratamento de falhas e retry logic
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Configurar rotas e integração com aplicação principal
  - [x] 7.1 Criar arquivo de rotas do módulo
    - Definir todas as rotas com middlewares apropriados seguindo padrão device.routes.ts
    - Implementar documentação Swagger para todas as APIs
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [x] 7.2 Integrar módulo com aplicação principal
    - Registrar rotas no applicationRouter seguindo padrão existente
    - Configurar factories de dependências seguindo padrão makeDeviceModule
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 8. Implementar validações e tratamento de erros
  - [x] 8.1 Criar schemas de validação Zod
    - Implementar validações para todos os endpoints
    - Criar schemas para criação e atualização de entidades
    - _Requisitos: 1.1, 1.2, 1.3, 2.1, 3.1, 4.1, 5.1_

  - [x] 8.2 Implementar classes de erro customizadas
    - Criar BusinessRuleError, ValidationError, AuthenticationError, AuthorizationError
    - Implementar middleware de tratamento de erros
    - _Requisitos: 1.2, 4.4, 5.3, 5.5_

- [x] 9. Implementar funcionalidades de inicialização
  - [x] 9.1 Criar dados iniciais (seed)
    - Implementar script para criar categorias padrão (Proteína, Acompanhamento, Sobremesa, etc.)
    - Criar usuário administrador inicial
    - Adicionar dias da semana padrão (Segunda a Domingo)
    - _Requisitos: 2.1, 3.1_

  - [x] 9.2 Implementar factory de dependências
    - Criar factory para instanciar serviços e repositórios seguindo padrão makeDeviceModule
    - Configurar injeção de dependências
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 10. Implementar testes
  - [x] 10.1 Criar testes unitários para serviços de domínio
    - Testar AuthenticationService, UserManagementService, ReservationService
    - Testar regras de negócio críticas (horário limite, usuários fixos)
    - _Requisitos: 1.1, 2.1, 4.1, 5.1, 6.1_

  - [x] 10.2 Criar testes de integração para repositórios
    - Testar operações CRUD com banco de dados
    - Testar relacionamentos e constraints
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

  - [x] 10.3 Criar testes end-to-end para fluxos principais
    - Testar fluxo completo de autenticação
    - Testar criação e gestão de reservas
    - Testar geração automática de reservas para usuários fixos
    - _Requisitos: 1.1, 4.1, 5.1, 6.1_
