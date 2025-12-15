# Design Document - Module Composition Factory

## Overview

Este documento descreve o design para implementar o padrão de Fábrica de Composição por módulo no projeto. A solução centraliza a lógica de injeção de dependências em fábricas dedicadas, seguindo os princípios da Clean Architecture e melhorando a organização do código.

## Architecture

### Current Architecture Issues

- Injeção de dependências espalhada nos arquivos de rota
- Acoplamento entre rotas e implementações específicas de infraestrutura
- Dificuldade para testar módulos isoladamente
- Duplicação de lógica de instanciação

### Proposed Architecture

```
src/
├── app/
│   └── modules/
│       └── [module]/
│           ├── domain/
│           ├── dtos/
│           ├── [Module]Service.ts
│           ├── factories/
│           │   └── make[Module]Module.ts  # Nova fábrica
│           └── index.ts
├── infrastructure/
│   ├── database/
│   │   └── repositories/
│   └── http/
│       ├── controllers/
│       └── routes/  # Simplificadas
└── server.ts
```

## Components and Interfaces

### 1. Module Factory Interface

Cada fábrica seguirá uma interface padrão:

```typescript
interface ModuleFactory<T> {
  (): T
}

interface ModuleOutput {
  controller: Controller
  service: Service
  // Outras dependências expostas se necessário
}
```

### 2. Company Module Factory

```typescript
interface CompanyModule {
  companyController: CompanyController
  companyService: CompanyService
}

export function makeCompanyModule(): CompanyModule {
  // 1. Secondary Adapters (Infrastructure)
  const companyRepository: CompanyRepository = new PrismaCompanyRepository(
    prisma
  )

  // 2. Core Services
  const companyService = new CompanyService(companyRepository)

  // 3. Primary Adapters (Controllers)
  const companyController = new CompanyController(companyService)

  return {
    companyController,
    companyService,
  }
}
```

### 3. Route Simplification

As rotas serão simplificadas para usar apenas as fábricas:

```typescript
// company.routes.ts
import { Router } from "express"
import { makeCompanyModule } from "../../../app/modules/company/factories/makeCompanyModule"

const companyRouter = Router()
const { companyController } = makeCompanyModule()

companyRouter.post("/", (req, res) => companyController.create(req, res))
// ... outras rotas
```

### 4. Factory Location Strategy

- **Localização**: `src/app/modules/[module]/factories/`
- **Nomenclatura**: `make[ModuleName]Module.ts`
- **Exportação**: Função nomeada seguindo o padrão `make[ModuleName]Module`

## Data Models

### Factory Configuration

Para suportar diferentes ambientes e facilitar testes:

```typescript
interface FactoryConfig {
  database?: PrismaClient
  environment?: "development" | "test" | "production"
}

export function makeCompanyModule(config?: FactoryConfig): CompanyModule {
  const dbClient = config?.database || prisma
  const companyRepository = new PrismaCompanyRepository(dbClient)
  // ... resto da implementação
}
```

### Module Registry (Opcional)

Para centralizar todas as fábricas:

```typescript
interface ModuleRegistry {
  company: () => CompanyModule
  // Futuros módulos...
}

export const moduleRegistry: ModuleRegistry = {
  company: makeCompanyModule,
}
```

## Error Handling

### Factory Error Handling

```typescript
export function makeCompanyModule(config?: FactoryConfig): CompanyModule {
  try {
    // Instanciação das dependências
    return { companyController, companyService }
  } catch (error) {
    throw new Error(`Failed to create Company module: ${error.message}`)
  }
}
```

### Dependency Validation

```typescript
function validateDependencies(dependencies: any[]): void {
  dependencies.forEach((dep, index) => {
    if (!dep) {
      throw new Error(`Dependency at index ${index} is null or undefined`)
    }
  })
}
```

## Testing Strategy

### 1. Factory Unit Tests

```typescript
describe("makeCompanyModule", () => {
  it("should create all required dependencies", () => {
    const module = makeCompanyModule()

    expect(module.companyController).toBeInstanceOf(CompanyController)
    expect(module.companyService).toBeInstanceOf(CompanyService)
  })

  it("should use custom database client when provided", () => {
    const mockPrisma = {} as PrismaClient
    const module = makeCompanyModule({ database: mockPrisma })

    // Verificar se o mock foi usado
  })
})
```

### 2. Integration Tests

```typescript
describe("Company Module Integration", () => {
  it("should handle complete request flow", async () => {
    const { companyController } = makeCompanyModule({
      database: testPrismaClient,
    })

    // Testar fluxo completo
  })
})
```

### 3. Mock Factory for Tests

```typescript
export function makeMockCompanyModule(): CompanyModule {
  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    // ... outros mocks
  } as jest.Mocked<CompanyRepository>

  const companyService = new CompanyService(mockRepository)
  const companyController = new CompanyController(companyService)

  return { companyController, companyService }
}
```

## Implementation Phases

### Phase 1: Create Factory Infrastructure

- Criar estrutura de pastas `factories/`
- Implementar fábrica do módulo Company
- Criar interfaces e tipos necessários

### Phase 2: Refactor Routes

- Modificar `company.routes.ts` para usar a fábrica
- Remover lógica de instanciação das rotas
- Testar compatibilidade

### Phase 3: Testing and Validation

- Implementar testes para as fábricas
- Validar que todos os endpoints continuam funcionando
- Verificar que os testes existentes ainda passam

### Phase 4: Documentation and Standards

- Documentar padrão de fábrica
- Criar template para novos módulos
- Estabelecer convenções de nomenclatura

## Benefits

1. **Separation of Concerns**: Rotas focam apenas no roteamento
2. **Testability**: Fábricas podem ser facilmente mockadas
3. **Maintainability**: Lógica de DI centralizada por módulo
4. **Scalability**: Fácil adição de novos módulos
5. **Flexibility**: Suporte a diferentes configurações e ambientes

## Migration Strategy

1. **Backward Compatibility**: Manter estrutura atual funcionando
2. **Gradual Migration**: Migrar um módulo por vez
3. **Testing**: Validar cada etapa com testes
4. **Documentation**: Atualizar documentação conforme migração
