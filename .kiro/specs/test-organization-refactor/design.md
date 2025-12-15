# Design Document - Test Organization Refactor

## Overview

Este documento descreve o design para refatorar a organização dos testes do sistema, implementando uma estrutura modular que espelha a arquitetura da aplicação. A refatoração visa melhorar a manutenibilidade, descoberta e execução de testes, mantendo compatibilidade com as configurações existentes do Vitest.

## Architecture

### Current State Analysis

A estrutura atual apresenta uma organização mista:

- Testes E2E estão na raiz de `tests/e2e/` sem separação por módulos
- Testes de integração têm estrutura parcialmente modular em `tests/integration/`
- Testes unitários já seguem estrutura modular em `tests/unit/app/modules/`
- Existe uma pasta `tests/modules/` com estrutura incompleta

### Target Architecture

```
tests/
├── shared/                          # Testes e utilitários compartilhados
│   ├── helpers/                     # Helpers globais (app.ts, etc.)
│   ├── fixtures/                    # Dados de teste compartilhados
│   └── setup/                       # Setup files globais
│       ├── unit.setup.ts
│       ├── integration.setup.ts
│       └── setup.ts
├── modules/                         # Testes organizados por módulo
│   ├── device/                      # Módulo Device
│   │   ├── unit/                    # Testes unitários do módulo
│   │   │   ├── domain/              # Testes de entidades e value objects
│   │   │   ├── services/            # Testes de serviços
│   │   │   └── factories/           # Testes de factories
│   │   ├── integration/             # Testes de integração do módulo
│   │   │   ├── repositories/        # Testes de repositórios
│   │   │   ├── adapters/            # Testes de adapters
│   │   │   └── infrastructure/      # Testes de infraestrutura
│   │   └── e2e/                     # Testes E2E do módulo
│   │       └── device-management.e2e.spec.ts
│   └── lunch-reservation/           # Módulo Lunch Reservation
│       ├── unit/
│       │   ├── domain/
│       │   │   ├── entities/
│       │   │   ├── services/
│       │   │   └── repositories/
│       │   ├── dtos/
│       │   └── factories/
│       ├── integration/
│       │   ├── repositories/
│       │   ├── infrastructure/
│       │   └── adapters/
│       └── e2e/
│           ├── authentication.e2e.spec.ts
│           ├── management.e2e.spec.ts
│           └── auto-generation.e2e.spec.ts
└── system/                          # Testes de sistema/infraestrutura global
    ├── integration/
    │   ├── websocket.integration.spec.ts
    │   └── database/
    └── e2e/
        └── health-check.e2e.spec.ts
```

## Components and Interfaces

### 1. Module Test Structure

Cada módulo seguirá uma estrutura consistente:

```typescript
// Estrutura padrão para cada módulo
interface ModuleTestStructure {
  unit: {
    domain: TestFile[] // Entidades, Value Objects, Domain Services
    services: TestFile[] // Application Services
    factories: TestFile[] // Factories e Builders
    dtos: TestFile[] // DTOs e Validações
  }
  integration: {
    repositories: TestFile[] // Testes de repositórios
    adapters: TestFile[] // Testes de adapters
    infrastructure: TestFile[] // Testes de infraestrutura específica
  }
  e2e: TestFile[] // Testes end-to-end do módulo
}
```

### 2. Shared Test Components

```typescript
// Estrutura de componentes compartilhados
interface SharedTestComponents {
  helpers: {
    app: AppTestHelper // Helper para inicialização da app
    database: DatabaseHelper // Helper para operações de banco
    auth: AuthHelper // Helper para autenticação
  }
  fixtures: {
    users: UserFixtures // Dados de teste para usuários
    devices: DeviceFixtures // Dados de teste para devices
    menus: MenuFixtures // Dados de teste para menus
  }
  setup: {
    unit: SetupFile // Setup para testes unitários
    integration: SetupFile // Setup para testes de integração
    global: SetupFile // Setup global
  }
}
```

### 3. Migration Strategy

```typescript
interface MigrationPlan {
  phase1: {
    action: "create_structure"
    description: "Criar nova estrutura de diretórios"
  }
  phase2: {
    action: "move_shared_components"
    description: "Mover helpers e setup files para shared/"
  }
  phase3: {
    action: "migrate_unit_tests"
    description: "Migrar testes unitários para estrutura modular"
  }
  phase4: {
    action: "migrate_integration_tests"
    description: "Migrar testes de integração para estrutura modular"
  }
  phase5: {
    action: "migrate_e2e_tests"
    description: "Migrar testes E2E para estrutura modular"
  }
  phase6: {
    action: "update_configurations"
    description: "Atualizar configurações do Vitest"
  }
  phase7: {
    action: "cleanup"
    description: "Remover estrutura antiga e arquivos desnecessários"
  }
}
```

## Data Models

### Test File Mapping

```typescript
interface TestFileMapping {
  source: string // Caminho atual do arquivo
  destination: string // Novo caminho do arquivo
  module: string // Módulo ao qual pertence
  category: "unit" | "integration" | "e2e" | "shared"
  updateImports: ImportUpdate[] // Imports que precisam ser atualizados
}

interface ImportUpdate {
  from: string // Import original
  to: string // Novo import
  reason: string // Motivo da mudança
}
```

### Configuration Updates

```typescript
interface VitestConfigUpdate {
  file: string // Arquivo de configuração
  changes: {
    include: string[] // Novos padrões de include
    setupFiles: string[] // Novos setup files
    alias: Record<string, string> // Novos aliases
  }
}
```

## Error Handling

### Migration Error Handling

1. **File Conflict Resolution**
   - Detectar conflitos de nomes de arquivos
   - Criar backup automático antes da migração
   - Rollback automático em caso de falha

2. **Import Resolution**
   - Validar todos os imports após migração
   - Atualizar imports relativos para absolutos quando necessário
   - Detectar imports quebrados e sugerir correções

3. **Test Execution Validation**
   - Executar testes após cada fase da migração
   - Validar que todos os testes continuam passando
   - Reportar testes quebrados com informações detalhadas

### Runtime Error Handling

```typescript
interface ErrorHandling {
  fileNotFound: {
    action: "create_missing_directories"
    fallback: "use_default_structure"
  }
  importError: {
    action: "update_import_paths"
    fallback: "maintain_relative_imports"
  }
  testFailure: {
    action: "analyze_failure_cause"
    fallback: "revert_specific_file"
  }
}
```

## Testing Strategy

### Validation Tests

1. **Structure Validation**
   - Verificar que todos os arquivos foram movidos corretamente
   - Validar que a estrutura de diretórios está conforme especificado
   - Confirmar que não há arquivos órfãos

2. **Import Validation**
   - Executar verificação de tipos TypeScript
   - Validar que todos os imports estão funcionando
   - Verificar aliases de path

3. **Test Execution Validation**
   - Executar suite completa de testes unitários
   - Executar suite completa de testes de integração
   - Executar suite completa de testes E2E
   - Validar coverage reports

### Migration Testing

```typescript
interface MigrationTests {
  beforeMigration: {
    captureCurrentState: () => TestState
    runAllTests: () => TestResults
    generateBaseline: () => Baseline
  }
  duringMigration: {
    validateEachPhase: (phase: MigrationPhase) => ValidationResult
    checkIntegrity: () => IntegrityCheck
  }
  afterMigration: {
    compareResults: (baseline: Baseline) => Comparison
    validateStructure: () => StructureValidation
    runFullSuite: () => TestResults
  }
}
```

## Implementation Considerations

### Backward Compatibility

- Manter scripts existentes no package.json funcionando
- Preservar configurações do Vitest existentes
- Garantir que CI/CD pipelines continuem funcionando

### Performance Considerations

- Minimizar impacto no tempo de execução dos testes
- Otimizar estrutura de diretórios para descoberta rápida
- Manter paralelização de testes

### Developer Experience

- Facilitar navegação entre código e testes relacionados
- Melhorar descoberta de testes por funcionalidade
- Simplificar execução de testes específicos de módulos

### Configuration Updates

```typescript
// Atualizações necessárias nos arquivos de configuração
const configUpdates = {
  "vitest.unit.config.ts": {
    include: [
      "tests/modules/**/unit/**/*.spec.ts",
      "tests/shared/unit/**/*.spec.ts",
    ],
  },
  "vitest.integration.config.ts": {
    include: [
      "tests/modules/**/integration/**/*.spec.ts",
      "tests/modules/**/e2e/**/*.spec.ts",
      "tests/system/**/*.spec.ts",
    ],
  },
  "vitest.config.ts": {
    include: ["tests/**/*.spec.ts"],
  },
}
```

### Path Aliases

```typescript
// Novos aliases para facilitar imports
const pathAliases = {
  "@tests/shared": "./tests/shared",
  "@tests/modules": "./tests/modules",
  "@tests/system": "./tests/system",
}
```

## Migration Phases Detail

### Phase 1: Structure Creation

- Criar diretórios da nova estrutura
- Não mover arquivos ainda
- Validar permissões de escrita

### Phase 2: Shared Components Migration

- Mover `tests/helpers/` para `tests/shared/helpers/`
- Mover setup files para `tests/shared/setup/`
- Atualizar imports nos arquivos movidos

### Phase 3: Unit Tests Migration

- Mover testes unitários já organizados
- Reorganizar testes unitários dispersos
- Atualizar imports e referências

### Phase 4: Integration Tests Migration

- Mover testes de integração para módulos apropriados
- Separar testes de sistema dos testes de módulo
- Atualizar configurações específicas

### Phase 5: E2E Tests Migration

- Mover testes E2E para módulos correspondentes
- Manter testes E2E de sistema separados
- Atualizar helpers e fixtures

### Phase 6: Configuration Update

- Atualizar arquivos de configuração do Vitest
- Atualizar scripts do package.json se necessário
- Validar aliases de path

### Phase 7: Cleanup

- Remover diretórios vazios da estrutura antiga
- Remover arquivos duplicados ou desnecessários
- Executar validação final
