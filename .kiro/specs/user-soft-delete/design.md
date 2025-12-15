# Design Document - User Soft Delete

## Overview

Este documento descreve o design da solução para implementar exclusão lógica (soft delete) de usuários no Sistema de Reservas de Almoço Corporativo. A implementação modificará o comportamento da rota DELETE `/api/lunch-reservation/users/{id}` para alterar o status do usuário para INATIVO ao invés de removê-lo fisicamente do banco de dados.

### Contexto Atual

O sistema já possui:

- Campo `status` no modelo User com enum `UserStatus` (ATIVO/INATIVO)
- Método `toggleStatus()` na entidade User
- Validação de status ATIVO no processo de autenticação (AuthenticationService)
- Método `delete()` no UserManagementService que atualmente remove fisicamente o registro

### Objetivos

1. Modificar o método `delete()` do UserManagementService para realizar soft delete
2. Garantir que usuários inativos não possam fazer login
3. Filtrar usuários inativos nas listagens padrão
4. Manter compatibilidade com o contrato da API existente
5. Preservar integridade referencial e histórico de reservas

## Architecture

### Camadas Afetadas

```
┌─────────────────────────────────────────┐
│   HTTP Layer (Controller)               │
│   - UserController.delete()             │
│     (sem alterações)                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Domain Layer (Service)                │
│   - UserManagementService.delete()      │
│     (modificado para soft delete)       │
│   - UserManagementService.findAll()     │
│     (modificado para filtrar ativos)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Infrastructure Layer (Repository)     │
│   - PrismaUserRepository.update()       │
│     (usado para alterar status)         │
│   - PrismaUserRepository.findAll()      │
│     (modificado para filtrar)           │
└─────────────────────────────────────────┘
```

### Fluxo de Exclusão Lógica

```
DELETE /api/lunch-reservation/users/{id}
    │
    ▼
UserController.delete(id)
    │
    ▼
UserManagementService.delete(id)
    │
    ├─► Busca usuário por ID
    │   └─► Se não existe: throw AppError(404)
    │
    ├─► Verifica se já está INATIVO
    │   └─► Se sim: throw AppError(400)
    │
    └─► Atualiza status para INATIVO
        └─► userRepository.update(id, { status: INATIVO })
```

## Components and Interfaces

### 1. UserManagementService (Modificado)

**Arquivo:** `src/app/modules/lunch-reservation/domain/services/UserManagementService.ts`

#### Método `delete()` - Modificação

```typescript
async delete(id: string): Promise<void> {
  const existingUser = await this.userRepository.findById(id)
  if (!existingUser) {
    throw new AppError("Usuário não encontrado", 404)
  }

  // Verifica se o usuário já está inativo
  if (existingUser.status === UserStatus.INATIVO) {
    throw new AppError("Usuário já está inativo", 400)
  }

  // Realiza soft delete alterando o status para INATIVO
  await this.userRepository.update(id, {
    status: UserStatus.INATIVO,
  })
}
```

#### Método `findAll()` - Modificação

```typescript
async findAll(includeInactive: boolean = false): Promise<User[]> {
  const allUsers = await this.userRepository.findAll()

  if (includeInactive) {
    return allUsers
  }

  // Retorna apenas usuários ativos por padrão
  return allUsers.filter((user) => user.status === UserStatus.ATIVO)
}
```

### 2. PrismaUserRepository (Modificado)

**Arquivo:** `src/app/modules/lunch-reservation/infrastructure/repositories/PrismaUserRepository.ts`

#### Método `findAll()` - Modificação

```typescript
async findAll(includeInactive: boolean = false): Promise<User[]> {
  const whereClause = includeInactive
    ? {}
    : { status: UserStatus.ATIVO }

  const users = await this.prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  })

  return users.map(this.toDomain)
}
```

### 3. UserRepository Interface (Modificado)

**Arquivo:** `src/app/modules/lunch-reservation/domain/repositories/UserRepository.ts`

```typescript
export interface UserRepository {
  findByCpf(cpf: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(userData: CreateUserDTO): Promise<User>
  update(id: string, userData: UpdateUserDTO): Promise<User>
  findAll(includeInactive?: boolean): Promise<User[]> // Parâmetro adicionado
  delete(id: string): Promise<void> // Mantido para compatibilidade, mas não usado
}
```

### 4. UserController (Sem Alterações)

**Arquivo:** `src/infrastructure/http/controllers/UserController.ts`

O controller permanece inalterado, mantendo o contrato da API:

- Retorna 204 (No Content) em caso de sucesso
- Retorna 404 se usuário não existe
- Retorna 400 se usuário já está inativo (nova validação)

#### Método `getAll()` - Suporte a Query Parameter (Opcional)

Para permitir que administradores visualizem usuários inativos quando necessário:

```typescript
async getAll(req: Request, res: Response): Promise<Response> {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const users = await this.userManagementService.findAll(includeInactive)

    // Remove passwords from response
    const usersResponse = users.map(({ password, ...user }) => user)

    return res.status(200).json(usersResponse)
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      })
    }
    throw error
  }
}
```

## Data Models

### User Entity (Sem Alterações)

A entidade User já possui todos os campos e métodos necessários:

```typescript
export class User {
  constructor(
    public readonly id: string,
    public readonly cpf: string,
    public password: string,
    public name: string,
    public role: UserRole,
    public userType: UserType,
    public status: UserStatus, // Campo já existente
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public isActive(): boolean {
    return this.status === UserStatus.ATIVO
  }
}
```

### Prisma Schema (Sem Alterações)

O schema já possui o campo status:

```prisma
model User {
  id        String     @id @default(uuid())
  cpf       String     @unique
  password  String
  name      String
  role      UserRole   @default(USER)
  userType  UserType   @default(NAO_FIXO)
  status    UserStatus @default(ATIVO)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  reservations Reservation[]

  @@map("users")
}

enum UserStatus {
  ATIVO
  INATIVO
}
```

## Error Handling

### Cenários de Erro

| Cenário                   | Status Code | Mensagem                       | Tratamento                               |
| ------------------------- | ----------- | ------------------------------ | ---------------------------------------- |
| Usuário não encontrado    | 404         | "Usuário não encontrado"       | Lançar AppError no service               |
| Usuário já inativo        | 400         | "Usuário já está inativo"      | Lançar AppError no service               |
| Erro de validação de ID   | 400         | "Erro de validação" + detalhes | Capturado no controller (ZodError)       |
| Login com usuário inativo | 401         | "Usuário inativo"              | Já implementado no AuthenticationService |

### Mensagens de Erro

```typescript
// UserManagementService.delete()
throw new AppError("Usuário não encontrado", 404)
throw new AppError("Usuário já está inativo", 400)
```

## Testing Strategy

### 1. Testes Unitários

#### UserManagementService.delete()

```typescript
describe("UserManagementService.delete", () => {
  it("deve alterar status para INATIVO quando usuário existe e está ATIVO", async () => {
    // Arrange: usuário ativo
    // Act: chamar delete
    // Assert: update foi chamado com status INATIVO
  })

  it("deve lançar erro 404 quando usuário não existe", async () => {
    // Arrange: usuário não existe
    // Act & Assert: esperar AppError com status 404
  })

  it("deve lançar erro 400 quando usuário já está INATIVO", async () => {
    // Arrange: usuário inativo
    // Act & Assert: esperar AppError com status 400
  })
})
```

#### UserManagementService.findAll()

```typescript
describe("UserManagementService.findAll", () => {
  it("deve retornar apenas usuários ATIVO por padrão", async () => {
    // Arrange: mix de usuários ativos e inativos
    // Act: chamar findAll()
    // Assert: apenas usuários ativos retornados
  })

  it("deve retornar todos os usuários quando includeInactive é true", async () => {
    // Arrange: mix de usuários ativos e inativos
    // Act: chamar findAll(true)
    // Assert: todos os usuários retornados
  })
})
```

### 2. Testes de Integração

#### Rota DELETE /api/lunch-reservation/users/:id

```typescript
describe("DELETE /api/lunch-reservation/users/:id", () => {
  it("deve retornar 204 e alterar status para INATIVO", async () => {
    // Arrange: criar usuário ativo
    // Act: DELETE request
    // Assert: status 204, usuário no DB com status INATIVO
  })

  it("deve retornar 404 quando usuário não existe", async () => {
    // Act: DELETE com ID inexistente
    // Assert: status 404
  })

  it("deve retornar 400 quando usuário já está inativo", async () => {
    // Arrange: criar usuário inativo
    // Act: DELETE request
    // Assert: status 400
  })

  it("deve preservar reservas do usuário após soft delete", async () => {
    // Arrange: criar usuário com reservas
    // Act: DELETE request
    // Assert: reservas ainda existem no DB
  })
})
```

#### Rota GET /api/lunch-reservation/users

```typescript
describe("GET /api/lunch-reservation/users", () => {
  it("deve retornar apenas usuários ativos por padrão", async () => {
    // Arrange: criar usuários ativos e inativos
    // Act: GET request
    // Assert: apenas usuários ativos na resposta
  })

  it("deve retornar todos os usuários com query param includeInactive=true", async () => {
    // Arrange: criar usuários ativos e inativos
    // Act: GET request com ?includeInactive=true
    // Assert: todos os usuários na resposta
  })
})
```

### 3. Testes de Autenticação

```typescript
describe("POST /api/auth/login", () => {
  it("deve rejeitar login de usuário inativo", async () => {
    // Arrange: criar usuário inativo
    // Act: POST login
    // Assert: status 401, mensagem "Usuário inativo"
  })

  it("deve permitir login de usuário ativo", async () => {
    // Arrange: criar usuário ativo
    // Act: POST login
    // Assert: status 200, token retornado
  })
})
```

## Implementation Notes

### Ordem de Implementação

1. **Modificar UserManagementService.delete()**
   - Adicionar validação de status INATIVO
   - Substituir chamada de delete por update com status INATIVO

2. **Modificar UserManagementService.findAll()**
   - Adicionar parâmetro opcional `includeInactive`
   - Filtrar usuários por status quando necessário

3. **Modificar PrismaUserRepository.findAll()**
   - Adicionar parâmetro opcional `includeInactive`
   - Implementar filtro no Prisma query

4. **Atualizar UserRepository interface**
   - Adicionar parâmetro opcional em findAll()

5. **Modificar UserController.getAll() (Opcional)**
   - Adicionar suporte a query parameter `includeInactive`

6. **Atualizar métodos que usam findAll()**
   - Verificar métodos como `getActiveUsers()`, `getFixedUsers()`, etc.
   - Garantir que continuam funcionando corretamente

### Considerações de Compatibilidade

- **API Contract:** Mantido inalterado (DELETE retorna 204)
- **Frontend:** Não requer alterações obrigatórias
- **Banco de Dados:** Não requer migrations (campo status já existe)
- **Reservas:** Preservadas automaticamente (sem CASCADE DELETE)

### Impacto em Outros Serviços

#### AutoReservationService

O serviço de reservas automáticas já utiliza `getFixedUsers()` que filtra por status ATIVO, portanto não requer alterações.

#### ReservationService

Não requer alterações, pois usuários inativos não conseguirão fazer login para criar reservas.

### Melhorias Futuras (Fora do Escopo)

1. Adicionar campo `deletedAt` para auditoria
2. Implementar endpoint específico para reativação (POST /users/:id/reactivate)
3. Adicionar logs de auditoria para operações de soft delete
4. Implementar limpeza automática de usuários inativos após período definido
