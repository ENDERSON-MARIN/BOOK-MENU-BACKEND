# Implementation Plan - User Soft Delete

- [x] 1. Modificar UserManagementService para implementar soft delete
  - Alterar o método `delete()` para realizar exclusão lógica ao invés de física
  - Adicionar validação para verificar se usuário já está inativo antes de desativar
  - Utilizar o método `update()` do repositório para alterar o status para INATIVO
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Adicionar suporte para filtrar usuários inativos nas listagens
- [x] 2.1 Modificar UserManagementService.findAll()
  - Adicionar parâmetro opcional `includeInactive` com valor padrão `false`
  - Implementar filtro para retornar apenas usuários ativos quando `includeInactive` é `false`
  - _Requirements: 3.1, 3.2_

- [x] 2.2 Modificar PrismaUserRepository.findAll()
  - Adicionar parâmetro opcional `includeInactive` com valor padrão `false`
  - Implementar cláusula WHERE no Prisma para filtrar por status quando necessário
  - _Requirements: 3.1, 3.2_

- [x] 2.3 Atualizar interface UserRepository
  - Adicionar parâmetro opcional `includeInactive` na assinatura do método `findAll()`
  - _Requirements: 3.1, 3.2_

- [x] 3. Adicionar suporte opcional para visualizar usuários inativos via API
- [x] 3.1 Modificar UserController.getAll()
  - Adicionar leitura do query parameter `includeInactive` da requisição
  - Passar o parâmetro para o método `findAll()` do service
  - _Requirements: 3.3_

- [x] 4. Escrever testes unitários para UserManagementService
- [x] 4.1 Criar testes para o método delete()
  - Testar soft delete de usuário ativo (deve alterar status para INATIVO)
  - Testar erro 404 quando usuário não existe
  - Testar erro 400 quando usuário já está inativo
  - _Requirements: 1.1, 1.4_

- [x] 4.2 Criar testes para o método findAll()
  - Testar filtro padrão que retorna apenas usuários ativos
  - Testar parâmetro `includeInactive=true` que retorna todos os usuários
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Escrever testes de integração para as rotas de usuários
- [x] 5.1 Criar testes para DELETE /api/lunch-reservation/users/:id
  - Testar resposta 204 e alteração de status no banco de dados
  - Testar resposta 404 para usuário inexistente
  - Testar resposta 400 para usuário já inativo
  - Testar preservação de reservas após soft delete
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3_

- [x] 5.2 Criar testes para GET /api/lunch-reservation/users
  - Testar listagem padrão retornando apenas usuários ativos
  - Testar query parameter `includeInactive=true` retornando todos os usuários
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5.3 Criar testes para autenticação com usuários inativos
  - Testar rejeição de login para usuário inativo (status 401)
  - Testar sucesso de login para usuário ativo
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Validar comportamento de reativação de usuários
- [x] 6.1 Testar reativação via PUT /api/lunch-reservation/users/:id
  - Criar teste que altera status de INATIVO para ATIVO via endpoint de update
  - Verificar que usuário reativado pode fazer login novamente
  - Verificar que histórico de reservas é mantido
  - _Requirements: 4.1, 4.2, 4.3_
