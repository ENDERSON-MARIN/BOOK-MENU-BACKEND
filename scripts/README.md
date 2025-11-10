# Scripts de Manutenção

## Migração de Senhas (migrate-passwords.ts)

### Problema Identificado

O sistema tinha dois métodos diferentes de hash de senha:

1. **Criação de usuários** (UserManagementService) → usava SHA256
2. **Login** (AuthService) → usava bcrypt

Isso causava falha de autenticação mesmo com credenciais corretas.

### Solução Implementada

1. **Código corrigido**: UserManagementService agora usa AuthService (bcrypt) para hash de senhas
2. **Script de migração**: Atualiza senhas existentes no banco de dados

### Como Usar o Script de Migração

```bash
# Executar o script
npx tsx scripts/migrate-passwords.ts
```

### O que o Script Faz

- Identifica usuários com senhas em formato SHA256
- Atualiza para uma senha temporária padrão: `TempPassword123!`
- Mantém usuários que já têm senhas bcrypt (como o admin do seed)

### Após Executar o Script

1. Notifique os usuários afetados sobre a senha temporária
2. Instrua-os a alterarem suas senhas no primeiro login
3. Considere implementar um fluxo de "reset de senha" se necessário

### Alternativa

Se você souber as senhas originais dos usuários, pode atualizá-las manualmente:

```typescript
import bcrypt from "bcryptjs"

const hashedPassword = await bcrypt.hash("senha_original", 10)
// Atualizar no banco de dados
```

### Prevenção

Com as correções implementadas, novos usuários criados pelo admin já terão senhas em formato bcrypt compatível com o login.
