/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Script para testar cron jobs localmente
 *
 * Uso:
 * pnpm tsx scripts/test-cron.ts
 * pnpm tsx scripts/test-cron.ts --date 2024-12-25
 */

const API_URL = process.env.API_URL || "http://localhost:3000"

async function testAutoReservations() {
  console.log("🧪 Testando auto-reservations...\n")

  try {
    const response = await fetch(
      `${API_URL}/api/cron/auto-reservations/manual`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      console.log("✅ Sucesso!")
      console.log("\nResultado:")
      console.log(`  Total de usuários: ${data.data.totalUsers}`)
      console.log(`  Reservas criadas: ${data.data.successfulReservations}`)
      console.log(`  Falhas: ${data.data.failedReservations}`)
      console.log(`  Processado em: ${data.data.processedAt}`)

      if (data.data.errors && data.data.errors.length > 0) {
        console.log("\n⚠️ Erros:")
        data.data.errors.forEach((error: any) => {
          console.log(`  - Usuário ${error.userId}: ${error.error}`)
        })
      }
    } else {
      console.error("❌ Erro:", data.error)
    }
  } catch (error) {
    console.error("❌ Erro ao conectar com a API:", error)
    console.log("\n💡 Certifique-se de que o servidor está rodando:")
    console.log("   pnpm dev")
  }
}

async function testAutoReservationsForDate(date: string) {
  console.log(`🧪 Testando auto-reservations para data: ${date}...\n`)

  try {
    const response = await fetch(`${API_URL}/api/cron/auto-reservations/date`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("✅ Sucesso!")
      console.log("\nResultado:")
      console.log(`  Total de usuários: ${data.data.totalUsers}`)
      console.log(`  Reservas criadas: ${data.data.successfulReservations}`)
      console.log(`  Falhas: ${data.data.failedReservations}`)
      console.log(`  Processado em: ${data.data.processedAt}`)

      if (data.data.errors && data.data.errors.length > 0) {
        console.log("\n⚠️ Erros:")
        data.data.errors.forEach((error: any) => {
          console.log(`  - Usuário ${error.userId}: ${error.error}`)
        })
      }
    } else {
      console.error("❌ Erro:", data.error)
    }
  } catch (error) {
    console.error("❌ Erro ao conectar com a API:", error)
    console.log("\n💡 Certifique-se de que o servidor está rodando:")
    console.log("   pnpm dev")
  }
}

// Parse argumentos
const args = process.argv.slice(2)
const dateIndex = args.indexOf("--date")

if (dateIndex !== -1 && args[dateIndex + 1]) {
  const date = args[dateIndex + 1]
  testAutoReservationsForDate(date)
} else {
  testAutoReservations()
}
