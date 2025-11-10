import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * Script para migrar senhas de SHA256 para bcrypt
 *
 * IMPORTANTE: Este script não pode converter senhas SHA256 de volta para texto plano.
 * Você precisará:
 * 1. Resetar as senhas dos usuários existentes para uma senha padrão
 * 2. Notificar os usuários para alterarem suas senhas
 *
 * OU
 *
 * Se você souber as senhas originais dos usuários, pode atualizá-las manualmente.
 */

async function migratePasswords() {
  console.log("🔐 Iniciando migração de senhas...")

  try {
    // Buscar todos os usuários
    const users = await prisma.user.findMany()

    console.log(`📊 Encontrados ${users.length} usuários`)

    // Senha padrão temporária que será usada para todos os usuários
    const defaultPassword = process.env.TEMP_PASSWORD || "123456"
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10)

    let updatedCount = 0

    for (const user of users) {
      // Verificar se a senha já está em formato bcrypt
      // Senhas bcrypt começam com $2a$, $2b$ ou $2y$
      const isBcrypt = /^\$2[aby]\$/.test(user.password)

      if (!isBcrypt) {
        console.log(
          `🔄 Atualizando senha do usuário: ${user.name} (CPF: ${user.cpf})`
        )

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedDefaultPassword },
        })

        updatedCount++
      } else {
        console.log(`✅ Usuário ${user.name} já possui senha bcrypt`)
      }
    }

    console.log(`\n✅ Migração concluída!`)
    console.log(`📊 Total de senhas atualizadas: ${updatedCount}`)

    if (updatedCount > 0) {
      console.log(`\n⚠️  IMPORTANTE:`)
      console.log(`   - Senha temporária definida: ${defaultPassword}`)
      console.log(`   - Notifique os usuários para alterarem suas senhas`)
      console.log(`   - Os usuários afetados são:`)

      const updatedUsers = await prisma.user.findMany({
        select: { cpf: true, name: true },
      })

      updatedUsers.forEach((user) => {
        console.log(`     - ${user.name} (CPF: ${user.cpf})`)
      })
    }
  } catch (error) {
    console.error("❌ Erro durante a migração:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar migração
migratePasswords()
  .then(() => {
    console.log("\n🎉 Script finalizado com sucesso!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Script falhou:", error)
    process.exit(1)
  })
