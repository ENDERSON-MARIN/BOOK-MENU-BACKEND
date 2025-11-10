export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "BookMenu API",
    version: "1.0.0",
    description:
      "API REST para sistema de reservas de almoço corporativo. Permite gerenciamento de usuários, categorias de alimentos, itens de menu, cardápios semanais e reservas de refeições.",
    contact: {
      name: "BookMenu Support",
      email: "support@bookmenu.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Servidor de Desenvolvimento",
    },
    {
      url: "https://api.production.com",
      description: "Servidor de Produção",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Autenticação e gerenciamento de sessões",
    },
    {
      name: "Users",
      description: "Gerenciamento de usuários (ADMIN)",
    },
    {
      name: "Categories",
      description: "Gerenciamento de categorias de alimentos (ADMIN)",
    },
    {
      name: "MenuItems",
      description: "Gerenciamento de itens de menu (ADMIN)",
    },
    {
      name: "WeekDays",
      description: "Consulta de dias da semana",
    },
    {
      name: "Menus",
      description: "Gerenciamento de cardápios",
    },
    {
      name: "Reservations",
      description: "Gerenciamento de reservas de almoço",
    },
    {
      name: "Devices",
      description: "Gerenciamento de dispositivos (ADMIN)",
    },
  ],
  paths: {
    //Authentication
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autenticar usuário",
        description:
          "Autentica um usuário usando CPF e senha, retornando um token JWT para acesso aos demais endpoints da API",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginInput",
              },
              examples: {
                usuarioComum: {
                  summary: "Usuário comum",
                  value: {
                    cpf: "12345678901",
                    password: "senha123",
                  },
                },
                administrador: {
                  summary: "Administrador",
                  value: {
                    cpf: "00000000000",
                    password: "password",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description: "Token JWT para autenticação",
                      example:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJjcGYiOiIxMjM0NTY3ODkwMSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzMwOTg4MDAwLCJleHAiOjE3MzEwNzQ0MDB9.abc123def456ghi789",
                    },
                    user: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                  required: ["token", "user"],
                },
                examples: {
                  usuarioComum: {
                    summary: "Login de usuário comum",
                    value: {
                      token:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJjcGYiOiIxMjM0NTY3ODkwMSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzMwOTg4MDAwLCJleHAiOjE3MzEwNzQ0MDB9.abc123def456ghi789",
                      user: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        cpf: "12345678901",
                        name: "João Silva",
                        role: "USER",
                        userType: "FIXO",
                        status: "ATIVO",
                        createdAt: "2025-10-21T10:30:00.000Z",
                        updatedAt: "2025-10-21T10:30:00.000Z",
                      },
                    },
                  },
                  administrador: {
                    summary: "Login de administrador",
                    value: {
                      token:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJjcGYiOiI5ODc2NTQzMjEwMCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczMDk4ODAwMCwiZXhwIjoxNzMxMDc0NDAwfQ.xyz789abc123def456",
                      user: {
                        id: "660e8400-e29b-41d4-a716-446655440001",
                        cpf: "98765432100",
                        name: "Maria Santos",
                        role: "ADMIN",
                        userType: "FIXO",
                        status: "ATIVO",
                        createdAt: "2025-10-15T08:00:00.000Z",
                        updatedAt: "2025-10-15T08:00:00.000Z",
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  cpfInvalido: {
                    summary: "CPF inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "CPF must contain exactly 11 digits",
                          path: ["cpf"],
                        },
                      ],
                    },
                  },
                  senhaAusente: {
                    summary: "Senha ausente",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_type",
                          message: "Password is required",
                          path: ["password"],
                        },
                      ],
                    },
                  },
                  senhaCurta: {
                    summary: "Senha muito curta",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "too_small",
                          message: "Password must be at least 6 characters",
                          path: ["password"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                examples: {
                  credenciaisInvalidas: {
                    summary: "CPF ou senha incorretos",
                    value: {
                      error: "Invalid credentials",
                    },
                  },
                  usuarioInativo: {
                    summary: "Usuário inativo",
                    value: {
                      error: "User account is inactive",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar token de autenticação",
        description:
          "Renova o token JWT de autenticação do usuário. Permite manter a sessão ativa sem necessidade de novo login.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: {
                    type: "string",
                    description: "Token de renovação",
                    example: "refresh_token_example",
                  },
                },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token renovado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                      description: "Novo token JWT para autenticação",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token de renovação inválido ou expirado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Invalid or expired refresh token",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Encerrar sessão",
        description:
          "Encerra a sessão do usuário autenticado, invalidando o token atual.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Logout realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Logout successful",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    //Users
    "/api/lunch-reservation/users": {
      post: {
        tags: ["Users"],
        summary: "Criar novo usuário",
        description:
          "Cria um novo usuário no sistema. Requer privilégios de administrador (ADMIN). O CPF deve ser único no sistema.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUserInput",
              },
              examples: {
                usuarioComum: {
                  summary: "Criar usuário comum",
                  value: {
                    cpf: "11122233344",
                    password: "senha123",
                    name: "Carlos Oliveira",
                    role: "USER",
                    userType: "NAO_FIXO",
                    status: "ATIVO",
                  },
                },
                usuarioFixo: {
                  summary: "Criar usuário fixo",
                  value: {
                    cpf: "55566677788",
                    password: "senha456",
                    name: "Ana Paula Santos",
                    role: "USER",
                    userType: "FIXO",
                    status: "ATIVO",
                  },
                },
                administrador: {
                  summary: "Criar administrador",
                  value: {
                    cpf: "99988877766",
                    password: "admin789",
                    name: "Roberto Silva",
                    role: "ADMIN",
                    userType: "FIXO",
                    status: "ATIVO",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
                examples: {
                  usuarioCriado: {
                    summary: "Usuário criado",
                    value: {
                      id: "770e8400-e29b-41d4-a716-446655440010",
                      cpf: "11122233344",
                      name: "Carlos Oliveira",
                      role: "USER",
                      userType: "NAO_FIXO",
                      status: "ATIVO",
                      createdAt: "2025-11-07T15:30:00.000Z",
                      updatedAt: "2025-11-07T15:30:00.000Z",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  cpfInvalido: {
                    summary: "CPF inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "CPF must contain exactly 11 digits",
                          path: ["cpf"],
                        },
                      ],
                    },
                  },
                  nomeAusente: {
                    summary: "Nome ausente",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_type",
                          message: "Name is required",
                          path: ["name"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "409": {
            description: "CPF já cadastrado no sistema",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "User with this CPF already exists",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Users"],
        summary: "Listar todos os usuários",
        description:
          "Retorna uma lista com todos os usuários cadastrados no sistema. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Lista de usuários retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
                examples: {
                  listaUsuarios: {
                    summary: "Lista com múltiplos usuários",
                    value: [
                      {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        cpf: "12345678901",
                        name: "João Silva",
                        role: "USER",
                        userType: "FIXO",
                        status: "ATIVO",
                        createdAt: "2025-10-21T10:30:00.000Z",
                        updatedAt: "2025-10-21T10:30:00.000Z",
                      },
                      {
                        id: "660e8400-e29b-41d4-a716-446655440001",
                        cpf: "98765432100",
                        name: "Maria Santos",
                        role: "ADMIN",
                        userType: "FIXO",
                        status: "ATIVO",
                        createdAt: "2025-10-15T08:00:00.000Z",
                        updatedAt: "2025-10-15T08:00:00.000Z",
                      },
                      {
                        id: "770e8400-e29b-41d4-a716-446655440010",
                        cpf: "11122233344",
                        name: "Carlos Oliveira",
                        role: "USER",
                        userType: "NAO_FIXO",
                        status: "ATIVO",
                        createdAt: "2025-11-07T15:30:00.000Z",
                        updatedAt: "2025-11-07T15:30:00.000Z",
                      },
                      {
                        id: "880e8400-e29b-41d4-a716-446655440011",
                        cpf: "44455566677",
                        name: "Fernanda Costa",
                        role: "USER",
                        userType: "FIXO",
                        status: "INATIVO",
                        createdAt: "2025-09-10T14:20:00.000Z",
                        updatedAt: "2025-11-05T09:15:00.000Z",
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Consultar usuário específico",
        description:
          "Retorna os dados de um usuário específico pelo ID. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do usuário (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        responses: {
          "200": {
            description: "Usuário encontrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
                example: {
                  id: "550e8400-e29b-41d4-a716-446655440000",
                  cpf: "12345678901",
                  name: "João Silva",
                  role: "USER",
                  userType: "FIXO",
                  status: "ATIVO",
                  createdAt: "2025-10-21T10:30:00.000Z",
                  updatedAt: "2025-10-21T10:30:00.000Z",
                },
              },
            },
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Usuário não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "User not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Atualizar usuário",
        description:
          "Atualiza os dados de um usuário existente. Permite alterar nome, papel (role), tipo de usuário (userType) e status. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do usuário (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateUserInput",
              },
              examples: {
                atualizarNome: {
                  summary: "Atualizar nome do usuário",
                  value: {
                    name: "João Silva Santos",
                  },
                },
                alterarTipoUsuario: {
                  summary: "Alterar tipo de usuário (FIXO para NAO_FIXO)",
                  value: {
                    userType: "NAO_FIXO",
                  },
                },
                promoverAdmin: {
                  summary: "Promover usuário a administrador",
                  value: {
                    role: "ADMIN",
                  },
                },
                atualizacaoCompleta: {
                  summary: "Atualização completa",
                  value: {
                    name: "João Silva Santos",
                    role: "ADMIN",
                    userType: "FIXO",
                    status: "ATIVO",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usuário atualizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
                examples: {
                  usuarioAtualizado: {
                    summary: "Usuário com tipo alterado",
                    value: {
                      id: "550e8400-e29b-41d4-a716-446655440000",
                      cpf: "12345678901",
                      name: "João Silva",
                      role: "USER",
                      userType: "NAO_FIXO",
                      status: "ATIVO",
                      createdAt: "2025-10-21T10:30:00.000Z",
                      updatedAt: "2025-11-07T16:45:00.000Z",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  roleInvalido: {
                    summary: "Papel inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_enum_value",
                          message: "Invalid role. Must be ADMIN or USER",
                          path: ["role"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Usuário não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "User not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Excluir usuário",
        description:
          "Exclui um usuário do sistema. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do usuário a ser excluído (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        responses: {
          "204": {
            description: "Usuário excluído com sucesso (sem conteúdo)",
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Usuário não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "User not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    //Categories
    "/api/lunch-reservation/categories": {
      post: {
        tags: ["Categories"],
        summary: "Criar nova categoria",
        description:
          "Cria uma nova categoria de alimentos no sistema. Requer privilégios de administrador (ADMIN). O nome da categoria deve ser único.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateCategoryInput",
              },
              examples: {
                proteina: {
                  summary: "Categoria de Proteína",
                  value: {
                    name: "Proteína",
                    description: "Alimentos ricos em proteínas",
                    displayOrder: 1,
                  },
                },
                acompanhamento: {
                  summary: "Categoria de Acompanhamento",
                  value: {
                    name: "Acompanhamento",
                    description: "Arroz, feijão e outros acompanhamentos",
                    displayOrder: 2,
                  },
                },
                salada: {
                  summary: "Categoria de Salada",
                  value: {
                    name: "Salada",
                    description: "Saladas e vegetais frescos",
                    displayOrder: 3,
                  },
                },
                sobremesa: {
                  summary: "Categoria de Sobremesa",
                  value: {
                    name: "Sobremesa",
                    description: "Doces e frutas",
                    displayOrder: 4,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Categoria criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category",
                },
                examples: {
                  categoriaCriada: {
                    summary: "Categoria criada",
                    value: {
                      id: "550e8400-e29b-41d4-a716-446655440020",
                      name: "Proteína",
                      description: "Alimentos ricos em proteínas",
                      displayOrder: 1,
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-07T18:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  nomeAusente: {
                    summary: "Nome ausente",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_type",
                          message: "Name is required",
                          path: ["name"],
                        },
                      ],
                    },
                  },
                  displayOrderInvalido: {
                    summary: "Ordem de exibição inválida",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "too_small",
                          message: "Display order must be at least 0",
                          path: ["displayOrder"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "409": {
            description: "Categoria com este nome já existe",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Category with this name already exists",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Categories"],
        summary: "Listar todas as categorias",
        description:
          "Retorna uma lista com todas as categorias de alimentos cadastradas no sistema. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Lista de categorias retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Category",
                  },
                },
                examples: {
                  listaCategorias: {
                    summary: "Lista com múltiplas categorias",
                    value: [
                      {
                        id: "550e8400-e29b-41d4-a716-446655440020",
                        name: "Proteína",
                        description: "Alimentos ricos em proteínas",
                        displayOrder: 1,
                        isActive: true,
                        createdAt: "2025-11-07T18:00:00.000Z",
                        updatedAt: "2025-11-07T18:00:00.000Z",
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440021",
                        name: "Acompanhamento",
                        description: "Arroz, feijão e outros acompanhamentos",
                        displayOrder: 2,
                        isActive: true,
                        createdAt: "2025-11-07T18:05:00.000Z",
                        updatedAt: "2025-11-07T18:05:00.000Z",
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440022",
                        name: "Salada",
                        description: "Saladas e vegetais frescos",
                        displayOrder: 3,
                        isActive: true,
                        createdAt: "2025-11-07T18:10:00.000Z",
                        updatedAt: "2025-11-07T18:10:00.000Z",
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440023",
                        name: "Sobremesa",
                        description: "Doces e frutas",
                        displayOrder: 4,
                        isActive: true,
                        createdAt: "2025-11-07T18:15:00.000Z",
                        updatedAt: "2025-11-07T18:15:00.000Z",
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440024",
                        name: "Bebida",
                        description: "Sucos e bebidas",
                        displayOrder: 5,
                        isActive: false,
                        createdAt: "2025-10-15T10:00:00.000Z",
                        updatedAt: "2025-11-05T14:30:00.000Z",
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Consultar categoria específica",
        description:
          "Retorna os dados de uma categoria específica pelo ID. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único da categoria (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440020",
          },
        ],
        responses: {
          "200": {
            description: "Categoria encontrada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category",
                },
                example: {
                  id: "550e8400-e29b-41d4-a716-446655440020",
                  name: "Proteína",
                  description: "Alimentos ricos em proteínas",
                  displayOrder: 1,
                  isActive: true,
                  createdAt: "2025-11-07T18:00:00.000Z",
                  updatedAt: "2025-11-07T18:00:00.000Z",
                },
              },
            },
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Categoria não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Category not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Atualizar categoria",
        description:
          "Atualiza os dados de uma categoria existente. Permite alterar nome, descrição e ordem de exibição. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único da categoria (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440020",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateCategoryInput",
              },
              examples: {
                atualizarNome: {
                  summary: "Atualizar nome da categoria",
                  value: {
                    name: "Proteína Animal",
                  },
                },
                atualizarDescricao: {
                  summary: "Atualizar descrição",
                  value: {
                    description:
                      "Alimentos ricos em proteínas de origem animal",
                  },
                },
                atualizarOrdem: {
                  summary: "Alterar ordem de exibição",
                  value: {
                    displayOrder: 5,
                  },
                },
                atualizacaoCompleta: {
                  summary: "Atualização completa",
                  value: {
                    name: "Proteína Animal",
                    description:
                      "Alimentos ricos em proteínas de origem animal",
                    displayOrder: 2,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Categoria atualizada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category",
                },
                examples: {
                  categoriaAtualizada: {
                    summary: "Categoria com nome e descrição atualizados",
                    value: {
                      id: "550e8400-e29b-41d4-a716-446655440020",
                      name: "Proteína Animal",
                      description:
                        "Alimentos ricos em proteínas de origem animal",
                      displayOrder: 1,
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-07T19:30:00.000Z",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  nomeInvalido: {
                    summary: "Nome muito longo",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "too_big",
                          message: "Name must be at most 100 characters",
                          path: ["name"],
                        },
                      ],
                    },
                  },
                  displayOrderInvalido: {
                    summary: "Ordem de exibição negativa",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "too_small",
                          message: "Display order must be at least 0",
                          path: ["displayOrder"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Categoria não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Category not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Excluir categoria",
        description:
          "Exclui uma categoria do sistema. A categoria não pode ter itens de menu associados. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único da categoria a ser excluída (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440024",
          },
        ],
        responses: {
          "204": {
            description: "Categoria excluída com sucesso (sem conteúdo)",
          },
          "400": {
            description: "ID inválido ou categoria possui itens associados",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      $ref: "#/components/schemas/ValidationError",
                    },
                    {
                      $ref: "#/components/schemas/Error",
                    },
                  ],
                },
                examples: {
                  idInvalido: {
                    summary: "ID inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["id"],
                        },
                      ],
                    },
                  },
                  categoriaComItens: {
                    summary: "Categoria possui itens associados",
                    value: {
                      error:
                        "Cannot delete category with associated menu items",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Categoria não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Category not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    //Menu Items
    "/api/lunch-reservation/menu-items": {
      post: {
        tags: ["MenuItems"],
        summary: "Criar novo item de menu",
        description:
          "Cria um novo item de menu associado a uma categoria. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateMenuItemInput",
              },
              examples: {
                proteina: {
                  summary: "Criar item de proteína",
                  value: {
                    name: "Frango Grelhado",
                    description: "Peito de frango grelhado temperado com ervas",
                    categoryId: "550e8400-e29b-41d4-a716-446655440020",
                  },
                },
                acompanhamento: {
                  summary: "Criar acompanhamento",
                  value: {
                    name: "Farofa de Bacon",
                    description: "Farofa crocante com bacon e cebola",
                    categoryId: "660e8400-e29b-41d4-a716-446655440021",
                  },
                },
                sobremesa: {
                  summary: "Criar sobremesa",
                  value: {
                    name: "Brigadeiro",
                    description:
                      "Brigadeiro tradicional com chocolate e granulado",
                    categoryId: "770e8400-e29b-41d4-a716-446655440022",
                  },
                },
                salada: {
                  summary: "Criar salada",
                  value: {
                    name: "Salada de Tomate com Cebola",
                    description: "Tomate fresco com cebola roxa e azeite",
                    categoryId: "880e8400-e29b-41d4-a716-446655440023",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Item de menu criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MenuItem",
                },
                examples: {
                  itemCriado: {
                    summary: "Item de menu criado",
                    value: {
                      id: "880e8400-e29b-41d4-a716-446655440030",
                      name: "Frango Grelhado",
                      description:
                        "Peito de frango grelhado temperado com ervas",
                      categoryId: "550e8400-e29b-41d4-a716-446655440020",
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-07T18:00:00.000Z",
                      category: {
                        id: "550e8400-e29b-41d4-a716-446655440020",
                        name: "Proteína",
                        description: "Carnes e proteínas",
                        displayOrder: 1,
                        isActive: true,
                        createdAt: "2025-10-01T10:00:00.000Z",
                        updatedAt: "2025-10-01T10:00:00.000Z",
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  nomeAusente: {
                    summary: "Nome ausente",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_type",
                          message: "Name is required",
                          path: ["name"],
                        },
                      ],
                    },
                  },
                  categoryIdInvalido: {
                    summary: "ID de categoria inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["categoryId"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["MenuItems"],
        summary: "Listar todos os itens de menu",
        description:
          "Retorna uma lista com todos os itens de menu cadastrados no sistema. Permite filtrar por categoria através do parâmetro categoryId. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "categoryId",
            in: "query",
            required: false,
            description:
              "ID da categoria para filtrar os itens de menu (UUID). Se não informado, retorna todos os itens.",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440020",
          },
        ],
        responses: {
          "200": {
            description: "Lista de itens de menu retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MenuItem",
                  },
                },
                examples: {
                  todosItens: {
                    summary: "Todos os itens de menu",
                    value: [
                      {
                        id: "880e8400-e29b-41d4-a716-446655440030",
                        name: "Frango Grelhado",
                        description:
                          "Peito de frango grelhado temperado com ervas",
                        categoryId: "550e8400-e29b-41d4-a716-446655440020",
                        isActive: true,
                        createdAt: "2025-11-07T18:00:00.000Z",
                        updatedAt: "2025-11-07T18:00:00.000Z",
                        category: {
                          id: "550e8400-e29b-41d4-a716-446655440020",
                          name: "Proteína",
                          description: "Carnes e proteínas",
                          displayOrder: 1,
                          isActive: true,
                        },
                      },
                      {
                        id: "990e8400-e29b-41d4-a716-446655440031",
                        name: "Peixe Assado",
                        description: "Filé de peixe assado com limão",
                        categoryId: "550e8400-e29b-41d4-a716-446655440020",
                        isActive: true,
                        createdAt: "2025-11-05T14:30:00.000Z",
                        updatedAt: "2025-11-05T14:30:00.000Z",
                        category: {
                          id: "550e8400-e29b-41d4-a716-446655440020",
                          name: "Proteína",
                          description: "Carnes e proteínas",
                          displayOrder: 1,
                          isActive: true,
                        },
                      },
                      {
                        id: "aa0e8400-e29b-41d4-a716-446655440032",
                        name: "Arroz Integral",
                        description: "Arroz integral cozido no vapor",
                        categoryId: "660e8400-e29b-41d4-a716-446655440021",
                        isActive: true,
                        createdAt: "2025-11-03T10:15:00.000Z",
                        updatedAt: "2025-11-03T10:15:00.000Z",
                        category: {
                          id: "660e8400-e29b-41d4-a716-446655440021",
                          name: "Acompanhamento",
                          description: "Arroz, feijão e massas",
                          displayOrder: 2,
                          isActive: true,
                        },
                      },
                      {
                        id: "bb0e8400-e29b-41d4-a716-446655440033",
                        name: "Feijão Preto",
                        description: "Feijão preto cozido",
                        categoryId: "660e8400-e29b-41d4-a716-446655440021",
                        isActive: true,
                        createdAt: "2025-11-03T10:20:00.000Z",
                        updatedAt: "2025-11-03T10:20:00.000Z",
                        category: {
                          id: "660e8400-e29b-41d4-a716-446655440021",
                          name: "Acompanhamento",
                          description: "Arroz, feijão e massas",
                          displayOrder: 2,
                          isActive: true,
                        },
                      },
                      {
                        id: "cc0e8400-e29b-41d4-a716-446655440034",
                        name: "Carne Assada",
                        description: "Carne bovina assada ao molho madeira",
                        categoryId: "550e8400-e29b-41d4-a716-446655440020",
                        isActive: true,
                        createdAt: "2025-11-02T09:00:00.000Z",
                        updatedAt: "2025-11-02T09:00:00.000Z",
                        category: {
                          id: "550e8400-e29b-41d4-a716-446655440020",
                          name: "Proteína",
                          description: "Carnes e proteínas",
                          displayOrder: 1,
                          isActive: true,
                        },
                      },
                      {
                        id: "dd0e8400-e29b-41d4-a716-446655440035",
                        name: "Macarrão ao Alho e Óleo",
                        description: "Macarrão tipo penne com alho e azeite",
                        categoryId: "660e8400-e29b-41d4-a716-446655440021",
                        isActive: true,
                        createdAt: "2025-11-01T11:30:00.000Z",
                        updatedAt: "2025-11-01T11:30:00.000Z",
                        category: {
                          id: "660e8400-e29b-41d4-a716-446655440021",
                          name: "Acompanhamento",
                          description: "Arroz, feijão e massas",
                          displayOrder: 2,
                          isActive: true,
                        },
                      },
                    ],
                  },
                  itensFiltrados: {
                    summary: "Itens filtrados por categoria (Proteína)",
                    value: [
                      {
                        id: "880e8400-e29b-41d4-a716-446655440030",
                        name: "Frango Grelhado",
                        description:
                          "Peito de frango grelhado temperado com ervas",
                        categoryId: "550e8400-e29b-41d4-a716-446655440020",
                        isActive: true,
                        createdAt: "2025-11-07T18:00:00.000Z",
                        updatedAt: "2025-11-07T18:00:00.000Z",
                        category: {
                          id: "550e8400-e29b-41d4-a716-446655440020",
                          name: "Proteína",
                          description: "Carnes e proteínas",
                          displayOrder: 1,
                          isActive: true,
                        },
                      },
                      {
                        id: "990e8400-e29b-41d4-a716-446655440031",
                        name: "Peixe Assado",
                        description: "Filé de peixe assado com limão",
                        categoryId: "550e8400-e29b-41d4-a716-446655440020",
                        isActive: true,
                        createdAt: "2025-11-05T14:30:00.000Z",
                        updatedAt: "2025-11-05T14:30:00.000Z",
                        category: {
                          id: "550e8400-e29b-41d4-a716-446655440020",
                          name: "Proteína",
                          description: "Carnes e proteínas",
                          displayOrder: 1,
                          isActive: true,
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/menu-items/{id}": {
      get: {
        tags: ["MenuItems"],
        summary: "Consultar item de menu específico",
        description:
          "Retorna os dados de um item de menu específico pelo ID. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do item de menu (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "880e8400-e29b-41d4-a716-446655440030",
          },
        ],
        responses: {
          "200": {
            description: "Item de menu encontrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MenuItem",
                },
                example: {
                  id: "880e8400-e29b-41d4-a716-446655440030",
                  name: "Frango Grelhado",
                  description: "Peito de frango grelhado temperado com ervas",
                  categoryId: "550e8400-e29b-41d4-a716-446655440020",
                  isActive: true,
                  createdAt: "2025-11-07T18:00:00.000Z",
                  updatedAt: "2025-11-07T18:00:00.000Z",
                  category: {
                    id: "550e8400-e29b-41d4-a716-446655440020",
                    name: "Proteína",
                    description: "Carnes e proteínas",
                    displayOrder: 1,
                    isActive: true,
                    createdAt: "2025-10-01T10:00:00.000Z",
                    updatedAt: "2025-10-01T10:00:00.000Z",
                  },
                },
              },
            },
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Item de menu não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu item not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["MenuItems"],
        summary: "Atualizar item de menu",
        description:
          "Atualiza os dados de um item de menu existente. Permite alterar nome, descrição e categoria. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do item de menu (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "880e8400-e29b-41d4-a716-446655440030",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateMenuItemInput",
              },
              examples: {
                atualizarNome: {
                  summary: "Atualizar nome e descrição",
                  value: {
                    name: "Frango Grelhado com Ervas Finas",
                    description:
                      "Peito de frango grelhado temperado com ervas finas e azeite",
                  },
                },
                alterarCategoria: {
                  summary: "Alterar categoria do item",
                  value: {
                    categoryId: "770e8400-e29b-41d4-a716-446655440022",
                  },
                },
                atualizacaoCompleta: {
                  summary: "Atualização completa",
                  value: {
                    name: "Frango Grelhado Premium",
                    description:
                      "Peito de frango grelhado premium com tempero especial",
                    categoryId: "550e8400-e29b-41d4-a716-446655440020",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Item de menu atualizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MenuItem",
                },
                examples: {
                  itemAtualizado: {
                    summary: "Item atualizado",
                    value: {
                      id: "880e8400-e29b-41d4-a716-446655440030",
                      name: "Frango Grelhado com Ervas Finas",
                      description:
                        "Peito de frango grelhado temperado com ervas finas e azeite",
                      categoryId: "550e8400-e29b-41d4-a716-446655440020",
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-07T19:30:00.000Z",
                      category: {
                        id: "550e8400-e29b-41d4-a716-446655440020",
                        name: "Proteína",
                        description: "Carnes e proteínas",
                        displayOrder: 1,
                        isActive: true,
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  nomeInvalido: {
                    summary: "Nome muito curto",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "too_small",
                          message: "Name must be at least 1 character",
                          path: ["name"],
                        },
                      ],
                    },
                  },
                  categoryIdInvalido: {
                    summary: "ID de categoria inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["categoryId"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Item de menu não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu item not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["MenuItems"],
        summary: "Excluir item de menu",
        description:
          "Exclui um item de menu do sistema. O item não pode estar associado a cardápios existentes. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do item de menu a ser excluído (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "880e8400-e29b-41d4-a716-446655440030",
          },
        ],
        responses: {
          "204": {
            description: "Item de menu excluído com sucesso (sem conteúdo)",
          },
          "400": {
            description: "ID inválido ou item possui associações",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      $ref: "#/components/schemas/ValidationError",
                    },
                    {
                      $ref: "#/components/schemas/Error",
                    },
                  ],
                },
                examples: {
                  idInvalido: {
                    summary: "ID inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["id"],
                        },
                      ],
                    },
                  },
                  itemComAssociacoes: {
                    summary: "Item possui associações com cardápios",
                    value: {
                      error:
                        "Cannot delete menu item associated with existing menus",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Item de menu não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu item not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    //Week Days
    "/api/lunch-reservation/week-days": {
      get: {
        tags: ["WeekDays"],
        summary: "Listar dias da semana",
        description:
          "Retorna a lista de dias da semana disponíveis no sistema (Segunda a Domingo). Estes são dados somente leitura utilizados para referência na criação de cardápios e reservas.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Lista de dias da semana retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WeekDay",
                  },
                },
                examples: {
                  diasDaSemana: {
                    summary: "Dias da semana (Segunda a Domingo)",
                    value: [
                      {
                        id: "550e8400-e29b-41d4-a716-446655440040",
                        dayName: "Segunda-feira",
                        dayOfWeek: "MONDAY",
                        displayOrder: 1,
                        isActive: true,
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440041",
                        dayName: "Terça-feira",
                        dayOfWeek: "TUESDAY",
                        displayOrder: 2,
                        isActive: true,
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440042",
                        dayName: "Quarta-feira",
                        dayOfWeek: "WEDNESDAY",
                        displayOrder: 3,
                        isActive: true,
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440043",
                        dayName: "Quinta-feira",
                        dayOfWeek: "THURSDAY",
                        displayOrder: 4,
                        isActive: true,
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440044",
                        dayName: "Sexta-feira",
                        dayOfWeek: "FRIDAY",
                        displayOrder: 5,
                        isActive: true,
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440045",
                        dayName: "Sábado",
                        dayOfWeek: "SATURDAY",
                        displayOrder: 6,
                        isActive: true,
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440046",
                        dayName: "Domingo",
                        dayOfWeek: "SUNDAY",
                        displayOrder: 7,
                        isActive: true,
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/week-days/working": {
      get: {
        tags: ["WeekDays"],
        summary: "Listar dias úteis da semana",
        description:
          "Retorna apenas os dias úteis da semana (Segunda a Sexta-feira). Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Lista de dias úteis retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WeekDay",
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    //Menus
    "/api/lunch-reservation/menus": {
      post: {
        tags: ["Menus"],
        summary: "Criar novo cardápio",
        description:
          "Cria um cardápio para uma data específica com composição de itens de menu. O sistema gera automaticamente variações do cardápio (padrão e substituição de ovo) baseadas nas proteínas principais e alternativas definidas. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateMenuInput",
              },
              examples: {
                cardapioCompleto: {
                  summary: "Cardápio completo da semana",
                  value: {
                    date: "2025-11-11T00:00:00.000Z",
                    observations: "Cardápio especial da semana",
                    menuItems: [
                      {
                        menuItemId: "e5784b88-0b64-48f5-bd9f-233a3ca63a05",
                        observations: "Peito de frango grelhado temperado",
                        isMainProtein: true,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "6ca8ca21-0c7e-40d8-b727-bdadc7a67c8a",
                        observations: "Ovo cozido como alternativa",
                        isMainProtein: false,
                        isAlternativeProtein: true,
                      },
                      {
                        menuItemId: "eb7e42a4-17c4-4d8b-9a0a-19eb79135140",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "4aa70b4d-960b-4770-917f-cf0dc753dba8",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "bd0f30c2-dca0-4397-a6a3-9dc6516b0e0f",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "084c07fd-228e-4829-844a-ee9554aa4c99",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                    ],
                  },
                },
                cardapioSimples: {
                  summary: "Cardápio simples",
                  value: {
                    date: "2025-11-11T00:00:00.000Z",
                    menuItems: [
                      {
                        menuItemId: "eb7e42a4-17c4-4d8b-9a0a-19eb79135140",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "3cf76776-25ed-46aa-9264-9479500cb012",
                        isMainProtein: true,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "6ca8ca21-0c7e-40d8-b727-bdadc7a67c8a",
                        isMainProtein: false,
                        isAlternativeProtein: true,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Cardápio criado com sucesso, incluindo variações geradas automaticamente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Menu",
                },
                examples: {
                  cardapioCriado: {
                    summary: "Cardápio criado com variações",
                    value: {
                      id: "550e8400-e29b-41d4-a716-446655440200",
                      date: "2025-11-10",
                      dayOfWeek: "MONDAY",
                      weekNumber: 45,
                      observations: "Cardápio especial da semana",
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-07T18:00:00.000Z",
                      menuCompositions: [
                        {
                          id: "comp-001",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440100",
                          observations: "Peito de frango grelhado temperado",
                          isMainProtein: true,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440100",
                            name: "Frango Grelhado",
                            description: "Peito de frango grelhado",
                            categoryId: "cat-001",
                            isActive: true,
                            category: {
                              id: "cat-001",
                              name: "Proteína",
                              description: "Proteínas principais",
                              displayOrder: 1,
                              isActive: true,
                            },
                          },
                        },
                        {
                          id: "comp-002",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440101",
                          observations: "Ovo cozido como alternativa",
                          isMainProtein: false,
                          isAlternativeProtein: true,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440101",
                            name: "Ovo Cozido",
                            description: "Ovo cozido",
                            categoryId: "cat-001",
                            isActive: true,
                            category: {
                              id: "cat-001",
                              name: "Proteína",
                              description: "Proteínas principais",
                              displayOrder: 1,
                              isActive: true,
                            },
                          },
                        },
                        {
                          id: "comp-003",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440102",
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440102",
                            name: "Arroz Branco",
                            description: "Arroz branco cozido",
                            categoryId: "cat-002",
                            isActive: true,
                            category: {
                              id: "cat-002",
                              name: "Acompanhamento",
                              description: "Acompanhamentos",
                              displayOrder: 2,
                              isActive: true,
                            },
                          },
                        },
                        {
                          id: "comp-004",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440103",
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440103",
                            name: "Feijão Preto",
                            description: "Feijão preto cozido",
                            categoryId: "cat-002",
                            isActive: true,
                            category: {
                              id: "cat-002",
                              name: "Acompanhamento",
                              description: "Acompanhamentos",
                              displayOrder: 2,
                              isActive: true,
                            },
                          },
                        },
                        {
                          id: "comp-005",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440104",
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440104",
                            name: "Salada Verde",
                            description: "Mix de folhas verdes",
                            categoryId: "cat-003",
                            isActive: true,
                            category: {
                              id: "cat-003",
                              name: "Salada",
                              description: "Saladas",
                              displayOrder: 3,
                              isActive: true,
                            },
                          },
                        },
                        {
                          id: "comp-006",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440105",
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440105",
                            name: "Pudim de Leite",
                            description: "Pudim de leite condensado",
                            categoryId: "cat-004",
                            isActive: true,
                            category: {
                              id: "cat-004",
                              name: "Sobremesa",
                              description: "Sobremesas",
                              displayOrder: 4,
                              isActive: true,
                            },
                          },
                        },
                      ],
                      variations: [
                        {
                          id: "var-001",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          variationType: "STANDARD",
                          proteinItemId: "550e8400-e29b-41d4-a716-446655440100",
                          isDefault: true,
                          proteinItem: {
                            id: "550e8400-e29b-41d4-a716-446655440100",
                            name: "Frango Grelhado",
                            description: "Peito de frango grelhado",
                            categoryId: "cat-001",
                            isActive: true,
                          },
                        },
                        {
                          id: "var-002",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          variationType: "EGG_SUBSTITUTE",
                          proteinItemId: "550e8400-e29b-41d4-a716-446655440101",
                          isDefault: false,
                          proteinItem: {
                            id: "550e8400-e29b-41d4-a716-446655440101",
                            name: "Ovo Cozido",
                            description: "Ovo cozido",
                            categoryId: "cat-001",
                            isActive: true,
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  dataInvalida: {
                    summary: "Data inválida",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_date",
                          message: "Invalid date format. Expected YYYY-MM-DD",
                          path: ["date"],
                        },
                      ],
                    },
                  },
                  itensVazios: {
                    summary: "Array de itens vazio",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "too_small",
                          message: "Menu must have at least one item",
                          path: ["menuItems"],
                        },
                      ],
                    },
                  },
                  semProteina: {
                    summary: "Cardápio sem proteína principal",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "custom",
                          message: "Menu must have at least one main protein",
                          path: ["menuItems"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "409": {
            description: "Já existe um cardápio para esta data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu already exists for this date",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Menus"],
        summary: "Listar cardápios",
        description:
          "Retorna uma lista de cardápios com suas composições e variações. Permite filtrar por período de datas ou por número da semana. Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: false,
            description: "Data inicial do filtro (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
            example: "2025-11-10",
          },
          {
            name: "endDate",
            in: "query",
            required: false,
            description: "Data final do filtro (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
            example: "2025-11-16",
          },
          {
            name: "weekNumber",
            in: "query",
            required: false,
            description:
              "Número da semana do ano (1-53) para filtrar cardápios",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 53,
            },
            example: 45,
          },
        ],
        responses: {
          "200": {
            description: "Lista de cardápios retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Menu",
                  },
                },
                examples: {
                  cardapiosSemana: {
                    summary: "Cardápios da semana (filtro por período)",
                    value: [
                      {
                        id: "550e8400-e29b-41d4-a716-446655440200",
                        date: "2025-11-10",
                        dayOfWeek: "MONDAY",
                        weekNumber: 45,
                        observations: "Cardápio especial da semana",
                        isActive: true,
                        createdAt: "2025-11-07T18:00:00.000Z",
                        updatedAt: "2025-11-07T18:00:00.000Z",
                        menuCompositions: [
                          {
                            id: "comp-001",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440100",
                            observations: "Peito de frango grelhado temperado",
                            isMainProtein: true,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440100",
                              name: "Frango Grelhado",
                              description: "Peito de frango grelhado",
                              categoryId: "cat-001",
                              isActive: true,
                              category: {
                                name: "Proteína",
                              },
                            },
                          },
                          {
                            id: "comp-002",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440101",
                            observations: "Ovo cozido como alternativa",
                            isMainProtein: false,
                            isAlternativeProtein: true,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440101",
                              name: "Ovo Cozido",
                              description: "Ovo cozido",
                              categoryId: "cat-001",
                              isActive: true,
                              category: {
                                name: "Proteína",
                              },
                            },
                          },
                          {
                            id: "comp-003",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440102",
                            isMainProtein: false,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440102",
                              name: "Arroz Branco",
                              categoryId: "cat-002",
                              isActive: true,
                              category: {
                                name: "Acompanhamento",
                              },
                            },
                          },
                          {
                            id: "comp-004",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440103",
                            isMainProtein: false,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440103",
                              name: "Feijão Preto",
                              categoryId: "cat-002",
                              isActive: true,
                              category: {
                                name: "Acompanhamento",
                              },
                            },
                          },
                          {
                            id: "comp-005",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440104",
                            isMainProtein: false,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440104",
                              name: "Salada Verde",
                              categoryId: "cat-003",
                              isActive: true,
                              category: {
                                name: "Salada",
                              },
                            },
                          },
                          {
                            id: "comp-006",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440105",
                            isMainProtein: false,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440105",
                              name: "Pudim de Leite",
                              categoryId: "cat-004",
                              isActive: true,
                              category: {
                                name: "Sobremesa",
                              },
                            },
                          },
                        ],
                        variations: [
                          {
                            id: "var-001",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            variationType: "STANDARD",
                            proteinItemId:
                              "550e8400-e29b-41d4-a716-446655440100",
                            isDefault: true,
                            proteinItem: {
                              id: "550e8400-e29b-41d4-a716-446655440100",
                              name: "Frango Grelhado",
                            },
                          },
                          {
                            id: "var-002",
                            menuId: "550e8400-e29b-41d4-a716-446655440200",
                            variationType: "EGG_SUBSTITUTE",
                            proteinItemId:
                              "550e8400-e29b-41d4-a716-446655440101",
                            isDefault: false,
                            proteinItem: {
                              id: "550e8400-e29b-41d4-a716-446655440101",
                              name: "Ovo Cozido",
                            },
                          },
                        ],
                      },
                      {
                        id: "550e8400-e29b-41d4-a716-446655440201",
                        date: "2025-11-11",
                        dayOfWeek: "TUESDAY",
                        weekNumber: 45,
                        observations: null,
                        isActive: true,
                        createdAt: "2025-11-07T18:30:00.000Z",
                        updatedAt: "2025-11-07T18:30:00.000Z",
                        menuCompositions: [
                          {
                            id: "comp-010",
                            menuId: "550e8400-e29b-41d4-a716-446655440201",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440110",
                            isMainProtein: true,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440110",
                              name: "Carne Assada",
                              categoryId: "cat-001",
                              isActive: true,
                              category: {
                                name: "Proteína",
                              },
                            },
                          },
                          {
                            id: "comp-011",
                            menuId: "550e8400-e29b-41d4-a716-446655440201",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440101",
                            isMainProtein: false,
                            isAlternativeProtein: true,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440101",
                              name: "Ovo Cozido",
                              categoryId: "cat-001",
                              isActive: true,
                              category: {
                                name: "Proteína",
                              },
                            },
                          },
                          {
                            id: "comp-012",
                            menuId: "550e8400-e29b-41d4-a716-446655440201",
                            menuItemId: "550e8400-e29b-41d4-a716-446655440102",
                            isMainProtein: false,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "550e8400-e29b-41d4-a716-446655440102",
                              name: "Arroz Branco",
                              categoryId: "cat-002",
                              isActive: true,
                              category: {
                                name: "Acompanhamento",
                              },
                            },
                          },
                        ],
                        variations: [
                          {
                            id: "var-010",
                            menuId: "550e8400-e29b-41d4-a716-446655440201",
                            variationType: "STANDARD",
                            proteinItemId:
                              "550e8400-e29b-41d4-a716-446655440110",
                            isDefault: true,
                            proteinItem: {
                              id: "550e8400-e29b-41d4-a716-446655440110",
                              name: "Carne Assada",
                            },
                          },
                          {
                            id: "var-011",
                            menuId: "550e8400-e29b-41d4-a716-446655440201",
                            variationType: "EGG_SUBSTITUTE",
                            proteinItemId:
                              "550e8400-e29b-41d4-a716-446655440101",
                            isDefault: false,
                            proteinItem: {
                              id: "550e8400-e29b-41d4-a716-446655440101",
                              name: "Ovo Cozido",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  cardapiosPorSemana: {
                    summary: "Cardápios filtrados por número da semana",
                    value: [
                      {
                        id: "550e8400-e29b-41d4-a716-446655440200",
                        date: "2025-11-10",
                        dayOfWeek: "MONDAY",
                        weekNumber: 45,
                        observations: "Cardápio especial da semana",
                        isActive: true,
                        menuCompositions: [
                          {
                            menuItem: {
                              name: "Frango Grelhado",
                              category: {
                                name: "Proteína",
                              },
                            },
                          },
                        ],
                        variations: [
                          {
                            variationType: "STANDARD",
                            proteinItem: {
                              name: "Frango Grelhado",
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/menus/{id}": {
      get: {
        tags: ["Menus"],
        summary: "Consultar cardápio específico",
        description:
          "Retorna os detalhes completos de um cardápio específico, incluindo todas as composições de itens de menu e variações disponíveis. Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do cardápio (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440200",
          },
        ],
        responses: {
          "200": {
            description: "Cardápio encontrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Menu",
                },
                examples: {
                  cardapioCompleto: {
                    summary: "Cardápio completo da semana",
                    value: {
                      id: "550e8400-e29b-41d4-a716-446655440200",
                      date: "2025-11-10",
                      dayOfWeek: "MONDAY",
                      weekNumber: 45,
                      observations: "Cardápio especial da semana",
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-07T18:00:00.000Z",
                      menuCompositions: [
                        {
                          id: "comp-001",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440100",
                          observations: "Peito de frango grelhado temperado",
                          isMainProtein: true,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440100",
                            name: "Frango Grelhado",
                            description: "Peito de frango grelhado",
                            categoryId: "cat-001",
                            isActive: true,
                            createdAt: "2025-10-01T10:00:00.000Z",
                            updatedAt: "2025-10-01T10:00:00.000Z",
                            category: {
                              id: "cat-001",
                              name: "Proteína",
                              description: "Proteínas principais",
                              displayOrder: 1,
                              isActive: true,
                              createdAt: "2025-09-15T08:00:00.000Z",
                              updatedAt: "2025-09-15T08:00:00.000Z",
                            },
                          },
                        },
                        {
                          id: "comp-002",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440101",
                          observations: "Ovo cozido como alternativa",
                          isMainProtein: false,
                          isAlternativeProtein: true,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440101",
                            name: "Ovo Cozido",
                            description: "Ovo cozido",
                            categoryId: "cat-001",
                            isActive: true,
                            createdAt: "2025-10-01T10:05:00.000Z",
                            updatedAt: "2025-10-01T10:05:00.000Z",
                            category: {
                              id: "cat-001",
                              name: "Proteína",
                              description: "Proteínas principais",
                              displayOrder: 1,
                              isActive: true,
                              createdAt: "2025-09-15T08:00:00.000Z",
                              updatedAt: "2025-09-15T08:00:00.000Z",
                            },
                          },
                        },
                        {
                          id: "comp-003",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440102",
                          observations: null,
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440102",
                            name: "Arroz Branco",
                            description: "Arroz branco cozido",
                            categoryId: "cat-002",
                            isActive: true,
                            createdAt: "2025-10-01T10:10:00.000Z",
                            updatedAt: "2025-10-01T10:10:00.000Z",
                            category: {
                              id: "cat-002",
                              name: "Acompanhamento",
                              description: "Acompanhamentos",
                              displayOrder: 2,
                              isActive: true,
                              createdAt: "2025-09-15T08:05:00.000Z",
                              updatedAt: "2025-09-15T08:05:00.000Z",
                            },
                          },
                        },
                        {
                          id: "comp-004",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440103",
                          observations: null,
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440103",
                            name: "Feijão Preto",
                            description: "Feijão preto cozido",
                            categoryId: "cat-002",
                            isActive: true,
                            createdAt: "2025-10-01T10:15:00.000Z",
                            updatedAt: "2025-10-01T10:15:00.000Z",
                            category: {
                              id: "cat-002",
                              name: "Acompanhamento",
                              description: "Acompanhamentos",
                              displayOrder: 2,
                              isActive: true,
                              createdAt: "2025-09-15T08:05:00.000Z",
                              updatedAt: "2025-09-15T08:05:00.000Z",
                            },
                          },
                        },
                        {
                          id: "comp-005",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440104",
                          observations: null,
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440104",
                            name: "Salada Verde",
                            description: "Mix de folhas verdes",
                            categoryId: "cat-003",
                            isActive: true,
                            createdAt: "2025-10-01T10:20:00.000Z",
                            updatedAt: "2025-10-01T10:20:00.000Z",
                            category: {
                              id: "cat-003",
                              name: "Salada",
                              description: "Saladas",
                              displayOrder: 3,
                              isActive: true,
                              createdAt: "2025-09-15T08:10:00.000Z",
                              updatedAt: "2025-09-15T08:10:00.000Z",
                            },
                          },
                        },
                        {
                          id: "comp-006",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440105",
                          observations: null,
                          isMainProtein: false,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440105",
                            name: "Pudim de Leite",
                            description: "Pudim de leite condensado",
                            categoryId: "cat-004",
                            isActive: true,
                            createdAt: "2025-10-01T10:25:00.000Z",
                            updatedAt: "2025-10-01T10:25:00.000Z",
                            category: {
                              id: "cat-004",
                              name: "Sobremesa",
                              description: "Sobremesas",
                              displayOrder: 4,
                              isActive: true,
                              createdAt: "2025-09-15T08:15:00.000Z",
                              updatedAt: "2025-09-15T08:15:00.000Z",
                            },
                          },
                        },
                      ],
                      variations: [
                        {
                          id: "var-001",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          variationType: "STANDARD",
                          proteinItemId: "550e8400-e29b-41d4-a716-446655440100",
                          isDefault: true,
                          proteinItem: {
                            id: "550e8400-e29b-41d4-a716-446655440100",
                            name: "Frango Grelhado",
                            description: "Peito de frango grelhado",
                            categoryId: "cat-001",
                            isActive: true,
                            createdAt: "2025-10-01T10:00:00.000Z",
                            updatedAt: "2025-10-01T10:00:00.000Z",
                          },
                        },
                        {
                          id: "var-002",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          variationType: "EGG_SUBSTITUTE",
                          proteinItemId: "550e8400-e29b-41d4-a716-446655440101",
                          isDefault: false,
                          proteinItem: {
                            id: "550e8400-e29b-41d4-a716-446655440101",
                            name: "Ovo Cozido",
                            description: "Ovo cozido",
                            categoryId: "cat-001",
                            isActive: true,
                            createdAt: "2025-10-01T10:05:00.000Z",
                            updatedAt: "2025-10-01T10:05:00.000Z",
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "404": {
            description: "Cardápio não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Menus"],
        summary: "Atualizar cardápio",
        description:
          "Atualiza os dados de um cardápio existente, incluindo observações e composição de itens. Permite modificar a lista de itens do cardápio e suas propriedades. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do cardápio (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440200",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateMenuInput",
              },
              examples: {
                atualizarObservacoes: {
                  summary: "Atualizar apenas observações",
                  value: {
                    observations: "Cardápio atualizado com novos itens",
                  },
                },
                atualizarItens: {
                  summary: "Atualizar composição do cardápio",
                  value: {
                    observations: "Cardápio modificado",
                    menuItems: [
                      {
                        menuItemId: "550e8400-e29b-41d4-a716-446655440120",
                        observations: "Peixe grelhado ao limão",
                        isMainProtein: true,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "550e8400-e29b-41d4-a716-446655440101",
                        observations: "Ovo cozido como alternativa",
                        isMainProtein: false,
                        isAlternativeProtein: true,
                      },
                      {
                        menuItemId: "550e8400-e29b-41d4-a716-446655440102",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                      {
                        menuItemId: "550e8400-e29b-41d4-a716-446655440103",
                        isMainProtein: false,
                        isAlternativeProtein: false,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cardápio atualizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Menu",
                },
                examples: {
                  cardapioAtualizado: {
                    summary: "Cardápio com itens atualizados",
                    value: {
                      id: "550e8400-e29b-41d4-a716-446655440200",
                      date: "2025-11-10",
                      dayOfWeek: "MONDAY",
                      weekNumber: 45,
                      observations: "Cardápio modificado",
                      isActive: true,
                      createdAt: "2025-11-07T18:00:00.000Z",
                      updatedAt: "2025-11-08T10:30:00.000Z",
                      menuCompositions: [
                        {
                          id: "comp-020",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440120",
                          observations: "Peixe grelhado ao limão",
                          isMainProtein: true,
                          isAlternativeProtein: false,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440120",
                            name: "Peixe Grelhado",
                            description: "Filé de peixe grelhado",
                            categoryId: "cat-001",
                            isActive: true,
                            category: {
                              name: "Proteína",
                            },
                          },
                        },
                        {
                          id: "comp-021",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          menuItemId: "550e8400-e29b-41d4-a716-446655440101",
                          observations: "Ovo cozido como alternativa",
                          isMainProtein: false,
                          isAlternativeProtein: true,
                          menuItem: {
                            id: "550e8400-e29b-41d4-a716-446655440101",
                            name: "Ovo Cozido",
                            categoryId: "cat-001",
                            isActive: true,
                            category: {
                              name: "Proteína",
                            },
                          },
                        },
                      ],
                      variations: [
                        {
                          id: "var-020",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          variationType: "STANDARD",
                          proteinItemId: "550e8400-e29b-41d4-a716-446655440120",
                          isDefault: true,
                          proteinItem: {
                            name: "Peixe Grelhado",
                          },
                        },
                        {
                          id: "var-021",
                          menuId: "550e8400-e29b-41d4-a716-446655440200",
                          variationType: "EGG_SUBSTITUTE",
                          proteinItemId: "550e8400-e29b-41d4-a716-446655440101",
                          isDefault: false,
                          proteinItem: {
                            name: "Ovo Cozido",
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  idInvalido: {
                    summary: "ID inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["id"],
                        },
                      ],
                    },
                  },
                  semProteina: {
                    summary: "Cardápio sem proteína principal",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "custom",
                          message: "Menu must have at least one main protein",
                          path: ["menuItems"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Cardápio não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Menus"],
        summary: "Excluir cardápio",
        description:
          "Exclui um cardápio existente do sistema. Esta operação também remove todas as composições e variações associadas ao cardápio. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do cardápio a ser excluído (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "550e8400-e29b-41d4-a716-446655440200",
          },
        ],
        responses: {
          "204": {
            description:
              "Cardápio excluído com sucesso (sem conteúdo na resposta)",
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error: "Access denied. Admin privileges required",
                },
              },
            },
          },
          "404": {
            description: "Cardápio não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/menus/date/{date}": {
      get: {
        tags: ["Menus"],
        summary: "Consultar cardápio por data",
        description:
          "Retorna o cardápio de uma data específica. Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "date",
            in: "path",
            required: true,
            description: "Data do cardápio (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
            example: "2025-11-10",
          },
        ],
        responses: {
          "200": {
            description: "Cardápio encontrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Menu",
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "404": {
            description: "Cardápio não encontrado para esta data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Menu not found for this date",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/menus/week/{weekNumber}": {
      get: {
        tags: ["Menus"],
        summary: "Consultar cardápios por semana",
        description:
          "Retorna todos os cardápios de uma semana específica do ano. Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "weekNumber",
            in: "path",
            required: true,
            description: "Número da semana do ano (1-53)",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 53,
            },
            example: 45,
          },
        ],
        responses: {
          "200": {
            description: "Cardápios da semana retornados com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Menu",
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    //Reservations
    "/api/lunch-reservation/reservations": {
      post: {
        tags: ["Reservations"],
        summary: "Criar nova reserva",
        description:
          "Cria uma reserva de almoço para o usuário autenticado. Não é permitido criar reservas para datas passadas. O usuário deve escolher um cardápio (menu) e uma variação específica (padrão ou ovo).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateReservationInput",
              },
              examples: {
                reservaPadrao: {
                  summary: "Reserva com variação padrão",
                  value: {
                    menuId: "50b514cb-3da3-408a-8aaf-606031f23214",
                    menuVariationId: "50b514cb-3da3-408a-8aaf-606031f23214",
                    reservationDate: "2025-11-12T00:00:00.000Z",
                  },
                },
                reservaOvo: {
                  summary: "Reserva com variação ovo",
                  value: {
                    menuId: "d9041a20-d97d-49ec-b328-b056112be40f",
                    menuVariationId: "c12c058b-aa73-43a5-867c-f3bf6152b070",
                    reservationDate: "2025-11-14T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Reserva criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Reservation",
                },
                examples: {
                  reservaCriada: {
                    summary: "Reserva criada",
                    value: {
                      id: "res-550e8400-e29b-41d4-a716-446655440000",
                      userId: "user-550e8400-e29b-41d4-a716-446655440000",
                      menuId: "550e8400-e29b-41d4-a716-446655440000",
                      menuVariationId: "var-1",
                      reservationDate: "2025-11-10",
                      status: "ACTIVE",
                      isAutoGenerated: false,
                      createdAt: "2025-11-07T18:30:00.000Z",
                      updatedAt: "2025-11-07T18:30:00.000Z",
                      menu: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        date: "2025-11-10",
                        dayOfWeek: "MONDAY",
                        weekNumber: 45,
                      },
                      menuVariation: {
                        id: "var-1",
                        variationType: "STANDARD",
                        proteinItem: {
                          id: "item-1",
                          name: "Frango Grelhado",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Dados de entrada inválidos ou data passada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                examples: {
                  dataPassada: {
                    summary: "Data passada não permitida",
                    value: {
                      error: "Cannot create reservation for past dates",
                    },
                  },
                  menuIdInvalido: {
                    summary: "ID do menu inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["menuId"],
                        },
                      ],
                    },
                  },
                  dataAusente: {
                    summary: "Data de reserva ausente",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_type",
                          message: "Reservation date is required",
                          path: ["reservationDate"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "409": {
            description: "Usuário já possui reserva para esta data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "User already has a reservation for this date",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Reservations"],
        summary: "Listar reservas do usuário",
        description:
          "Retorna todas as reservas do usuário autenticado. Permite filtrar por status (ACTIVE, CANCELLED) e período de datas.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            description: "Filtrar por status da reserva",
            schema: {
              type: "string",
              enum: ["ACTIVE", "CANCELLED"],
            },
            example: "ACTIVE",
          },
          {
            name: "startDate",
            in: "query",
            required: false,
            description: "Data inicial do filtro (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
            example: "2025-11-01",
          },
          {
            name: "endDate",
            in: "query",
            required: false,
            description: "Data final do filtro (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
            example: "2025-11-30",
          },
        ],
        responses: {
          "200": {
            description: "Lista de reservas retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Reservation",
                  },
                },
                examples: {
                  listaReservas: {
                    summary: "Lista com múltiplas reservas do usuário",
                    value: [
                      {
                        id: "res-550e8400-e29b-41d4-a716-446655440000",
                        userId: "user-550e8400-e29b-41d4-a716-446655440000",
                        menuId: "menu-550e8400-e29b-41d4-a716-446655440000",
                        menuVariationId: "var-1",
                        reservationDate: "2025-11-10",
                        status: "ACTIVE",
                        isAutoGenerated: false,
                        createdAt: "2025-11-07T18:30:00.000Z",
                        updatedAt: "2025-11-07T18:30:00.000Z",
                        menu: {
                          id: "menu-550e8400-e29b-41d4-a716-446655440000",
                          date: "2025-11-10",
                          dayOfWeek: "MONDAY",
                        },
                        menuVariation: {
                          id: "var-1",
                          variationType: "STANDARD",
                          proteinItem: {
                            name: "Frango Grelhado",
                          },
                        },
                      },
                      {
                        id: "res-660e8400-e29b-41d4-a716-446655440001",
                        userId: "user-550e8400-e29b-41d4-a716-446655440000",
                        menuId: "menu-660e8400-e29b-41d4-a716-446655440001",
                        menuVariationId: "var-3",
                        reservationDate: "2025-11-11",
                        status: "ACTIVE",
                        isAutoGenerated: true,
                        createdAt: "2025-11-04T08:00:00.000Z",
                        updatedAt: "2025-11-04T08:00:00.000Z",
                        menu: {
                          id: "menu-660e8400-e29b-41d4-a716-446655440001",
                          date: "2025-11-11",
                          dayOfWeek: "TUESDAY",
                        },
                        menuVariation: {
                          id: "var-3",
                          variationType: "STANDARD",
                          proteinItem: {
                            name: "Peixe Assado",
                          },
                        },
                      },
                      {
                        id: "res-770e8400-e29b-41d4-a716-446655440002",
                        userId: "user-550e8400-e29b-41d4-a716-446655440000",
                        menuId: "menu-770e8400-e29b-41d4-a716-446655440002",
                        menuVariationId: "var-5",
                        reservationDate: "2025-11-08",
                        status: "CANCELLED",
                        isAutoGenerated: false,
                        createdAt: "2025-11-05T14:20:00.000Z",
                        updatedAt: "2025-11-06T07:45:00.000Z",
                        menu: {
                          id: "menu-770e8400-e29b-41d4-a716-446655440002",
                          date: "2025-11-08",
                          dayOfWeek: "FRIDAY",
                        },
                        menuVariation: {
                          id: "var-5",
                          variationType: "EGG_SUBSTITUTE",
                          proteinItem: {
                            name: "Ovo Cozido",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/reservations/{id}": {
      get: {
        tags: ["Reservations"],
        summary: "Consultar reserva específica",
        description:
          "Retorna os dados completos de uma reserva específica pelo ID. O usuário só pode consultar suas próprias reservas.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único da reserva (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "res-550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        responses: {
          "200": {
            description: "Reserva encontrada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Reservation",
                },
                examples: {
                  reservaCompleta: {
                    summary: "Reserva com menu e variação completos",
                    value: {
                      id: "res-550e8400-e29b-41d4-a716-446655440000",
                      userId: "user-550e8400-e29b-41d4-a716-446655440000",
                      menuId: "menu-550e8400-e29b-41d4-a716-446655440000",
                      menuVariationId: "var-1",
                      reservationDate: "2025-11-10",
                      status: "ACTIVE",
                      isAutoGenerated: false,
                      createdAt: "2025-11-07T18:30:00.000Z",
                      updatedAt: "2025-11-07T18:30:00.000Z",
                      menu: {
                        id: "menu-550e8400-e29b-41d4-a716-446655440000",
                        date: "2025-11-10",
                        dayOfWeek: "MONDAY",
                        weekNumber: 45,
                        observations: "Cardápio especial da semana",
                        isActive: true,
                        menuCompositions: [
                          {
                            id: "comp-1",
                            menuItemId: "item-1",
                            isMainProtein: true,
                            isAlternativeProtein: false,
                            menuItem: {
                              id: "item-1",
                              name: "Frango Grelhado",
                              description: "Peito de frango grelhado temperado",
                              category: {
                                name: "Proteína",
                              },
                            },
                          },
                          {
                            id: "comp-3",
                            menuItemId: "item-3",
                            menuItem: {
                              id: "item-3",
                              name: "Arroz Branco",
                              category: {
                                name: "Acompanhamento",
                              },
                            },
                          },
                          {
                            id: "comp-4",
                            menuItemId: "item-4",
                            menuItem: {
                              id: "item-4",
                              name: "Feijão Preto",
                              category: {
                                name: "Acompanhamento",
                              },
                            },
                          },
                          {
                            id: "comp-5",
                            menuItemId: "item-5",
                            menuItem: {
                              id: "item-5",
                              name: "Salada Verde",
                              category: {
                                name: "Salada",
                              },
                            },
                          },
                          {
                            id: "comp-6",
                            menuItemId: "item-6",
                            menuItem: {
                              id: "item-6",
                              name: "Pudim de Leite",
                              category: {
                                name: "Sobremesa",
                              },
                            },
                          },
                        ],
                      },
                      menuVariation: {
                        id: "var-1",
                        variationType: "STANDARD",
                        proteinItemId: "item-1",
                        isDefault: true,
                        proteinItem: {
                          id: "item-1",
                          name: "Frango Grelhado",
                          description: "Peito de frango grelhado temperado",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "ID inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
                example: {
                  error: "Validation error",
                  details: [
                    {
                      code: "invalid_string",
                      message: "Invalid UUID format",
                      path: ["id"],
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão para acessar esta reserva",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error:
                    "Access denied. You can only view your own reservations",
                },
              },
            },
          },
          "404": {
            description: "Reserva não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Reservation not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Reservations"],
        summary: "Alterar reserva",
        description:
          "Permite alterar a variação do cardápio de uma reserva existente. Alterações só são permitidas até às 8:30 AM do dia da refeição. Após esse horário, a operação será rejeitada.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único da reserva (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "res-550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateReservationInput",
              },
              examples: {
                alterarVariacao: {
                  summary: "Alterar para variação ovo",
                  value: {
                    menuVariationId: "var-2",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Reserva atualizada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Reservation",
                },
                examples: {
                  reservaAtualizada: {
                    summary: "Reserva com variação alterada",
                    value: {
                      id: "res-550e8400-e29b-41d4-a716-446655440000",
                      userId: "user-550e8400-e29b-41d4-a716-446655440000",
                      menuId: "menu-550e8400-e29b-41d4-a716-446655440000",
                      menuVariationId: "var-2",
                      reservationDate: "2025-11-10",
                      status: "ACTIVE",
                      isAutoGenerated: false,
                      createdAt: "2025-11-07T18:30:00.000Z",
                      updatedAt: "2025-11-08T07:15:00.000Z",
                      menu: {
                        id: "menu-550e8400-e29b-41d4-a716-446655440000",
                        date: "2025-11-10",
                        dayOfWeek: "MONDAY",
                      },
                      menuVariation: {
                        id: "var-2",
                        variationType: "EGG_SUBSTITUTE",
                        proteinItem: {
                          name: "Ovo Cozido",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Dados de entrada inválidos ou horário limite ultrapassado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  horarioLimite: {
                    summary: "Horário limite ultrapassado (após 8:30 AM)",
                    value: {
                      error:
                        "Modifications are not allowed after 8:30 AM on the reservation date",
                    },
                  },
                  variacaoInvalida: {
                    summary: "ID da variação inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["menuVariationId"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão para alterar esta reserva",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error:
                    "Access denied. You can only modify your own reservations",
                },
              },
            },
          },
          "404": {
            description: "Reserva não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Reservation not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Reservations"],
        summary: "Cancelar reserva",
        description:
          "Cancela uma reserva existente alterando seu status para CANCELLED. Cancelamentos só são permitidos até às 8:30 AM do dia da refeição. Após esse horário, a operação será rejeitada.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único da reserva a ser cancelada (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
            example: "res-550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        responses: {
          "204": {
            description: "Reserva cancelada com sucesso (sem conteúdo)",
          },
          "400": {
            description: "ID inválido ou horário limite ultrapassado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  horarioLimite: {
                    summary: "Horário limite ultrapassado (após 8:30 AM)",
                    value: {
                      error:
                        "Cancellations are not allowed after 8:30 AM on the reservation date",
                    },
                  },
                  idInvalido: {
                    summary: "ID inválido",
                    value: {
                      error: "Validation error",
                      details: [
                        {
                          code: "invalid_string",
                          message: "Invalid UUID format",
                          path: ["id"],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
                example: {
                  error: "Authentication token is required",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão para cancelar esta reserva",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
                example: {
                  error:
                    "Access denied. You can only cancel your own reservations",
                },
              },
            },
          },
          "404": {
            description: "Reserva não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Reservation not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/reservations/active": {
      get: {
        tags: ["Reservations"],
        summary: "Listar reservas ativas do usuário",
        description:
          "Retorna apenas as reservas ativas (não canceladas) do usuário autenticado.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Lista de reservas ativas retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Reservation",
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/lunch-reservation/admin/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "Listar todas as reservas (ADMIN)",
        description:
          "Retorna todas as reservas do sistema. Permite filtrar por data. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: false,
            description: "Data inicial do filtro (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "endDate",
            in: "query",
            required: false,
            description: "Data final do filtro (formato: YYYY-MM-DD)",
            schema: {
              type: "string",
              format: "date",
            },
          },
        ],
        responses: {
          "200": {
            description: "Lista de todas as reservas retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Reservation",
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    //Devices
    "/api/devices": {
      post: {
        tags: ["Devices"],
        summary: "Criar novo dispositivo",
        description:
          "Registra um novo dispositivo no sistema. Requer privilégios de administrador (ADMIN).",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Nome do dispositivo",
                    example: "Tablet Recepção",
                  },
                  location: {
                    type: "string",
                    description: "Localização do dispositivo",
                    example: "Recepção Principal",
                  },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Dispositivo criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },
                    name: {
                      type: "string",
                    },
                    location: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: ["ACTIVE", "INACTIVE"],
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "403": {
            description: "Usuário não tem permissão de administrador",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthorizationError",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Devices"],
        summary: "Listar todos os dispositivos",
        description:
          "Retorna uma lista com todos os dispositivos cadastrados no sistema. Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Lista de dispositivos retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                      },
                      name: {
                        type: "string",
                      },
                      location: {
                        type: "string",
                      },
                      status: {
                        type: "string",
                        enum: ["ACTIVE", "INACTIVE"],
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/devices/{id}/status": {
      patch: {
        tags: ["Devices"],
        summary: "Alternar status do dispositivo",
        description:
          "Alterna o status do dispositivo entre ACTIVE e INACTIVE. Acessível por usuários autenticados.",
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID único do dispositivo (UUID)",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          "200": {
            description: "Status do dispositivo alternado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                    },
                    name: {
                      type: "string",
                    },
                    location: {
                      type: "string",
                    },
                    status: {
                      type: "string",
                      enum: ["ACTIVE", "INACTIVE"],
                    },
                    updatedAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Token ausente ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthenticationError",
                },
              },
            },
          },
          "404": {
            description: "Dispositivo não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Device not found",
                },
              },
            },
          },
          "500": {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT obtido através do endpoint de login",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do usuário",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          cpf: {
            type: "string",
            pattern: "^\\d{11}$",
            description: "CPF do usuário sem formatação (11 dígitos)",
            example: "12345678901",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome completo do usuário",
            example: "João Silva",
          },
          role: {
            type: "string",
            enum: ["ADMIN", "USER"],
            description: "Papel do usuário no sistema",
            example: "USER",
          },
          userType: {
            type: "string",
            enum: ["FIXO", "NAO_FIXO"],
            description: "Tipo de usuário (fixo ou não fixo)",
            example: "FIXO",
          },
          status: {
            type: "string",
            enum: ["ATIVO", "INATIVO"],
            description: "Status atual do usuário",
            example: "ATIVO",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do registro",
            example: "2025-10-21T10:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
            example: "2025-10-21T10:30:00.000Z",
          },
        },
        required: [
          "id",
          "cpf",
          "name",
          "role",
          "userType",
          "status",
          "createdAt",
          "updatedAt",
        ],
      },
      Category: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único da categoria",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            description: "Nome da categoria",
            example: "Proteína",
          },
          description: {
            type: "string",
            description: "Descrição detalhada da categoria",
            example: "Alimentos ricos em proteínas",
          },
          displayOrder: {
            type: "integer",
            minimum: 0,
            description: "Ordem de exibição da categoria",
            example: 1,
          },
          isActive: {
            type: "boolean",
            description: "Indica se a categoria está ativa",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do registro",
            example: "2025-10-21T10:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
            example: "2025-10-21T10:30:00.000Z",
          },
        },
        required: [
          "id",
          "name",
          "description",
          "displayOrder",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
      },
      MenuItem: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do item de menu",
            example: "550e8400-e29b-41d4-a716-446655440002",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome do item de menu",
            example: "Frango Grelhado",
          },
          description: {
            type: "string",
            description: "Descrição detalhada do item",
            example: "Peito de frango grelhado temperado com ervas",
          },
          categoryId: {
            type: "string",
            format: "uuid",
            description: "ID da categoria à qual o item pertence",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
          isActive: {
            type: "boolean",
            description: "Indica se o item está ativo",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do registro",
            example: "2025-10-21T10:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
            example: "2025-10-21T10:30:00.000Z",
          },
          category: {
            $ref: "#/components/schemas/Category",
            description: "Categoria do item de menu",
          },
        },
        required: [
          "id",
          "name",
          "description",
          "categoryId",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
      },
      WeekDay: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do dia da semana",
            example: "550e8400-e29b-41d4-a716-446655440003",
          },
          dayName: {
            type: "string",
            description: "Nome do dia da semana em português",
            example: "Segunda-feira",
          },
          dayOfWeek: {
            type: "string",
            enum: [
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ],
            description: "Dia da semana em inglês",
            example: "MONDAY",
          },
          displayOrder: {
            type: "integer",
            minimum: 1,
            maximum: 7,
            description: "Ordem de exibição (1-7)",
            example: 1,
          },
          isActive: {
            type: "boolean",
            description: "Indica se o dia está ativo",
            example: true,
          },
        },
        required: ["id", "dayName", "dayOfWeek", "displayOrder", "isActive"],
      },
      MenuComposition: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único da composição do menu",
            example: "550e8400-e29b-41d4-a716-446655440004",
          },
          menuId: {
            type: "string",
            format: "uuid",
            description: "ID do menu ao qual a composição pertence",
            example: "550e8400-e29b-41d4-a716-446655440005",
          },
          menuItemId: {
            type: "string",
            format: "uuid",
            description: "ID do item de menu incluído na composição",
            example: "550e8400-e29b-41d4-a716-446655440002",
          },
          observations: {
            type: "string",
            description: "Observações sobre o item na composição",
            example: "Sem pimenta",
          },
          isMainProtein: {
            type: "boolean",
            description: "Indica se é a proteína principal",
            example: true,
          },
          isAlternativeProtein: {
            type: "boolean",
            description: "Indica se é uma proteína alternativa",
            example: false,
          },
          menuItem: {
            $ref: "#/components/schemas/MenuItem",
            description: "Item de menu da composição",
          },
        },
        required: [
          "id",
          "menuId",
          "menuItemId",
          "isMainProtein",
          "isAlternativeProtein",
        ],
      },
      MenuVariation: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único da variação do menu",
            example: "550e8400-e29b-41d4-a716-446655440006",
          },
          menuId: {
            type: "string",
            format: "uuid",
            description: "ID do menu ao qual a variação pertence",
            example: "550e8400-e29b-41d4-a716-446655440005",
          },
          variationType: {
            type: "string",
            enum: ["STANDARD", "EGG_SUBSTITUTE"],
            description: "Tipo de variação (padrão ou substituto com ovo)",
            example: "STANDARD",
          },
          proteinItemId: {
            type: "string",
            format: "uuid",
            description: "ID do item de proteína da variação",
            example: "550e8400-e29b-41d4-a716-446655440002",
          },
          isDefault: {
            type: "boolean",
            description: "Indica se é a variação padrão",
            example: true,
          },
          proteinItem: {
            $ref: "#/components/schemas/MenuItem",
            description: "Item de proteína da variação",
          },
        },
        required: [
          "id",
          "menuId",
          "variationType",
          "proteinItemId",
          "isDefault",
        ],
      },
      Menu: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do menu",
            example: "550e8400-e29b-41d4-a716-446655440005",
          },
          date: {
            type: "string",
            format: "date",
            description: "Data do cardápio",
            example: "2025-11-10",
          },
          dayOfWeek: {
            type: "string",
            enum: [
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ],
            description: "Dia da semana do cardápio",
            example: "MONDAY",
          },
          weekNumber: {
            type: "integer",
            minimum: 1,
            maximum: 53,
            description: "Número da semana do ano (1-53)",
            example: 45,
          },
          observations: {
            type: "string",
            description: "Observações sobre o cardápio",
            example: "Cardápio especial da semana",
          },
          isActive: {
            type: "boolean",
            description: "Indica se o cardápio está ativo",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do registro",
            example: "2025-10-21T10:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
            example: "2025-10-21T10:30:00.000Z",
          },
          menuCompositions: {
            type: "array",
            description: "Composições do cardápio",
            items: {
              $ref: "#/components/schemas/MenuComposition",
            },
          },
          variations: {
            type: "array",
            description: "Variações do cardápio",
            items: {
              $ref: "#/components/schemas/MenuVariation",
            },
          },
        },
        required: [
          "id",
          "date",
          "dayOfWeek",
          "weekNumber",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
      },
      Reservation: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único da reserva",
            example: "550e8400-e29b-41d4-a716-446655440007",
          },
          userId: {
            type: "string",
            format: "uuid",
            description: "ID do usuário que fez a reserva",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          menuId: {
            type: "string",
            format: "uuid",
            description: "ID do cardápio reservado",
            example: "550e8400-e29b-41d4-a716-446655440005",
          },
          menuVariationId: {
            type: "string",
            format: "uuid",
            description: "ID da variação do cardápio escolhida",
            example: "550e8400-e29b-41d4-a716-446655440006",
          },
          reservationDate: {
            type: "string",
            format: "date",
            description: "Data da reserva",
            example: "2025-11-10",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "CANCELLED"],
            description: "Status da reserva",
            example: "ACTIVE",
          },
          isAutoGenerated: {
            type: "boolean",
            description: "Indica se a reserva foi gerada automaticamente",
            example: false,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação do registro",
            example: "2025-11-07T14:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
            example: "2025-11-07T14:30:00.000Z",
          },
          menu: {
            $ref: "#/components/schemas/Menu",
            description: "Cardápio da reserva",
          },
          menuVariation: {
            $ref: "#/components/schemas/MenuVariation",
            description: "Variação do cardápio escolhida",
          },
        },
        required: [
          "id",
          "userId",
          "menuId",
          "menuVariationId",
          "reservationDate",
          "status",
          "isAutoGenerated",
          "createdAt",
          "updatedAt",
        ],
      },
      LoginInput: {
        type: "object",
        properties: {
          cpf: {
            type: "string",
            pattern: "^\\d{11}$",
            description: "CPF sem formatação (11 dígitos)",
            example: "12345678901",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "Senha do usuário (mínimo 6 caracteres)",
            example: "senha123",
          },
        },
        required: ["cpf", "password"],
      },
      CreateUserInput: {
        type: "object",
        properties: {
          cpf: {
            type: "string",
            pattern: "^\\d{11}$",
            description: "CPF sem formatação (11 dígitos)",
            example: "12345678901",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "Senha do usuário (mínimo 6 caracteres)",
            example: "senha123",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome completo do usuário",
            example: "João Silva",
          },
          role: {
            type: "string",
            enum: ["ADMIN", "USER"],
            description: "Papel do usuário no sistema",
            default: "USER",
            example: "USER",
          },
          userType: {
            type: "string",
            enum: ["FIXO", "NAO_FIXO"],
            description: "Tipo de usuário (fixo ou não fixo)",
            default: "NAO_FIXO",
            example: "NAO_FIXO",
          },
          status: {
            type: "string",
            enum: ["ATIVO", "INATIVO"],
            description: "Status inicial do usuário",
            default: "ATIVO",
            example: "ATIVO",
          },
        },
        required: ["cpf", "password", "name"],
      },
      UpdateUserInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome completo do usuário",
            example: "João Silva Santos",
          },
          role: {
            type: "string",
            enum: ["ADMIN", "USER"],
            description: "Papel do usuário no sistema",
            example: "ADMIN",
          },
          userType: {
            type: "string",
            enum: ["FIXO", "NAO_FIXO"],
            description: "Tipo de usuário (fixo ou não fixo)",
            example: "FIXO",
          },
          status: {
            type: "string",
            enum: ["ATIVO", "INATIVO"],
            description: "Status do usuário",
            example: "ATIVO",
          },
        },
      },
      CreateCategoryInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            description: "Nome da categoria",
            example: "Proteína",
          },
          description: {
            type: "string",
            description: "Descrição detalhada da categoria",
            example: "Alimentos ricos em proteínas",
          },
          displayOrder: {
            type: "integer",
            minimum: 0,
            description: "Ordem de exibição da categoria",
            example: 1,
          },
        },
        required: ["name", "description", "displayOrder"],
      },
      UpdateCategoryInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            description: "Nome da categoria",
            example: "Proteína Animal",
          },
          description: {
            type: "string",
            description: "Descrição detalhada da categoria",
            example: "Alimentos ricos em proteínas de origem animal",
          },
          displayOrder: {
            type: "integer",
            minimum: 0,
            description: "Ordem de exibição da categoria",
            example: 2,
          },
        },
      },
      CreateMenuItemInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome do item de menu",
            example: "Frango Grelhado",
          },
          description: {
            type: "string",
            description: "Descrição detalhada do item",
            example: "Peito de frango grelhado temperado com ervas",
          },
          categoryId: {
            type: "string",
            format: "uuid",
            description: "ID da categoria à qual o item pertence",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
        },
        required: ["name", "description", "categoryId"],
      },
      UpdateMenuItemInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome do item de menu",
            example: "Frango Grelhado com Alecrim",
          },
          description: {
            type: "string",
            description: "Descrição detalhada do item",
            example: "Peito de frango grelhado temperado com alecrim e limão",
          },
          categoryId: {
            type: "string",
            format: "uuid",
            description: "ID da categoria à qual o item pertence",
            example: "550e8400-e29b-41d4-a716-446655440001",
          },
        },
      },
      CreateMenuInput: {
        type: "object",
        properties: {
          date: {
            type: "string",
            format: "date",
            description: "Data do cardápio",
            example: "2025-11-10",
          },
          observations: {
            type: "string",
            description: "Observações sobre o cardápio",
            example: "Cardápio especial da semana",
          },
          menuItems: {
            type: "array",
            description: "Lista de itens que compõem o cardápio",
            items: {
              type: "object",
              properties: {
                menuItemId: {
                  type: "string",
                  format: "uuid",
                  description: "ID do item de menu",
                  example: "550e8400-e29b-41d4-a716-446655440002",
                },
                observations: {
                  type: "string",
                  description: "Observações sobre o item na composição",
                  example: "Sem pimenta",
                },
                isMainProtein: {
                  type: "boolean",
                  description: "Indica se é a proteína principal",
                  default: false,
                  example: true,
                },
                isAlternativeProtein: {
                  type: "boolean",
                  description: "Indica se é uma proteína alternativa",
                  default: false,
                  example: false,
                },
              },
              required: ["menuItemId"],
            },
            example: [
              {
                menuItemId: "550e8400-e29b-41d4-a716-446655440002",
                isMainProtein: true,
                isAlternativeProtein: false,
              },
              {
                menuItemId: "550e8400-e29b-41d4-a716-446655440008",
                isMainProtein: false,
                isAlternativeProtein: true,
              },
              {
                menuItemId: "550e8400-e29b-41d4-a716-446655440009",
                isMainProtein: false,
                isAlternativeProtein: false,
              },
            ],
          },
        },
        required: ["date", "menuItems"],
      },
      UpdateMenuInput: {
        type: "object",
        properties: {
          date: {
            type: "string",
            format: "date",
            description: "Data do cardápio",
            example: "2025-11-11",
          },
          observations: {
            type: "string",
            description: "Observações sobre o cardápio",
            example: "Cardápio atualizado",
          },
          menuItems: {
            type: "array",
            description: "Lista de itens que compõem o cardápio",
            items: {
              type: "object",
              properties: {
                menuItemId: {
                  type: "string",
                  format: "uuid",
                  description: "ID do item de menu",
                  example: "550e8400-e29b-41d4-a716-446655440002",
                },
                observations: {
                  type: "string",
                  description: "Observações sobre o item na composição",
                  example: "Sem pimenta",
                },
                isMainProtein: {
                  type: "boolean",
                  description: "Indica se é a proteína principal",
                  default: false,
                  example: true,
                },
                isAlternativeProtein: {
                  type: "boolean",
                  description: "Indica se é uma proteína alternativa",
                  default: false,
                  example: false,
                },
              },
              required: ["menuItemId"],
            },
          },
        },
      },
      CreateReservationInput: {
        type: "object",
        properties: {
          menuId: {
            type: "string",
            format: "uuid",
            description: "ID do cardápio a ser reservado",
            example: "550e8400-e29b-41d4-a716-446655440005",
          },
          menuVariationId: {
            type: "string",
            format: "uuid",
            description: "ID da variação do cardápio escolhida",
            example: "550e8400-e29b-41d4-a716-446655440006",
          },
          reservationDate: {
            type: "string",
            format: "date",
            description: "Data da reserva (deve ser uma data futura)",
            example: "2025-11-10",
          },
        },
        required: ["menuId", "menuVariationId", "reservationDate"],
      },
      UpdateReservationInput: {
        type: "object",
        properties: {
          menuVariationId: {
            type: "string",
            format: "uuid",
            description:
              "ID da nova variação do cardápio (alterações permitidas até 8:30 AM do dia da refeição)",
            example: "550e8400-e29b-41d4-a716-446655440006",
          },
        },
        required: ["menuVariationId"],
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro genérica",
            example: "Resource not found",
          },
        },
        required: ["error"],
      },
      ValidationError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Tipo do erro de validação",
            example: "Validation error",
          },
          details: {
            type: "array",
            description: "Detalhes dos erros de validação",
            items: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Código do erro de validação",
                  example: "invalid_string",
                },
                message: {
                  type: "string",
                  description: "Mensagem descritiva do erro",
                  example: "CPF is required",
                },
                path: {
                  type: "array",
                  description: "Caminho do campo com erro",
                  items: {
                    type: "string",
                  },
                  example: ["cpf"],
                },
              },
              required: ["code", "message", "path"],
            },
          },
        },
        required: ["error", "details"],
      },
      AuthenticationError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro de autenticação",
            example: "Invalid credentials",
          },
        },
        required: ["error"],
      },
      AuthorizationError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro de autorização",
            example: "Access denied",
          },
        },
        required: ["error"],
      },
    },
  },
}
