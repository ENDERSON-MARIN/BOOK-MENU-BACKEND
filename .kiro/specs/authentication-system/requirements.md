# Requirements Document

## Introduction

Este documento define os requisitos para o sistema de autenticação da API Book Menu. O sistema permitirá que usuários façam login usando CPF e senha, recebam tokens de autenticação, e acessem recursos protegidos baseados em suas permissões (roles).

## Glossary

- **Authentication System**: O sistema responsável por verificar a identidade dos usuários e gerenciar sessões
- **User**: Entidade que representa um usuário no sistema, identificado por CPF
- **Token**: Credencial temporária gerada após login bem-sucedido que permite acesso a recursos protegidos
- **CPF**: Cadastro de Pessoa Física, identificador único do usuário brasileiro
- **Role**: Papel do usuário no sistema (ADMIN ou USER) que define suas permissões
- **API**: Interface de programação de aplicações que expõe endpoints HTTP

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero fazer login com meu CPF e senha, para que eu possa acessar funcionalidades protegidas da API

#### Acceptance Criteria

1. WHEN um usuário envia uma requisição POST para /api/auth/login com CPF e senha válidos, THE Authentication System SHALL retornar um token de autenticação e os dados do usuário
2. WHEN um usuário envia uma requisição POST para /api/auth/login com CPF inválido, THE Authentication System SHALL retornar erro 401 com mensagem "Credenciais inválidas"
3. WHEN um usuário envia uma requisição POST para /api/auth/login com senha incorreta, THE Authentication System SHALL retornar erro 401 com mensagem "Credenciais inválidas"
4. WHEN um usuário envia uma requisição POST para /api/auth/login com CPF de usuário inativo, THE Authentication System SHALL retornar erro 403 com mensagem "Usuário inativo"
5. WHEN um usuário envia uma requisição POST para /api/auth/login sem CPF ou senha, THE Authentication System SHALL retornar erro 400 com mensagem de validação

### Requirement 2

**User Story:** Como um desenvolvedor da API, eu quero que as senhas sejam armazenadas de forma segura, para que os dados dos usuários estejam protegidos

#### Acceptance Criteria

1. WHEN um novo usuário é criado no sistema, THE Authentication System SHALL armazenar a senha usando hash bcrypt com salt factor mínimo de 10
2. WHEN um usuário faz login, THE Authentication System SHALL comparar a senha fornecida com o hash armazenado usando bcrypt
3. THE Authentication System SHALL nunca retornar senhas em texto plano em nenhuma resposta da API

### Requirement 3

**User Story:** Como um usuário autenticado, eu quero que meu token identifique minha sessão, para que eu possa acessar recursos protegidos sem fazer login repetidamente

#### Acceptance Criteria

1. WHEN um login é bem-sucedido, THE Authentication System SHALL gerar um token JWT contendo userId, cpf e role
2. THE Authentication System SHALL configurar o token JWT com expiração de 24 horas
3. WHEN um token JWT é gerado, THE Authentication System SHALL assinar o token usando uma chave secreta configurada via variável de ambiente
4. THE Authentication System SHALL incluir no payload do token os campos: userId, cpf, role e iat (issued at)

### Requirement 4

**User Story:** Como um desenvolvedor da API, eu quero proteger endpoints específicos com autenticação, para que apenas usuários autenticados possam acessá-los

#### Acceptance Criteria

1. WHEN uma requisição é feita para um endpoint protegido sem token, THE Authentication System SHALL retornar erro 401 com mensagem "Token não fornecido"
2. WHEN uma requisição é feita para um endpoint protegido com token inválido, THE Authentication System SHALL retornar erro 401 com mensagem "Token inválido"
3. WHEN uma requisição é feita para um endpoint protegido com token expirado, THE Authentication System SHALL retornar erro 401 com mensagem "Token expirado"
4. WHEN uma requisição é feita para um endpoint protegido com token válido, THE Authentication System SHALL adicionar os dados do usuário ao objeto request
5. WHEN uma requisição é feita para um endpoint protegido com token válido, THE Authentication System SHALL permitir que a requisição prossiga para o handler

### Requirement 5

**User Story:** Como um administrador do sistema, eu quero que apenas usuários com role ADMIN possam acessar endpoints administrativos, para que operações sensíveis sejam restritas

#### Acceptance Criteria

1. WHEN uma requisição é feita para um endpoint que requer role ADMIN por usuário com role USER, THE Authentication System SHALL retornar erro 403 com mensagem "Acesso negado"
2. WHEN uma requisição é feita para um endpoint que requer role ADMIN por usuário com role ADMIN, THE Authentication System SHALL permitir que a requisição prossiga
3. THE Authentication System SHALL fornecer um middleware configurável que aceita roles permitidas como parâmetro

### Requirement 6

**User Story:** Como um usuário autenticado, eu quero poder fazer logout, para que meu token seja invalidado e minha sessão encerrada

#### Acceptance Criteria

1. WHEN um usuário autenticado envia uma requisição POST para /api/auth/logout, THE Authentication System SHALL retornar status 200 com mensagem de sucesso
2. THE Authentication System SHALL fornecer resposta de logout mesmo que a invalidação de token seja implementada no cliente
3. WHEN um usuário faz logout, THE Authentication System SHALL retornar mensagem "Logout realizado com sucesso"

### Requirement 7

**User Story:** Como um desenvolvedor da API, eu quero validar os dados de entrada do login, para que requisições malformadas sejam rejeitadas antes do processamento

#### Acceptance Criteria

1. WHEN uma requisição de login é recebida, THE Authentication System SHALL validar que o campo cpf contém exatamente 11 dígitos numéricos
2. WHEN uma requisição de login é recebida, THE Authentication System SHALL validar que o campo password tem no mínimo 6 caracteres
3. WHEN uma requisição de login contém dados inválidos, THE Authentication System SHALL retornar erro 400 com detalhes dos campos inválidos
4. THE Authentication System SHALL usar Zod para validação de schemas de entrada
