# Documento de Design - Atualização da Documentação Swagger para BookMenu API

## Visão Geral

Este documento descreve o design completo da documentação Swagger/OpenAPI 3.0 para a BookMenu API (Sistema de Reservas de Almoço). A documentação substituirá completamente a atual documentação de dispositivos IoT, refletindo todos os endpoints, schemas e exemplos do sistema de reservas de almoço corporativo.

## Arquitetura da Documentação

### Estrutura do Documento Swagger

O documento Swagger será organizado nas seguintes seções principais:

1. **Info**: Metadados da API (título, versão, descrição, contato, licença)
2. **Servers**: URLs dos ambientes de desenvolvimento e produção
3. **Tags**: Organização lógica dos endpoints
4. **Security**: Definição do esquema de autenticação JWT
5. **Paths**: Documentação de todos os endpoints da API
6. **Components**: Schemas reutilizáveis, security schemes e exemplos

### Tags de Organização

```typescript
tags: [
  { name: "Auth", description: "Autenticação e gerenciamento de sessões" },
  { name: "Users", description: "Gerenciamento de usuários (ADMIN)" },
  {
    name: "Categories",
    description: "Gerenciamento de categorias de alimentos (ADMIN)",
  },
  { name: "MenuItems", description: "Gerenciamento de itens de menu (ADMIN)" },
  { name: "WeekDays", description: "Consulta de dias da semana" },
  { name: "Menus", description: "Gerenciamento de cardápios" },
  { name: "Reservations", description: "Gerenciamento de reservas de almoço" },
]
```

## Componentes e Schemas

### Security Scheme

```typescript
components: {
  securitySchemes: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Token JWT obtido através do endpoint de login"
    }
  }
}
```

### Schemas de Entidades Principais

#### User Schema

```typescript
User: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    cpf: { type: "string", pattern: "^\\d{11}$" },
    name: { type: "string", minLength: 1, maxLength: 255 },
    role: { type: "string", enum: ["ADMIN", "USER"] },
    userType: { type: "string", enum: ["FIXO", "NAO_FIXO"] },
    status: { type: "string", enum: ["ATIVO", "INATIVO"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  },
  required: ["id", "cpf", "name", "role", "userType", "status", "createdAt", "updatedAt"]
}
```

#### Category Schema

```typescript
Category: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 100 },
    description: { type: "string" },
    displayOrder: { type: "integer", minimum: 0 },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
}
```

#### MenuItem Schema

```typescript
MenuItem: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1, maxLength: 255 },
    description: { type: "string" },
    categoryId: { type: "string", format: "uuid" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    category: { $ref: "#/components/schemas/Category" }
  }
}
```

#### WeekDay Schema

```typescript
WeekDay: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    dayName: { type: "string" },
    dayOfWeek: {
      type: "string",
      enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
    },
    displayOrder: { type: "integer" },
    isActive: { type: "boolean" }
  }
}
```

#### Menu Schema

```typescript
Menu: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    date: { type: "string", format: "date" },
    dayOfWeek: {
      type: "string",
      enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
    },
    weekNumber: { type: "integer", description: "Semana do ano (1-53)" },
    observations: { type: "string" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    menuCompositions: {
      type: "array",
      items: { $ref: "#/components/schemas/MenuComposition" }
    },
    variations: {
      type: "array",
      items: { $ref: "#/components/schemas/MenuVariation" }
    }
  }
}
```

#### MenuComposition Schema

```typescript
MenuComposition: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    menuId: { type: "string", format: "uuid" },
    menuItemId: { type: "string", format: "uuid" },
    observations: { type: "string" },
    isMainProtein: { type: "boolean" },
    isAlternativeProtein: { type: "boolean" },
    menuItem: { $ref: "#/components/schemas/MenuItem" }
  }
}
```

#### MenuVariation Schema

```typescript
MenuVariation: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    menuId: { type: "string", format: "uuid" },
    variationType: {
      type: "string",
      enum: ["STANDARD", "EGG_SUBSTITUTE"]
    },
    proteinItemId: { type: "string", format: "uuid" },
    isDefault: { type: "boolean" },
    proteinItem: { $ref: "#/components/schemas/MenuItem" }
  }
}
```

#### Reservation Schema

```typescript
Reservation: {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    menuId: { type: "string", format: "uuid" },
    menuVariationId: { type: "string", format: "uuid" },
    reservationDate: { type: "string", format: "date" },
    status: {
      type: "string",
      enum: ["ACTIVE", "CANCELLED"]
    },
    isAutoGenerated: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    menu: { $ref: "#/components/schemas/Menu" },
    menuVariation: { $ref: "#/components/schemas/MenuVariation" }
  }
}
```

### Schemas de Input (DTOs)

#### LoginInput

```typescript
LoginInput: {
  type: "object",
  properties: {
    cpf: { type: "string", pattern: "^\\d{11}$", description: "CPF sem formatação (11 dígitos)" },
    password: { type: "string", minLength: 6 }
  },
  required: ["cpf", "password"]
}
```

#### CreateUserInput

```typescript
CreateUserInput: {
  type: "object",
  properties: {
    cpf: { type: "string", pattern: "^\\d{11}$" },
    password: { type: "string", minLength: 6 },
    name: { type: "string", minLength: 1, maxLength: 255 },
    role: { type: "string", enum: ["ADMIN", "USER"], default: "USER" },
    userType: { type: "string", enum: ["FIXO", "NAO_FIXO"], default: "NAO_FIXO" },
    status: { type: "string", enum: ["ATIVO", "INATIVO"], default: "ATIVO" }
  },
  required: ["cpf", "password", "name"]
}
```

#### UpdateUserInput

```typescript
UpdateUserInput: {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 255 },
    role: { type: "string", enum: ["ADMIN", "USER"] },
    userType: { type: "string", enum: ["FIXO", "NAO_FIXO"] },
    status: { type: "string", enum: ["ATIVO", "INATIVO"] }
  }
}
```

#### CreateCategoryInput

```typescript
CreateCategoryInput: {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    description: { type: "string" },
    displayOrder: { type: "integer", minimum: 0 }
  },
  required: ["name", "description", "displayOrder"]
}
```

#### CreateMenuItemInput

```typescript
CreateMenuItemInput: {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 255 },
    description: { type: "string" },
    categoryId: { type: "string", format: "uuid" }
  },
  required: ["name", "description", "categoryId"]
}
```

#### CreateMenuInput

```typescript
CreateMenuInput: {
  type: "object",
  properties: {
    date: { type: "string", format: "date" },
    observations: { type: "string" },
    menuItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          menuItemId: { type: "string", format: "uuid" },
          observations: { type: "string" },
          isMainProtein: { type: "boolean" },
          isAlternativeProtein: { type: "boolean" }
        },
        required: ["menuItemId"]
      }
    }
  },
  required: ["date", "menuItems"]
}
```

#### CreateReservationInput

```typescript
CreateReservationInput: {
  type: "object",
  properties: {
    menuId: { type: "string", format: "uuid" },
    menuVariationId: { type: "string", format: "uuid" },
    reservationDate: { type: "string", format: "date" }
  },
  required: ["menuId", "menuVariationId", "reservationDate"]
}
```

### Schemas de Erro

#### Error

```typescript
Error: {
  type: "object",
  properties: {
    error: { type: "string", description: "Mensagem de erro" }
  },
  required: ["error"]
}
```

#### ValidationError

```typescript
ValidationError: {
  type: "object",
  properties: {
    error: { type: "string", example: "Validation error" },
    details: {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          path: { type: "array", items: { type: "string" } }
        }
      }
    }
  },
  required: ["error", "details"]
}
```

#### AuthenticationError

```typescript
AuthenticationError: {
  type: "object",
  properties: {
    error: { type: "string", example: "Invalid credentials" }
  }
}
```

#### AuthorizationError

```typescript
AuthorizationError: {
  type: "object",
  properties: {
    error: { type: "string", example: "Access denied" }
  }
}
```

## Documentação de Endpoints

### Auth Endpoints

#### POST /api/auth/login

- **Tag**: Auth
- **Summary**: Autenticar usuário
- **Description**: Autentica um usuário usando CPF e senha, retornando um token JWT
- **Request Body**: LoginInput
- **Responses**:
  - 200: Login bem-sucedido (retorna token JWT e dados do usuário)
  - 400: Dados inválidos (ValidationError)
  - 401: Credenciais inválidas (AuthenticationError)
  - 500: Erro interno (Error)
- **Exemplo de Resposta 200**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cpf": "12345678901",
    "name": "João Silva",
    "role": "USER",
    "userType": "FIXO",
    "status": "ATIVO"
  }
}
```

### Users Endpoints (ADMIN only)

#### POST /api/users

- **Tag**: Users
- **Security**: BearerAuth
- **Summary**: Criar novo usuário
- **Request Body**: CreateUserInput
- **Responses**: 201, 400, 401, 403, 409, 500

#### GET /api/users

- **Tag**: Users
- **Security**: BearerAuth
- **Summary**: Listar todos os usuários
- **Responses**: 200, 401, 403, 500

#### GET /api/users/:id

- **Tag**: Users
- **Security**: BearerAuth
- **Summary**: Consultar usuário específico
- **Parameters**: id (path, uuid)
- **Responses**: 200, 400, 401, 403, 404, 500

#### PATCH /api/users/:id

- **Tag**: Users
- **Security**: BearerAuth
- **Summary**: Atualizar usuário
- **Parameters**: id (path, uuid)
- **Request Body**: UpdateUserInput
- **Responses**: 200, 400, 401, 403, 404, 500

#### PATCH /api/users/:id/status

- **Tag**: Users
- **Security**: BearerAuth
- **Summary**: Alternar status do usuário (ATIVO/INATIVO)
- **Parameters**: id (path, uuid)
- **Responses**: 200, 400, 401, 403, 404, 500

### Categories Endpoints (ADMIN only)

#### POST /api/categories

- **Tag**: Categories
- **Security**: BearerAuth
- **Summary**: Criar nova categoria
- **Request Body**: CreateCategoryInput
- **Responses**: 201, 400, 401, 403, 409, 500

#### GET /api/categories

- **Tag**: Categories
- **Security**: BearerAuth
- **Summary**: Listar todas as categorias
- **Responses**: 200, 401, 403, 500

#### GET /api/categories/:id

- **Tag**: Categories
- **Security**: BearerAuth
- **Summary**: Consultar categoria específica
- **Parameters**: id (path, uuid)
- **Responses**: 200, 400, 401, 403, 404, 500

#### PATCH /api/categories/:id

- **Tag**: Categories
- **Security**: BearerAuth
- **Summary**: Atualizar categoria
- **Parameters**: id (path, uuid)
- **Request Body**: UpdateCategoryInput
- **Responses**: 200, 400, 401, 403, 404, 500

#### DELETE /api/categories/:id

- **Tag**: Categories
- **Security**: BearerAuth
- **Summary**: Excluir categoria
- **Parameters**: id (path, uuid)
- **Responses**: 204, 400, 401, 403, 404, 500

### MenuItems Endpoints (ADMIN only)

#### POST /api/menu-items

- **Tag**: MenuItems
- **Security**: BearerAuth
- **Summary**: Criar novo item de menu
- **Request Body**: CreateMenuItemInput
- **Responses**: 201, 400, 401, 403, 500

#### GET /api/menu-items

- **Tag**: MenuItems
- **Security**: BearerAuth
- **Summary**: Listar todos os itens de menu
- **Query Parameters**:
  - categoryId (optional, uuid): Filtrar por categoria
- **Responses**: 200, 401, 403, 500

#### GET /api/menu-items/:id

- **Tag**: MenuItems
- **Security**: BearerAuth
- **Summary**: Consultar item de menu específico
- **Parameters**: id (path, uuid)
- **Responses**: 200, 400, 401, 403, 404, 500

#### PATCH /api/menu-items/:id

- **Tag**: MenuItems
- **Security**: BearerAuth
- **Summary**: Atualizar item de menu
- **Parameters**: id (path, uuid)
- **Request Body**: UpdateMenuItemInput
- **Responses**: 200, 400, 401, 403, 404, 500

#### DELETE /api/menu-items/:id

- **Tag**: MenuItems
- **Security**: BearerAuth
- **Summary**: Excluir item de menu
- **Parameters**: id (path, uuid)
- **Responses**: 204, 400, 401, 403, 404, 500

### WeekDays Endpoints

#### GET /api/week-days

- **Tag**: WeekDays
- **Security**: BearerAuth
- **Summary**: Listar dias da semana
- **Description**: Retorna lista de dias da semana (Segunda a Domingo) disponíveis no sistema
- **Responses**: 200, 401, 500

### Menus Endpoints

#### POST /api/menus

- **Tag**: Menus
- **Security**: BearerAuth (ADMIN)
- **Summary**: Criar novo cardápio
- **Description**: Cria um cardápio para uma data específica com composição de itens e gera automaticamente variações (padrão e ovo)
- **Request Body**: CreateMenuInput
- **Responses**: 201, 400, 401, 403, 409, 500

#### GET /api/menus

- **Tag**: Menus
- **Security**: BearerAuth
- **Summary**: Listar cardápios
- **Query Parameters**:
  - startDate (optional, date): Data inicial do filtro
  - endDate (optional, date): Data final do filtro
  - weekNumber (optional, integer): Filtrar por semana do ano
- **Responses**: 200, 401, 500

#### GET /api/menus/:id

- **Tag**: Menus
- **Security**: BearerAuth
- **Summary**: Consultar cardápio específico
- **Description**: Retorna cardápio completo com composições e variações
- **Parameters**: id (path, uuid)
- **Responses**: 200, 400, 401, 404, 500

#### PATCH /api/menus/:id

- **Tag**: Menus
- **Security**: BearerAuth (ADMIN)
- **Summary**: Atualizar cardápio
- **Parameters**: id (path, uuid)
- **Request Body**: UpdateMenuInput
- **Responses**: 200, 400, 401, 403, 404, 500

#### DELETE /api/menus/:id

- **Tag**: Menus
- **Security**: BearerAuth (ADMIN)
- **Summary**: Excluir cardápio
- **Parameters**: id (path, uuid)
- **Responses**: 204, 400, 401, 403, 404, 500

### Reservations Endpoints

#### POST /api/reservations

- **Tag**: Reservations
- **Security**: BearerAuth
- **Summary**: Criar nova reserva
- **Description**: Cria uma reserva de almoço para o usuário autenticado. Não é permitido criar reservas para datas passadas.
- **Request Body**: CreateReservationInput
- **Responses**: 201, 400, 401, 409, 500

#### GET /api/reservations

- **Tag**: Reservations
- **Security**: BearerAuth
- **Summary**: Listar reservas do usuário
- **Description**: Retorna todas as reservas do usuário autenticado
- **Query Parameters**:
  - status (optional): Filtrar por status (ACTIVE, CANCELLED)
  - startDate (optional, date): Data inicial do filtro
  - endDate (optional, date): Data final do filtro
- **Responses**: 200, 401, 500

#### GET /api/reservations/:id

- **Tag**: Reservations
- **Security**: BearerAuth
- **Summary**: Consultar reserva específica
- **Parameters**: id (path, uuid)
- **Responses**: 200, 400, 401, 403, 404, 500

#### PATCH /api/reservations/:id

- **Tag**: Reservations
- **Security**: BearerAuth
- **Summary**: Alterar reserva
- **Description**: Permite alterar a variação do cardápio de uma reserva. Alterações só são permitidas até às 8:30 AM do dia da refeição.
- **Parameters**: id (path, uuid)
- **Request Body**: UpdateReservationInput
- **Responses**: 200, 400, 401, 403, 404, 500

#### DELETE /api/reservations/:id

- **Tag**: Reservations
- **Security**: BearerAuth
- **Summary**: Cancelar reserva
- **Description**: Cancela uma reserva existente. Cancelamentos só são permitidos até às 8:30 AM do dia da refeição.
- **Parameters**: id (path, uuid)
- **Responses**: 204, 400, 401, 403, 404, 500

## Exemplos Realistas

### Exemplo de Cardápio Completo

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-11-10",
  "dayOfWeek": "MONDAY",
  "weekNumber": 45,
  "observations": "Cardápio especial da semana",
  "isActive": true,
  "menuCompositions": [
    {
      "id": "comp-1",
      "menuItemId": "item-1",
      "isMainProtein": true,
      "isAlternativeProtein": false,
      "menuItem": {
        "id": "item-1",
        "name": "Frango Grelhado",
        "description": "Peito de frango grelhado temperado",
        "category": { "name": "Proteína" }
      }
    },
    {
      "id": "comp-2",
      "menuItemId": "item-2",
      "isMainProtein": false,
      "isAlternativeProtein": true,
      "menuItem": {
        "id": "item-2",
        "name": "Ovo Cozido",
        "description": "Ovo cozido",
        "category": { "name": "Proteína" }
      }
    },
    {
      "id": "comp-3",
      "menuItemId": "item-3",
      "menuItem": {
        "id": "item-3",
        "name": "Arroz Branco",
        "category": { "name": "Acompanhamento" }
      }
    },
    {
      "id": "comp-4",
      "menuItemId": "item-4",
      "menuItem": {
        "id": "item-4",
        "name": "Feijão Preto",
        "category": { "name": "Acompanhamento" }
      }
    },
    {
      "id": "comp-5",
      "menuItemId": "item-5",
      "menuItem": {
        "id": "item-5",
        "name": "Salada Verde",
        "category": { "name": "Salada" }
      }
    },
    {
      "id": "comp-6",
      "menuItemId": "item-6",
      "menuItem": {
        "id": "item-6",
        "name": "Pudim de Leite",
        "category": { "name": "Sobremesa" }
      }
    }
  ],
  "variations": [
    {
      "id": "var-1",
      "variationType": "STANDARD",
      "proteinItemId": "item-1",
      "isDefault": true,
      "proteinItem": {
        "name": "Frango Grelhado"
      }
    },
    {
      "id": "var-2",
      "variationType": "EGG_SUBSTITUTE",
      "proteinItemId": "item-2",
      "isDefault": false,
      "proteinItem": {
        "name": "Ovo Cozido"
      }
    }
  ]
}
```

### Exemplo de Reserva

```json
{
  "id": "res-1",
  "userId": "user-1",
  "menuId": "550e8400-e29b-41d4-a716-446655440000",
  "menuVariationId": "var-1",
  "reservationDate": "2025-11-10",
  "status": "ACTIVE",
  "isAutoGenerated": false,
  "createdAt": "2025-11-07T14:30:00.000Z",
  "updatedAt": "2025-11-07T14:30:00.000Z",
  "menu": {
    "date": "2025-11-10",
    "dayOfWeek": "MONDAY"
  },
  "menuVariation": {
    "variationType": "STANDARD",
    "proteinItem": {
      "name": "Frango Grelhado"
    }
  }
}
```

## Tratamento de Erros

### Códigos de Status HTTP

- **200 OK**: Operação bem-sucedida (GET, PATCH)
- **201 Created**: Recurso criado com sucesso (POST)
- **204 No Content**: Recurso excluído com sucesso (DELETE)
- **400 Bad Request**: Dados de entrada inválidos (ValidationError)
- **401 Unauthorized**: Token ausente ou inválido (AuthenticationError)
- **403 Forbidden**: Usuário não tem permissão (AuthorizationError)
- **404 Not Found**: Recurso não encontrado (Error)
- **409 Conflict**: Conflito de dados (ex: CPF duplicado, reserva já existe)
- **500 Internal Server Error**: Erro interno do servidor (Error)

### Mensagens de Erro Específicas

#### Horário Limite (8:30 AM)

```json
{
  "error": "Modifications are not allowed after 8:30 AM on the reservation date"
}
```

#### Data Passada

```json
{
  "error": "Cannot create reservation for past dates"
}
```

#### CPF Duplicado

```json
{
  "error": "User with this CPF already exists"
}
```

#### Reserva Duplicada

```json
{
  "error": "User already has a reservation for this date"
}
```

## Considerações de Implementação

### Ordem de Implementação

1. Atualizar seção `info` com dados da BookMenu API
2. Atualizar `tags` para refletir os módulos da API
3. Adicionar `securitySchemes` para JWT
4. Implementar schemas de entidades principais (User, Category, MenuItem, etc.)
5. Implementar schemas de input (DTOs)
6. Implementar schemas de erro
7. Documentar endpoints de Auth
8. Documentar endpoints de Users (ADMIN)
9. Documentar endpoints de Categories, MenuItems, WeekDays (ADMIN)
10. Documentar endpoints de Menus
11. Documentar endpoints de Reservations
12. Adicionar exemplos realistas para todos os endpoints
13. Revisar e validar a documentação completa

### Validação

- Todos os schemas devem seguir a especificação OpenAPI 3.0
- Exemplos devem ser válidos de acordo com os schemas definidos
- Referências ($ref) devem apontar para schemas existentes
- Códigos de status HTTP devem ser apropriados para cada operação
- Descrições devem ser claras e em português

### Manutenibilidade

- Usar referências ($ref) para evitar duplicação de schemas
- Manter consistência nos nomes de propriedades
- Documentar regras de negócio importantes nas descrições
- Incluir exemplos para facilitar o entendimento
- Organizar schemas de forma lógica (entidades, inputs, erros)
