# Implementation Plan

- [x] 1. Setup database schema and core domain entities
  - Create Prisma migration for devices table with DeviceStatus enum
  - Implement Device domain entity with business logic methods
  - Create DeviceRepository interface following hexagonal architecture
  - _Requirements: 1.2, 1.3, 1.4, 3.1_

- [x] 2. Implement device service and DTOs
  - [x] 2.1 Create device DTOs for request/response handling
    - Implement CreateDeviceDTO with validation rules
    - Create DeviceResponseDTO for API responses
    - _Requirements: 1.1, 1.2, 1.3, 2.2_

  - [x] 2.2 Implement DeviceService with core business logic
    - Create device creation logic with MAC uniqueness validation
    - Implement device listing functionality
    - Add device status toggle functionality
    - _Requirements: 1.1, 1.4, 2.1, 3.1, 3.2_

- [x] 3. Create infrastructure layer components
  - [x] 3.1 Implement Prisma device repository
    - Create PrismaDeviceRepository implementing DeviceRepository interface
    - Add database operations for CRUD functionality
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 3.2 Setup WebSocket service with Socket.IO
    - Create WebSocketService for real-time communication
    - Integrate Socket.IO with existing Express server
    - Implement event emission for device operations
    - _Requirements: 1.5, 3.3, 4.1, 4.2, 4.3_

- [x] 4. Create HTTP layer with controllers and routes
  - [x] 4.1 Implement DeviceController with API endpoints
    - Create POST /api/devices endpoint for device creation
    - Implement GET /api/devices endpoint for listing devices
    - Add PATCH /api/devices/:id/status endpoint for status toggle
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 4.2 Setup request validation schemas
    - Create Zod schemas for device validation
    - Add middleware for request validation
    - _Requirements: 1.2, 1.3_

  - [x] 4.3 Configure device routes and integrate with application router
    - Create device.routes.ts following existing pattern
    - Integrate device routes with applicationRouter
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 5. Create module factory and dependency injection
  - [x] 5.1 Implement makeDeviceModule factory
    - Create factory function for device module dependencies
    - Wire DeviceService with repository and WebSocket service
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

  - [x] 5.2 Export device module components
    - Update module index files for proper exports
    - Integrate device module with main application
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 6. Implement comprehensive testing
  - [x] 6.1 Create integration tests for device API endpoints
    - Test POST /api/devices with valid and invalid data
    - Test GET /api/devices endpoint functionality
    - Test PATCH /api/devices/:id/status endpoint
    - _Requirements: 5.1, 5.3_

  - [x] 6.2 Write unit tests for core business logic
    - Test Device entity methods (toggleStatus, validation)
    - Test DeviceService business logic and error handling
    - _Requirements: 5.2, 5.3_

  - [x] 6.3 Create WebSocket integration tests
    - Test device:created event emission
    - Test device:status event emission
    - Verify real-time communication functionality
    - _Requirements: 4.1, 4.2, 4.3, 5.1_
