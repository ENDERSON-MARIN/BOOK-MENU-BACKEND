# Design Document

## Overview

Este documento descreve o design para refatorar o README.md da API BookMenu, transformando-o de uma documentação sobre gestão de dispositivos IoT para uma documentação completa e precisa do sistema de reservas de almoço corporativo. A refatoração manterá a estrutura geral do documento (seções bem organizadas, exemplos claros, formatação markdown) mas substituirá todo o conteúdo relacionado a dispositivos por conteúdo relevante ao sistema de reservas de almoço.

## Architecture

### Document Structure

O README refatorado seguirá esta estrutura de alto nível:

```
1. Header & Badges
2. Índice
3. Screenshots
4. Tecnologias
5. Arquitetura Hexagonal Modular
6. Estrutura do Projeto
7. Padrões de Import
8. Pré-requisitos
9. Instalação
10. Execução
11. Testes
12. Endpoints da API
13. Documentação Swagger
14. Decisões Técnicas
15. Scripts Disponíveis
16. Contribuição
17. Licença
18. Autor
```

### Content Mapping Strategy

Cada seção será transformada seguindo este mapeamento:

| Seção Original | Ação                     | Novo Conteúdo                                                      |
| -------------- | ------------------------ | ------------------------------------------------------------------ |
| Título         | Substituir               | "Sistema de Reservas de Almoço Corporativo"                        |
| Descrição      | Substituir               | API REST para reservas de almoço com gerenciamento de cardápios    |
| Screenshots    | Atualizar                | Manter estrutura, atualizar descrições para endpoints de reservas  |
| Tecnologias    | Manter                   | Já está correto (Node.js, TypeScript, Express, PostgreSQL, Prisma) |
| Arquitetura    | Atualizar                | Manter princípios, atualizar exemplos para domínio de reservas     |
| Estrutura      | Substituir               | Mostrar módulos: user, category, menu-item, menu, reservation      |
| Endpoints      | Substituir Completamente | Documentar 7 grupos de endpoints de reservas                       |
| Exemplos       | Substituir               | Usar dados de almoço (cardápios, reservas, usuários)               |
| Instalação     | Atualizar                | Manter processo, atualizar referências ao schema de reservas       |
| Testes         | Atualizar                | Substituir test:device por test:lunch-reservation                  |

## Components and Interfaces

### 1. Header Section Component

**Purpose**: Apresentar o projeto e seu propósito principal

**Content Elements**:

- Título: "📱 Sistema de Reservas de Almoço Corporativo"
- Subtítulo: Descrição concisa da API
- Badges (se aplicável): Build status, coverage, version

**Design Decision**: Usar emoji de comida/restaurante (🍽️) ao invés de dispositivo (📱)

### 2. Table of Contents Component

**Purpose**: Navegação rápida pelo documento

**Content Elements**:

- Links para todas as seções principais
- Estrutura hierárquica clara

**Design Decision**: Manter estrutura atual, apenas atualizar nomes das seções

### 3. Screenshots Section Component

**Purpose**: Visualização da documentação Swagger e funcionalidades

**Current State**:

```
- doc.png: Documentação geral da API
- post.png: Criar dispositivo
- get.png: Listar dispositivos
- patch.png: Alterar status dispositivo
```

**Target State**:

```
- doc.png: Documentação geral da API (manter se mostra endpoints corretos)
- post.png: Criar reserva de almoço
- get.png: Listar cardápios da semana
- patch.png: Alterar reserva
```

**Design Decision**:

- Se screenshots atuais mostram endpoints de devices, adicionar nota para atualizar
- Se mostram interface genérica do Swagger, manter com descrições atualizadas

### 4. Technologies Section Component

**Purpose**: Listar stack tecnológico

**Content Elements**:

- Backend: Node.js v22+, TypeScript v5.8, Express v5.1, Zod v4.1
- Database: PostgreSQL v16, Prisma ORM v6.17
- Testing: Vitest v3.2.4, Supertest v7.1.4
- Documentation: Swagger UI Express v5.0.1
- DevOps: Docker, Docker Compose, ESLint, Prettier, Husky

**Design Decision**: Manter seção atual (já está correta)

### 5. Architecture Section Component

**Purpose**: Explicar arquitetura hexagonal modular

**Content Elements**:

- Princípios arquiteturais
- Separação por módulos (User, Category, MenuItem, Menu, Reservation)
- Camadas (Application, Infrastructure)
- Benefícios da organização modular

**Design Decision**:

- Manter estrutura de explicação
- Substituir exemplo "Device" por "Reservation" ou "Menu"
- Atualizar diagramas se houver

### 6. Project Structure Component

**Purpose**: Mostrar organização de arquivos e diretórios

**Current Structure** (Device-focused):

```
src/app/modules/device/
├── domain/
│   ├── Device.ts
│   ├── DeviceRepository.ts
```

**Target Structure** (Reservation-focused):

```
src/app/modules/
├── user/
│   ├── domain/
│   │   ├── User.ts
│   │   ├── UserRepository.ts
├── category/
│   ├── domain/
│   │   ├── Category.ts
│   │   ├── CategoryRepository.ts
├── menu-item/
│   ├── domain/
│   │   ├── MenuItem.ts
│   │   ├── MenuItemRepository.ts
├── menu/
│   ├── domain/
│   │   ├── Menu.ts
│   │   ├── MenuRepository.ts
├── reservation/
│   ├── domain/
│   │   ├── Reservation.ts
│   │   ├── ReservationRepository.ts
```

**Design Decision**:

- Mostrar estrutura completa com todos os módulos principais
- Manter padrão de organização (domain/, dtos/, services/, factories/)
- Remover completamente referências ao módulo device

### 7. Import Patterns Component

**Purpose**: Documentar convenções de import

**Content Elements**:

- Barrel exports explanation
- Exemplos de imports recomendados
- Exemplos de imports não recomendados
- Path mapping configuration

**Current Examples**:

```typescript
import { DeviceService, CreateDeviceDTO, Device } from "@/app/modules/device"
```

**Target Examples**:

```typescript
// Import de módulo completo
import {
  ReservationService,
  CreateReservationDTO,
} from "@/app/modules/reservation"
import { MenuService, CreateMenuDTO } from "@/app/modules/menu"

// Import de camada específica
import {
  UserController,
  ReservationController,
} from "@/infrastructure/http/controllers"
```

**Design Decision**: Substituir todos os exemplos de Device por exemplos de Reservation, Menu, User

### 8. Endpoints Documentation Component

**Purpose**: Documentar todos os endpoints da API

**Structure**:

```
Base URL: http://localhost:8080/api

1. Authentication (/api/auth)
   - POST /api/auth/login

2. Users (/api/users)
   - POST /api/users
   - GET /api/users
   - GET /api/users/{id}
   - PATCH /api/users/{id}
   - PATCH /api/users/{id}/status

3. Categories (/api/categories)
   - POST /api/categories
   - GET /api/categories
   - GET /api/categories/{id}
   - PATCH /api/categories/{id}
   - DELETE /api/categories/{id}

4. Menu Items (/api/menu-items)
   - POST /api/menu-items
   - GET /api/menu-items
   - GET /api/menu-items/{id}
   - PATCH /api/menu-items/{id}
   - DELETE /api/menu-items/{id}

5. Week Days (/api/week-days)
   - GET /api/week-days

6. Menus (/api/menus)
   - POST /api/menus
   - GET /api/menus
   - GET /api/menus/{id}
   - PATCH /api/menus/{id}
   - DELETE /api/menus/{id}

7. Reservations (/api/reservations)
   - POST /api/reservations
   - GET /api/reservations
   - GET /api/reservations/{id}
   - PATCH /api/reservations/{id}
   - DELETE /api/reservations/{id}
```

**Design Decision**:

- Remover completamente seção de endpoints de devices
- Criar nova seção com 7 grupos de endpoints
- Incluir exemplos de request/response para cada endpoint principal
- Usar dados realistas (CPF, nomes de alimentos, datas de reserva)

## Data Models

### Entity Descriptions for Documentation

**User Entity**:

```json
{
  "id": "UUID",
  "cpf": "11 digits",
  "name": "Full name",
  "role": "ADMIN | USER",
  "userType": "FIXO | NAO_FIXO",
  "status": "ATIVO | INATIVO",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Category Entity**:

```json
{
  "id": "UUID",
  "name": "Category name",
  "description": "Category description",
  "displayOrder": "Integer",
  "isActive": "Boolean",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**MenuItem Entity**:

```json
{
  "id": "UUID",
  "name": "Item name",
  "description": "Item description",
  "categoryId": "UUID",
  "isActive": "Boolean",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Menu Entity**:

```json
{
  "id": "UUID",
  "date": "YYYY-MM-DD",
  "dayOfWeek": "MONDAY | TUESDAY | ...",
  "weekNumber": "1-53",
  "observations": "Optional notes",
  "isActive": "Boolean",
  "menuCompositions": "Array of MenuComposition",
  "variations": "Array of MenuVariation",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Reservation Entity**:

```json
{
  "id": "UUID",
  "userId": "UUID",
  "menuId": "UUID",
  "menuVariationId": "UUID",
  "reservationDate": "YYYY-MM-DD",
  "status": "ACTIVE | CANCELLED",
  "isAutoGenerated": "Boolean",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Example Data for Documentation

**Example User**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf": "12345678901",
  "name": "João Silva",
  "role": "USER",
  "userType": "FIXO",
  "status": "ATIVO",
  "createdAt": "2025-10-21T10:30:00.000Z",
  "updatedAt": "2025-10-21T10:30:00.000Z"
}
```

**Example Menu Item**:

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440030",
  "name": "Frango Grelhado",
  "description": "Peito de frango grelhado temperado com ervas",
  "categoryId": "550e8400-e29b-41d4-a716-446655440020",
  "isActive": true,
  "createdAt": "2025-11-07T18:00:00.000Z",
  "updatedAt": "2025-11-07T18:00:00.000Z"
}
```

**Example Reservation**:

```json
{
  "id": "res-550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-550e8400-e29b-41d4-a716-446655440000",
  "menuId": "menu-550e8400-e29b-41d4-a716-446655440000",
  "menuVariationId": "var-1",
  "reservationDate": "2025-11-10",
  "status": "ACTIVE",
  "isAutoGenerated": false,
  "createdAt": "2025-11-07T18:30:00.000Z",
  "updatedAt": "2025-11-07T18:30:00.000Z"
}
```

## Error Handling

### Documentation of Error Responses

O README deve documentar os principais tipos de erro retornados pela API:

**Validation Error (400)**:

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "CPF must contain exactly 11 digits",
      "path": ["cpf"]
    }
  ]
}
```

**Authentication Error (401)**:

```json
{
  "error": "Invalid credentials"
}
```

**Authorization Error (403)**:

```json
{
  "error": "Access denied. Admin privileges required"
}
```

**Not Found Error (404)**:

```json
{
  "error": "Reservation not found"
}
```

**Conflict Error (409)**:

```json
{
  "error": "User already has a reservation for this date"
}
```

**Design Decision**: Incluir exemplos de erros comuns na seção de endpoints para cada operação

## Testing Strategy

### Test Documentation Structure

**Test Commands**:

```bash
# Executar todos os testes
pnpm test

# Testes com cobertura
pnpm test:coverage

# Testes específicos por módulo
pnpm test:lunch-reservation
pnpm test:lunch-reservation:unit
pnpm test:lunch-reservation:integration
pnpm test:lunch-reservation:e2e

# Outros módulos
pnpm test:user
pnpm test:category
pnpm test:menu-item
pnpm test:menu
```

**Test Coverage Table**:
| Tipo | Quantidade | Descrição |
|------|------------|-----------|
| Unitários | ~40 | Entidades, Services, Validators, DTOs |
| Integração | ~15 | Repositórios com banco real |
| E2E | ~25 | API completa com Supertest |
| Total | ~80 | Cobertura > 90% |

**Design Decision**:

- Remover referências a test:device
- Adicionar comandos para test:lunch-reservation
- Atualizar números de testes para refletir sistema de reservas
- Manter estrutura de tipos de teste (unit, integration, e2e)

## Installation and Setup

### Environment Variables

**Example .env file**:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bookmenu_db?schema=public

# Server
PORT=8080
NODE_ENV=development

# JWT (if applicable)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

**Design Decision**:

- Renomear database de "device_db" para "bookmenu_db"
- Manter estrutura de configuração
- Adicionar variáveis JWT se necessário

### Database Setup

**Prisma Commands**:

```bash
# Gerar cliente Prisma
pnpm prisma:generate

# Executar migrações
pnpm prisma:migrate

# Seed database (opcional)
pnpm prisma:seed

# Abrir Prisma Studio
pnpm prisma:studio
```

**Design Decision**: Manter comandos atuais, apenas atualizar descrições

### Docker Setup

**Docker Compose**:

```bash
# Subir banco PostgreSQL
docker-compose up -d postgres

# Subir todos os serviços (PostgreSQL + API)
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar serviços
docker-compose down
```

**Design Decision**: Manter instruções Docker atuais

## Swagger Documentation

### Swagger Access

**URL**: `http://localhost:8080/api-docs`

**Features**:

- Interface interativa "Try it out"
- 7 grupos de endpoints documentados (Auth, Users, Categories, MenuItems, WeekDays, Menus, Reservations)
- Schemas de validação detalhados
- Exemplos de requisições e respostas
- Códigos de erro com descrições
- Exportação para Postman/Insomnia
- Tema escuro moderno

**Export URL**: `http://localhost:8080/api-docs.json`

**Design Decision**:

- Atualizar descrição para mencionar endpoints de reservas
- Remover referências a endpoints de devices
- Manter estrutura de features

## Technical Decisions

### Why Hexagonal Architecture for Lunch Reservation System?

**Reasons**:

1. **Separation of Concerns**: Cada módulo (User, Menu, Reservation) tem responsabilidade única
2. **Testability**: Facilita testes unitários e de integração para funcionalidades de reserva
3. **Maintainability**: Código organizado e fácil de manter para operações de reserva
4. **Scalability**: Preparado para futuras expansões (notificações, relatórios, integrações)
5. **Independence**: Camadas não dependem de detalhes de implementação específicos

### Why Barrel Exports?

**Benefits**:

- Imports mais limpos e organizados
- API consistente entre módulos
- Facilita refatoração
- Reduz acoplamento entre arquivos

**Example**:

```typescript
// Ao invés de:
import { Reservation } from "@/app/modules/reservation/domain/Reservation"
import { CreateReservationDTO } from "@/app/modules/reservation/dtos/CreateReservationDTO"

// Podemos fazer:
import { Reservation, CreateReservationDTO } from "@/app/modules/reservation"
```

### Why TypeScript + Zod?

**Advantages**:

- Type safety em tempo de compilação
- Validação de runtime com Zod
- Inferência automática de tipos
- Melhor experiência de desenvolvimento
- Validação de CPF, datas, UUIDs

### Why Prisma ORM?

**Reasons**:

- Type safety nativo
- Migrations automáticas
- Query builder intuitivo
- Excelente integração com TypeScript
- Schema declarativo para entidades de reserva

## Scripts Available

### Development Scripts

```bash
pnpm dev              # Iniciar em modo desenvolvimento
pnpm build            # Compilar TypeScript
pnpm start            # Iniciar servidor de produção
```

### Database Scripts

```bash
pnpm prisma:generate  # Gerar cliente Prisma
pnpm prisma:migrate   # Executar migrações
pnpm prisma:studio    # Interface visual do banco
pnpm prisma:seed      # Popular banco com dados iniciais
```

### Test Scripts

```bash
pnpm test                        # Executar todos os testes
pnpm test:unit                   # Apenas testes unitários
pnpm test:integration            # Apenas testes de integração
pnpm test:coverage               # Testes com cobertura

# Testes por módulo
pnpm test:lunch-reservation      # Todos os testes de reserva
pnpm test:lunch-reservation:unit # Testes unitários de reserva
pnpm test:lunch-reservation:integration # Testes de integração de reserva
pnpm test:lunch-reservation:e2e  # Testes E2E de reserva
```

### Quality Scripts

```bash
pnpm lint             # Executar ESLint
pnpm lint:fix         # Corrigir problemas do ESLint
pnpm format           # Formatar código com Prettier
pnpm type-check       # Verificar tipos TypeScript
```

### Docker Scripts

```bash
pnpm docker:build     # Build das imagens Docker
pnpm docker:up        # Subir todos os serviços
pnpm docker:down      # Parar serviços
```

**Design Decision**:

- Remover scripts test:device
- Adicionar scripts test:lunch-reservation
- Manter todos os outros scripts

## Key Features to Highlight

### 1. Authentication System

- JWT-based authentication
- CPF and password login
- Role-based access control (ADMIN, USER)

### 2. User Management

- Create and manage users
- User types (FIXO, NAO_FIXO)
- User status control (ATIVO, INATIVO)
- Admin-only operations

### 3. Food Category Management

- Create and organize food categories
- Display order control
- Category activation/deactivation

### 4. Menu Item Management

- Create food items
- Associate items with categories
- Item descriptions and details

### 5. Weekly Menu Management

- Create daily menus
- Menu composition with multiple items
- Automatic menu variations (standard, egg substitute)
- Main protein and alternative protein designation

### 6. Reservation System

- Create lunch reservations
- Choose menu variations
- Reservation modification (until 8:30 AM)
- Reservation cancellation (until 8:30 AM)
- Auto-generated reservations for fixed users
- Reservation history

### 7. Real-time Updates (if WebSocket is implemented)

- Real-time menu updates
- Real-time reservation notifications

## Content Removal Checklist

Items to completely remove from README:

- [ ] All references to "Device Management"
- [ ] All references to "IoT"
- [ ] Device entity examples
- [ ] MAC address validation examples
- [ ] Device status (ATIVO/INATIVO for devices)
- [ ] POST /api/devices endpoint
- [ ] GET /api/devices endpoint
- [ ] PATCH /api/devices/{id}/status endpoint
- [ ] Device-related screenshots descriptions
- [ ] test:device commands
- [ ] Device module structure examples
- [ ] DeviceService examples
- [ ] CreateDeviceDTO examples
- [ ] Device repository examples

## Content Addition Checklist

Items to add to README:

- [ ] Lunch reservation system description
- [ ] Authentication endpoints documentation
- [ ] User management endpoints (7 endpoints)
- [ ] Category management endpoints (5 endpoints)
- [ ] Menu item management endpoints (5 endpoints)
- [ ] Week days endpoint (1 endpoint)
- [ ] Menu management endpoints (5 endpoints)
- [ ] Reservation management endpoints (5 endpoints)
- [ ] CPF validation examples
- [ ] Menu composition examples
- [ ] Reservation creation examples
- [ ] Menu variation examples (standard, egg substitute)
- [ ] Reservation time restrictions (8:30 AM cutoff)
- [ ] Auto-generated reservations for fixed users
- [ ] test:lunch-reservation commands
- [ ] Reservation module structure examples
- [ ] ReservationService examples
- [ ] CreateReservationDTO examples

## Summary

Este design document estabelece uma estratégia clara para transformar o README de um sistema de gestão de dispositivos IoT para um sistema de reservas de almoço corporativo. A abordagem mantém a estrutura bem organizada do documento original enquanto substitui sistematicamente todo o conteúdo relacionado a dispositivos por conteúdo relevante ao domínio de reservas de almoço.

As principais transformações incluem:

1. Substituição completa da seção de endpoints (de 3 para 28 endpoints)
2. Atualização de todos os exemplos de código e JSON
3. Modificação da estrutura do projeto para mostrar módulos de reserva
4. Atualização de comandos de teste
5. Revisão de screenshots e descrições
6. Manutenção da arquitetura hexagonal com novos exemplos

O resultado será um README preciso, completo e profissional que reflete fielmente o sistema BookMenu API.
