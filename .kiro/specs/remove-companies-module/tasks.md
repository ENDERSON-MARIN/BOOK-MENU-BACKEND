# Implementation Plan

- [x] 1. Remove company module from application layer
  - Delete entire company module directory and all its files
  - Update module barrel exports to remove company references
  - _Requirements: 1.2, 1.3, 6.1, 6.2_

- [ ] 2. Clean infrastructure HTTP components
  - [x] 2.1 Remove company HTTP controller and routes
    - Delete CompanyController.ts file
    - Delete company.routes.ts file
    - Update controller and routes barrel exports
    - _Requirements: 1.1, 6.1, 6.2_

  - [x] 2.2 Remove company validation schemas
    - Delete companySchemas.ts file
    - Update validators barrel exports
    - _Requirements: 1.5, 6.1_

  - [x] 2.3 Update application router
    - Remove company routes registration from applicationRouter.ts
    - Ensure only device routes are registered
    - _Requirements: 1.1, 6.4_

- [x] 3. Clean infrastructure database components
  - [x] 3.1 Remove company repository implementation
    - Delete PrismaCompanyRepository.ts file
    - Update database repositories barrel exports
    - _Requirements: 1.3, 6.1_

- [x] 4. Update database schema and migrations
  - [x] 4.1 Create migration to drop companies table
    - Generate new Prisma migration to drop companies table
    - Ensure migration handles any potential foreign key constraints
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 4.2 Update Prisma schema
    - Remove Company model from schema.prisma
    - Keep only Device model and DeviceStatus enum
    - Regenerate Prisma client
    - _Requirements: 2.1, 2.4_

- [x] 5. Remove company-related tests
  - [x] 5.1 Remove unit tests for company module
    - Delete all company unit test files
    - Update test configurations if needed
    - _Requirements: 3.1, 3.4_

  - [x] 5.2 Remove integration tests for company repository
    - Delete company repository integration tests
    - Ensure device integration tests still pass
    - _Requirements: 3.2, 3.4_

  - [x] 5.3 Remove E2E tests for company endpoints
    - Delete all company API endpoint tests
    - Validate remaining device E2E tests pass
    - _Requirements: 3.3, 3.5_

- [x] 6. Update Swagger configuration
  - Remove all company-related Swagger schemas and definitions
  - Update API title and description to focus on device management
  - Ensure device endpoints are fully documented
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Update main application configuration
  - [x] 7.1 Clean server.ts and main entry points
    - Remove any company module initialization
    - Ensure only device module is properly configured
    - _Requirements: 6.3, 6.4_

  - [x] 7.2 Update dependency injection configurations
    - Remove company service registrations
    - Maintain device service configurations
    - _Requirements: 6.4_

- [x] 8. Rewrite README.md documentation
  - [x] 8.1 Update project title and description
    - Change title to focus on device management
    - Update project description and overview
    - _Requirements: 4.1, 4.4_

  - [x] 8.2 Update architecture documentation
    - Remove company module from architecture diagrams
    - Update project structure to show only device module
    - _Requirements: 4.3, 4.4_

  - [x] 8.3 Update API endpoints documentation
    - Remove all company endpoint documentation
    - Ensure device endpoints are completely documented
    - Update examples to use device data
    - _Requirements: 4.4_

  - [x] 8.4 Update screenshots and examples
    - Remove company-related screenshots
    - Add device-related screenshots if available
    - Update all code examples to use device entities
    - _Requirements: 4.2_

- [x] 9. Final validation and testing
  - [x] 9.1 Build and compile application
    - Ensure TypeScript compilation succeeds
    - Fix any remaining import or reference errors
    - _Requirements: 6.5_

  - [x] 9.2 Execute remaining test suite
    - Run all device-related tests
    - Ensure test coverage remains adequate
    - Fix any broken tests due to cleanup
    - _Requirements: 3.4, 3.5_

  - [x] 9.3 Validate API functionality
    - Test device CRUD operations
    - Verify Swagger documentation accessibility
    - Ensure WebSocket functionality works if applicable
    - _Requirements: 5.3_
