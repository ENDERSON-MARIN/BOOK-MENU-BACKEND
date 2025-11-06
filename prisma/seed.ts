import { PrismaClient } from "@prisma/client"
import { DayOfWeek, UserRole, UserType, UserStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create default categories
  console.log("📂 Creating categories...")
  const categories = [
    {
      name: "Proteína",
      description: "Proteínas principais do cardápio",
      displayOrder: 1,
    },
    {
      name: "Acompanhamento",
      description: "Acompanhamentos como arroz, feijão, etc.",
      displayOrder: 2,
    },
    {
      name: "Salada",
      description: "Saladas e vegetais frescos",
      displayOrder: 3,
    },
    {
      name: "Sobremesa",
      description: "Sobremesas e doces",
      displayOrder: 4,
    },
    {
      name: "Massa",
      description: "Massas e pratos à base de massa",
      displayOrder: 5,
    },
    {
      name: "Molho",
      description: "Molhos e temperos",
      displayOrder: 6,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  // Create week days (Monday to Sunday)
  console.log("📅 Creating week days...")
  const weekDays = [
    {
      dayName: "Segunda-feira",
      dayOfWeek: DayOfWeek.MONDAY,
      displayOrder: 1,
    },
    {
      dayName: "Terça-feira",
      dayOfWeek: DayOfWeek.TUESDAY,
      displayOrder: 2,
    },
    {
      dayName: "Quarta-feira",
      dayOfWeek: DayOfWeek.WEDNESDAY,
      displayOrder: 3,
    },
    {
      dayName: "Quinta-feira",
      dayOfWeek: DayOfWeek.THURSDAY,
      displayOrder: 4,
    },
    {
      dayName: "Sexta-feira",
      dayOfWeek: DayOfWeek.FRIDAY,
      displayOrder: 5,
    },
    {
      dayName: "Sábado",
      dayOfWeek: DayOfWeek.SATURDAY,
      displayOrder: 6,
    },
    {
      dayName: "Domingo",
      dayOfWeek: DayOfWeek.SUNDAY,
      displayOrder: 7,
    },
  ]

  for (const weekDay of weekDays) {
    await prisma.weekDay.upsert({
      where: { dayOfWeek: weekDay.dayOfWeek },
      update: {},
      create: weekDay,
    })
  }

  // Create default admin user
  console.log("👤 Creating admin user...")
  await prisma.user.upsert({
    where: { cpf: "00000000000" },
    update: {},
    create: {
      cpf: "00000000000",
      password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: "password"
      name: "Administrador",
      role: UserRole.ADMIN,
      userType: UserType.NAO_FIXO,
      status: UserStatus.ATIVO,
    },
  })

  // Create some sample menu items for each category
  console.log("🍽️ Creating sample menu items...")

  // Get categories
  const proteinCategory = await prisma.category.findUnique({
    where: { name: "Proteína" },
  })
  const accompanimentCategory = await prisma.category.findUnique({
    where: { name: "Acompanhamento" },
  })
  const saladCategory = await prisma.category.findUnique({
    where: { name: "Salada" },
  })
  const dessertCategory = await prisma.category.findUnique({
    where: { name: "Sobremesa" },
  })
  const pastaCategory = await prisma.category.findUnique({
    where: { name: "Massa" },
  })
  const sauceCategory = await prisma.category.findUnique({
    where: { name: "Molho" },
  })

  if (proteinCategory) {
    const proteinItems = [
      {
        name: "Frango Grelhado",
        description: "Peito de frango grelhado temperado",
      },
      { name: "Carne Bovina", description: "Carne bovina refogada" },
      { name: "Peixe Assado", description: "Filé de peixe assado com ervas" },
      { name: "Ovo", description: "Ovo cozido ou frito" },
    ]

    for (const item of proteinItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: {
          ...item,
          categoryId: proteinCategory.id,
        },
      })
    }
  }

  if (accompanimentCategory) {
    const accompanimentItems = [
      { name: "Arroz Branco", description: "Arroz branco tradicional" },
      { name: "Feijão Preto", description: "Feijão preto temperado" },
      { name: "Batata Frita", description: "Batata frita crocante" },
      { name: "Purê de Batata", description: "Purê de batata cremoso" },
    ]

    for (const item of accompanimentItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: {
          ...item,
          categoryId: accompanimentCategory.id,
        },
      })
    }
  }

  if (saladCategory) {
    const saladItems = [
      { name: "Salada Verde", description: "Mix de folhas verdes" },
      { name: "Salada de Tomate", description: "Tomate fatiado com cebola" },
      { name: "Salada de Cenoura", description: "Cenoura ralada temperada" },
    ]

    for (const item of saladItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: {
          ...item,
          categoryId: saladCategory.id,
        },
      })
    }
  }

  if (dessertCategory) {
    const dessertItems = [
      { name: "Pudim", description: "Pudim de leite condensado" },
      { name: "Gelatina", description: "Gelatina de frutas" },
      { name: "Fruta da Época", description: "Fruta fresca da estação" },
    ]

    for (const item of dessertItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: {
          ...item,
          categoryId: dessertCategory.id,
        },
      })
    }
  }

  if (pastaCategory) {
    const pastaItems = [
      {
        name: "Macarrão ao Molho",
        description: "Macarrão com molho de tomate",
      },
      { name: "Lasanha", description: "Lasanha de carne" },
    ]

    for (const item of pastaItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: {
          ...item,
          categoryId: pastaCategory.id,
        },
      })
    }
  }

  if (sauceCategory) {
    const sauceItems = [
      { name: "Molho de Tomate", description: "Molho de tomate tradicional" },
      { name: "Molho Branco", description: "Molho branco cremoso" },
    ]

    for (const item of sauceItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: {
          ...item,
          categoryId: sauceCategory.id,
        },
      })
    }
  }

  console.log("✅ Seed completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
