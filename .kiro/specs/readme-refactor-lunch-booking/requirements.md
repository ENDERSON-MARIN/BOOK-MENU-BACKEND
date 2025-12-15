# Requirements Document

## Introduction

Este documento define os requisitos para refatorar o arquivo README.md da API BookMenu, removendo todo o conteúdo relacionado à gestão de dispositivos IoT e substituindo por documentação adequada para o sistema de reservas de almoço corporativo. O objetivo é garantir que a documentação reflita com precisão a funcionalidade real da API, incluindo autenticação, gerenciamento de usuários, categorias de alimentos, itens de menu, cardápios semanais e reservas de refeições.

## Glossary

- **BookMenu System**: Sistema de reservas de almoço corporativo que permite gerenciamento de cardápios e reservas de refeições
- **README**: Arquivo de documentação principal do projeto localizado na raiz do repositório
- **API Endpoint**: Rota HTTP que expõe funcionalidades específicas da API
- **Swagger Documentation**: Documentação interativa da API baseada em OpenAPI 3.0
- **User**: Usuário do sistema que pode ser ADMIN ou USER comum
- **Menu**: Cardápio diário com composição de itens de alimentos
- **Reservation**: Reserva de almoço feita por um usuário para uma data específica
- **Menu Variation**: Variação do cardápio (padrão ou substituição com ovo)
- **Category**: Categoria de alimentos (Proteína, Acompanhamento, Salada, Sobremesa)
- **MenuItem**: Item individual de alimento que compõe um cardápio

## Requirements

### Requirement 1

**User Story:** Como desenvolvedor que acessa o repositório pela primeira vez, quero ver uma documentação clara sobre o sistema de reservas de almoço, para que eu possa entender rapidamente o propósito e funcionalidades da API.

#### Acceptance Criteria

1. WHEN THE Developer reads the README title and introduction, THE BookMenu System SHALL display accurate information about the lunch reservation system
2. THE BookMenu System SHALL NOT contain any references to device management or IoT functionality in the README
3. THE BookMenu System SHALL include a clear description stating it is a REST API for corporate lunch reservation management
4. THE BookMenu System SHALL list all main features including authentication, user management, food categories, menu items, weekly menus, and meal reservations

### Requirement 2

**User Story:** Como desenvolvedor, quero ver a lista completa de endpoints da API de reservas de almoço no README, para que eu possa entender quais operações estão disponíveis.

#### Acceptance Criteria

1. THE BookMenu System SHALL document all authentication endpoints (login) in the README
2. THE BookMenu System SHALL document all user management endpoints (create, list, get, update, toggle status) in the README
3. THE BookMenu System SHALL document all category management endpoints (create, list, get, update, delete) in the README
4. THE BookMenu System SHALL document all menu item endpoints (create, list, get, update, delete) in the README
5. THE BookMenu System SHALL document all week days endpoints (list) in the README
6. THE BookMenu System SHALL document all menu endpoints (create, list, get, update, delete) in the README
7. THE BookMenu System SHALL document all reservation endpoints (create, list, get, update, delete) in the README
8. WHEN THE Developer views endpoint documentation, THE BookMenu System SHALL include request/response examples with lunch reservation data instead of device data

### Requirement 3

**User Story:** Como desenvolvedor, quero ver exemplos de uso da API com dados de reservas de almoço, para que eu possa entender como integrar com o sistema.

#### Acceptance Criteria

1. THE BookMenu System SHALL provide example requests for creating lunch reservations in the README
2. THE BookMenu System SHALL provide example requests for creating menus with food items in the README
3. THE BookMenu System SHALL provide example responses showing user data, menu data, and reservation data in the README
4. THE BookMenu System SHALL NOT include any examples related to devices, MAC addresses, or IoT status in the README
5. WHEN THE Developer views examples, THE BookMenu System SHALL show realistic lunch reservation scenarios (e.g., "Frango Grelhado", "Arroz Branco", "Feijão Preto")

### Requirement 4

**User Story:** Como desenvolvedor, quero ver a estrutura do projeto refletindo o sistema de reservas de almoço, para que eu possa navegar facilmente pelo código.

#### Acceptance Criteria

1. THE BookMenu System SHALL document the modular hexagonal architecture in the README
2. THE BookMenu System SHALL show the project structure with modules for users, categories, menu-items, menus, and reservations
3. THE BookMenu System SHALL NOT reference device-related modules or directories in the structure documentation
4. THE BookMenu System SHALL document the application layer with lunch reservation domain entities
5. THE BookMenu System SHALL document the infrastructure layer with HTTP controllers for lunch reservation endpoints

### Requirement 5

**User Story:** Como desenvolvedor, quero ver informações sobre o banco de dados do sistema de reservas, para que eu possa entender o modelo de dados.

#### Acceptance Criteria

1. THE BookMenu System SHALL document the PostgreSQL database schema for lunch reservations in the README
2. THE BookMenu System SHALL list all main entities (User, Category, MenuItem, Menu, MenuComposition, MenuVariation, Reservation, WeekDay) in the README
3. THE BookMenu System SHALL NOT reference Device or DeviceStatus entities in the README
4. THE BookMenu System SHALL document the Prisma ORM usage for lunch reservation data access
5. THE BookMenu System SHALL include database setup instructions specific to the lunch reservation schema

### Requirement 6

**User Story:** Como desenvolvedor, quero ver screenshots da documentação Swagger da API de reservas, para que eu possa visualizar a interface da API.

#### Acceptance Criteria

1. WHEN THE Developer views the screenshots section, THE BookMenu System SHALL display images showing lunch reservation endpoints
2. THE BookMenu System SHALL NOT display screenshots showing device management endpoints
3. IF screenshots show API documentation, THEN THE BookMenu System SHALL display endpoints like /api/auth/login, /api/users, /api/categories, /api/menu-items, /api/menus, /api/reservations
4. THE BookMenu System SHALL update or remove screenshots that reference device-related functionality

### Requirement 7

**User Story:** Como desenvolvedor, quero ver as tecnologias utilizadas no projeto de reservas de almoço, para que eu possa entender o stack tecnológico.

#### Acceptance Criteria

1. THE BookMenu System SHALL list Node.js, TypeScript, Express, Zod as backend technologies in the README
2. THE BookMenu System SHALL list PostgreSQL and Prisma ORM as database technologies in the README
3. THE BookMenu System SHALL list Vitest and Supertest as testing technologies in the README
4. THE BookMenu System SHALL list Swagger UI Express for API documentation in the README
5. THE BookMenu System SHALL maintain the hexagonal architecture description in the README

### Requirement 8

**User Story:** Como desenvolvedor, quero ver instruções de instalação e execução específicas para o sistema de reservas, para que eu possa rodar o projeto localmente.

#### Acceptance Criteria

1. THE BookMenu System SHALL provide installation instructions that reference the lunch reservation database schema
2. THE BookMenu System SHALL include environment variable examples relevant to lunch reservations (DATABASE_URL, PORT, NODE_ENV)
3. THE BookMenu System SHALL document Prisma migration commands for the lunch reservation schema
4. THE BookMenu System SHALL provide Docker Compose instructions for running the lunch reservation API
5. THE BookMenu System SHALL NOT reference device-specific environment variables or configurations

### Requirement 9

**User Story:** Como desenvolvedor, quero ver a documentação de testes refletindo o sistema de reservas, para que eu possa entender a cobertura de testes.

#### Acceptance Criteria

1. THE BookMenu System SHALL document test commands for lunch reservation modules in the README
2. THE BookMenu System SHALL list test types (unit, integration, e2e) for reservation functionality
3. THE BookMenu System SHALL provide examples of running tests for specific modules (test:lunch-reservation, test:user, test:menu)
4. THE BookMenu System SHALL NOT reference device-related test commands (test:device)
5. THE BookMenu System SHALL document the expected test coverage for lunch reservation features

### Requirement 10

**User Story:** Como desenvolvedor, quero ver decisões técnicas documentadas para o sistema de reservas, para que eu possa entender as escolhas arquiteturais.

#### Acceptance Criteria

1. THE BookMenu System SHALL document why hexagonal architecture was chosen for the lunch reservation system
2. THE BookMenu System SHALL explain the modular organization benefits for reservation features
3. THE BookMenu System SHALL document the use of barrel exports for clean imports in the README
4. THE BookMenu System SHALL explain TypeScript and Zod usage for type safety in reservation data
5. THE BookMenu System SHALL NOT reference IoT-specific architectural decisions
