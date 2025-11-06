export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Device Management API",
    version: "1.0.0",
    description:
      "API REST para sistema de gestão de dispositivos IoT com controle de status e validação de endereços MAC",
    contact: {
      name: "API Support",
      email: "support@deviceapi.com",
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
      name: "Devices",
      description: "Endpoints para gerenciamento de dispositivos IoT",
    },
  ],
  paths: {
    "/api/devices": {
      post: {
        tags: ["Devices"],
        summary: "Criar novo dispositivo",
        description: "Cria um novo dispositivo IoT no sistema",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateDeviceInput",
              },
              examples: {
                exemplo: {
                  summary: "Dispositivo IoT",
                  value: {
                    name: "Sensor de Temperatura",
                    mac: "AA:BB:CC:DD:EE:FF",
                  },
                },
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
                  $ref: "#/components/schemas/Device",
                },
                example: {
                  id: "550e8400-e29b-41d4-a716-446655440000",
                  name: "Sensor de Temperatura",
                  mac: "AA:BB:CC:DD:EE:FF",
                  status: "ATIVO",
                  createdAt: "2025-10-21T10:30:00.000Z",
                  updatedAt: "2025-10-21T10:30:00.000Z",
                },
              },
            },
          },
          "400": {
            description: "Dados inválidos",
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
                      message: "MAC address is required",
                      path: ["mac"],
                    },
                  ],
                },
              },
            },
          },
          "409": {
            description: "MAC address já cadastrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  error: "Device with this MAC address already exists",
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
          "Retorna uma lista de todos os dispositivos cadastrados, ordenados por data de criação (mais recentes primeiro)",
        responses: {
          "200": {
            description: "Lista de dispositivos retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Device",
                  },
                },
                example: [
                  {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Sensor de Temperatura",
                    mac: "AA:BB:CC:DD:EE:FF",
                    status: "ATIVO",
                    createdAt: "2025-10-21T10:30:00.000Z",
                    updatedAt: "2025-10-21T10:30:00.000Z",
                  },
                  {
                    id: "650e8400-e29b-41d4-a716-446655440001",
                    name: "Sensor de Umidade",
                    mac: "11:22:33:44:55:66",
                    status: "INATIVO",
                    createdAt: "2025-10-20T15:20:00.000Z",
                    updatedAt: "2025-10-20T15:20:00.000Z",
                  },
                ],
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
        description: "Alterna o status de um dispositivo entre ATIVO e INATIVO",
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
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
        ],
        responses: {
          "200": {
            description: "Status do dispositivo alterado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Device",
                },
                example: {
                  id: "550e8400-e29b-41d4-a716-446655440000",
                  name: "Sensor de Temperatura",
                  mac: "AA:BB:CC:DD:EE:FF",
                  status: "INATIVO",
                  createdAt: "2025-10-21T10:30:00.000Z",
                  updatedAt: "2025-10-21T11:45:00.000Z",
                },
              },
            },
          },
          "400": {
            description: "ID inválido (não é um UUID)",
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
    schemas: {
      Device: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID único do dispositivo",
            example: "550e8400-e29b-41d4-a716-446655440000",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome do dispositivo",
            example: "Sensor de Temperatura",
          },
          mac: {
            type: "string",
            maxLength: 17,
            description: "Endereço MAC do dispositivo",
            example: "AA:BB:CC:DD:EE:FF",
          },
          status: {
            type: "string",
            enum: ["ATIVO", "INATIVO"],
            description: "Status atual do dispositivo",
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
        required: ["id", "name", "mac", "status", "createdAt", "updatedAt"],
      },
      CreateDeviceInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Nome do dispositivo",
            example: "Sensor de Temperatura",
          },
          mac: {
            type: "string",
            minLength: 1,
            maxLength: 17,
            description: "Endereço MAC do dispositivo (formato livre)",
            example: "AA:BB:CC:DD:EE:FF",
          },
        },
        required: ["name", "mac"],
      },
      DeviceStatus: {
        type: "string",
        enum: ["ATIVO", "INATIVO"],
        description: "Status possíveis para um dispositivo",
        example: "ATIVO",
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro",
            example: "Device not found",
          },
        },
        required: ["error"],
      },
      ValidationError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Tipo do erro",
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
                  example: "invalid_string",
                },
                message: {
                  type: "string",
                  example: "MAC address is required",
                },
                path: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["mac"],
                },
              },
            },
          },
        },
        required: ["error", "details"],
      },
    },
  },
}
