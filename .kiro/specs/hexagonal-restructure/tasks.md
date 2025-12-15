# Implementation Plan - Reestruturação Hexagonal Modular

- [x] 1. Criar estrutura base de diretórios
  - Criar diretórios `src/app/modules/` e `src/app/shared/`
  - Criar diretórios `src/infrastructure/http/`, `src/infrastructure/database/`, `src/infrastructure/service-providers/`
  - Criar estrutura do módulo company: `src/app/modules/company/domain/`, `src/app/modules/company/dtos/`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Migrar componentes compartilhados
  - Mover `src/core/errors/AppError.ts` para `src/app/shared/errors/AppError.ts`
  - Criar barrel export em `src/app/shared/index.ts`
  - Atualizar imports de AppError em arquivos existentes
  - _Requirements: 1.3, 5.3_

- [x] 3. Migrar Company domain layer
  - Mover `src/core/entities/Company.ts` para `src/app/modules/company/domain/Company.ts`
  - Mover `src/core/ports/ICompanyRepository.ts` para `src/app/modules/company/domain/CompanyRepository.ts`
  - Renomear interface de `ICompanyRepository` para `CompanyRepository`
  - Criar barrel export em `src/app/modules/company/domain/index.ts`
  - _Requirements: 2.1, 2.4, 5.2_

- [x] 4. Criar DTOs para Company module
  - Extrair `CreateCompanyDTO` e `UpdateCompanyDTO` do CompanyService para arquivos separados
  - Criar `src/app/modules/company/dtos/CreateCompanyDTO.ts`
  - Criar `src/app/modules/company/dtos/UpdateCompanyDTO.ts`
  - Criar `src/app/modules/company/dtos/CompanyOutputDTO.ts`
  - Criar barrel export em `src/app/modules/company/dtos/index.ts`
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 5. Migrar Company service layer
  - Mover `src/core/services/CompanyService.ts` para `src/app/modules/company/CompanyService.ts`
  - Atualizar imports para usar novos DTOs e domain entities
  - Remover definições de DTO do arquivo de service
  - Criar barrel export em `src/app/modules/company/index.ts`
  - _Requirements: 2.2, 5.3, 5.5_

- [x] 6. Reorganizar infrastructure HTTP layer
  - Mover `src/adapters/controllers/CompanyController.ts` para `src/infrastructure/http/controllers/CompanyController.ts`
  - Mover `src/adapters/middlewares/errorHandler.ts` para `src/infrastructure/http/middlewares/errorHandler.ts`
  - Mover `src/adapters/validators/companySchemas.ts` para `src/infrastructure/http/validators/companySchemas.ts`
  - Atualizar imports nos controllers para usar nova estrutura
  - _Requirements: 4.1, 4.4, 5.4_

- [x] 7. Reorganizar infrastructure database layer
  - Mover `src/adapters/repositories/PrismaCompanyRepository.ts` para `src/infrastructure/database/repositories/PrismaCompanyRepository.ts`
  - Mover `src/adapters/databases/prisma.ts` para `src/infrastructure/database/prisma.ts`
  - Atualizar imports e implementação para usar nova interface CompanyRepository
  - _Requirements: 4.2, 4.5, 5.4_

- [x] 8. Criar e reorganizar routes
  - Criar `src/infrastructure/http/routes/company.routes.ts` com rotas específicas do Company
  - Mover `src/adapters/routes/index.ts` para `src/infrastructure/http/routes/index.ts`
  - Refatorar routes para usar estrutura modular
  - _Requirements: 4.1, 5.4, 5.5_

- [x] 9. Atualizar server.ts e dependency injection
  - Atualizar `src/server.ts` para usar novos imports da infrastructure
  - Configurar injeção de dependência com nova estrutura
  - Atualizar imports de routes e middlewares
  - _Requirements: 5.4, 5.5_

- [x] 10. Limpar estrutura antiga e validar
  - Remover diretórios vazios da estrutura antiga (`src/core/`, `src/adapters/`)
  - Executar testes para validar que funcionalidade foi preservada
  - Verificar se todas as rotas HTTP continuam funcionando
  - _Requirements: 5.1, 5.4_

- [x] 11. Criar testes para nova estrutura
  - Criar testes unitários para CompanyService na nova localização
  - Criar testes de integração para PrismaCompanyRepository
  - Atualizar imports nos testes existentes
  - _Requirements: 5.1_

- [x] 12. Adicionar documentação e barrel exports
  - Criar README.md explicando nova estrutura
  - Adicionar barrel exports em todos os módulos
  - Documentar padrões de import e organização
  - _Requirements: 1.1, 1.2_
