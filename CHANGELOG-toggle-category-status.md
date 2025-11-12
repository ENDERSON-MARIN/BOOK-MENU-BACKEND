# Changelog - Toggle de Status de Categorias

## Data: 2025-11-12

### Adicionado

#### Backend

1. **Controller** (`src/infrastructure/http/controllers/CategoryController.ts`)
   - Adicionado método `toggleActive` para alternar o status de categorias

2. **Rota** (`src/infrastructure/http/routes/lunchReservation.routes.ts`)
   - Adicionada rota `PATCH /api/lunch-reservation/categories/:id/toggle-active`
   - Requer autenticação e privilégios de administrador

3. **Documentação Swagger** (`src/config/swagger.ts`)
   - Documentado novo endpoint com exemplos de requisição e resposta
   - Incluídos todos os códigos de status HTTP possíveis (200, 400, 401, 403, 404, 500)

4. **Testes** (`tests/system/category-toggle-status.test.ts`)
   - Testes de integração para o novo endpoint
   - Cobertura de casos de sucesso e erro

5. **Documentação** (`docs/category-toggle-status-example.md`)
   - Exemplos de uso do endpoint
   - Exemplos de integração com frontend (React/TanStack Query)

### Observações

- O método `toggleActive` já existia no `CategoryManagementService`, apenas foi exposto via API REST
- A implementação segue os padrões do projeto (Arquitetura Hexagonal)
- Mantém compatibilidade com o sistema existente
- Não requer alterações no banco de dados (campo `isActive` já existe)

### Como Testar

```bash
# Executar testes
npm test tests/system/category-toggle-status.test.ts

# Testar manualmente com curl
curl -X PATCH http://localhost:8080/api/lunch-reservation/categories/{id}/toggle-active \
  -H "Authorization: Bearer {seu-token-jwt}"
```

### Próximos Passos (Opcional)

Se houver um frontend separado, você pode:

1. Criar o hook de mutation: `src/_hooks/mutations/use-toggle-category-status.ts`
2. Adicionar um switch/toggle na tabela de categorias
3. Adicionar feedback visual (toast) ao alternar o status
