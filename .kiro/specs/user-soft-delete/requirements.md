# Requirements Document

## Introduction

Este documento especifica os requisitos para modificar a funcionalidade de exclusão de usuários no Sistema de Reservas de Almoço Corporativo. Atualmente, a operação DELETE remove fisicamente o usuário do banco de dados. A nova implementação deve realizar uma exclusão lógica (soft delete), alterando o status do usuário para INATIVO ao invés de removê-lo permanentemente, preservando o histórico de reservas e integridade referencial.

## Glossary

- **Sistema**: Sistema de Reservas de Almoço Corporativo
- **Usuário**: Entidade que representa um funcionário cadastrado no sistema
- **Exclusão Lógica (Soft Delete)**: Operação que marca um registro como inativo sem removê-lo fisicamente do banco de dados
- **Status ATIVO**: Estado que indica que o usuário pode acessar e utilizar o sistema
- **Status INATIVO**: Estado que indica que o usuário não pode mais acessar o sistema, mas seus dados são preservados
- **Rota DELETE**: Endpoint HTTP DELETE /api/lunch-reservation/users/{id}
- **UserManagementService**: Serviço de domínio responsável pela lógica de negócio de gerenciamento de usuários
- **Histórico de Reservas**: Conjunto de reservas de almoço associadas a um usuário

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero que a exclusão de usuários preserve os dados no banco de dados, para que o histórico de reservas e auditoria sejam mantidos.

#### Acceptance Criteria

1. WHEN o administrador executa a operação DELETE em um usuário, THE Sistema SHALL alterar o status do usuário para INATIVO
2. WHEN o administrador executa a operação DELETE em um usuário, THE Sistema SHALL preservar todos os dados do usuário no banco de dados
3. WHEN o administrador executa a operação DELETE em um usuário, THE Sistema SHALL manter todas as reservas associadas ao usuário
4. WHEN o administrador executa a operação DELETE em um usuário com status INATIVO, THE Sistema SHALL retornar erro indicando que o usuário já está inativo

### Requirement 2

**User Story:** Como administrador do sistema, eu quero que usuários inativos não possam fazer login, para que apenas usuários ativos tenham acesso ao sistema.

#### Acceptance Criteria

1. WHEN um usuário com status INATIVO tenta fazer login, THE Sistema SHALL rejeitar a autenticação
2. WHEN um usuário com status INATIVO tenta fazer login, THE Sistema SHALL retornar mensagem de erro apropriada
3. WHEN um usuário com status ATIVO faz login, THE Sistema SHALL permitir a autenticação normalmente

### Requirement 3

**User Story:** Como administrador do sistema, eu quero que usuários inativos não apareçam nas listagens padrão, para que apenas usuários ativos sejam exibidos nas operações do dia a dia.

#### Acceptance Criteria

1. WHEN o sistema lista usuários através do endpoint GET /api/lunch-reservation/users, THE Sistema SHALL retornar apenas usuários com status ATIVO
2. WHEN o sistema busca usuários para criação de reservas automáticas, THE Sistema SHALL considerar apenas usuários com status ATIVO
3. WHERE o administrador necessita visualizar todos os usuários incluindo inativos, THE Sistema SHALL fornecer um parâmetro de consulta opcional para incluir usuários inativos

### Requirement 4

**User Story:** Como administrador do sistema, eu quero poder reativar usuários inativos, para que funcionários que retornem à empresa possam ter seu acesso restaurado.

#### Acceptance Criteria

1. WHEN o administrador executa a operação de atualização (PUT) alterando o status de INATIVO para ATIVO, THE Sistema SHALL reativar o usuário
2. WHEN um usuário é reativado, THE Sistema SHALL permitir que o usuário faça login novamente
3. WHEN um usuário é reativado, THE Sistema SHALL manter todo o histórico de reservas anteriores

### Requirement 5

**User Story:** Como desenvolvedor, eu quero que a API mantenha compatibilidade com o contrato existente, para que o frontend não precise de alterações significativas.

#### Acceptance Criteria

1. WHEN a rota DELETE é chamada, THE Sistema SHALL retornar código HTTP 204 (No Content) em caso de sucesso
2. WHEN a rota DELETE é chamada para um usuário inexistente, THE Sistema SHALL retornar código HTTP 404 (Not Found)
3. WHEN a rota DELETE é chamada para um usuário já inativo, THE Sistema SHALL retornar código HTTP 400 (Bad Request) com mensagem descritiva
