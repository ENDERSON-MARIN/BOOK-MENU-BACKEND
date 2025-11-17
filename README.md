# 🍽️ Sistema de Reservas de Almoço Corporativo

API REST para gerenciamento de reservas de almoço corporativo, desenvolvida com Node.js, TypeScript, Express, PostgreSQL e Prisma ORM, seguindo os princípios da Arquitetura Hexagonal Modular.

## 📋 Índice

- [Screenshots](#-screenshots)
- [Tecnologias](#-tecnologias)
- [Arquitetura Hexagonal Modular](#-arquitetura-hexagonal-modular)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Padrões de Import](#-padrões-de-import)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Execução](#-execução)
- [Testes](#-testes)
- [Endpoints da API](#-endpoints-da-api)
- [Documentação Swagger](#-documentação-swagger)
- [Decisões Técnicas](#-decisões-técnicas)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Autor](#-autor)

## 📸 Screenshots

> **Nota:** As capturas de tela abaixo mostram a documentação Swagger da API. Para refletir completamente o sistema de reservas de almoço, as imagens devem ser atualizadas para mostrar os endpoints de autenticação, usuários, categorias, itens de menu, cardápios e reservas.

<div style="overflow-x: auto;">
    <table style="width: 100%;">
        <tr>
            <td style="width: 50%;"><img src="./public/screenshots/doc1.png" alt="Documentação geral da API de reservas de almoço parte 1" style="width: 100%; height: auto; object-fit: cover;" /></td>
            <td style="width: 50%;"><img src="./public/screenshots/doc2.png" alt="Documentação geral da API de reservas de almoço parte 2" style="width: 100%; height: auto; object-fit: cover;" /></td>
        </tr>
        <tr>
            <td style="width: 50%;"><img src="./public/screenshots/doc3.png" alt="Documentação geral da API de reservas de almoço parte 3" style="width: 100%; height: auto; object-fit: cover;" /></td>
            <td style="width: 50%;"><img src="./public/screenshots/doc4.png" alt="Documentação geral da API de reservas de almoço parte 4" style="width: 100%; height: auto; object-fit: cover;" /></td>
        </tr>
    </table>
</div>

---

## 🚀 Tecnologias

### Backend

- **Node.js** v22+ - Runtime JavaScript para execução do sistema de reservas
- **TypeScript** v5.8 - Superset JavaScript com tipagem estática para segurança de tipos em entidades de reserva
- **Express** v5.1 - Framework web minimalista para endpoints da API de reservas
- **Zod** v4.1 - Validação de schemas com inferência de tipos para dados de usuários, cardápios e reservas

### Banco de Dados

- **PostgreSQL** v16 - Banco de dados relacional para armazenamento de usuários, cardápios e reservas
- **Prisma ORM** v6.17 - ORM moderno com type-safety para gerenciamento de dados do sistema de reservas

### Testes

- **Vitest** v3.2.4 - Framework de testes unitários e integração para funcionalidades de reserva
- **Supertest** v7.1.4 - Testes HTTP end-to-end para endpoints da API de reservas

### Documentação

- **Swagger UI Express** v5.0.1 - Interface interativa de documentação OpenAPI 3.0 para endpoints de reservas

### DevOps

- **Docker** & **Docker Compose** - Containerização do ambiente de desenvolvimento
- **ESLint** & **Prettier** - Qualidade e formatação de código
- **Husky** - Git hooks para qualidade

---

## 🏗️ Arquitetura Hexagonal Modular

O projeto segue os princípios da **Arquitetura Hexagonal (Ports & Adapters)** com organização **modular**, separando funcionalidades por módulos e mantendo camadas bem definidas:

### Princípios Arquiteturais

- **Separação por Módulos**: Cada funcionalidade (User, Category, MenuItem, Menu, Reservation) é organizada em seu próprio módulo
- **Independência de Camadas**: Domain não depende de Infrastructure, Application não depende de detalhes externos
- **Inversão de Dependência**: Infrastructure implementa interfaces definidas no Domain
- **Single Responsibility**: Cada componente tem uma responsabilidade específica

### Camadas da Arquitetura

#### 🎯 Application Layer (`src/app/`)

- **Módulos**: Organizados por funcionalidade (`modules/user/`, `modules/menu/`, `modules/reservation/`)
- **Domain**: Entidades e interfaces de repositório (User, Menu, Reservation)
- **Services**: Casos de uso e lógica de negócio (criar reservas, gerenciar cardápios)
- **DTOs**: Contratos de entrada e saída (CreateReservationDTO, MenuResponseDTO)
- **Shared**: Componentes compartilhados entre módulos

#### 🔌 Infrastructure Layer (`src/infrastructure/`)

- **HTTP**: Adaptadores primários (controllers, routes, middlewares)
- **Database**: Adaptadores secundários (repositories, ORM)
- **Service Providers**: Integrações externas (email, storage, etc.)

**Benefícios da Organização Modular para o Sistema de Reservas:**

- ✅ Separação clara de responsabilidades por funcionalidade (autenticação, cardápios, reservas)
- ✅ Independência de frameworks externos
- ✅ Facilita testes unitários e de integração para funcionalidades de reserva
- ✅ Código limpo e manutenível para gerenciamento de cardápios e reservas
- ✅ Escalável para novos módulos (notificações, relatórios, integrações)
- ✅ Reutilização de componentes compartilhados entre módulos de reserva
- ✅ Desenvolvimento paralelo por equipes em diferentes funcionalidades

---

## 🗂️ Estrutura do Projeto

```
bookmenu-api/
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados (User, Category, MenuItem, Menu, Reservation)
│   ├── migrations/                # Histórico de migrações
│   └── seed.ts                    # Dados iniciais (categorias, dias da semana)
│
├── src/
│   ├── app/                       # 🎯 APPLICATION LAYER
│   │   ├── modules/               # Módulos organizados por funcionalidade
│   │   │   └── lunch-reservation/ # Módulo de Reservas de Almoço
│   │   │       ├── domain/        # Camada de Domínio
│   │   │       │   ├── entities/  # Entidades do domínio
│   │   │       │   │   ├── User.ts           # Entidade User (ADMIN/USER, FIXO/NAO_FIXO)
│   │   │       │   │   ├── Category.ts       # Entidade Category (Proteína, Acompanhamento, etc)
│   │   │       │   │   ├── MenuItem.ts       # Entidade MenuItem (itens de alimento)
│   │   │       │   │   ├── Menu.ts           # Entidade Menu (cardápio diário)
│   │   │       │   │   ├── MenuComposition.ts # Composição do cardápio
│   │   │       │   │   ├── MenuVariation.ts  # Variações (padrão, com ovo)
│   │   │       │   │   ├── Reservation.ts    # Entidade Reservation
│   │   │       │   │   ├── WeekDay.ts        # Dias da semana
│   │   │       │   │   └── index.ts          # Barrel export
│   │   │       │   ├── repositories/  # Interfaces de repositórios
│   │   │       │   │   ├── UserRepository.ts
│   │   │       │   │   ├── CategoryRepository.ts
│   │   │       │   │   ├── MenuItemRepository.ts
│   │   │       │   │   ├── MenuRepository.ts
│   │   │       │   │   ├── ReservationRepository.ts
│   │   │       │   │   ├── WeekDayRepository.ts
│   │   │       │   │   └── index.ts          # Barrel export
│   │   │       │   ├── services/      # Serviços de domínio
│   │   │       │   │   ├── AuthenticationService.ts
│   │   │       │   │   ├── UserManagementService.ts
│   │   │       │   │   ├── CategoryManagementService.ts
│   │   │       │   │   ├── MenuItemManagementService.ts
│   │   │       │   │   ├── MenuManagementService.ts
│   │   │       │   │   ├── ReservationService.ts
│   │   │       │   │   ├── WeekDayManagementService.ts
│   │   │       │   │   ├── AutoReservationService.ts
│   │   │       │   │   └── index.ts          # Barrel export
│   │   │       │   └── index.ts       # Barrel export domain
│   │   │       ├── dtos/          # Data Transfer Objects
│   │   │       │   ├── UserDTOs.ts           # DTOs de usuário
│   │   │       │   ├── CategoryDTOs.ts       # DTOs de categoria
│   │   │       │   ├── MenuItemDTOs.ts       # DTOs de item de menu
│   │   │       │   ├── MenuDTOs.ts           # DTOs de cardápio
│   │   │       │   ├── ReservationDTOs.ts    # DTOs de reserva
│   │   │       │   └── index.ts              # Barrel export
│   │   │       ├── infrastructure/ # Infraestrutura do módulo
│   │   │       │   ├── repositories/  # Implementações Prisma
│   │   │       │   │   ├── PrismaUserRepository.ts
│   │   │       │   │   ├── PrismaCategoryRepository.ts
│   │   │       │   │   ├── PrismaMenuItemRepository.ts
│   │   │       │   │   ├── PrismaMenuRepository.ts
│   │   │       │   │   ├── PrismaReservationRepository.ts
│   │   │       │   │   ├── PrismaWeekDayRepository.ts
│   │   │       │   │   └── index.ts          # Barrel export
│   │   │       │   ├── schedulers/    # Agendadores (reservas automáticas)
│   │   │       │   │   ├── AutoReservationScheduler.ts
│   │   │       │   │   ├── SchedulerManager.ts
│   │   │       │   │   └── index.ts
│   │   │       │   └── index.ts       # Barrel export infrastructure
│   │   │       ├── factories/     # Fábricas de dependências
│   │   │       │   ├── makeLunchReservationModule.ts
│   │   │       │   ├── makeAutoReservationScheduler.ts
│   │   │       │   ├── types.ts
│   │   │       │   └── index.ts              # Barrel export
│   │   │       ├── initialization/ # Inicialização do módulo
│   │   │       │   ├── initializeScheduler.ts
│   │   │       │   └── index.ts
│   │   │       └── index.ts       # Barrel export do módulo
│   │   ├── shared/                # Componentes compartilhados
│   │   │   ├── errors/
│   │   │   │   └── AppError.ts    # Exceções da aplicação
│   │   │   └── index.ts           # Barrel export
│   │   └── index.ts               # Barrel export da app layer
│   │
│   ├── infrastructure/            # 🔌 INFRASTRUCTURE LAYER
│   │   ├── http/                  # Adaptadores primários (entrada)
│   │   │   ├── controllers/       # Controllers HTTP
│   │   │   │   ├── AuthController.ts
│   │   │   │   ├── UserController.ts
│   │   │   │   ├── CategoryController.ts
│   │   │   │   ├── MenuItemController.ts
│   │   │   │   ├── MenuController.ts
│   │   │   │   ├── ReservationController.ts
│   │   │   │   ├── WeekDayController.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── routes/            # Definição de rotas
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── category.routes.ts
│   │   │   │   ├── menuItem.routes.ts
│   │   │   │   ├── menu.routes.ts
│   │   │   │   ├── reservation.routes.ts
│   │   │   │   ├── weekDay.routes.ts
│   │   │   │   ├── applicationRouter.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── middlewares/       # Middlewares HTTP
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── validators/        # Validadores de entrada (Zod)
│   │   │   │   ├── authSchemas.ts
│   │   │   │   ├── userSchemas.ts
│   │   │   │   ├── categorySchemas.ts
│   │   │   │   ├── menuItemSchemas.ts
│   │   │   │   ├── menuSchemas.ts
│   │   │   │   ├── reservationSchemas.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   └── index.ts           # Barrel export HTTP
│   │   ├── database/              # Adaptadores secundários (saída)
│   │   │   ├── prisma.ts          # Configuração do Prisma Client
│   │   │   └── index.ts           # Barrel export database
│   │   ├── service-providers/     # Provedores de serviços externos
│   │   └── index.ts               # Barrel export infrastructure
│   │
│   ├── config/                    # Configurações da aplicação
│   │   └── swagger.ts             # Configuração Swagger/OpenAPI
│   └── server.ts                  # Ponto de entrada da aplicação
│
├── tests/                         # Testes organizados por tipo e módulo
│   ├── modules/                   # Testes por módulo
│   │   └── lunch-reservation/     # Testes do módulo de reservas
│   │       ├── unit/              # Testes unitários
│   │       ├── integration/       # Testes de integração
│   │       └── system/            # Testes E2E
│   ├── shared/                    # Testes de componentes compartilhados
│   └── README.md                  # Documentação de testes
│
└── docker-compose.yml             # Configuração Docker (PostgreSQL + API)
```

### 📁 Organização por Funcionalidades

O módulo `lunch-reservation` agrupa todas as funcionalidades do sistema de reservas:

#### 🍽️ Entidades do Domínio

```
src/app/modules/lunch-reservation/domain/entities/
├── User.ts                # Usuário (ADMIN/USER, FIXO/NAO_FIXO, ATIVO/INATIVO)
├── Category.ts            # Categoria de alimento (Proteína, Acompanhamento, Salada, Sobremesa)
├── MenuItem.ts            # Item de alimento (Frango Grelhado, Arroz Branco, etc)
├── Menu.ts                # Cardápio diário com data e dia da semana
├── MenuComposition.ts     # Composição do cardápio (quais itens compõem o menu)
├── MenuVariation.ts       # Variações do cardápio (padrão, substituição com ovo)
├── Reservation.ts         # Reserva de almoço (usuário + menu + variação + data)
└── WeekDay.ts             # Dias da semana (Segunda, Terça, etc)
```

#### 🔄 Serviços de Domínio

```
src/app/modules/lunch-reservation/domain/services/
├── AuthenticationService.ts          # Autenticação (login com CPF e senha)
├── UserManagementService.ts          # Gerenciamento de usuários
├── CategoryManagementService.ts      # Gerenciamento de categorias
├── MenuItemManagementService.ts      # Gerenciamento de itens de menu
├── MenuManagementService.ts          # Gerenciamento de cardápios
├── ReservationService.ts             # Gerenciamento de reservas
├── WeekDayManagementService.ts       # Gerenciamento de dias da semana
└── AutoReservationService.ts         # Reservas automáticas para usuários fixos
```

#### 📦 Repositórios

```
src/app/modules/lunch-reservation/infrastructure/repositories/
├── PrismaUserRepository.ts           # Persistência de usuários
├── PrismaCategoryRepository.ts       # Persistência de categorias
├── PrismaMenuItemRepository.ts       # Persistência de itens de menu
├── PrismaMenuRepository.ts           # Persistência de cardápios
├── PrismaReservationRepository.ts    # Persistência de reservas
└── PrismaWeekDayRepository.ts        # Persistência de dias da semana
```

#### 🌐 Controllers HTTP

```
src/infrastructure/http/controllers/
├── AuthController.ts                 # POST /api/auth/login
├── UserController.ts                 # CRUD de usuários
├── CategoryController.ts             # CRUD de categorias
├── MenuItemController.ts             # CRUD de itens de menu
├── MenuController.ts                 # CRUD de cardápios
├── ReservationController.ts          # CRUD de reservas
└── WeekDayController.ts              # Listagem de dias da semana
```

## 📦 Padrões de Import

### Barrel Exports

O projeto utiliza **barrel exports** (arquivos `index.ts`) para simplificar imports e criar APIs limpas:

#### ✅ Imports Recomendados

```typescript
// Import de módulo completo do lunch-reservation
import {
  ReservationService,
  CreateReservationDTO,
  Reservation,
} from "@/app/modules/lunch-reservation"

// Import de entidades específicas
import {
  MenuService,
  CreateMenuDTO,
  Menu,
} from "@/app/modules/lunch-reservation"

import {
  UserManagementService,
  CreateUserDTO,
  User,
} from "@/app/modules/lunch-reservation"

// Import de controllers HTTP
import {
  ReservationController,
  MenuController,
  UserController,
} from "@/infrastructure/http/controllers"

// Import de shared components
import { AppError } from "@/app/shared"

// Import de repositórios
import {
  PrismaReservationRepository,
  PrismaMenuRepository,
  PrismaUserRepository,
} from "@/app/modules/lunch-reservation/infrastructure"
```

#### ❌ Imports Não Recomendados

```typescript
// Evitar imports diretos sem barrel exports
import { Reservation } from "@/app/modules/lunch-reservation/domain/entities/Reservation"
import { CreateReservationDTO } from "@/app/modules/lunch-reservation/dtos/ReservationDTOs"
import { Menu } from "@/app/modules/lunch-reservation/domain/entities/Menu"
```

### Regras de Import

1. **Imports Relativos**: Dentro do mesmo módulo

   ```typescript
   // Dentro de lunch-reservation/domain/services/
   import { Reservation, Menu, User } from "../entities"
   import { ReservationRepository, MenuRepository } from "../repositories"

   // Dentro de lunch-reservation/infrastructure/
   import { CreateReservationDTO, UpdateReservationDTO } from "../../dtos"
   ```

2. **Imports Absolutos**: Entre módulos diferentes ou de camadas externas

   ```typescript
   import { AppError } from "@/app/shared"
   import {
     ReservationService,
     MenuService,
   } from "@/app/modules/lunch-reservation"
   import {
     ReservationController,
     MenuController,
   } from "@/infrastructure/http/controllers"
   ```

3. **Dependências Externas**: Sempre no topo

   ```typescript
   import express from "express"
   import { z } from "zod"

   import {
     ReservationService,
     MenuService,
   } from "@/app/modules/lunch-reservation"
   import { AppError } from "@/app/shared"
   ```

### Configuração de Path Mapping

O projeto está configurado com path mapping no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/app/*": ["app/*"],
      "@/infrastructure/*": ["infrastructure/*"],
      "@/config/*": ["config/*"]
    }
  }
}
```

### Convenções de Nomenclatura

- **Arquivos**: PascalCase para classes (`ReservationService.ts`, `MenuController.ts`)
- **Diretórios**: kebab-case (`lunch-reservation/`, `service-providers/`)
- **Interfaces**: PascalCase sem prefixo I (`ReservationRepository`, `MenuRepository`)
- **DTOs**: Sufixo DTO (`CreateReservationDTO`, `CreateMenuDTO`, `CreateUserDTO`)
- **Barrel Exports**: Sempre `index.ts`

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 22.x ou superior ([Download](https://nodejs.org/))
- **pnpm** 10.x ou superior ([Instalação](https://pnpm.io/installation))
- **PostgreSQL** 16.x ou superior ([Download](https://www.postgresql.org/download/))
- **Docker** (opcional, mas recomendado) ([Download](https://www.docker.com/))

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/ENDERSON-MARIN/bookmenu-api.git
cd bookmenu-api
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bookmenu_db?schema=public
PORT=8080
NODE_ENV=development
```

### 4. Configure o banco de dados

#### Opção A: Com Docker (Recomendado)

```bash
# Subir banco PostgreSQL
docker-compose up -d postgres

# Aguardar banco inicializar (~10 segundos)
sleep 10

# Gerar cliente Prisma
pnpm prisma:generate

# Executar migrações
pnpm prisma:migrate
```

#### Opção B: PostgreSQL local

```bash
# Criar banco de dados
createdb bookmenu_db

# Gerar cliente Prisma
pnpm prisma:generate

# Executar migrações
pnpm prisma:migrate
```

---

## 🚀 Execução

### Desenvolvimento

```bash
# Iniciar em modo watch (recarrega automaticamente)
pnpm dev
```

A API estará disponível em: **http://localhost:8080**

### Produção

```bash
# Compilar TypeScript
pnpm build

# Iniciar servidor
pnpm start
```

### Docker (Aplicação Completa)

```bash
# Subir todos os serviços (PostgreSQL + API)
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar serviços
docker-compose down

# Remover volumes (limpar dados)
docker-compose down -v
```

---

## 🧪 Testes

O projeto possui cobertura completa de testes:

### Executar todos os testes

```bash
pnpm test
```

### Executar com cobertura

```bash
pnpm test:coverage
```

**Cobertura esperada:** > 90% em todas as métricas

### Testes específicos

```bash
# Apenas testes unitários
pnpm test:unit

# Apenas testes de integração
pnpm test:integration

# Apenas testes E2E
pnpm test:e2e

# Testes do módulo de reservas de almoço
pnpm test:lunch-reservation                    # Todos os testes de reservas
pnpm test:lunch-reservation:unit              # Testes unitários de reservas
pnpm test:lunch-reservation:integration       # Testes de integração de reservas
pnpm test:lunch-reservation:e2e               # Testes E2E de reservas

# Outros módulos específicos
pnpm test:user                                # Testes do módulo de usuários
pnpm test:category                            # Testes do módulo de categorias
pnpm test:menu-item                           # Testes do módulo de itens de menu
pnpm test:menu                                # Testes do módulo de cardápios

# Teste específico
pnpm test tests/modules/lunch-reservation/unit/Reservation.spec.ts

# Modo watch
pnpm test --watch
```

### Configurar banco de teste

```bash
# Criar banco de testes
createdb bookmenu_db_test

# Executar migrações
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookmenu_db_test?schema=public" pnpm prisma:migrate
```

### Tipos de testes implementados

| Tipo           | Quantidade | Descrição                                                                            |
| -------------- | ---------- | ------------------------------------------------------------------------------------ |
| **Unitários**  | ~40        | Entidades, Services, Validators, DTOs (User, Category, MenuItem, Menu, Reservation)  |
| **Integração** | ~15        | Repositórios com banco real (Prisma repositories)                                    |
| **E2E**        | ~25        | API completa com Supertest (Auth, Users, Categories, MenuItems, Menus, Reservations) |
| **Total**      | ~80        | Cobertura > 90%                                                                      |

---

## 📡 Endpoints da API

### Base URL

```
http://localhost:8080/api
```

---

### 1. Authentication (`/api/auth`)

#### **POST** `/api/auth/login`

Autentica um usuário no sistema usando CPF e senha.

**Request Body:**

```json
{
  "cpf": "12345678901",
  "password": "senha123"
}
```

**Campos obrigatórios:** `cpf`, `password`

**Validações:**

- `cpf`: Exatamente 11 dígitos numéricos
- `password`: Mínimo 6 caracteres

**Exemplo de Sucesso (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJjcGYiOiIxMjM0NTY3ODkwMSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzMxMDA4NDAwLCJleHAiOjE3MzEwOTQ4MDB9.abc123xyz",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cpf": "12345678901",
    "name": "João Silva",
    "role": "USER",
    "userType": "FIXO",
    "status": "ATIVO",
    "createdAt": "2025-10-21T10:30:00.000Z",
    "updatedAt": "2025-11-07T14:20:00.000Z"
  }
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

Retornado quando os dados enviados não atendem aos requisitos de validação.

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "CPF deve conter exatamente 11 dígitos",
      "path": ["cpf"]
    }
  ]
}
```

Exemplos de erros de validação:

- CPF com formato inválido (menos ou mais de 11 dígitos)
- Senha muito curta (menos de 6 caracteres)
- Campos obrigatórios ausentes

**401 Unauthorized - Credenciais Inválidas:**

Retornado quando o CPF não existe ou a senha está incorreta.

```json
{
  "error": "Credenciais inválidas",
  "message": "CPF ou senha incorretos"
}
```

**401 Unauthorized - Usuário Inativo:**

Retornado quando o usuário existe mas está com status INATIVO.

```json
{
  "error": "Usuário inativo",
  "message": "Este usuário está desativado. Entre em contato com o administrador."
}
```

**500 Internal Server Error - Erro no Servidor:**

Retornado quando ocorre um erro inesperado no servidor.

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde."
}
```

---

### 2. Users (`/api/users`)

#### **POST** `/api/users`

Cria um novo usuário no sistema.

**Permissões:** Requer autenticação e role ADMIN

**Request Body:**

```json
{
  "cpf": "12345678901",
  "name": "João Silva",
  "password": "senha123",
  "role": "USER",
  "userType": "FIXO"
}
```

**Campos obrigatórios:** `cpf`, `name`, `password`, `role`, `userType`

**Validações:**

- `cpf`: Exatamente 11 dígitos numéricos
- `name`: 3-255 caracteres
- `password`: Mínimo 6 caracteres
- `role`: "ADMIN" ou "USER"
- `userType`: "FIXO" ou "NAO_FIXO"

**Exemplo de Sucesso (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf": "12345678901",
  "name": "João Silva",
  "role": "USER",
  "userType": "FIXO",
  "status": "ATIVO",
  "createdAt": "2025-11-07T10:30:00.000Z",
  "updatedAt": "2025-11-07T10:30:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "CPF deve conter exatamente 11 dígitos",
      "path": ["cpf"]
    }
  ]
}
```

Exemplos de erros de validação:

- CPF com formato inválido (menos ou mais de 11 dígitos)
- Nome muito curto (menos de 3 caracteres)
- Senha muito curta (menos de 6 caracteres)
- Role inválido (diferente de "ADMIN" ou "USER")
- UserType inválido (diferente de "FIXO" ou "NAO_FIXO")

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem criar usuários"
}
```

**409 Conflict - CPF Já Cadastrado:**

```json
{
  "error": "CPF já cadastrado",
  "message": "Já existe um usuário com este CPF no sistema"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/users`

Retorna a lista de todos os usuários cadastrados no sistema.

**Permissões:** Requer autenticação e role ADMIN

**Query Parameters (opcionais):**

- `status`: Filtrar por status (ATIVO, INATIVO)
- `role`: Filtrar por role (ADMIN, USER)
- `userType`: Filtrar por tipo (FIXO, NAO_FIXO)

**Exemplo de Sucesso (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cpf": "12345678901",
    "name": "João Silva",
    "role": "USER",
    "userType": "FIXO",
    "status": "ATIVO",
    "createdAt": "2025-11-07T10:30:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "cpf": "98765432109",
    "name": "Maria Santos",
    "role": "ADMIN",
    "userType": "FIXO",
    "status": "ATIVO",
    "createdAt": "2025-11-05T08:15:00.000Z",
    "updatedAt": "2025-11-06T14:20:00.000Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "cpf": "11122233344",
    "name": "Pedro Oliveira",
    "role": "USER",
    "userType": "NAO_FIXO",
    "status": "INATIVO",
    "createdAt": "2025-10-20T12:00:00.000Z",
    "updatedAt": "2025-11-01T09:30:00.000Z"
  }
]
```

**Possíveis Erros:**

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem listar todos os usuários"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/users/{id}`

Retorna os dados de um usuário específico.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do usuário

**Exemplo de Requisição:**

```
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf": "12345678901",
  "name": "João Silva",
  "role": "USER",
  "userType": "FIXO",
  "status": "ATIVO",
  "createdAt": "2025-11-07T10:30:00.000Z",
  "updatedAt": "2025-11-07T10:30:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem visualizar dados de usuários"
}
```

**404 Not Found - Usuário Não Encontrado:**

```json
{
  "error": "Usuário não encontrado",
  "message": "Não existe usuário com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **PATCH** `/api/users/{id}`

Atualiza os dados de um usuário existente.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do usuário

**Request Body (todos os campos são opcionais):**

```json
{
  "name": "João Silva Santos",
  "userType": "NAO_FIXO",
  "role": "ADMIN"
}
```

**Campos atualizáveis:**

- `name`: Novo nome do usuário (3-255 caracteres)
- `userType`: Novo tipo de usuário ("FIXO" ou "NAO_FIXO")
- `role`: Nova role do usuário ("ADMIN" ou "USER")
- `password`: Nova senha (mínimo 6 caracteres)

**Observações:**

- O CPF não pode ser alterado
- O status deve ser alterado através do endpoint específico `/api/users/{id}/status`
- Ao menos um campo deve ser fornecido para atualização

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf": "12345678901",
  "name": "João Silva Santos",
  "role": "ADMIN",
  "userType": "NAO_FIXO",
  "status": "ATIVO",
  "createdAt": "2025-11-07T10:30:00.000Z",
  "updatedAt": "2025-11-07T16:45:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Nome deve ter no mínimo 3 caracteres",
      "path": ["name"]
    }
  ]
}
```

Exemplos de erros de validação:

- Nome muito curto (menos de 3 caracteres)
- Role inválido (diferente de "ADMIN" ou "USER")
- UserType inválido (diferente de "FIXO" ou "NAO_FIXO")
- Senha muito curta (menos de 6 caracteres)
- Nenhum campo fornecido para atualização

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem atualizar dados de usuários"
}
```

**404 Not Found - Usuário Não Encontrado:**

```json
{
  "error": "Usuário não encontrado",
  "message": "Não existe usuário com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **PATCH** `/api/users/{id}/status`

Alterna o status de um usuário entre ATIVO e INATIVO.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do usuário

**Request Body:** Não requer corpo na requisição

**Comportamento:**

- Se o usuário está ATIVO, será alterado para INATIVO
- Se o usuário está INATIVO, será alterado para ATIVO
- Usuários inativos não podem fazer login no sistema
- Reservas existentes de usuários inativos são mantidas

**Exemplo de Requisição:**

```
PATCH /api/users/550e8400-e29b-41d4-a716-446655440000/status
```

**Exemplo de Sucesso (200 OK) - Usuário Desativado:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf": "12345678901",
  "name": "João Silva",
  "role": "USER",
  "userType": "FIXO",
  "status": "INATIVO",
  "createdAt": "2025-11-07T10:30:00.000Z",
  "updatedAt": "2025-11-07T17:20:00.000Z"
}
```

**Exemplo de Sucesso (200 OK) - Usuário Reativado:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf": "12345678901",
  "name": "João Silva",
  "role": "USER",
  "userType": "FIXO",
  "status": "ATIVO",
  "createdAt": "2025-11-07T10:30:00.000Z",
  "updatedAt": "2025-11-07T18:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem alterar o status de usuários"
}
```

**404 Not Found - Usuário Não Encontrado:**

```json
{
  "error": "Usuário não encontrado",
  "message": "Não existe usuário com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

### 3. Categories (`/api/categories`)

#### **POST** `/api/categories`

Cria uma nova categoria de alimentos no sistema.

**Permissões:** Requer autenticação e role ADMIN

**Request Body:**

```json
{
  "name": "Proteína",
  "description": "Carnes e proteínas principais",
  "displayOrder": 1
}
```

**Campos obrigatórios:** `name`, `displayOrder`

**Validações:**

- `name`: 2-100 caracteres
- `description`: Opcional, máximo 500 caracteres
- `displayOrder`: Número inteiro positivo

**Exemplo de Sucesso (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "name": "Proteína",
  "description": "Carnes e proteínas principais",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Nome deve ter entre 2 e 100 caracteres",
      "path": ["name"]
    }
  ]
}
```

Exemplos de erros de validação:

- Nome muito curto (menos de 2 caracteres) ou muito longo (mais de 100 caracteres)
- Descrição muito longa (mais de 500 caracteres)
- displayOrder não é um número inteiro positivo
- Campos obrigatórios ausentes

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem criar categorias"
}
```

**409 Conflict - Nome Já Cadastrado:**

```json
{
  "error": "Categoria já existe",
  "message": "Já existe uma categoria com este nome no sistema"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/categories`

Retorna a lista de todas as categorias cadastradas no sistema.

**Permissões:** Requer autenticação

**Query Parameters (opcionais):**

- `isActive`: Filtrar por status (true, false)

**Exemplo de Sucesso (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "name": "Proteína",
    "description": "Carnes e proteínas principais",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440021",
    "name": "Acompanhamento",
    "description": "Arroz, feijão, massas e outros acompanhamentos",
    "displayOrder": 2,
    "isActive": true,
    "createdAt": "2025-11-07T10:05:00.000Z",
    "updatedAt": "2025-11-07T10:05:00.000Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440022",
    "name": "Salada",
    "description": "Saladas e vegetais frescos",
    "displayOrder": 3,
    "isActive": true,
    "createdAt": "2025-11-07T10:10:00.000Z",
    "updatedAt": "2025-11-07T10:10:00.000Z"
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440023",
    "name": "Sobremesa",
    "description": "Frutas e doces",
    "displayOrder": 4,
    "isActive": true,
    "createdAt": "2025-11-07T10:15:00.000Z",
    "updatedAt": "2025-11-07T10:15:00.000Z"
  }
]
```

**Possíveis Erros:**

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/categories/{id}`

Retorna os dados de uma categoria específica.

**Permissões:** Requer autenticação

**Parâmetros de URL:**

- `id` (UUID): Identificador único da categoria

**Exemplo de Requisição:**

```
GET /api/categories/550e8400-e29b-41d4-a716-446655440020
```

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "name": "Proteína",
  "description": "Carnes e proteínas principais",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**404 Not Found - Categoria Não Encontrada:**

```json
{
  "error": "Categoria não encontrada",
  "message": "Não existe categoria com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **PATCH** `/api/categories/{id}`

Atualiza os dados de uma categoria existente.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único da categoria

**Request Body (todos os campos são opcionais):**

```json
{
  "name": "Proteína Principal",
  "description": "Carnes, aves, peixes e ovos",
  "displayOrder": 1,
  "isActive": true
}
```

**Campos atualizáveis:**

- `name`: Novo nome da categoria (2-100 caracteres)
- `description`: Nova descrição (máximo 500 caracteres)
- `displayOrder`: Nova ordem de exibição (número inteiro positivo)
- `isActive`: Status de ativação (true ou false)

**Observações:**

- Ao menos um campo deve ser fornecido para atualização
- Alterar `isActive` para `false` desativa a categoria

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "name": "Proteína Principal",
  "description": "Carnes, aves, peixes e ovos",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T14:30:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Nome deve ter entre 2 e 100 caracteres",
      "path": ["name"]
    }
  ]
}
```

Exemplos de erros de validação:

- Nome muito curto (menos de 2 caracteres) ou muito longo (mais de 100 caracteres)
- Descrição muito longa (mais de 500 caracteres)
- displayOrder não é um número inteiro positivo
- Nenhum campo fornecido para atualização

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem atualizar categorias"
}
```

**404 Not Found - Categoria Não Encontrada:**

```json
{
  "error": "Categoria não encontrada",
  "message": "Não existe categoria com o ID fornecido"
}
```

**409 Conflict - Nome Já Cadastrado:**

```json
{
  "error": "Categoria já existe",
  "message": "Já existe outra categoria com este nome no sistema"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **DELETE** `/api/categories/{id}`

Remove uma categoria do sistema.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único da categoria

**Exemplo de Requisição:**

```
DELETE /api/categories/880e8400-e29b-41d4-a716-446655440023
```

**Observações:**

- A categoria não pode ser removida se houver itens de menu associados a ela
- Esta operação é irreversível
- Considere desativar a categoria (isActive: false) ao invés de removê-la

**Exemplo de Sucesso (204 No Content):**

Sem corpo de resposta. A categoria foi removida com sucesso.

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem remover categorias"
}
```

**404 Not Found - Categoria Não Encontrada:**

```json
{
  "error": "Categoria não encontrada",
  "message": "Não existe categoria com o ID fornecido"
}
```

**409 Conflict - Categoria em Uso:**

```json
{
  "error": "Categoria em uso",
  "message": "Não é possível remover esta categoria pois existem itens de menu associados a ela"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

### 4. Menu Items (`/api/menu-items`)

#### **POST** `/api/menu-items`

Cria um novo item de menu no sistema.

**Permissões:** Requer autenticação e role ADMIN

**Request Body:**

```json
{
  "name": "Frango Grelhado",
  "description": "Peito de frango grelhado temperado com ervas",
  "categoryId": "550e8400-e29b-41d4-a716-446655440020"
}
```

**Campos obrigatórios:** `name`, `categoryId`

**Validações:**

- `name`: 2-200 caracteres
- `description`: Opcional, máximo 500 caracteres
- `categoryId`: UUID válido de uma categoria existente

**Exemplo de Sucesso (201 Created):**

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

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Nome deve ter entre 2 e 200 caracteres",
      "path": ["name"]
    }
  ]
}
```

Exemplos de erros de validação:

- Nome muito curto (menos de 2 caracteres) ou muito longo (mais de 200 caracteres)
- Descrição muito longa (mais de 500 caracteres)
- categoryId não é um UUID válido
- Campos obrigatórios ausentes

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem criar itens de menu"
}
```

**404 Not Found - Categoria Não Encontrada:**

```json
{
  "error": "Categoria não encontrada",
  "message": "A categoria especificada não existe no sistema"
}
```

**409 Conflict - Nome Já Cadastrado:**

```json
{
  "error": "Item de menu já existe",
  "message": "Já existe um item de menu com este nome na mesma categoria"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/menu-items`

Retorna a lista de todos os itens de menu cadastrados no sistema.

**Permissões:** Requer autenticação

**Query Parameters (opcionais):**

- `categoryId`: Filtrar por categoria específica (UUID)
- `isActive`: Filtrar por status (true, false)

**Exemplo de Sucesso (200 OK):**

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440030",
    "name": "Frango Grelhado",
    "description": "Peito de frango grelhado temperado com ervas",
    "categoryId": "550e8400-e29b-41d4-a716-446655440020",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Proteína"
    },
    "isActive": true,
    "createdAt": "2025-11-07T18:00:00.000Z",
    "updatedAt": "2025-11-07T18:00:00.000Z"
  },
  {
    "id": "990e8400-e29b-41d4-a716-446655440031",
    "name": "Arroz Branco",
    "description": "Arroz branco soltinho",
    "categoryId": "660e8400-e29b-41d4-a716-446655440021",
    "category": {
      "id": "660e8400-e29b-41d4-a716-446655440021",
      "name": "Acompanhamento"
    },
    "isActive": true,
    "createdAt": "2025-11-07T18:05:00.000Z",
    "updatedAt": "2025-11-07T18:05:00.000Z"
  },
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440032",
    "name": "Feijão Preto",
    "description": "Feijão preto cozido com temperos especiais",
    "categoryId": "660e8400-e29b-41d4-a716-446655440021",
    "category": {
      "id": "660e8400-e29b-41d4-a716-446655440021",
      "name": "Acompanhamento"
    },
    "isActive": true,
    "createdAt": "2025-11-07T18:10:00.000Z",
    "updatedAt": "2025-11-07T18:10:00.000Z"
  },
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440033",
    "name": "Salada Verde",
    "description": "Mix de folhas verdes frescas",
    "categoryId": "770e8400-e29b-41d4-a716-446655440022",
    "category": {
      "id": "770e8400-e29b-41d4-a716-446655440022",
      "name": "Salada"
    },
    "isActive": true,
    "createdAt": "2025-11-07T18:15:00.000Z",
    "updatedAt": "2025-11-07T18:15:00.000Z"
  }
]
```

**Possíveis Erros:**

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/menu-items/{id}`

Retorna os dados de um item de menu específico.

**Permissões:** Requer autenticação

**Parâmetros de URL:**

- `id` (UUID): Identificador único do item de menu

**Exemplo de Requisição:**

```
GET /api/menu-items/880e8400-e29b-41d4-a716-446655440030
```

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440030",
  "name": "Frango Grelhado",
  "description": "Peito de frango grelhado temperado com ervas",
  "categoryId": "550e8400-e29b-41d4-a716-446655440020",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "name": "Proteína",
    "description": "Carnes e proteínas principais",
    "displayOrder": 1
  },
  "isActive": true,
  "createdAt": "2025-11-07T18:00:00.000Z",
  "updatedAt": "2025-11-07T18:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**404 Not Found - Item Não Encontrado:**

```json
{
  "error": "Item de menu não encontrado",
  "message": "Não existe item de menu com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **PATCH** `/api/menu-items/{id}`

Atualiza os dados de um item de menu existente.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do item de menu

**Request Body (todos os campos são opcionais):**

```json
{
  "name": "Frango Grelhado com Alecrim",
  "description": "Peito de frango grelhado temperado com alecrim e limão",
  "categoryId": "550e8400-e29b-41d4-a716-446655440020",
  "isActive": true
}
```

**Campos atualizáveis:**

- `name`: Novo nome do item (2-200 caracteres)
- `description`: Nova descrição (máximo 500 caracteres)
- `categoryId`: Nova categoria (UUID válido)
- `isActive`: Status de ativação (true ou false)

**Observações:**

- Ao menos um campo deve ser fornecido para atualização
- Alterar `isActive` para `false` desativa o item de menu
- Itens inativos não aparecem na listagem de cardápios

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440030",
  "name": "Frango Grelhado com Alecrim",
  "description": "Peito de frango grelhado temperado com alecrim e limão",
  "categoryId": "550e8400-e29b-41d4-a716-446655440020",
  "isActive": true,
  "createdAt": "2025-11-07T18:00:00.000Z",
  "updatedAt": "2025-11-07T20:30:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Nome deve ter entre 2 e 200 caracteres",
      "path": ["name"]
    }
  ]
}
```

Exemplos de erros de validação:

- Nome muito curto (menos de 2 caracteres) ou muito longo (mais de 200 caracteres)
- Descrição muito longa (mais de 500 caracteres)
- categoryId não é um UUID válido
- Nenhum campo fornecido para atualização

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem atualizar itens de menu"
}
```

**404 Not Found - Item Não Encontrado:**

```json
{
  "error": "Item de menu não encontrado",
  "message": "Não existe item de menu com o ID fornecido"
}
```

**404 Not Found - Categoria Não Encontrada:**

```json
{
  "error": "Categoria não encontrada",
  "message": "A categoria especificada não existe no sistema"
}
```

**409 Conflict - Nome Já Cadastrado:**

```json
{
  "error": "Item de menu já existe",
  "message": "Já existe outro item de menu com este nome na mesma categoria"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **DELETE** `/api/menu-items/{id}`

Remove um item de menu do sistema.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do item de menu

**Exemplo de Requisição:**

```
DELETE /api/menu-items/bb0e8400-e29b-41d4-a716-446655440033
```

**Observações:**

- O item não pode ser removido se estiver sendo usado em algum cardápio ativo
- Esta operação é irreversível
- Considere desativar o item (isActive: false) ao invés de removê-lo

**Exemplo de Sucesso (204 No Content):**

Sem corpo de resposta. O item de menu foi removido com sucesso.

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem remover itens de menu"
}
```

**404 Not Found - Item Não Encontrado:**

```json
{
  "error": "Item de menu não encontrado",
  "message": "Não existe item de menu com o ID fornecido"
}
```

**409 Conflict - Item em Uso:**

```json
{
  "error": "Item de menu em uso",
  "message": "Não é possível remover este item pois ele está sendo usado em cardápios ativos"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

### 5. Week Days (`/api/week-days`)

#### **GET** `/api/week-days`

Retorna a lista de todos os dias da semana cadastrados.

**Exemplo de resposta:**

```json
[
  {
    "id": "1",
    "name": "Segunda-feira",
    "dayOfWeek": "MONDAY"
  },
  {
    "id": "2",
    "name": "Terça-feira",
    "dayOfWeek": "TUESDAY"
  }
]
```

---

### 6. Menus (`/api/menus`)

#### **POST** `/api/menus`

Cria um novo cardápio diário com sua composição de itens de alimento.

**Permissões:** Requer autenticação e role ADMIN

**Request Body:**

```json
{
  "date": "2025-11-10",
  "dayOfWeek": "MONDAY",
  "observations": "Cardápio especial de segunda-feira",
  "menuCompositions": [
    {
      "menuItemId": "880e8400-e29b-41d4-a716-446655440030",
      "isMainProtein": true
    },
    {
      "menuItemId": "880e8400-e29b-41d4-a716-446655440031",
      "isMainProtein": false
    },
    {
      "menuItemId": "880e8400-e29b-41d4-a716-446655440032",
      "isMainProtein": false
    },
    {
      "menuItemId": "880e8400-e29b-41d4-a716-446655440033",
      "isMainProtein": false
    }
  ]
}
```

**Campos obrigatórios:** `date`, `dayOfWeek`, `menuCompositions`

**Validações:**

- `date`: Formato YYYY-MM-DD, data futura
- `dayOfWeek`: Deve ser um dos valores: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
- `observations`: Opcional, máximo 500 caracteres
- `menuCompositions`: Array com no mínimo 1 item
  - `menuItemId`: UUID válido de um item de menu existente
  - `isMainProtein`: Boolean indicando se é a proteína principal

**Exemplo de Sucesso (201 Created):**

```json
{
  "id": "menu-550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-10",
  "dayOfWeek": "MONDAY",
  "weekNumber": 45,
  "observations": "Cardápio especial de segunda-feira",
  "isActive": true,
  "menuCompositions": [
    {
      "id": "comp-1",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440030",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440030",
        "name": "Frango Grelhado",
        "description": "Peito de frango grelhado temperado com ervas",
        "category": {
          "id": "cat-1",
          "name": "Proteína"
        }
      },
      "isMainProtein": true
    },
    {
      "id": "comp-2",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440031",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440031",
        "name": "Arroz Branco",
        "description": "Arroz branco soltinho",
        "category": {
          "id": "cat-2",
          "name": "Acompanhamento"
        }
      },
      "isMainProtein": false
    },
    {
      "id": "comp-3",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440032",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440032",
        "name": "Feijão Preto",
        "description": "Feijão preto temperado",
        "category": {
          "id": "cat-2",
          "name": "Acompanhamento"
        }
      },
      "isMainProtein": false
    },
    {
      "id": "comp-4",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440033",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440033",
        "name": "Salada Verde",
        "description": "Mix de folhas verdes",
        "category": {
          "id": "cat-3",
          "name": "Salada"
        }
      },
      "isMainProtein": false
    }
  ],
  "variations": [
    {
      "id": "var-1",
      "name": "Padrão",
      "description": "Cardápio padrão com todas as opções"
    },
    {
      "id": "var-2",
      "name": "Com Ovo",
      "description": "Substituição da proteína principal por ovo"
    }
  ],
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_date",
      "message": "Data deve estar no formato YYYY-MM-DD",
      "path": ["date"]
    }
  ]
}
```

Exemplos de erros de validação:

- Data em formato inválido
- Data no passado
- DayOfWeek inválido (não é um dia da semana válido)
- MenuCompositions vazio ou ausente
- MenuItemId inválido (não é UUID)
- Observations muito longo (mais de 500 caracteres)

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem criar cardápios"
}
```

**404 Not Found - Item de Menu Não Encontrado:**

```json
{
  "error": "Item de menu não encontrado",
  "message": "Um ou mais itens de menu fornecidos não existem no sistema"
}
```

**409 Conflict - Cardápio Já Existe:**

```json
{
  "error": "Cardápio já existe",
  "message": "Já existe um cardápio cadastrado para esta data"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/menus`

Retorna a lista de cardápios com filtros opcionais.

**Permissões:** Requer autenticação

**Query Parameters (opcionais):**

- `date`: Filtrar por data específica (formato: YYYY-MM-DD)
- `startDate`: Data inicial do período (formato: YYYY-MM-DD)
- `endDate`: Data final do período (formato: YYYY-MM-DD)
- `dayOfWeek`: Filtrar por dia da semana (MONDAY, TUESDAY, etc.)
- `isActive`: Filtrar por status (true, false)

**Exemplos de Requisição:**

```
GET /api/menus
GET /api/menus?date=2025-11-10
GET /api/menus?startDate=2025-11-10&endDate=2025-11-15
GET /api/menus?dayOfWeek=MONDAY&isActive=true
```

**Exemplo de Sucesso (200 OK):**

```json
[
  {
    "id": "menu-550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-11-10",
    "dayOfWeek": "MONDAY",
    "weekNumber": 45,
    "observations": "Cardápio especial de segunda-feira",
    "isActive": true,
    "menuCompositions": [
      {
        "id": "comp-1",
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440030",
          "name": "Frango Grelhado",
          "description": "Peito de frango grelhado temperado com ervas",
          "category": {
            "id": "cat-1",
            "name": "Proteína",
            "displayOrder": 1
          }
        },
        "isMainProtein": true
      },
      {
        "id": "comp-2",
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440031",
          "name": "Arroz Branco",
          "description": "Arroz branco soltinho",
          "category": {
            "id": "cat-2",
            "name": "Acompanhamento",
            "displayOrder": 2
          }
        },
        "isMainProtein": false
      },
      {
        "id": "comp-3",
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440032",
          "name": "Feijão Preto",
          "description": "Feijão preto temperado",
          "category": {
            "id": "cat-2",
            "name": "Acompanhamento",
            "displayOrder": 2
          }
        },
        "isMainProtein": false
      },
      {
        "id": "comp-4",
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440033",
          "name": "Salada Verde",
          "description": "Mix de folhas verdes",
          "category": {
            "id": "cat-3",
            "name": "Salada",
            "displayOrder": 3
          }
        },
        "isMainProtein": false
      }
    ],
    "variations": [
      {
        "id": "var-1",
        "name": "Padrão",
        "description": "Cardápio padrão com todas as opções"
      },
      {
        "id": "var-2",
        "name": "Com Ovo",
        "description": "Substituição da proteína principal por ovo"
      }
    ],
    "createdAt": "2025-11-07T10:00:00.000Z",
    "updatedAt": "2025-11-07T10:00:00.000Z"
  },
  {
    "id": "menu-660e8400-e29b-41d4-a716-446655440001",
    "date": "2025-11-11",
    "dayOfWeek": "TUESDAY",
    "weekNumber": 45,
    "observations": "Cardápio de terça-feira",
    "isActive": true,
    "menuCompositions": [
      {
        "id": "comp-5",
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440034",
          "name": "Peixe Assado",
          "description": "Filé de peixe assado com limão",
          "category": {
            "id": "cat-1",
            "name": "Proteína",
            "displayOrder": 1
          }
        },
        "isMainProtein": true
      },
      {
        "id": "comp-6",
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440035",
          "name": "Batata Assada",
          "description": "Batata assada com alecrim",
          "category": {
            "id": "cat-2",
            "name": "Acompanhamento",
            "displayOrder": 2
          }
        },
        "isMainProtein": false
      }
    ],
    "variations": [
      {
        "id": "var-3",
        "name": "Padrão",
        "description": "Cardápio padrão com todas as opções"
      },
      {
        "id": "var-4",
        "name": "Com Ovo",
        "description": "Substituição da proteína principal por ovo"
      }
    ],
    "createdAt": "2025-11-07T11:00:00.000Z",
    "updatedAt": "2025-11-07T11:00:00.000Z"
  }
]
```

**Possíveis Erros:**

**400 Bad Request - Parâmetros Inválidos:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_date",
      "message": "Data deve estar no formato YYYY-MM-DD",
      "path": ["date"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/menus/{id}`

Retorna os dados detalhados de um cardápio específico.

**Permissões:** Requer autenticação

**Parâmetros de URL:**

- `id` (UUID): Identificador único do cardápio

**Exemplo de Requisição:**

```
GET /api/menus/menu-550e8400-e29b-41d4-a716-446655440000
```

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "menu-550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-10",
  "dayOfWeek": "MONDAY",
  "weekNumber": 45,
  "observations": "Cardápio especial de segunda-feira",
  "isActive": true,
  "menuCompositions": [
    {
      "id": "comp-1",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440030",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440030",
        "name": "Frango Grelhado",
        "description": "Peito de frango grelhado temperado com ervas",
        "isActive": true,
        "category": {
          "id": "cat-1",
          "name": "Proteína",
          "description": "Opções de proteínas",
          "displayOrder": 1,
          "isActive": true
        }
      },
      "isMainProtein": true
    },
    {
      "id": "comp-2",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440031",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440031",
        "name": "Arroz Branco",
        "description": "Arroz branco soltinho",
        "isActive": true,
        "category": {
          "id": "cat-2",
          "name": "Acompanhamento",
          "description": "Acompanhamentos diversos",
          "displayOrder": 2,
          "isActive": true
        }
      },
      "isMainProtein": false
    },
    {
      "id": "comp-3",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440032",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440032",
        "name": "Feijão Preto",
        "description": "Feijão preto temperado",
        "isActive": true,
        "category": {
          "id": "cat-2",
          "name": "Acompanhamento",
          "description": "Acompanhamentos diversos",
          "displayOrder": 2,
          "isActive": true
        }
      },
      "isMainProtein": false
    },
    {
      "id": "comp-4",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440033",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440033",
        "name": "Salada Verde",
        "description": "Mix de folhas verdes",
        "isActive": true,
        "category": {
          "id": "cat-3",
          "name": "Salada",
          "description": "Opções de saladas",
          "displayOrder": 3,
          "isActive": true
        }
      },
      "isMainProtein": false
    }
  ],
  "variations": [
    {
      "id": "var-1",
      "menuId": "menu-550e8400-e29b-41d4-a716-446655440000",
      "name": "Padrão",
      "description": "Cardápio padrão com todas as opções",
      "createdAt": "2025-11-07T10:00:00.000Z"
    },
    {
      "id": "var-2",
      "menuId": "menu-550e8400-e29b-41d4-a716-446655440000",
      "name": "Com Ovo",
      "description": "Substituição da proteína principal por ovo",
      "createdAt": "2025-11-07T10:00:00.000Z"
    }
  ],
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**404 Not Found - Cardápio Não Encontrado:**

```json
{
  "error": "Cardápio não encontrado",
  "message": "Não existe cardápio com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **PATCH** `/api/menus/{id}`

Atualiza os dados de um cardápio existente.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do cardápio

**Request Body (todos os campos são opcionais):**

```json
{
  "date": "2025-11-11",
  "dayOfWeek": "TUESDAY",
  "observations": "Cardápio atualizado com novas observações",
  "isActive": false,
  "menuCompositions": [
    {
      "menuItemId": "880e8400-e29b-41d4-a716-446655440034",
      "isMainProtein": true
    },
    {
      "menuItemId": "880e8400-e29b-41d4-a716-446655440035",
      "isMainProtein": false
    }
  ]
}
```

**Campos atualizáveis:**

- `date`: Nova data do cardápio (formato YYYY-MM-DD)
- `dayOfWeek`: Novo dia da semana
- `observations`: Novas observações (máximo 500 caracteres)
- `isActive`: Status do cardápio (true/false)
- `menuCompositions`: Nova composição do cardápio (substitui a composição anterior)

**Observações:**

- Ao menos um campo deve ser fornecido para atualização
- Se `menuCompositions` for fornecido, a composição anterior será completamente substituída
- Não é possível atualizar cardápios de datas passadas

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "menu-550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-11",
  "dayOfWeek": "TUESDAY",
  "weekNumber": 45,
  "observations": "Cardápio atualizado com novas observações",
  "isActive": false,
  "menuCompositions": [
    {
      "id": "comp-5",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440034",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440034",
        "name": "Peixe Assado",
        "description": "Filé de peixe assado com limão",
        "category": {
          "id": "cat-1",
          "name": "Proteína"
        }
      },
      "isMainProtein": true
    },
    {
      "id": "comp-6",
      "menuItemId": "880e8400-e29b-41d4-a716-446655440035",
      "menuItem": {
        "id": "880e8400-e29b-41d4-a716-446655440035",
        "name": "Batata Assada",
        "description": "Batata assada com alecrim",
        "category": {
          "id": "cat-2",
          "name": "Acompanhamento"
        }
      },
      "isMainProtein": false
    }
  ],
  "variations": [
    {
      "id": "var-1",
      "name": "Padrão",
      "description": "Cardápio padrão com todas as opções"
    },
    {
      "id": "var-2",
      "name": "Com Ovo",
      "description": "Substituição da proteína principal por ovo"
    }
  ],
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T15:30:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_date",
      "message": "Data deve estar no formato YYYY-MM-DD",
      "path": ["date"]
    }
  ]
}
```

Exemplos de erros de validação:

- Data em formato inválido
- Data no passado
- DayOfWeek inválido
- Observations muito longo (mais de 500 caracteres)
- MenuCompositions vazio (se fornecido)
- MenuItemId inválido
- Nenhum campo fornecido para atualização

**400 Bad Request - Cardápio de Data Passada:**

```json
{
  "error": "Operação não permitida",
  "message": "Não é possível atualizar cardápios de datas passadas"
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem atualizar cardápios"
}
```

**404 Not Found - Cardápio Não Encontrado:**

```json
{
  "error": "Cardápio não encontrado",
  "message": "Não existe cardápio com o ID fornecido"
}
```

**404 Not Found - Item de Menu Não Encontrado:**

```json
{
  "error": "Item de menu não encontrado",
  "message": "Um ou mais itens de menu fornecidos não existem no sistema"
}
```

**409 Conflict - Data Já Utilizada:**

```json
{
  "error": "Conflito de data",
  "message": "Já existe outro cardápio cadastrado para a nova data informada"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **DELETE** `/api/menus/{id}`

Remove um cardápio do sistema.

**Permissões:** Requer autenticação e role ADMIN

**Parâmetros de URL:**

- `id` (UUID): Identificador único do cardápio

**Exemplo de Requisição:**

```
DELETE /api/menus/menu-550e8400-e29b-41d4-a716-446655440000
```

**Observações:**

- Não é possível excluir cardápios que possuem reservas ativas
- Não é possível excluir cardápios de datas passadas
- A exclusão é permanente e não pode ser desfeita

**Exemplo de Sucesso (204 No Content):**

Sem corpo de resposta. Status HTTP 204 indica sucesso.

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**400 Bad Request - Cardápio com Reservas:**

```json
{
  "error": "Operação não permitida",
  "message": "Não é possível excluir cardápio que possui reservas ativas. Cancele as reservas primeiro."
}
```

**400 Bad Request - Cardápio de Data Passada:**

```json
{
  "error": "Operação não permitida",
  "message": "Não é possível excluir cardápios de datas passadas"
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Sem Permissão:**

```json
{
  "error": "Acesso negado",
  "message": "Apenas administradores podem excluir cardápios"
}
```

**404 Not Found - Cardápio Não Encontrado:**

```json
{
  "error": "Cardápio não encontrado",
  "message": "Não existe cardápio com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

### 7. Reservations (`/api/reservations`)

#### **POST** `/api/reservations`

Cria uma nova reserva de almoço para o usuário autenticado.

**Permissões:** Requer autenticação (USER ou ADMIN)

**Request Body:**

```json
{
  "menuId": "550e8400-e29b-41d4-a716-446655440010",
  "menuVariationId": "660e8400-e29b-41d4-a716-446655440020",
  "reservationDate": "2025-11-10"
}
```

**Campos obrigatórios:** `menuId`, `menuVariationId`, `reservationDate`

**Validações:**

- `menuId`: UUID válido do cardápio
- `menuVariationId`: UUID válido da variação do cardápio
- `reservationDate`: Data no formato YYYY-MM-DD
- **Restrição de horário:** Reserva só pode ser criada até às **8:30 AM** do dia da refeição
- Usuário não pode ter mais de uma reserva para a mesma data

**Exemplo de Sucesso (201 Created):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440030",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "menuId": "550e8400-e29b-41d4-a716-446655440010",
  "menuVariationId": "660e8400-e29b-41d4-a716-446655440020",
  "reservationDate": "2025-11-10",
  "status": "ACTIVE",
  "isAutoGenerated": false,
  "createdAt": "2025-11-07T18:30:00.000Z",
  "updatedAt": "2025-11-07T18:30:00.000Z",
  "menu": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "date": "2025-11-10",
    "dayOfWeek": "MONDAY",
    "observations": "Cardápio especial da semana"
  },
  "menuVariation": {
    "id": "660e8400-e29b-41d4-a716-446655440020",
    "name": "Padrão",
    "description": "Cardápio padrão com proteína principal"
  }
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "menuId deve ser um UUID válido",
      "path": ["menuId"]
    }
  ]
}
```

Exemplos de erros de validação:

- menuId ou menuVariationId com formato UUID inválido
- reservationDate com formato de data inválido
- Campos obrigatórios ausentes

**400 Bad Request - Prazo Expirado (após 8:30 AM):**

```json
{
  "error": "Prazo expirado",
  "message": "Reservas só podem ser criadas até às 8:30 AM do dia da refeição. O prazo para esta data já expirou."
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para criar reservas"
}
```

**404 Not Found - Cardápio Não Encontrado:**

```json
{
  "error": "Cardápio não encontrado",
  "message": "Não existe cardápio com o ID fornecido"
}
```

**404 Not Found - Variação Não Encontrada:**

```json
{
  "error": "Variação de cardápio não encontrada",
  "message": "A variação selecionada não existe para este cardápio"
}
```

**409 Conflict - Reserva Duplicada:**

```json
{
  "error": "Reserva duplicada",
  "message": "Você já possui uma reserva para esta data. Cancele a reserva existente antes de criar uma nova."
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/reservations`

Retorna a lista de reservas do usuário autenticado.

**Permissões:** Requer autenticação (USER ou ADMIN)

**Query Parameters (opcionais):**

- `status`: Filtrar por status (ACTIVE, CANCELLED)
- `startDate`: Data inicial do período (formato: YYYY-MM-DD)
- `endDate`: Data final do período (formato: YYYY-MM-DD)

**Exemplo de Requisição:**

```
GET /api/reservations?status=ACTIVE&startDate=2025-11-01&endDate=2025-11-30
```

**Exemplo de Sucesso (200 OK):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440030",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "menuId": "550e8400-e29b-41d4-a716-446655440010",
    "menuVariationId": "660e8400-e29b-41d4-a716-446655440020",
    "reservationDate": "2025-11-10",
    "status": "ACTIVE",
    "isAutoGenerated": false,
    "createdAt": "2025-11-07T18:30:00.000Z",
    "updatedAt": "2025-11-07T18:30:00.000Z",
    "menu": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "date": "2025-11-10",
      "dayOfWeek": "MONDAY",
      "observations": "Cardápio especial da semana",
      "menuCompositions": [
        {
          "menuItem": {
            "id": "880e8400-e29b-41d4-a716-446655440040",
            "name": "Frango Grelhado",
            "category": {
              "name": "Proteína"
            }
          }
        },
        {
          "menuItem": {
            "id": "990e8400-e29b-41d4-a716-446655440050",
            "name": "Arroz Branco",
            "category": {
              "name": "Acompanhamento"
            }
          }
        },
        {
          "menuItem": {
            "id": "aa0e8400-e29b-41d4-a716-446655440060",
            "name": "Feijão Preto",
            "category": {
              "name": "Acompanhamento"
            }
          }
        },
        {
          "menuItem": {
            "id": "bb0e8400-e29b-41d4-a716-446655440070",
            "name": "Salada Verde",
            "category": {
              "name": "Salada"
            }
          }
        }
      ]
    },
    "menuVariation": {
      "id": "660e8400-e29b-41d4-a716-446655440020",
      "name": "Padrão",
      "description": "Cardápio padrão com proteína principal"
    }
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440031",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "menuId": "550e8400-e29b-41d4-a716-446655440011",
    "menuVariationId": "660e8400-e29b-41d4-a716-446655440021",
    "reservationDate": "2025-11-11",
    "status": "ACTIVE",
    "isAutoGenerated": true,
    "createdAt": "2025-11-04T00:00:00.000Z",
    "updatedAt": "2025-11-04T00:00:00.000Z",
    "menu": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "date": "2025-11-11",
      "dayOfWeek": "TUESDAY",
      "observations": null
    },
    "menuVariation": {
      "id": "660e8400-e29b-41d4-a716-446655440021",
      "name": "Com Ovo",
      "description": "Substituição da proteína principal por ovo"
    }
  }
]
```

**Possíveis Erros:**

**400 Bad Request - Parâmetros Inválidos:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_date",
      "message": "startDate deve estar no formato YYYY-MM-DD",
      "path": ["startDate"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar suas reservas"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **GET** `/api/reservations/{id}`

Retorna os dados detalhados de uma reserva específica.

**Permissões:** Requer autenticação (USER ou ADMIN)

**Observação:** Usuários comuns só podem visualizar suas próprias reservas. Administradores podem visualizar qualquer reserva.

**Parâmetros de URL:**

- `id` (UUID): Identificador único da reserva

**Exemplo de Requisição:**

```
GET /api/reservations/770e8400-e29b-41d4-a716-446655440030
```

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440030",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "menuId": "550e8400-e29b-41d4-a716-446655440010",
  "menuVariationId": "660e8400-e29b-41d4-a716-446655440020",
  "reservationDate": "2025-11-10",
  "status": "ACTIVE",
  "isAutoGenerated": false,
  "createdAt": "2025-11-07T18:30:00.000Z",
  "updatedAt": "2025-11-07T18:30:00.000Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cpf": "12345678901",
    "name": "João Silva",
    "userType": "FIXO"
  },
  "menu": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "date": "2025-11-10",
    "dayOfWeek": "MONDAY",
    "observations": "Cardápio especial da semana",
    "menuCompositions": [
      {
        "menuItem": {
          "id": "880e8400-e29b-41d4-a716-446655440040",
          "name": "Frango Grelhado",
          "description": "Peito de frango grelhado temperado com ervas",
          "category": {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "name": "Proteína"
          }
        },
        "isMainProtein": true,
        "isAlternativeProtein": false
      },
      {
        "menuItem": {
          "id": "990e8400-e29b-41d4-a716-446655440050",
          "name": "Arroz Branco",
          "description": "Arroz branco soltinho",
          "category": {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "name": "Acompanhamento"
          }
        },
        "isMainProtein": false,
        "isAlternativeProtein": false
      },
      {
        "menuItem": {
          "id": "aa0e8400-e29b-41d4-a716-446655440060",
          "name": "Feijão Preto",
          "description": "Feijão preto cozido",
          "category": {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "name": "Acompanhamento"
          }
        },
        "isMainProtein": false,
        "isAlternativeProtein": false
      },
      {
        "menuItem": {
          "id": "bb0e8400-e29b-41d4-a716-446655440070",
          "name": "Salada Verde",
          "description": "Mix de folhas verdes frescas",
          "category": {
            "id": "550e8400-e29b-41d4-a716-446655440003",
            "name": "Salada"
          }
        },
        "isMainProtein": false,
        "isAlternativeProtein": false
      }
    ]
  },
  "menuVariation": {
    "id": "660e8400-e29b-41d4-a716-446655440020",
    "name": "Padrão",
    "description": "Cardápio padrão com proteína principal"
  }
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para acessar este recurso"
}
```

**403 Forbidden - Acesso Negado:**

```json
{
  "error": "Acesso negado",
  "message": "Você não tem permissão para visualizar esta reserva"
}
```

**404 Not Found - Reserva Não Encontrada:**

```json
{
  "error": "Reserva não encontrada",
  "message": "Não existe reserva com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **PATCH** `/api/reservations/{id}`

Atualiza uma reserva existente, permitindo trocar a variação do cardápio.

**Permissões:** Requer autenticação (USER ou ADMIN)

**Observação:** Usuários comuns só podem atualizar suas próprias reservas. Administradores podem atualizar qualquer reserva.

**Parâmetros de URL:**

- `id` (UUID): Identificador único da reserva

**Request Body:**

```json
{
  "menuVariationId": "660e8400-e29b-41d4-a716-446655440021"
}
```

**Campos atualizáveis:**

- `menuVariationId`: UUID da nova variação do cardápio

**Validações:**

- `menuVariationId`: UUID válido de uma variação existente para o cardápio da reserva
- **Restrição de horário:** Alteração só pode ser feita até às **8:30 AM** do dia da refeição
- A reserva deve estar com status ACTIVE

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440030",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "menuId": "550e8400-e29b-41d4-a716-446655440010",
  "menuVariationId": "660e8400-e29b-41d4-a716-446655440021",
  "reservationDate": "2025-11-10",
  "status": "ACTIVE",
  "isAutoGenerated": false,
  "createdAt": "2025-11-07T18:30:00.000Z",
  "updatedAt": "2025-11-08T07:15:00.000Z",
  "menu": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "date": "2025-11-10",
    "dayOfWeek": "MONDAY",
    "observations": "Cardápio especial da semana"
  },
  "menuVariation": {
    "id": "660e8400-e29b-41d4-a716-446655440021",
    "name": "Com Ovo",
    "description": "Substituição da proteína principal por ovo"
  }
}
```

**Possíveis Erros:**

**400 Bad Request - Validação de Dados:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "menuVariationId deve ser um UUID válido",
      "path": ["menuVariationId"]
    }
  ]
}
```

**400 Bad Request - Prazo Expirado (após 8:30 AM):**

```json
{
  "error": "Prazo expirado",
  "message": "Alterações em reservas só podem ser feitas até às 8:30 AM do dia da refeição. O prazo para esta reserva já expirou."
}
```

**400 Bad Request - Reserva Cancelada:**

```json
{
  "error": "Reserva cancelada",
  "message": "Não é possível alterar uma reserva que já foi cancelada"
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para atualizar reservas"
}
```

**403 Forbidden - Acesso Negado:**

```json
{
  "error": "Acesso negado",
  "message": "Você não tem permissão para alterar esta reserva"
}
```

**404 Not Found - Reserva Não Encontrada:**

```json
{
  "error": "Reserva não encontrada",
  "message": "Não existe reserva com o ID fornecido"
}
```

**404 Not Found - Variação Não Encontrada:**

```json
{
  "error": "Variação de cardápio não encontrada",
  "message": "A variação selecionada não existe para o cardápio desta reserva"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

#### **DELETE** `/api/reservations/{id}`

Cancela uma reserva de almoço existente.

**Permissões:** Requer autenticação (USER ou ADMIN)

**Observação:** Usuários comuns só podem cancelar suas próprias reservas. Administradores podem cancelar qualquer reserva.

**Parâmetros de URL:**

- `id` (UUID): Identificador único da reserva

**Validações:**

- **Restrição de horário:** Cancelamento só pode ser feito até às **8:30 AM** do dia da refeição
- A reserva deve estar com status ACTIVE

**Exemplo de Requisição:**

```
DELETE /api/reservations/770e8400-e29b-41d4-a716-446655440030
```

**Exemplo de Sucesso (200 OK):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440030",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "menuId": "550e8400-e29b-41d4-a716-446655440010",
  "menuVariationId": "660e8400-e29b-41d4-a716-446655440020",
  "reservationDate": "2025-11-10",
  "status": "CANCELLED",
  "isAutoGenerated": false,
  "createdAt": "2025-11-07T18:30:00.000Z",
  "updatedAt": "2025-11-08T08:00:00.000Z"
}
```

**Possíveis Erros:**

**400 Bad Request - ID Inválido:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "ID deve ser um UUID válido",
      "path": ["id"]
    }
  ]
}
```

**400 Bad Request - Prazo Expirado (após 8:30 AM):**

```json
{
  "error": "Prazo expirado",
  "message": "Cancelamentos de reservas só podem ser feitos até às 8:30 AM do dia da refeição. O prazo para esta reserva já expirou."
}
```

**400 Bad Request - Reserva Já Cancelada:**

```json
{
  "error": "Reserva já cancelada",
  "message": "Esta reserva já foi cancelada anteriormente"
}
```

**401 Unauthorized - Não Autenticado:**

```json
{
  "error": "Token não fornecido",
  "message": "É necessário estar autenticado para cancelar reservas"
}
```

**403 Forbidden - Acesso Negado:**

```json
{
  "error": "Acesso negado",
  "message": "Você não tem permissão para cancelar esta reserva"
}
```

**404 Not Found - Reserva Não Encontrada:**

```json
{
  "error": "Reserva não encontrada",
  "message": "Não existe reserva com o ID fornecido"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

## 📚 Documentação Swagger

A API possui documentação interativa completa com Swagger UI para todos os endpoints do sistema de reservas de almoço corporativo.

### Acessar documentação

```
http://localhost:8080/api-docs
```

### Grupos de Endpoints Documentados:

1. **Authentication** - Autenticação de usuários (login com CPF e senha)
2. **Users** - Gerenciamento de usuários (CRUD completo, controle de status)
3. **Categories** - Gerenciamento de categorias de alimentos (CRUD completo)
4. **Menu Items** - Gerenciamento de itens de menu (CRUD completo)
5. **Week Days** - Listagem de dias da semana
6. **Menus** - Gerenciamento de cardápios semanais (CRUD completo, composições e variações)
7. **Reservations** - Gerenciamento de reservas de almoço (CRUD completo, restrições de horário)

### Recursos disponíveis:

- ✅ Interface interativa "Try it out"
- ✅ 7 grupos de endpoints documentados (Auth, Users, Categories, MenuItems, WeekDays, Menus, Reservations)
- ✅ Schemas de validação detalhados (Zod schemas)
- ✅ Exemplos de requisições e respostas com dados realistas de reservas
- ✅ Códigos de erro com descrições
- ✅ Exportação para Postman/Insomnia
- ✅ Tema escuro moderno

### Exportar para Postman/Insomnia

```
http://localhost:8080/api-docs.json
```

---

## 🎯 Decisões Técnicas

### Arquitetura Hexagonal Modular

**Por que escolhemos esta abordagem para o sistema de reservas de almoço?**

1. **Separação de Responsabilidades**: Cada módulo (User, Menu, Reservation) tem responsabilidade única e bem definida
2. **Testabilidade**: Facilita testes unitários e de integração para funcionalidades de reserva e gerenciamento de cardápios
3. **Manutenibilidade**: Código organizado e fácil de manter para operações de reserva, cardápios e usuários
4. **Escalabilidade**: Preparado para futuras expansões (notificações, relatórios, integrações com sistemas externos)
5. **Independência**: Camadas não dependem de detalhes de implementação específicos, permitindo trocar frameworks ou bibliotecas sem impactar a lógica de negócio

**Exemplo prático no domínio de reservas:**

```typescript
// Domain Layer - Independente de frameworks
export class Reservation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly menuId: string,
    public readonly menuVariationId: string,
    public readonly reservationDate: Date,
    public readonly status: ReservationStatus,
    public readonly isAutoGenerated: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  canBeCancelled(): boolean {
    const now = new Date()
    const cutoffTime = new Date(this.reservationDate)
    cutoffTime.setHours(8, 30, 0, 0)
    return now < cutoffTime && this.status === "ACTIVE"
  }
}

// Application Layer - Casos de uso
export class ReservationService {
  constructor(private reservationRepository: ReservationRepository) {}

  async createReservation(data: CreateReservationDTO): Promise<Reservation> {
    // Lógica de negócio independente de infraestrutura
    const reservation = new Reservation(/* ... */)
    return this.reservationRepository.save(reservation)
  }
}

// Infrastructure Layer - Implementação com Prisma
export class PrismaReservationRepository implements ReservationRepository {
  async save(reservation: Reservation): Promise<Reservation> {
    // Detalhes de persistência isolados
    return prisma.reservation.create({ data: reservation })
  }
}
```

### Barrel Exports

**Benefícios:**

- Imports mais limpos e organizados
- API consistente entre módulos
- Facilita refatoração
- Reduz acoplamento entre arquivos

**Exemplo no contexto de reservas:**

```typescript
// ✅ Com barrel exports (recomendado)
import {
  ReservationService,
  CreateReservationDTO,
  Reservation,
} from "@/app/modules/lunch-reservation"

import {
  MenuService,
  Menu,
  CreateMenuDTO,
} from "@/app/modules/lunch-reservation"

import { UserManagementService, User } from "@/app/modules/lunch-reservation"

// ❌ Sem barrel exports (não recomendado)
import { Reservation } from "@/app/modules/lunch-reservation/domain/entities/Reservation"
import { CreateReservationDTO } from "@/app/modules/lunch-reservation/dtos/ReservationDTOs"
import { ReservationService } from "@/app/modules/lunch-reservation/domain/services/ReservationService"
```

### TypeScript + Zod

**Vantagens:**

- **Type safety em tempo de compilação**: Detecta erros antes da execução
- **Validação de runtime com Zod**: Garante que dados externos (API requests) são válidos
- **Inferência automática de tipos**: Reduz código boilerplate
- **Melhor experiência de desenvolvimento**: Autocomplete e documentação inline

**Exemplo de validação de reserva:**

```typescript
import { z } from "zod"

// Schema de validação para criação de reserva
export const createReservationSchema = z.object({
  userId: z.string().uuid("ID do usuário deve ser um UUID válido"),
  menuId: z.string().uuid("ID do menu deve ser um UUID válido"),
  menuVariationId: z.string().uuid("ID da variação deve ser um UUID válido"),
  reservationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
})

// Inferência automática de tipo
export type CreateReservationDTO = z.infer<typeof createReservationSchema>

// Validação de CPF para autenticação
export const loginSchema = z.object({
  cpf: z
    .string()
    .length(11, "CPF deve conter exatamente 11 dígitos")
    .regex(/^\d{11}$/, "CPF deve conter apenas números"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})
```

### Prisma ORM

**Por que Prisma?**

- **Type safety nativo**: Tipos TypeScript gerados automaticamente do schema
- **Migrations automáticas**: Controle de versão do banco de dados
- **Query builder intuitivo**: Sintaxe clara e expressiva
- **Excelente integração com TypeScript**: Autocomplete e validação de tipos
- **Schema declarativo**: Fácil visualização das relações entre entidades

**Exemplo de query com type safety:**

```typescript
// Buscar reservas de um usuário com menu e variação
const reservations = await prisma.reservation.findMany({
  where: {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    status: "ACTIVE",
  },
  include: {
    menu: {
      include: {
        menuCompositions: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    },
    menuVariation: true,
  },
  orderBy: {
    reservationDate: "asc",
  },
})

// TypeScript sabe exatamente a estrutura do retorno!
// reservations[0].menu.menuCompositions[0].menuItem.name ✅
```

**Entidades Principais do Schema:**

O banco de dados `bookmenu_db` contém as seguintes entidades principais:

- **User**: Usuários do sistema (ADMIN/USER, FIXO/NAO_FIXO, ATIVO/INATIVO)
- **Category**: Categorias de alimentos (Proteína, Acompanhamento, Salada, Sobremesa)
- **MenuItem**: Itens individuais de alimento que compõem os cardápios
- **Menu**: Cardápios diários com data e dia da semana
- **MenuComposition**: Composição dos cardápios (relacionamento entre Menu e MenuItem)
- **MenuVariation**: Variações dos cardápios (padrão, substituição com ovo)
- **Reservation**: Reservas de almoço dos usuários
- **WeekDay**: Dias da semana (Segunda, Terça, Quarta, etc.)

**Relacionamentos principais:**

```
User 1---N Reservation
Menu 1---N Reservation
MenuVariation 1---N Reservation
Menu 1---N MenuComposition N---1 MenuItem
MenuItem N---1 Category
Menu N---1 WeekDay
```

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Iniciar em modo desenvolvimento
pnpm build            # Compilar TypeScript
pnpm start            # Iniciar servidor de produção

# Banco de Dados
pnpm prisma:generate  # Gerar cliente Prisma
pnpm prisma:migrate   # Executar migrações
pnpm prisma:studio    # Interface visual do banco
pnpm prisma:seed      # Popular banco com dados iniciais

# Testes
pnpm test                              # Executar todos os testes
pnpm test:unit                         # Apenas testes unitários
pnpm test:integration                  # Apenas testes de integração
pnpm test:coverage                     # Testes com cobertura

# Testes por Módulo
pnpm test:lunch-reservation            # Todos os testes de reservas de almoço
pnpm test:lunch-reservation:unit       # Testes unitários de reservas
pnpm test:lunch-reservation:integration # Testes de integração de reservas
pnpm test:lunch-reservation:e2e        # Testes E2E de reservas

# Qualidade de Código
pnpm lint             # Executar ESLint
pnpm lint:fix         # Corrigir problemas do ESLint
pnpm format           # Formatar código com Prettier
pnpm type-check       # Verificar tipos TypeScript

# Docker
pnpm docker:build     # Build das imagens Docker
pnpm docker:up        # Subir todos os serviços
pnpm docker:down      # Parar serviços
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Enderson Marin**

- GitHub: [@ENDERSON-MARIN](https://github.com/ENDERSON-MARIN)
- LinkedIn: [Enderson Marin](https://linkedin.com/in/enderson-millan)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
