# Exemplo de Uso: Toggle de Status de Categoria

## Endpoint

```
PATCH /api/lunch-reservation/categories/{id}/toggle-active
```

## Descrição

Alterna o status de ativação de uma categoria entre ativa (`isActive: true`) e inativa (`isActive: false`). Categorias inativas não aparecem para os usuários ao fazer reservas.

## Autenticação

Requer token JWT de um usuário com privilégios de administrador (ADMIN).

## Parâmetros

- `id` (path, obrigatório): ID único da categoria (UUID)

## Exemplo de Requisição

```bash
curl -X PATCH http://localhost:8080/api/lunch-reservation/categories/550e8400-e29b-41d4-a716-446655440020/toggle-active \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Exemplo de Resposta (200 OK)

### Categoria Desativada

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "name": "Proteína",
  "description": "Alimentos ricos em proteínas",
  "displayOrder": 1,
  "isActive": false,
  "createdAt": "2025-11-07T18:00:00.000Z",
  "updatedAt": "2025-11-12T10:30:00.000Z"
}
```

### Categoria Ativada

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440024",
  "name": "Bebida",
  "description": "Sucos e bebidas",
  "displayOrder": 5,
  "isActive": true,
  "createdAt": "2025-10-15T10:00:00.000Z",
  "updatedAt": "2025-11-12T10:35:00.000Z"
}
```

## Possíveis Erros

### 400 - ID Inválido

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid UUID format",
      "path": ["id"]
    }
  ]
}
```

### 401 - Não Autenticado

```json
{
  "error": "Authentication token is required"
}
```

### 403 - Sem Permissão

```json
{
  "error": "Access denied. Admin privileges required"
}
```

### 404 - Categoria Não Encontrada

```json
{
  "error": "Categoria não encontrada"
}
```

### 500 - Erro Interno

```json
{
  "error": "Internal server error"
}
```

## Uso no Frontend (TypeScript/React)

### Hook de Mutation (TanStack Query)

```typescript
// src/_hooks/mutations/use-toggle-category-status.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/_services/api"
import { Category } from "@/_types/category"

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string): Promise<Category> => {
      const response = await api.patch(
        `/lunch-reservation/categories/${categoryId}/toggle-active`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
```

### Componente de Exemplo

```typescript
import { Switch } from "@/_components/ui/switch";
import { useToggleCategoryStatus } from "@/_hooks/mutations/use-toggle-category-status";
import { toast } from "sonner";

interface CategoryStatusToggleProps {
  category: Category;
}

export const CategoryStatusToggle = ({ category }: CategoryStatusToggleProps) => {
  const { mutate: toggleStatus, isPending } = useToggleCategoryStatus();

  const handleToggle = () => {
    toggleStatus(category.id, {
      onSuccess: (updatedCategory) => {
        toast.success(
          `Categoria ${updatedCategory.isActive ? "ativada" : "desativada"} com sucesso.`
        );
      },
      onError: () => {
        toast.error("Erro ao alterar status da categoria.");
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={category.isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span className="text-sm">
        {category.isActive ? "Ativa" : "Inativa"}
      </span>
    </div>
  );
};
```

## Notas

- O toggle é uma operação idempotente: chamar múltiplas vezes alterna o status entre ativo e inativo
- Categorias inativas permanecem no banco de dados mas não são exibidas aos usuários
- Itens de menu associados a categorias inativas também não são exibidos
- O histórico de reservas com categorias inativas é preservado
