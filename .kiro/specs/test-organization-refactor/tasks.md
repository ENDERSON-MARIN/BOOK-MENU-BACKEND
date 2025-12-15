# Implementation Plan

- [x] 1. Create new test directory structure
  - Create the complete modular directory structure as defined in the design
  - Set up `tests/shared/`, `tests/modules/`, and `tests/system/` directories
  - Create subdirectories for each module (device, lunch-reservation) with unit/integration/e2e folders
  - _Requirements: 1.1, 2.1_

- [x] 2. Migrate shared test components
  - [x] 2.1 Move helpers to shared directory
    - Move `tests/helpers/app.ts` to `tests/shared/helpers/app.ts`
    - Update import paths in the moved file
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Reorganize setup files
    - Move `tests/setup.ts`, `tests/unit.setup.ts`, `tests/integration.setup.ts` to `tests/shared/setup/`
    - Update references to setup files in Vitest configurations
    - _Requirements: 3.2, 4.3_

- [x] 3. Migrate unit tests to modular structure
  - [x] 3.1 Move device module unit tests
    - Move `tests/unit/app/modules/device/` to `tests/modules/device/unit/`
    - Update import paths in moved test files
    - _Requirements: 1.1, 2.1, 4.2_

  - [x] 3.2 Move lunch-reservation module unit tests
    - Move `tests/unit/app/modules/lunch-reservation/` to `tests/modules/lunch-reservation/unit/`
    - Update import paths in moved test files
    - _Requirements: 1.1, 2.1, 4.2_

  - [x] 3.3 Move remaining unit tests to appropriate modules
    - Analyze and move tests from `tests/unit/core/`, `tests/unit/adapters/`, `tests/unit/infrastructure/`
    - Organize tests by their corresponding modules or move to shared if they're cross-cutting
    - _Requirements: 1.1, 2.2, 4.2_

- [x] 4. Migrate integration tests to modular structure
  - [x] 4.1 Move device integration tests
    - Move device-related integration tests to `tests/modules/device/integration/`
    - Update import paths and database setup references
    - _Requirements: 1.1, 2.1, 4.2_

  - [x] 4.2 Move lunch-reservation integration tests
    - Move lunch-reservation integration tests to `tests/modules/lunch-reservation/integration/`
    - Update import paths and database setup references
    - _Requirements: 1.1, 2.1, 4.2_

  - [x] 4.3 Move system-level integration tests
    - Move `tests/integration/websocket.integration.spec.ts` to `tests/system/integration/`
    - Move other system-level tests that don't belong to specific modules
    - _Requirements: 1.1, 3.3, 4.2_

- [x] 5. Migrate E2E tests to modular structure
  - [x] 5.1 Move lunch-reservation E2E tests
    - Move `tests/e2e/lunch-reservation-*.e2e.spec.ts` files to `tests/modules/lunch-reservation/e2e/`
    - Rename files to remove redundant module prefix (e.g., `management.e2e.spec.ts`)
    - Update import paths in moved files
    - _Requirements: 1.1, 2.1, 4.2_

  - [x] 5.2 Create device E2E tests structure
    - Create `tests/modules/device/e2e/` directory structure
    - Move any device-related E2E tests if they exist
    - _Requirements: 1.1, 2.1_

- [x] 6. Update Vitest configurations
  - [x] 6.1 Update unit test configuration
    - Modify `vitest.unit.config.ts` to include new test paths: `tests/modules/**/unit/**/*.spec.ts`
    - Update setupFiles path to point to `tests/shared/setup/unit.setup.ts`
    - _Requirements: 4.4, 4.5_

  - [x] 6.2 Update integration test configuration
    - Modify `vitest.integration.config.ts` to include new paths: `tests/modules/**/integration/**/*.spec.ts`, `tests/modules/**/e2e/**/*.spec.ts`, `tests/system/**/*.spec.ts`
    - Update setupFiles path to point to `tests/shared/setup/integration.setup.ts`
    - _Requirements: 4.4, 4.5_

  - [x] 6.3 Update main Vitest configuration
    - Modify `vitest.config.ts` to include all new test paths
    - Update setupFiles path to point to `tests/shared/setup/setup.ts`
    - Add new path aliases for `@tests/shared`, `@tests/modules`, `@tests/system`
    - _Requirements: 4.4, 4.5_

- [x] 7. Update import paths throughout test files
  - [x] 7.1 Update imports in migrated test files
    - Update relative imports to use new path aliases where appropriate
    - Fix imports that reference moved helper files
    - _Requirements: 4.2, 4.3_

  - [x] 7.2 Update imports in helper and setup files
    - Update imports in shared helper files to use new aliases
    - Ensure setup files reference correct paths
    - _Requirements: 4.2, 4.3_

- [x] 8. Validate migration and cleanup
  - [x] 8.1 Run test suites to validate migration
    - Execute unit tests: `npm run test:unit`
    - Execute integration tests: `npm run test:integration`
    - Execute all tests: `npm run test`
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 8.2 Clean up old directory structure
    - Remove empty directories from old structure (`tests/unit/app/`, `tests/integration/app/`, etc.)
    - Remove old `tests/e2e/` directory after confirming all files are migrated
    - Remove old `tests/modules/lunch-reservation/e2e/` if it exists and is empty
    - _Requirements: 4.1, 4.5_

  - [x] 8.3 Create module-specific test scripts
    - Add npm scripts for running tests by module (e.g., `test:device`, `test:lunch-reservation`)
    - Update package.json with new test scripts
    - _Requirements: 1.1, 2.2_

  - [x] 8.4 Create documentation for new test structure
    - Create README.md in tests directory explaining the new structure
    - Document how to run tests for specific modules
    - _Requirements: 1.1, 2.2_
