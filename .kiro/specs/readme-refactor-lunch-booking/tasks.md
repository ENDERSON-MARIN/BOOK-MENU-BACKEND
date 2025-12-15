# Implementation Plan

- [x] 1. Update README header and introduction section
  - Replace title from "Sistema de Gestão de Dispositivos" to "Sistema de Reservas de Almoço Corporativo"
  - Update main description to reflect lunch reservation system instead of IoT device management
  - Change emoji from 📱 to 🍽️ or 🍴
  - Update subtitle to mention corporate lunch reservation management
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Update table of contents
  - Review all section links
  - Update section names to reflect lunch reservation content
  - Ensure all links point to correct sections
  - _Requirements: 1.1_

- [x] 3. Update screenshots section
  - Review current screenshot descriptions
  - Update descriptions from device operations to lunch reservation operations
  - Add note if screenshots need to be replaced with actual lunch reservation API screenshots
  - Update alt text for images
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Update technologies section
  - Verify all listed technologies are correct (already correct, just verify)
  - Ensure descriptions mention lunch reservation context where applicable
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5. Update hexagonal architecture section
  - Replace Device module examples with Reservation or Menu module examples
  - Update module list to include: User, Category, MenuItem, Menu, Reservation
  - Update benefits description to mention lunch reservation features
  - Ensure architectural principles remain clear
  - _Requirements: 4.1, 4.2, 4.4, 4.5, 10.1, 10.2_

- [x] 6. Update project structure section
  - Remove all references to device module
  - Add complete module structure showing: user, category, menu-item, menu, reservation
  - Update directory tree to show lunch reservation modules
  - Maintain the hexagonal architecture folder organization
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Update import patterns section
  - Replace all Device-related import examples with Reservation, Menu, and User examples
  - Update barrel export examples
  - Update path mapping examples
  - Ensure TypeScript import conventions are clear
  - _Requirements: 10.3_

- [x] 8. Replace endpoints documentation completely
  - Remove all device endpoints (POST /api/devices, GET /api/devices, PATCH /api/devices/{id}/status)
  - Add Authentication endpoints section with POST /api/auth/login
  - Add Users endpoints section with 5 endpoints
  - Add Categories endpoints section with 5 endpoints
  - Add Menu Items endpoints section with 5 endpoints
  - Add Week Days endpoints section with 1 endpoint
  - Add Menus endpoints section with 5 endpoints
  - Add Reservations endpoints section with 5 endpoints
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 9. Add detailed endpoint examples for authentication
  - Document POST /api/auth/login with CPF and password
  - Include request body example with CPF format
  - Include response example with JWT token and user data
  - Document possible error responses (400, 401, 500)
  - _Requirements: 2.1, 2.8, 3.1_

- [x] 10. Add detailed endpoint examples for users
  - Document POST /api/users (create user)
  - Document GET /api/users (list all users)
  - Document GET /api/users/{id} (get specific user)
  - Document PATCH /api/users/{id} (update user)
  - Document PATCH /api/users/{id}/status (toggle user status)
  - Include request/response examples with realistic user data
  - _Requirements: 2.2, 2.8, 3.1_

- [x] 11. Add detailed endpoint examples for categories
  - Document POST /api/categories (create category)
  - Document GET /api/categories (list all categories)
  - Document GET /api/categories/{id} (get specific category)
  - Document PATCH /api/categories/{id} (update category)
  - Document DELETE /api/categories/{id} (delete category)
  - Include examples with food categories (Proteína, Acompanhamento, Salada, Sobremesa)
  - _Requirements: 2.3, 2.8, 3.2_

- [x] 12. Add detailed endpoint examples for menu items
  - Document POST /api/menu-items (create menu item)
  - Document GET /api/menu-items (list all menu items)
  - Document GET /api/menu-items/{id} (get specific menu item)
  - Document PATCH /api/menu-items/{id} (update menu item)
  - Document DELETE /api/menu-items/{id} (delete menu item)
  - Include examples with realistic food items (Frango Grelhado, Arroz Branco, Feijão Preto)
  - _Requirements: 2.4, 2.8, 3.2, 3.5_

- [x] 13. Add detailed endpoint examples for menus
  - Document POST /api/menus (create menu with composition)
  - Document GET /api/menus (list menus with filters)
  - Document GET /api/menus/{id} (get specific menu)
  - Document PATCH /api/menus/{id} (update menu)
  - Document DELETE /api/menus/{id} (delete menu)
  - Include examples showing menu composition and variations
  - _Requirements: 2.6, 2.8, 3.2, 3.5_

- [x] 14. Add detailed endpoint examples for reservations
  - Document POST /api/reservations (create reservation)
  - Document GET /api/reservations (list user reservations)
  - Document GET /api/reservations/{id} (get specific reservation)
  - Document PATCH /api/reservations/{id} (update reservation)
  - Document DELETE /api/reservations/{id} (cancel reservation)
  - Include examples with reservation dates and menu variations
  - Document 8:30 AM cutoff time restriction
  - _Requirements: 2.7, 2.8, 3.1, 3.3, 3.5_

- [x] 15. Update database section
  - Update database name from device_db to bookmenu_db
  - List all main entities: User, Category, MenuItem, Menu, MenuComposition, MenuVariation, Reservation, WeekDay
  - Remove Device and DeviceStatus references
  - Update Prisma schema description
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 16. Update installation instructions
  - Update environment variable examples (DATABASE_URL with bookmenu_db)
  - Update database creation commands
  - Ensure Prisma commands reference lunch reservation schema
  - Update Docker setup instructions if needed
  - _Requirements: 5.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 17. Update testing section
  - Remove test:device commands
  - Add test:lunch-reservation commands
  - Add test:lunch-reservation:unit command
  - Add test:lunch-reservation:integration command
  - Add test:lunch-reservation:e2e command
  - Update test coverage table with lunch reservation modules
  - Update expected test counts
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 18. Update Swagger documentation section
  - Update description to mention lunch reservation endpoints
  - List 7 endpoint groups (Auth, Users, Categories, MenuItems, WeekDays, Menus, Reservations)
  - Remove references to device endpoints
  - Maintain Swagger features list
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 19. Update technical decisions section
  - Update hexagonal architecture justification for lunch reservation system
  - Update examples to use Reservation, Menu, User instead of Device
  - Maintain explanations for TypeScript, Zod, Prisma choices
  - Add context about lunch reservation domain
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 20. Update scripts section
  - Remove test:device script
  - Remove test:device:unit script
  - Remove test:device:integration script
  - Remove test:device:e2e script
  - Add test:lunch-reservation script
  - Add test:lunch-reservation:unit script
  - Add test:lunch-reservation:integration script
  - Add test:lunch-reservation:e2e script
  - Verify all other scripts are correct
  - _Requirements: 9.3, 9.4_

- [x] 21. Final review and cleanup
  - Search for any remaining "device" references and remove them
  - Search for any remaining "IoT" references and remove them
  - Search for any remaining "MAC address" references and remove them
  - Verify all links work correctly
  - Verify all code examples use lunch reservation domain
  - Check markdown formatting
  - _Requirements: 1.2, 2.8, 3.4_
