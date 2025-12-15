# Design Document - Authentication System

## Overview

O sistema de autenticação será implementado seguindo a arquitetura hexagonal já estabelecida no projeto, com separação clara entre camadas de domínio, aplicação e infraestrutura. O módulo fornecerá endpoints REST para login e logout, além de middlewares para proteção de rotas e controle de acesso baseado em roles.

A implementação utilizará JWT (JSON Web Tokens) para autenticação stateless e bcrypt para hash de senhas, garantindo segurança e escalabilidade.

## Architecture

### Hexagonal Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Primary Adapters                          │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ AuthController   │         │ Auth Middlewares │          │
│  │  - login()       │         │  - authenticate()│          │
│  │  - logout()      │         │  - authorize()   │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
└───────────┼────────────────────────────┼─────────────────────┘
            │                            │
┌───────────▼────────────────────────────▼─────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────┐        │
│  │              AuthService                         │        │
│  │  - login(cpf, password)                          │        │
│  │  - validateToken(token)                          │        │
│  │  - hashPassword(password)                        │        │
│  │  - comparePassword(password, hash)               │        │
│  │  - generateToken(user)                           │        │
│  └────────────────────┬─────────────────────────────┘        │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                    Domain Layer                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ User Entity      │         │ UserRepository   │          │
│  │  - id            │         │  Interface       │          │
│  │  - cpf           │         │                  │          │
│  │  - password      │         │                  │          │
│  │  - name          │         │                  │          │
│  │  - role          │         │                  │          │
│  │  - status        │         │                  │          │
│  └──────────────────┘         └────────┬─────────┘          │
│                                        │                     │
└────────────────────────────────────────┼─────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────┐
│                  Secondary Adapters                          │
│  ┌──────────────────────────────────────────────────┐        │
│  │         PrismaUserRepository                     │        │
│  │  - findByCpf(cpf)                                │        │
│  │  - findById(id)                                  │        │
│  └──────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/app/modules/auth/
├── domain/
│   ├── User.ts                    # User entity (reuse existing)
│   ├── UserRepository.ts          # Repository interface
│   └── index.ts
├── dtos/
│   ├── LoginDTO.ts                # Login request DTO
│   ├── AuthResponseDTO.ts         # Login response DTO
│   └── index.ts
├── factories/
│   ├── makeAuthModule.ts          # Factory for dependency injection
│   ├── types.ts                   # Factory types
│   └── index.ts
├── AuthService.ts                 # Core authentication logic
└── index.ts

src/infrastructure/http/
├── controllers/
│   └── AuthController.ts          # HTTP request handlers
├── middlewares/
│   ├── authenticate.ts            # JWT validation middleware
│   ├── authorize.ts               # Role-based access control
│   └── index.ts
├── routes/
│   └── auth.routes.ts             # Auth route definitions
└── validators/
    └── authSchemas.ts             # Zod validation schemas

src/infrastructure/database/repositories/
└── PrismaUserRepository.ts        # Prisma implementation
```

## Components and Interfaces

### 1. Domain Layer

#### User Entity (Reuse Existing)

```typescript
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserType {
  FIXO = "FIXO",
  NAO_FIXO = "NAO_FIXO",
}

export enum UserStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export class User {
  constructor(
    public readonly id: string,
    public cpf: string,
    public password: string,
    public name: string,
    public role: UserRole,
    public userType: UserType,
    public status: UserStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  isActive(): boolean {
    return this.status === UserStatus.ATIVO
  }
}
```

#### UserRepository Interface

```typescript
export interface UserRepository {
  findByCpf(cpf: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
```

### 2. Application Layer

#### AuthService

```typescript
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string = "24h"
  ) {}

  async login(cpf: string, password: string): Promise<AuthResponse>
  async validateToken(token: string): Promise<TokenPayload>
  generateToken(user: User): string
  async hashPassword(password: string): Promise<string>
  async comparePassword(password: string, hash: string): Promise<boolean>
}
```

**Key Methods:**

- `login()`: Validates credentials, checks user status is ATIVO, generates JWT (Requirements 1.1, 1.2, 1.3, 1.4)
- `validateToken()`: Verifies JWT signature and expiration (Requirements 4.2, 4.3)
- `generateToken()`: Creates JWT with userId, cpf, role, and iat in payload (Requirements 3.1, 3.4)
- `hashPassword()`: Hashes password using bcrypt with salt rounds minimum 10 (Requirement 2.1)
- `comparePassword()`: Compares plain password with hash using bcrypt (Requirement 2.2)

**Design Rationale:** The AuthService encapsulates all authentication logic in a single service class, making it testable and reusable. By accepting the UserRepository as a dependency, we maintain the hexagonal architecture pattern and enable easy mocking for tests.

### 3. DTOs

#### LoginDTO

```typescript
export interface LoginDTO {
  cpf: string // 11 digits
  password: string // min 6 characters
}
```

#### AuthResponseDTO

```typescript
export interface AuthResponseDTO {
  token: string
  user: {
    id: string
    cpf: string
    name: string
    role: UserRole
  }
}
```

#### TokenPayload

```typescript
export interface TokenPayload {
  userId: string
  cpf: string
  role: UserRole
  iat: number
  exp: number
}
```

### 4. Infrastructure Layer

#### AuthController

```typescript
export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<Response>
  async logout(req: Request, res: Response): Promise<Response>
}
```

**Endpoints:**

- `POST /api/auth/login`: Authenticate user and return token (Requirement 1.1)
  - Validates credentials against database
  - Checks user status is ATIVO (Requirement 1.4)
  - Returns token and user data on success
  - Returns appropriate error messages for failures (Requirements 1.2, 1.3, 1.4, 1.5)
- `POST /api/auth/logout`: Logout user (Requirement 6.1, 6.2, 6.3)
  - Returns success message "Logout realizado com sucesso"
  - Token invalidation handled client-side

#### Middlewares

**authenticate.ts**

```typescript
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void
```

- Extracts token from Authorization header (Bearer token)
- Validates token using AuthService
- Attaches user data to req.user (Requirement 4.4)
- Allows request to proceed on valid token (Requirement 4.5)
- Returns 401 with "Token não fornecido" for missing tokens (Requirement 4.1)
- Returns 401 with "Token inválido" for invalid tokens (Requirement 4.2)
- Returns 401 with "Token expirado" for expired tokens (Requirement 4.3)

**authorize.ts**

```typescript
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void
}
```

- Accepts allowed roles as parameters (Requirement 5.3)
- Checks if req.user.role is in allowedRoles
- Returns 403 with "Acesso negado" if user doesn't have required role (Requirement 5.1)
- Allows request to proceed if user has required role (Requirement 5.2)
- Must be used after authenticate middleware

#### PrismaUserRepository

```typescript
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCpf(cpf: string): Promise<User | null>
  async findById(id: string): Promise<User | null>
}
```

### 5. Validation Schemas

```typescript
export const loginSchema = z.object({
  cpf: z
    .string()
    .length(11, "CPF deve conter 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"), // Requirement 7.1
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"), // Requirement 7.2
})
```

**Design Rationale:** Zod provides type-safe validation with clear error messages that can be returned to clients. The CPF validation ensures exactly 11 numeric digits as specified in Requirement 7.1, and password validation enforces the 6-character minimum from Requirement 7.2.

### 6. Factory Pattern

```typescript
export interface AuthModule {
  authController: AuthController
  authService: AuthService
}

export interface AuthFactoryConfig {
  database?: PrismaClient
  jwtSecret?: string
  jwtExpiresIn?: string
}

export function makeAuthModule(config?: AuthFactoryConfig): AuthModule
```

## Data Models

### JWT Token Structure

```json
{
  "userId": "uuid",
  "cpf": "12345678901",
  "role": "USER",
  "iat": 1699632000,
  "exp": 1699718400
}
```

### Login Request

```json
{
  "cpf": "12345678901",
  "password": "senha123"
}
```

### Login Response (Success)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "cpf": "12345678901",
    "name": "João Silva",
    "role": "USER"
  }
}
```

### Error Responses

**400 - Validation Error**

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["cpf"],
      "message": "CPF deve conter 11 dígitos"
    }
  ]
}
```

**401 - Invalid Credentials**

```json
{
  "error": "Credenciais inválidas"
}
```

**403 - Inactive User**

```json
{
  "error": "Usuário inativo"
}
```

**403 - Insufficient Permissions**

```json
{
  "error": "Acesso negado"
}
```

## Error Handling

### Error Types

1. **Validation Errors (400)**
   - Invalid CPF format
   - Password too short
   - Missing required fields

2. **Authentication Errors (401)**
   - Invalid credentials
   - Missing token
   - Invalid token
   - Expired token

3. **Authorization Errors (403)**
   - Inactive user
   - Insufficient role permissions

4. **Server Errors (500)**
   - Database connection failures
   - Unexpected errors

### Error Handling Strategy

- Use existing `AppError` class for business logic errors
- Use Zod validation for input validation (Requirement 7)
- Use existing `errorHandler` middleware for centralized error handling
- Never expose sensitive information (e.g., "user not found" vs "invalid credentials") - always return "Credenciais inválidas" for authentication failures (Requirement 1.2, 1.3)
- Return specific error messages as defined in requirements:
  - "Token não fornecido" for missing tokens (Requirement 4.1)
  - "Token inválido" for invalid tokens (Requirement 4.2)
  - "Token expirado" for expired tokens (Requirement 4.3)
  - "Acesso negado" for authorization failures (Requirement 5.1)
  - "Usuário inativo" for inactive users (Requirement 1.4)

## Security Considerations

### Password Security

- Use bcrypt with salt rounds = 10 minimum (Requirement 2.1)
- Never return passwords in API responses (Requirement 2.3)
- Store only hashed passwords in database
- Compare passwords using bcrypt.compare() for secure validation (Requirement 2.2)

### Token Security

- Use strong JWT secret (min 32 characters, from environment variable JWT_SECRET) (Requirement 3.3)
- Set expiration time to 24 hours (Requirement 3.2)
- Use HS256 algorithm for signing
- Validate token on every protected request (Requirement 4.2, 4.3)
- Include userId, cpf, role, and iat in token payload (Requirement 3.1, 3.4)

### Input Validation

- Validate all inputs using Zod schemas (Requirement 7.4)
- CPF must be exactly 11 numeric digits (Requirement 7.1)
- Password must have minimum 6 characters (Requirement 7.2)
- Return 400 error with field details for validation failures (Requirement 7.3, 1.5)

### Rate Limiting (Future Enhancement)

- Consider implementing rate limiting for login endpoint
- Prevent brute force attacks

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h
```

## Testing Strategy

### Unit Tests

- AuthService.login() with valid/invalid credentials
- AuthService.validateToken() with valid/invalid/expired tokens
- AuthService.hashPassword() and comparePassword()
- User.isActive() method
- Middleware functions (authenticate, authorize)

### Integration Tests

- POST /api/auth/login with valid credentials
- POST /api/auth/login with invalid credentials
- POST /api/auth/login with inactive user
- Protected endpoint access with valid token
- Protected endpoint access without token
- Protected endpoint access with invalid token
- Admin-only endpoint access with USER role
- Admin-only endpoint access with ADMIN role

### Test Data

- Create test users with different roles (ADMIN, USER)
- Create inactive users for testing status validation
- Use known passwords for predictable hash comparison

## Integration Points

### Existing Modules

- Reuse existing User model from Prisma schema
- Integrate with existing error handling middleware
- Follow existing factory pattern for dependency injection
- Use existing Zod validation pattern

### Protected Routes

After implementation, existing routes can be protected:

```typescript
// Example: Protect device routes
deviceRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  deviceController.create.bind(deviceController)
)
```

### Route Registration

Add auth routes to applicationRouter:

```typescript
router.use("/auth", authRouter)
```

## Dependencies

### New Dependencies

- `jsonwebtoken`: JWT generation and validation
- `bcryptjs`: Password hashing
- `@types/jsonwebtoken`: TypeScript types for JWT
- `@types/bcryptjs`: TypeScript types for bcrypt

### Existing Dependencies

- `zod`: Input validation
- `express`: HTTP server
- `@prisma/client`: Database access
- Existing AppError class
- Existing error handler middleware

## Implementation Notes

1. **User Model**: Reuse existing Prisma User model, no schema changes needed. The model includes userType field which is not used in authentication but should be preserved.
2. **Password Migration**: Existing users may need password reset if passwords aren't hashed with bcrypt
3. **Backward Compatibility**: New auth system won't break existing unprotected routes
4. **Gradual Rollout**: Routes can be protected incrementally using authenticate and authorize middlewares
5. **Testing**: Ensure comprehensive tests before protecting production routes
6. **Requirements Traceability**: All requirements (1.1-7.3) are addressed in the design and mapped to specific components
7. **Error Messages**: All error messages follow the exact wording specified in requirements for consistency

## Requirements Coverage

This design addresses all requirements from the requirements document:

- **Requirement 1 (Login)**: Handled by AuthController.login() and AuthService.login()
- **Requirement 2 (Password Security)**: Implemented via bcrypt in AuthService
- **Requirement 3 (Token Generation)**: Implemented in AuthService.generateToken()
- **Requirement 4 (Protected Endpoints)**: Implemented via authenticate middleware
- **Requirement 5 (Role-Based Access)**: Implemented via authorize middleware
- **Requirement 6 (Logout)**: Handled by AuthController.logout()
- **Requirement 7 (Input Validation)**: Implemented via Zod schemas in authSchemas.ts
