# 📱 Sistema de Gestão de Dispositivos

API REST para gestão de dispositivos IoT, desenvolvida com Node.js, TypeScript, Express, PostgreSQL e Prisma ORM, seguindo os princípios da Arquitetura Hexagonal Modular.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Screenshots](#-screenshots)
- [Arquitetura Hexagonal Modular](#-arquitetura-hexagonal-modular)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Padrões de Import](#-padrões-de-import)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Execução](#-execução)
- [Testes](#-testes)
- [Endpoints](#-endpoints)
- [Documentação Swagger](#-documentação-swagger)
- [Decisões Técnicas](#-decisões-técnicas)
- [Scripts Disponíveis](#-scripts-disponíveis)

## 📸 Screenshots

<div style="overflow-x: auto;">
    <table style="width: 100%;">
        <tr>
            <td style="width: 50%;"><img src="./public/screenshots/doc.png" alt=" documentation API" style="width: 100%; height: auto; object-fit: cover;" /></td>
            <td style="width: 50%;"><img src="./public/screenshots/post.png" alt="create device" style="width: 100%; height: auto; object-fit: cover;" /></td>
        </tr>
        <tr>
            <td style="width: 50%;"><img src="./public/screenshots/get.png" alt="get all devices" style="width: 100%; height: auto; object-fit: cover;" /></td>
            <td style="width: 50%;"><img src="./public/screenshots/patch.png" alt="change status device" style="width: 100%; height: auto; object-fit: cover;" /></td>
        </tr>
    </table>
</div>

---

## 🚀 Tecnologias

### Backend

- **Node.js** v22+ - Runtime JavaScript
- **TypeScript** v5.8 - Superset JavaScript com tipagem estática
- **Express** v5.1 - Framework web minimalista
- **Zod** v4.1 - Validação de schemas com inferência de tipos

### Banco de Dados

- **PostgreSQL** v16 - Banco de dados relacional
- **Prisma ORM** v6.17 - ORM moderno com type-safety

### Testes

- **Vitest** v3.2.4 - Framework de testes unitários e integração
- **Supertest** v7.1.4 - Testes HTTP end-to-end

### Documentação

- **Swagger UI Express** v5.0.1 - Interface interativa de documentação OpenAPI 3.0

### DevOps

- **Docker** & **Docker Compose** - Containerização
- **ESLint** & **Prettier** - Qualidade e formatação de código
- **Husky** - Git hooks para qualidade

---

## 🏗️ Arquitetura Hexagonal Modular

O projeto segue os princípios da **Arquitetura Hexagonal (Ports & Adapters)** com organização **modular**, separando funcionalidades por módulos e mantendo camadas bem definidas:

### Princípios Arquiteturais

- **Separação por Módulos**: Cada funcionalidade (Device, etc.) é organizada em seu próprio módulo
- **Independência de Camadas**: Domain não depende de Infrastructure, Application não depende de detalhes externos
- **Inversão de Dependência**: Infrastructure implementa interfaces definidas no Domain
- **Single Responsibility**: Cada componente tem uma responsabilidade específica

### Camadas da Arquitetura

#### 🎯 Application Layer (`src/app/`)

- **Módulos**: Organizados por funcionalidade (`modules/device/`)
- **Domain**: Entidades e interfaces de repositório
- **Services**: Casos de uso e lógica de negócio
- **DTOs**: Contratos de entrada e saída
- **Shared**: Componentes compartilhados entre módulos

#### 🔌 Infrastructure Layer (`src/infrastructure/`)

- **HTTP**: Adaptadores primários (controllers, routes, middlewares)
- **Database**: Adaptadores secundários (repositories, ORM)
- **Service Providers**: Integrações externas (email, storage, etc.)

**Benefícios da Organização Modular:**

- ✅ Separação clara de responsabilidades por funcionalidade
- ✅ Independência de frameworks externos
- ✅ Facilita testes unitários e de integração
- ✅ Código limpo e manutenível
- ✅ Escalável para novos módulos
- ✅ Reutilização de componentes compartilhados
- ✅ Desenvolvimento paralelo por equipes

---

## 🗂️ Estrutura do Projeto

```
device-management-api/
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados
│   └── migrations/                # Histórico de migrações
│
├── src/
│   ├── app/                       # 🎯 APPLICATION LAYER
│   │   ├── modules/               # Módulos organizados por funcionalidade
│   │   │   └── device/            # Módulo Device
│   │   │       ├── domain/        # Entidades e interfaces do domínio
│   │   │       │   ├── Device.ts  # Entidade Device
│   │   │       │   ├── DeviceRepository.ts # Interface do repositório
│   │   │       │   └── index.ts   # Barrel export
│   │   │       ├── dtos/          # Data Transfer Objects
│   │   │       │   ├── CreateDeviceDTO.ts
│   │   │       │   ├── DeviceResponseDTO.ts
│   │   │       │   └── index.ts   # Barrel export
│   │   │       ├── DeviceService.ts # Casos de uso
│   │   │       ├── factories/     # Fábricas de dependências
│   │   │       │   ├── makeDeviceModule.ts
│   │   │       │   └── types.ts
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
│   │   │   │   ├── DeviceController.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── routes/            # Definição de rotas
│   │   │   │   ├── device.routes.ts
│   │   │   │   ├── applicationRouter.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── middlewares/       # Middlewares HTTP
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── validators/        # Validadores de entrada
│   │   │   │   ├── deviceSchemas.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   └── index.ts           # Barrel export HTTP
│   │   ├── database/              # Adaptadores secundários (saída)
│   │   │   ├── repositories/      # Implementações de repositórios
│   │   │   │   ├── PrismaDeviceRepository.ts
│   │   │   │   └── index.ts       # Barrel export
│   │   │   ├── prisma.ts          # Configuração do ORM
│   │   │   └── index.ts           # Barrel export database
│   │   ├── service-providers/     # Provedores de serviços externos
│   │   └── index.ts               # Barrel export infrastructure
│   │
│   ├── config/                    # Configurações da aplicação
│   │   └── swagger.ts
│   └── server.ts                  # Ponto de entrada da aplicação
│
├── tests/                         # Testes organizados por tipo
│   ├── unit/                      # Testes unitários
│   ├── integration/               # Testes de integração
│   └── e2e/                       # Testes end-to-end
│
└── docker-compose.yml             # Configuração Docker
```

### 📁 Organização por Módulos

O módulo Device segue a estrutura:

```
src/app/modules/device/
├── domain/                        # Camada de Domínio
│   ├── Device.ts                 # Entidade Device
│   ├── DeviceRepository.ts       # Interface do repositório
│   └── index.ts                  # Barrel export
├── dtos/                         # Data Transfer Objects
│   ├── CreateDeviceDTO.ts        # DTO de criação
│   ├── DeviceResponseDTO.ts      # DTO de resposta
│   └── index.ts                  # Barrel export
├── factories/                    # Fábricas de dependências
│   ├── makeDeviceModule.ts       # Factory do módulo
│   └── types.ts                  # Tipos das factories
├── DeviceService.ts              # Casos de uso
└── index.ts                      # Barrel export do módulo
```

## 📦 Padrões de Import

### Barrel Exports

O projeto utiliza **barrel exports** (arquivos `index.ts`) para simplificar imports e criar APIs limpas:

#### ✅ Imports Recomendados

```typescript
// Import de módulo completo
import { DeviceService, CreateDeviceDTO, Device } from "@/app/modules/device"

// Import de camada específica
import { DeviceController } from "@/infrastructure/http/controllers"

// Import de shared components
import { AppError } from "@/app/shared"

// Import de infrastructure
import { PrismaDeviceRepository } from "@/infrastructure/database"
```

#### ❌ Imports Não Recomendados

```typescript
// Evitar imports diretos sem barrel exports
import { Device } from "@/app/modules/device/domain/Device"
import { CreateDeviceDTO } from "@/app/modules/device/dtos/CreateDeviceDTO"
```

### Regras de Import

1. **Imports Relativos**: Dentro do mesmo módulo

   ```typescript
   import { Device } from "./domain"
   import { CreateDeviceDTO } from "./dtos"
   ```

2. **Imports Absolutos**: Entre módulos diferentes

   ```typescript
   import { AppError } from "@/app/shared"
   import { DeviceService } from "@/app/modules/device"
   ```

3. **Dependências Externas**: Sempre no topo

   ```typescript
   import express from "express"
   import { z } from "zod"

   import { DeviceService } from "@/app/modules/device"
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

- **Arquivos**: PascalCase para classes (`DeviceService.ts`)
- **Diretórios**: kebab-case (`service-providers/`)
- **Interfaces**: PascalCase sem prefixo I (`DeviceRepository`)
- **DTOs**: Sufixo DTO (`CreateDeviceDTO`)
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
git clone https://github.com/ENDERSON-MARIN/DEVICES-RESTAPI-WEBSOCKETS.git
cd device-management-api
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
DATABASE_URL=postgresql://user:password@host:port/db_name?schema=public
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
createdb device_db

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
pnpm test tests/unit

# Apenas testes de integração
pnpm test tests/integration

# Apenas testes E2E
pnpm test tests/e2e

# Teste específico
pnpm test tests/unit/app/modules/device/domain/Device.spec.ts

# Modo watch
pnpm test --watch
```

### Configurar banco de teste

```bash
# Criar banco de testes
createdb device_db_test

# Executar migrações
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/device_db_test?schema=public" pnpm prisma:migrate
```

### Tipos de testes implementados

| Tipo           | Quantidade | Descrição                               |
| -------------- | ---------- | --------------------------------------- |
| **Unitários**  | ~25        | Entidades, Services, Validators, Errors |
| **Integração** | ~8         | Repositórios com banco real             |
| **E2E**        | ~15        | API completa com Supertest              |
| **Total**      | ~48        | Cobertura > 90%                         |

---

## 📡 Endpoints

### Base URL

```
http://localhost:8080/api
```

---

### 1. **POST** `/api/devices`

Cria um novo dispositivo IoT no sistema.

**Request Body:**

```json
{
  "name": "Sensor de Temperatura",
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

**Campos obrigatórios:** `name`, `mac`

**Validações:**

- `name`: 3-255 caracteres
- `mac`: Formato MAC address válido (XX:XX:XX:XX:XX:XX)

**Respostas:**

- `201 Created`: Dispositivo criado com sucesso
- `400 Bad Request`: Dados inválidos
- `409 Conflict`: MAC address já cadastrado

**Exemplo de resposta:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sensor de Temperatura",
  "mac": "AA:BB:CC:DD:EE:FF",
  "status": "ATIVO",
  "createdAt": "2025-11-05T10:30:00.000Z",
  "updatedAt": "2025-11-05T10:30:00.000Z"
}
```

---

### 2. **GET** `/api/devices`

Retorna a lista de todos os dispositivos cadastrados, ordenados por data de criação (mais recentes primeiro).

**Respostas:**

- `200 OK`: Lista de dispositivos retornada com sucesso

**Exemplo de resposta:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sensor de Temperatura",
    "mac": "AA:BB:CC:DD:EE:FF",
    "status": "ATIVO",
    "createdAt": "2025-11-05T10:30:00.000Z",
    "updatedAt": "2025-11-05T10:30:00.000Z"
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Sensor de Umidade",
    "mac": "11:22:33:44:55:66",
    "status": "INATIVO",
    "createdAt": "2025-11-04T15:20:00.000Z",
    "updatedAt": "2025-11-04T15:20:00.000Z"
  }
]
```

---

### 3. **PATCH** `/api/devices/{id}/status`

Alterna o status de um dispositivo entre ATIVO e INATIVO.

**Parâmetros:**

- `id` (UUID): Identificador único do dispositivo

**Respostas:**

- `200 OK`: Status alterado com sucesso
- `400 Bad Request`: ID inválido (não é UUID)
- `404 Not Found`: Dispositivo não encontrado

**Exemplo de resposta:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sensor de Temperatura",
  "mac": "AA:BB:CC:DD:EE:FF",
  "status": "INATIVO",
  "createdAt": "2025-11-05T10:30:00.000Z",
  "updatedAt": "2025-11-05T11:45:00.000Z"
}
```

---

## 📚 Documentação Swagger

A API possui documentação interativa completa com Swagger UI focada na gestão de dispositivos IoT.

### Acessar documentação

```
http://localhost:8080/api-docs
```

### Recursos disponíveis:

- ✅ Interface interativa "Try it out"
- ✅ Todos os endpoints de dispositivos documentados
- ✅ Schemas de validação detalhados para dispositivos
- ✅ Exemplos de requisições e respostas com dados de dispositivos
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

**Por que escolhemos esta abordagem para gestão de dispositivos?**

1. **Separação de Responsabilidades**: O módulo de dispositivos tem responsabilidade única e bem definida
2. **Testabilidade**: Facilita testes unitários e de integração para funcionalidades IoT
3. **Manutenibilidade**: Código organizado e fácil de manter para operações de dispositivos
4. **Escalabilidade**: Preparado para futuras expansões do sistema IoT
5. **Independência**: Camadas não dependem de detalhes de implementação específicos

### Barrel Exports

**Benefícios:**

- Imports mais limpos e organizados
- API consistente entre módulos
- Facilita refatoração
- Reduz acoplamento entre arquivos

### TypeScript + Zod

**Vantagens:**

- Type safety em tempo de compilação
- Validação de runtime com Zod
- Inferência automática de tipos
- Melhor experiência de desenvolvimento

### Prisma ORM

**Por que Prisma?**

- Type safety nativo
- Migrations automáticas
- Query builder intuitivo
- Excelente integração com TypeScript

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

# Testes
pnpm test             # Executar todos os testes
pnpm test:unit        # Apenas testes unitários
pnpm test:integration # Apenas testes de integração
pnpm test:e2e         # Apenas testes E2E
pnpm test:coverage    # Testes com cobertura

# Qualidade de Código
pnpm lint             # Executar ESLint
pnpm lint:fix         # Corrigir problemas do ESLint
pnpm format           # Formatar código com Prettier
pnpm type-check       # Verificar tipos TypeScript

# Docker
docker-compose up -d  # Subir todos os serviços
docker-compose down   # Parar serviços
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
