# Design Document

## Overview

Esta refatoração envolve a remoção completa do módulo companies do sistema, mantendo apenas o módulo devices. O processo incluirá a limpeza de código, banco de dados, testes e documentação para criar um sistema focado exclusivamente na gestão de dispositivos.

## Architecture

### Current State

O sistema atual segue uma arquitetura hexagonal modular com dois módulos principais:

- **Companies Module**: Gestão completa de empresas
- **Devices Module**: Gestão de dispositivos

### Target State

Após a refatoração, o sistema terá:

- **Devices Module**: Único módulo de negócio
- **Shared Components**: Componentes compartilhados (errors, middlewares)
- **Infrastructure**: Adaptadores apenas para devices

### Architectural Impact

```
Before:
src/app/modules/
├── company/     [TO BE REMOVED]
└── device/      [MAINTAINED]

After:
src/app/modules/
└── device/      [ONLY MODULE]
```

## Components and Interfaces

### 1. Application Layer Cleanup

#### Files to Remove:

- `src/app/modules/company/` (entire directory)
  - `domain/Company.ts`
  - `domain/CompanyRepository.ts`
  - `dtos/CreateCompanyDTO.ts`
  - `dtos/UpdateCompanyDTO.ts`
  - `dtos/CompanyOutputDTO.ts`
  - `CompanyService.ts`
  - `factories/makeCompanyModule.ts`
  - `factories/makeMockCompanyModule.ts`
  - `factories/types.ts`

#### Files to Update:

- `src/app/modules/index.ts`: Remove company exports, keep only device exports

### 2. Infrastructure Layer Cleanup

#### HTTP Layer - Files to Remove:

- `src/infrastructure/http/controllers/CompanyController.ts`
- `src/infrastructure/http/routes/company.routes.ts`
- `src/infrastructure/http/validators/companySchemas.ts`

#### HTTP Layer - Files to Update:

- `src/infrastructure/http/controllers/index.ts`: Remove CompanyController export
- `src/infrastructure/http/routes/index.ts`: Remove company routes export
- `src/infrastructure/http/validators/index.ts`: Remove company schemas export
- `src/infrastructure/http/routes/applicationRouter.ts`: Remove company routes registration

#### Database Layer - Files to Remove:

- `src/infrastructure/database/repositories/PrismaCompanyRepository.ts`

#### Database Layer - Files to Update:

- `src/infrastructure/database/repositories/index.ts`: Remove PrismaCompanyRepository export

### 3. Configuration Updates

#### Swagger Configuration:

- `src/config/swagger.ts`: Update title, description to focus on device management
- Remove company-related schema definitions

#### Main Application:

- `src/server.ts`: Remove any company module initialization

## Data Models

### Database Schema Changes

#### Tables to Remove:

```sql
-- Remove Company table
DROP TABLE IF EXISTS companies;
```

#### Prisma Schema Updates:

```prisma
// Remove Company model entirely
// Keep only Device model and DeviceStatus enum

model Device {
  id        String      @id @default(uuid())
  name      String
  mac       String      @unique
  status    DeviceStatus @default(ATIVO)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@map("devices")
}

enum DeviceStatus {
  ATIVO
  INATIVO
}
```

### Migration Strategy:

1. Create new migration to drop companies table
2. Update schema.prisma to remove Company model
3. Regenerate Prisma client

## Error Handling

### Error Scenarios:

1. **Build Errors**: Missing imports after file removal
2. **Runtime Errors**: References to removed company services
3. **Database Errors**: Foreign key constraints (if any exist)

### Error Resolution Strategy:

1. **Systematic Import Cleanup**: Remove all company-related imports
2. **Barrel Export Updates**: Update all index.ts files
3. **Dependency Injection**: Remove company service registrations
4. **Route Registration**: Remove company routes from application router

## Testing Strategy

### Test Cleanup Plan:

#### Unit Tests to Remove:

- `tests/unit/app/modules/company/` (entire directory)
- Company entity tests
- Company service tests
- Company DTO validation tests

#### Integration Tests to Remove:

- `tests/integration/repositories/PrismaCompanyRepository.spec.ts`
- Company repository integration tests

#### E2E Tests to Remove:

- `tests/e2e/company/` (entire directory)
- Company API endpoint tests
- Company CRUD operation tests

#### Tests to Maintain:

- All device-related unit tests
- All device-related integration tests
- All device-related E2E tests
- Shared component tests (errors, middlewares)

### Test Execution Validation:

After cleanup, ensure:

1. All remaining tests pass
2. Test coverage remains high for device module
3. No orphaned test files or references

## Documentation Updates

### README.md Restructuring:

#### Sections to Update:

1. **Title**: Change from "Sistema de Gestão de Empresas" to "Sistema de Gestão de Dispositivos"
2. **Description**: Focus on device management capabilities
3. **Screenshots**: Replace company screenshots with device screenshots
4. **Architecture**: Update diagrams to show only device module
5. **API Endpoints**: Document only device endpoints
6. **Project Structure**: Reflect new simplified structure

#### New Content Structure:

```markdown
# 📱 Sistema de Gestão de Dispositivos

API REST para gestão de dispositivos IoT, desenvolvida com Node.js, TypeScript, Express, PostgreSQL e Prisma ORM, seguindo os princípios da Arquitetura Hexagonal.

## Módulos

- **Device Module**: Gestão completa de dispositivos
  - CRUD operations
  - Status management (ATIVO/INATIVO)
  - MAC address validation

## API Endpoints

- GET /api/devices
- POST /api/devices
- GET /api/devices/{id}
- PUT /api/devices/{id}
- DELETE /api/devices/{id}
```

### Swagger Documentation:

- Update API title and description
- Remove all company-related schemas
- Maintain complete device API documentation

## Implementation Phases

### Phase 1: Code Cleanup

1. Remove company module files
2. Update imports and exports
3. Clean infrastructure components

### Phase 2: Database Migration

1. Create migration to drop companies table
2. Update Prisma schema
3. Regenerate Prisma client

### Phase 3: Test Cleanup

1. Remove company-related tests
2. Validate remaining tests pass
3. Update test configurations

### Phase 4: Documentation Update

1. Rewrite README.md
2. Update Swagger configuration
3. Update project metadata

### Phase 5: Validation

1. Build and run application
2. Execute test suite
3. Verify API documentation
4. Test device endpoints functionality

## Risk Mitigation

### Potential Risks:

1. **Broken Dependencies**: Circular imports or hidden dependencies
2. **Database Integrity**: Foreign key constraints
3. **Test Failures**: Orphaned test references

### Mitigation Strategies:

1. **Systematic Approach**: Remove files in dependency order
2. **Incremental Testing**: Test after each major change
3. **Backup Strategy**: Ensure version control before major changes
4. **Rollback Plan**: Ability to restore company module if needed

## Success Criteria

### Technical Validation:

- ✅ Application builds without errors
- ✅ All device tests pass
- ✅ No company-related code remains
- ✅ Database contains only device tables
- ✅ API documentation shows only device endpoints

### Functional Validation:

- ✅ Device CRUD operations work correctly
- ✅ Device status management functions
- ✅ MAC address validation works
- ✅ WebSocket functionality (if used by devices) works
- ✅ Error handling works for device operations

### Documentation Validation:

- ✅ README.md accurately reflects device-only system
- ✅ Swagger UI shows complete device API
- ✅ Project structure documentation is updated
- ✅ All company references removed from documentation
