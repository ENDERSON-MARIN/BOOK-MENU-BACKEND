# Documento de Requisitos - Atualização da Documentação Swagger para BookMenu API

## Introdução

A Documentação Swagger atual está configurada para uma API de gerenciamento de dispositivos IoT. Este documento define os requisitos para atualizar completamente a documentação Swagger para refletir a API BookMenu (Sistema de Reservas de Almoço), incluindo todos os endpoints de autenticação, gerenciamento de usuários, categorias, itens de menu, cardápios e reservas.

## Glossário

- **Swagger_Doc**: Documento de especificação OpenAPI 3.0 que descreve a API
- **BookMenu_API**: API REST para sistema de reservas de almoço corporativo
- **Endpoint_Auth**: Endpoints relacionados à autenticação de usuários
- **Endpoint_Admin**: Endpoints que requerem privilégios administrativos
- **Endpoint_User**: Endpoints acessíveis por usuários autenticados
- **Schema_Component**: Definição reutilizável de estrutura de dados no Swagger
- **Security_Scheme**: Esquema de segurança JWT para autenticação

## Requisitos

### Requisito 1

**História do Usuário:** Como desenvolvedor da API, quero que a documentação Swagger reflita corretamente as informações básicas da BookMenu API, para que os consumidores da API entendam seu propósito e contexto.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL conter título "BookMenu API" ou "Sistema de Reservas de Almoço API"
2. THE Swagger_Doc SHALL incluir descrição detalhada sobre o sistema de reservas de almoço corporativo
3. THE Swagger_Doc SHALL definir servidores de desenvolvimento e produção com URLs apropriadas
4. THE Swagger_Doc SHALL incluir informações de contato e licença
5. THE Swagger_Doc SHALL organizar endpoints em tags apropriadas (Auth, Users, Categories, MenuItems, WeekDays, Menus, Reservations)

### Requisito 2

**História do Usuário:** Como desenvolvedor da API, quero que todos os endpoints de autenticação estejam documentados no Swagger, para que os consumidores saibam como autenticar na API.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL documentar o endpoint POST /api/auth/login com schema de entrada (cpf, password)
2. THE Swagger_Doc SHALL documentar respostas de sucesso (200) e erro (400, 401) para login
3. THE Swagger_Doc SHALL incluir exemplos de requisição e resposta para autenticação
4. THE Swagger_Doc SHALL documentar o formato do token JWT retornado
5. THE Swagger_Doc SHALL definir o security scheme JWT Bearer para uso nos demais endpoints

### Requisito 3

**História do Usuário:** Como desenvolvedor da API, quero que todos os endpoints de gerenciamento de usuários estejam documentados no Swagger, para que administradores saibam como gerenciar usuários.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL documentar endpoint POST /api/users para criação de usuários (ADMIN)
2. THE Swagger_Doc SHALL documentar endpoint GET /api/users para listagem de usuários (ADMIN)
3. THE Swagger_Doc SHALL documentar endpoint GET /api/users/:id para consulta de usuário específico (ADMIN)
4. THE Swagger_Doc SHALL documentar endpoint PATCH /api/users/:id para atualização de usuários (ADMIN)
5. THE Swagger_Doc SHALL documentar endpoint PATCH /api/users/:id/status para alteração de status (ADMIN)
6. THE Swagger_Doc SHALL incluir schemas para User, CreateUserInput, UpdateUserInput com enums apropriados

### Requisito 4

**História do Usuário:** Como desenvolvedor da API, quero que todos os endpoints de gerenciamento de categorias e itens de menu estejam documentados no Swagger, para que administradores saibam como configurar o sistema.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL documentar endpoints CRUD para /api/categories (POST, GET, GET/:id, PATCH/:id, DELETE/:id)
2. THE Swagger_Doc SHALL documentar endpoints CRUD para /api/menu-items (POST, GET, GET/:id, PATCH/:id, DELETE/:id)
3. THE Swagger_Doc SHALL documentar endpoint GET /api/week-days para consulta de dias da semana
4. THE Swagger_Doc SHALL incluir schemas para Category, MenuItem, WeekDay com suas propriedades
5. THE Swagger_Doc SHALL marcar todos esses endpoints como requerendo autenticação ADMIN

### Requisito 5

**História do Usuário:** Como desenvolvedor da API, quero que todos os endpoints de gerenciamento de cardápios estejam documentados no Swagger, para que administradores e usuários saibam como trabalhar com menus.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL documentar endpoint POST /api/menus para criação de cardápios (ADMIN)
2. THE Swagger_Doc SHALL documentar endpoint GET /api/menus para listagem de cardápios com filtros opcionais
3. THE Swagger_Doc SHALL documentar endpoint GET /api/menus/:id para consulta de cardápio específico
4. THE Swagger_Doc SHALL documentar endpoint PATCH /api/menus/:id para atualização de cardápios (ADMIN)
5. THE Swagger_Doc SHALL documentar endpoint DELETE /api/menus/:id para exclusão de cardápios (ADMIN)
6. THE Swagger_Doc SHALL incluir schemas para Menu, MenuComposition, MenuVariation com relacionamentos

### Requisito 6

**História do Usuário:** Como desenvolvedor da API, quero que todos os endpoints de reservas estejam documentados no Swagger, para que usuários saibam como fazer e gerenciar suas reservas.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL documentar endpoint POST /api/reservations para criação de reservas (USER)
2. THE Swagger_Doc SHALL documentar endpoint GET /api/reservations para listagem de reservas do usuário (USER)
3. THE Swagger_Doc SHALL documentar endpoint GET /api/reservations/:id para consulta de reserva específica (USER)
4. THE Swagger_Doc SHALL documentar endpoint PATCH /api/reservations/:id para alteração de reservas (USER)
5. THE Swagger_Doc SHALL documentar endpoint DELETE /api/reservations/:id para cancelamento de reservas (USER)
6. THE Swagger_Doc SHALL incluir validações de horário limite (8:30 AM) nas descrições dos endpoints
7. THE Swagger_Doc SHALL incluir schemas para Reservation, CreateReservationInput, UpdateReservationInput

### Requisito 7

**História do Usuário:** Como desenvolvedor da API, quero que todos os schemas de erro estejam documentados no Swagger, para que consumidores saibam interpretar respostas de erro.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL incluir schema Error para erros genéricos
2. THE Swagger_Doc SHALL incluir schema ValidationError para erros de validação com detalhes
3. THE Swagger_Doc SHALL incluir schema AuthenticationError para erros de autenticação
4. THE Swagger_Doc SHALL incluir schema AuthorizationError para erros de autorização
5. THE Swagger_Doc SHALL documentar códigos de status HTTP apropriados para cada tipo de erro (400, 401, 403, 404, 409, 500)

### Requisito 8

**História do Usuário:** Como desenvolvedor da API, quero que a documentação Swagger inclua exemplos realistas, para que consumidores entendam facilmente como usar cada endpoint.

#### Critérios de Aceitação

1. THE Swagger_Doc SHALL incluir exemplos de requisição para todos os endpoints POST, PATCH
2. THE Swagger_Doc SHALL incluir exemplos de resposta de sucesso para todos os endpoints
3. THE Swagger_Doc SHALL incluir exemplos de respostas de erro comuns para cada endpoint
4. THE Swagger_Doc SHALL usar dados realistas nos exemplos (nomes de pratos, datas, CPFs fictícios)
5. THE Swagger_Doc SHALL incluir comentários descritivos em exemplos complexos
