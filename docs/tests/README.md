# Test Structure Documentation

This document explains the new modular test organization structure for the Book Menu API project.

## Directory Structure

```
tests/
├── modules/                    # Module-specific tests
│   ├── device/                # Device module tests
│   │   ├── unit/              # Unit tests for device functionality
│   │   ├── integration/       # Integration tests for device functionality
│   │   └── e2e/               # End-to-end tests for device functionality
│   └── lunch-reservation/     # Lunch reservation module tests
│       ├── unit/              # Unit tests for lunch reservation functionality
│       ├── integration/       # Integration tests for lunch reservation functionality
│       └── e2e/               # End-to-end tests for lunch reservation functionality
├── shared/                    # Shared test utilities and setup
│   ├── helpers/               # Test helper functions and utilities
│   ├── setup/                 # Test setup and configuration files
│   └── unit/                  # Shared unit test utilities
└── system/                    # System-wide integration tests
    └── integration/           # Cross-module integration tests
```

## Test Types

### Unit Tests

- **Location**: `tests/modules/{module}/unit/`
- **Purpose**: Test individual functions, classes, and components in isolation
- **Scope**: Single module functionality
- **Dependencies**: Minimal external dependencies, use mocks when needed

### Integration Tests

- **Location**: `tests/modules/{module}/integration/`
- **Purpose**: Test interactions between different components within a module
- **Scope**: Module-level integration
- **Dependencies**: May use real database connections and external services

### End-to-End (E2E) Tests

- **Location**: `tests/modules/{module}/e2e/`
- **Purpose**: Test complete user workflows and API endpoints
- **Scope**: Full application stack testing
- **Dependencies**: Real database, full application setup

### System Integration Tests

- **Location**: `tests/system/integration/`
- **Purpose**: Test interactions between different modules
- **Scope**: Cross-module functionality
- **Dependencies**: Full application setup

## Running Tests

### All Tests

```bash
npm run test                    # Run all tests
npm run test:unit              # Run all unit tests
npm run test:integration       # Run all integration tests
npm run test:coverage          # Run tests with coverage report
```

### Module-Specific Tests

```bash
# Device module tests
npm run test:device                    # All device tests
npm run test:device:unit              # Device unit tests only
npm run test:device:integration       # Device integration tests only
npm run test:device:e2e               # Device e2e tests only

# Lunch reservation module tests
npm run test:lunch-reservation                    # All lunch reservation tests
npm run test:lunch-reservation:unit              # Lunch reservation unit tests only
npm run test:lunch-reservation:integration       # Lunch reservation integration tests only
npm run test:lunch-reservation:e2e               # Lunch reservation e2e tests only
```

### Custom Test Patterns

```bash
# Run specific test files
npx vitest tests/modules/device/unit/device.service.spec.ts

# Run tests matching a pattern
npx vitest --grep "authentication"

# Run tests in watch mode
npx vitest --watch tests/modules/lunch-reservation
```

## Test Configuration

The project uses Vitest as the test runner with separate configurations:

- **vitest.config.ts**: Main configuration for all tests
- **vitest.unit.config.ts**: Specific configuration for unit tests
- **vitest.integration.config.ts**: Specific configuration for integration tests

## Shared Test Utilities

### Test Helpers

- **Location**: `tests/shared/helpers/`
- **Purpose**: Common helper functions used across multiple test files
- **Examples**: App setup, database utilities, mock factories

### Test Setup

- **Location**: `tests/shared/setup/`
- **Purpose**: Test environment configuration and setup
- **Files**:
  - `setup.ts`: General test setup
  - `unit.setup.ts`: Unit test specific setup
  - `integration.setup.ts`: Integration test specific setup

## Best Practices

### File Naming Conventions

- Unit tests: `{component}.spec.ts`
- Integration tests: `{feature}.integration.spec.ts`
- E2E tests: `{workflow}.e2e.spec.ts`

### Test Organization

1. **Group by module**: Keep tests close to the functionality they test
2. **Separate by type**: Maintain clear boundaries between unit, integration, and e2e tests
3. **Use descriptive names**: Test file names should clearly indicate what they test
4. **Share common utilities**: Use the shared directory for reusable test code

### Writing Tests

1. **Follow AAA pattern**: Arrange, Act, Assert
2. **Use descriptive test names**: Clearly describe what the test validates
3. **Keep tests focused**: Each test should validate one specific behavior
4. **Use appropriate test type**: Choose unit, integration, or e2e based on what you're testing

## Migration Notes

This structure represents a migration from the previous flat test organization to a modular approach. The benefits include:

- **Better organization**: Tests are grouped by the functionality they test
- **Easier maintenance**: Changes to a module only affect tests in that module's directory
- **Clearer test scope**: The directory structure makes it clear what level of testing is being performed
- **Improved developer experience**: Developers can easily find and run tests for specific modules

## Adding New Tests

When adding tests for a new module:

1. Create the module directory under `tests/modules/{module-name}/`
2. Add subdirectories for `unit/`, `integration/`, and `e2e/` as needed
3. Update `package.json` with module-specific test scripts
4. Follow the established naming conventions and patterns
