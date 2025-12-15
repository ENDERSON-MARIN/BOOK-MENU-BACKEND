# Documento de Design - Sistema de Reservas de Almoço

## Visão Geral

O Sistema de Reservas de Almoço será implementado seguindo a arquitetura hexagonal já estabelecida no projeto, utilizando Node.js, Express, TypeScript, Prisma ORM e PostgreSQL. O sistema gerenciará autenticação, diferentes tipos de usuários, cardápios semanais e reservas com regras de negócio específicas.

## Arquitetura

### Estrutura de Módulos

O sistema seguirá a estrutura modular existente em `src/app/modules/`, criando um novo módulo `lunch-reservation` que conterá:

```
src/app/modules/lunch-reservation/
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Menu.ts
│   │   ├── Reservation.ts
│   │   └── MenuVariation.ts
│   ├── repositories/
│   │   ├── UserRepository.ts
│   │   ├── MenuRepository.ts
│   │   └── ReservationRepository.ts
│   └── services/
│       ├── AuthenticationService.ts
│       ├── UserManagementService.ts
│       ├── CategoryManagementService.ts
│       ├── MenuItemManagementService.ts
│       ├── WeekDayManagementService.ts
│       ├── MenuManagementService.ts
│       ├── ReservationService.ts
│       └── AutoReservationService.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── PrismaUserRepository.ts
│   │   ├── PrismaCategoryRepository.ts
│   │   ├── PrismaMenuItemRepository.ts
│   │   ├── PrismaWeekDayRepository.ts
│   │   ├── PrismaMenuRepository.ts
│   │   └── PrismaReservationRepository.ts
│   └── schedulers/
│       └── AutoReservationScheduler.ts
└── presentation/
    ├── controllers/
    │   ├── AuthController.ts
    │   ├── UserController.ts
    │   ├── CategoryController.ts
    │   ├── MenuItemController.ts
    │   ├── WeekDayController.ts
    │   ├── MenuController.ts
    │   └── ReservationController.ts
    ├── routes/
    │   └── lunchReservationRoutes.ts
    └── middlewares/
        ├── authMiddleware.ts
        └── roleMiddleware.ts
```

### Padrões Arquiteturais

- **Arquitetura Hexagonal**: Separação clara entre domínio, infraestrutura e apresentação
- **Repository Pattern**: Abstração do acesso a dados
- **Service Layer**: Lógica de negócio centralizada
- **Dependency Injection**: Inversão de dependências através de factories
- **CQRS Simplificado**: Separação de comandos e consultas nos serviços

### Estrutura Modular de Cardápios

A nova estrutura modular oferece maior flexibilidade e manutenibilidade:

**Benefícios:**
- **Flexibilidade**: Categorias e itens podem ser gerenciados independentemente
- **Reutilização**: Itens podem ser reutilizados em diferentes cardápios e semanas
- **Escalabilidade**: Fácil adição de novas categorias e itens sem alteração de estrutura
- **Manutenção**: Alterações em itens específicos não afetam outros cardápios
- **Relatórios**: Possibilidade de análises detalhadas por categoria e item

**Fluxo de Composição:**
1. **Categorias** definem tipos de alimentos (Proteína, Acompanhamento, Sobremesa, etc.)
2. **Itens de Menu** são criados dentro de cada categoria
3. **Semanas** organizam períodos de cardápios
4. **Dias da Semana** definem os dias úteis disponíveis
5. **Menus** combinam semana + dia + composição de itens
6. **Variações** permitem alternativas de proteína (padrão vs. ovo)

## Componentes e Interfaces

### Entidades de Domínio

#### User
```typescript
interface User {
  id: string
  cpf: string
  password: string
  name: string
  role: UserRole
  userType: UserType
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

enum UserType {
  FIXO = 'FIXO',
  NAO_FIXO = 'NAO_FIXO'
}

enum UserStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}
```

#### Category
```typescript
interface Category {
  id: string
  name: string
  description: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### MenuItem
```typescript
interface MenuItem {
  id: string
  name: string
  description: string
  categoryId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### WeekDay
```typescript
interface WeekDay {
  id: string
  dayName: string
  dayOfWeek: DayOfWeek
  displayOrder: number
  isActive: boolean
}

enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}
```

#### Menu
```typescript
interface Menu {
  id: string
  date: Date
  dayOfWeek: DayOfWeek
  weekNumber: number // Semana do ano (calculado automaticamente)
  observations: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  menuItems: MenuComposition[]
}
```

#### MenuComposition
```typescript
interface MenuComposition {
  id: string
  menuId: string
  menuItemId: string
  observations: string
  isMainProtein: boolean
  isAlternativeProtein: boolean
}
```

#### MenuVariation
```typescript
interface MenuVariation {
  id: string
  menuId: string
  variationType: VariationType
  proteinItemId: string
  isDefault: boolean
}

enum VariationType {
  STANDARD = 'STANDARD',
  EGG_SUBSTITUTE = 'EGG_SUBSTITUTE'
}
```

#### Reservation
```typescript
interface Reservation {
  id: string
  userId: string
  menuId: string
  menuVariationId: string
  reservationDate: Date
  status: ReservationStatus
  isAutoGenerated: boolean
  createdAt: Date
  updatedAt: Date
}

enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED'
}
```

### Interfaces de Repositório

```typescript
interface UserRepository {
  findByCpf(cpf: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(userData: CreateUserData): Promise<User>
  update(id: string, userData: UpdateUserData): Promise<User>
  findAll(): Promise<User[]>
}

interface CategoryRepository {
  findAll(): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  create(categoryData: CreateCategoryData): Promise<Category>
  update(id: string, categoryData: UpdateCategoryData): Promise<Category>
  delete(id: string): Promise<void>
}

interface MenuItemRepository {
  findByCategory(categoryId: string): Promise<MenuItem[]>
  findById(id: string): Promise<MenuItem | null>
  findActive(): Promise<MenuItem[]>
  create(itemData: CreateMenuItemData): Promise<MenuItem>
  update(id: string, itemData: UpdateMenuItemData): Promise<MenuItem>
  delete(id: string): Promise<void>
}

interface WeekDayRepository {
  findAll(): Promise<WeekDay[]>
  findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<WeekDay | null>
}

interface MenuRepository {
  findByDate(date: Date): Promise<Menu | null>
  findByWeekNumber(weekNumber: number): Promise<Menu[]>
  findByDateRange(startDate: Date, endDate: Date): Promise<Menu[]>
  create(menuData: CreateMenuData): Promise<Menu>
  update(id: string, menuData: UpdateMenuData): Promise<Menu>
  delete(id: string): Promise<void>
  findWithComposition(menuId: string): Promise<Menu | null>
}

interface ReservationRepository {
  findByUserAndDate(userId: string, date: Date): Promise<Reservation | null>
  findByUser(userId: string): Promise<Reservation[]>
  create(reservationData: CreateReservationData): Promise<Reservation>
  update(id: string, reservationData: UpdateReservationData): Promise<Reservation>
  delete(id: string): Promise<void>
  findActiveReservationsForDate(date: Date): Promise<Reservation[]>
}
```

### Serviços de Domínio

#### AuthenticationService
- Validação de CPF e senha
- Geração e validação de tokens JWT
- Gerenciamento de sessões

#### UserManagementService
- CRUD de usuários
- Validação de regras de negócio para tipos de usuário
- Controle de status ativo/inativo

#### MenuManagementService
- CRUD de cardápios
- Geração automática de variações
- Validação de dias úteis

#### ReservationService
- Criação e gerenciamento de reservas
- Validação de horário limite (8:30 AM)
- Validação de datas futuras
- Controle de alterações e cancelamentos

#### AutoReservationService
- Geração automática de reservas para usuários fixos
- Processamento em lote para múltiplos usuários
- Integração com scheduler

## Modelos de Dados

### Schema Prisma

```prisma
model User {
  id        String     @id @default(uuid())
  cpf       String     @unique
  password  String
  name      String
  role      UserRole   @default(USER)
  userType  UserType   @default(NAO_FIXO)
  status    UserStatus @default(ATIVO)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  reservations Reservation[]

  @@map("users")
}

model Category {
  id           String     @id @default(uuid())
  name         String     @unique
  description  String
  displayOrder Int
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  menuItems MenuItem[]

  @@map("categories")
}

model MenuItem {
  id          String   @id @default(uuid())
  name        String
  description String
  categoryId  String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category         Category           @relation(fields: [categoryId], references: [id])
  menuCompositions MenuComposition[]
  menuVariations   MenuVariation[]

  @@map("menu_items")
}

model WeekDay {
  id           String    @id @default(uuid())
  dayName      String
  dayOfWeek    DayOfWeek
  displayOrder Int
  isActive     Boolean   @default(true)

  @@unique([dayOfWeek])
  @@map("week_days")
}

model Menu {
  id           String    @id @default(uuid())
  date         DateTime  @unique
  dayOfWeek    DayOfWeek
  weekNumber   Int
  observations String?
  isActive     Boolean  @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  menuCompositions MenuComposition[]
  variations       MenuVariation[]
  reservations     Reservation[]

  @@map("menus")
}

model MenuComposition {
  id                    String   @id @default(uuid())
  menuId                String
  menuItemId            String
  observations          String?
  isMainProtein         Boolean  @default(false)
  isAlternativeProtein  Boolean  @default(false)

  menu     Menu     @relation(fields: [menuId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id])

  @@unique([menuId, menuItemId])
  @@map("menu_compositions")
}

model MenuVariation {
  id            String        @id @default(uuid())
  menuId        String
  variationType VariationType
  proteinItemId String
  isDefault     Boolean       @default(false)

  menu        Menu        @relation(fields: [menuId], references: [id], onDelete: Cascade)
  proteinItem MenuItem    @relation(fields: [proteinItemId], references: [id])
  reservations Reservation[]

  @@map("menu_variations")
}

model Reservation {
  id               String            @id @default(uuid())
  userId           String
  menuId           String
  menuVariationId  String
  reservationDate  DateTime
  status           ReservationStatus @default(ACTIVE)
  isAutoGenerated  Boolean           @default(false)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  user          User          @relation(fields: [userId], references: [id])
  menu          Menu          @relation(fields: [menuId], references: [id])
  menuVariation MenuVariation @relation(fields: [menuVariationId], references: [id])

  @@unique([userId, reservationDate])
  @@map("reservations")
}

enum UserRole {
  ADMIN
  USER
}

enum UserType {
  FIXO
  NAO_FIXO
}

enum UserStatus {
  ATIVO
  INATIVO
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum VariationType {
  STANDARD
  EGG_SUBSTITUTE
}

enum ReservationStatus {
  ACTIVE
  CANCELLED
}
```

## Tratamento de Erros

### Estratégia de Erro

- **Validação de Entrada**: Uso do Zod para validação de schemas
- **Erros de Domínio**: Classes de erro específicas para regras de negócio
- **Erros de Infraestrutura**: Tratamento de erros de banco de dados e externos
- **Middleware de Erro**: Centralização do tratamento de erros HTTP

### Classes de Erro Customizadas

```typescript
class BusinessRuleError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'BusinessRuleError'
  }
}

class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class AuthenticationError extends Error {
  constructor(message: string = 'Credenciais inválidas') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

class AuthorizationError extends Error {
  constructor(message: string = 'Acesso negado') {
    super(message)
    this.name = 'AuthorizationError'
  }
}
```

### Regras de Negócio Específicas

- **Horário Limite**: Validação de 8:30 AM para alterações
- **Datas Futuras**: Impedimento de reservas para datas passadas
- **Usuários Fixos**: Geração automática de reservas
- **Variações de Cardápio**: Criação automática de duas variações
- **Status de Usuário**: Controle de acesso baseado em status ativo/inativo

## Estratégia de Testes

### Testes Unitários
- Entidades de domínio e suas regras
- Serviços de domínio
- Validações e transformações de dados
- Lógica de negócio isolada

### Testes de Integração
- Repositórios com banco de dados
- Controllers com middlewares
- Fluxos completos de API
- Scheduler de reservas automáticas

### Testes End-to-End
- Fluxos de usuário completos
- Autenticação e autorização
- Cenários de reserva e cancelamento
- Geração automática de reservas

### Ferramentas de Teste
- **Vitest**: Framework de testes principal
- **Supertest**: Testes de API HTTP
- **Prisma Test Environment**: Isolamento de banco de dados para testes
- **Coverage**: Cobertura de código com V8

## Considerações de Segurança

### Autenticação e Autorização
- Hash de senhas com bcrypt
- Tokens JWT com expiração
- Middleware de autenticação obrigatório
- Controle de acesso baseado em roles

### Validação de Dados
- Sanitização de entrada com Zod
- Validação de CPF
- Prevenção de SQL Injection via Prisma
- Rate limiting para APIs críticas

### Auditoria
- Log de ações administrativas
- Rastreamento de alterações de reservas
- Monitoramento de tentativas de login

## Integrações e Dependências

### Scheduler para Reservas Automáticas
- Implementação de job scheduler para usuários fixos
- Execução diária para criação de reservas
- Tratamento de falhas e retry logic

### Notificações (Futuro)
- Sistema de notificações por email/SMS
- Lembretes de reservas
- Alertas de cancelamento

### Relatórios (Futuro)
- Dashboard administrativo
- Relatórios de utilização
- Métricas de reservas por período
