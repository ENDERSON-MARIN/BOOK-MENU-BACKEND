import { describe, it, expect, beforeEach, vi } from "vitest"
import { ReservationService } from "../../../../../../src/app/modules/lunch-reservation/domain/services/ReservationService"
import { ReservationRepository } from "../../../../../../src/app/modules/lunch-reservation/domain/repositories/ReservationRepository"
import {
  MenuRepository,
  MenuWithDetails,
} from "../../../../../../src/app/modules/lunch-reservation/domain/repositories/MenuRepository"
import { UserRepository } from "../../../../../../src/app/modules/lunch-reservation/domain/repositories/UserRepository"
import {
  Reservation,
  ReservationStatus,
} from "../../../../../../src/app/modules/lunch-reservation/domain/entities/Reservation"
import {
  User,
  UserRole,
  UserType,
  UserStatus,
} from "../../../../../../src/app/modules/lunch-reservation/domain/entities/User"
import { Menu } from "../../../../../../src/app/modules/lunch-reservation/domain/entities/Menu"
import {
  MenuVariation,
  VariationType,
} from "../../../../../../src/app/modules/lunch-reservation/domain/entities/MenuVariation"
import { MenuComposition } from "../../../../../../src/app/modules/lunch-reservation/domain/entities/MenuComposition"
import { DayOfWeek } from "../../../../../../src/app/modules/lunch-reservation/domain/entities/WeekDay"
import { CreateReservationDTO } from "../../../../../../src/app/modules/lunch-reservation/dtos/ReservationDTOs"
import { AppError } from "../../../../../../src/app/shared"

// Helper function to create MenuWithDetails
const createMenuWithDetails = (
  menu: Menu,
  compositions: MenuComposition[],
  variations: MenuVariation[]
): MenuWithDetails => ({
  ...menu,
  menuCompositions: compositions,
  variations,
  toggleActive: vi.fn(),
  update: vi.fn(),
})

// Mock repositories
const mockReservationRepository: ReservationRepository = {
  findById: vi.fn(),
  findByUser: vi.fn(),
  findByUserId: vi.fn(),
  findByUserAndDate: vi.fn(),
  findByMenuId: vi.fn(),
  findByStatus: vi.fn(),
  findActiveReservationsForDate: vi.fn(),
  findByDateRange: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const mockMenuRepository: MenuRepository = {
  findById: vi.fn(),
  findByDate: vi.fn(),
  findByWeekNumber: vi.fn(),
  findByDateRange: vi.fn(),
  findAll: vi.fn(),
  findActive: vi.fn(),
  findWithComposition: vi.fn(),
  findWithCompositionByDate: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const mockUserRepository: UserRepository = {
  findById: vi.fn(),
  findByCpf: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
}

describe("ReservationService", () => {
  let service: ReservationService

  beforeEach(() => {
    service = new ReservationService(
      mockReservationRepository,
      mockMenuRepository,
      mockUserRepository
    )
    vi.clearAllMocks()
  })

  describe("create", () => {
    const validUser = new User(
      "user123",
      "11144477735",
      "hashedPassword",
      "João Silva",
      UserRole.USER,
      UserType.NAO_FIXO,
      UserStatus.ATIVO,
      new Date(),
      new Date()
    )

    // Use future date for tests
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 2) // Day after tomorrow

    const validMenu = new Menu(
      "menu123",
      futureDate,
      DayOfWeek.TUESDAY,
      50,
      "Menu do dia",
      true,
      new Date(),
      new Date()
    )

    const validMenuVariation = new MenuVariation(
      "variation123",
      "menu123",
      VariationType.STANDARD,
      "protein123",
      true
    )

    const validMenuWithDetails = createMenuWithDetails(
      validMenu,
      [new MenuComposition("comp123", "menu123", "item123", "", true, false)],
      [validMenuVariation]
    )

    const createReservationDTO: CreateReservationDTO = {
      userId: "user123",
      menuId: "menu123",
      menuVariationId: "variation123",
      reservationDate: futureDate,
    }

    it("should create reservation with valid data", async () => {
      const createdReservation = new Reservation(
        "reservation123",
        createReservationDTO.userId,
        createReservationDTO.menuId,
        createReservationDTO.menuVariationId,
        createReservationDTO.reservationDate,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        validMenuWithDetails
      )
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        null
      )
      vi.mocked(mockReservationRepository.create).mockResolvedValue(
        createdReservation
      )

      const result = await service.create(createReservationDTO)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        createReservationDTO.userId
      )
      expect(mockMenuRepository.findWithComposition).toHaveBeenCalledWith(
        createReservationDTO.menuId
      )
      expect(mockReservationRepository.create).toHaveBeenCalledWith(
        createReservationDTO
      )
      expect(result).toEqual(createdReservation)
    })

    it("should throw error if user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Usuário não encontrado"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error if user is inactive", async () => {
      const inactiveUser = new User(
        validUser.id,
        validUser.cpf,
        validUser.password,
        validUser.name,
        validUser.role,
        validUser.userType,
        UserStatus.INATIVO,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(inactiveUser)

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Usuário inativo não pode fazer reservas"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error if menu not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(null)

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Cardápio não encontrado"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error if menu is inactive", async () => {
      const inactiveMenuBase = new Menu(
        validMenu.id,
        validMenu.date,
        validMenu.dayOfWeek,
        validMenu.weekNumber,
        validMenu.observations,
        false, // inactive
        validMenu.createdAt,
        validMenu.updatedAt
      )
      const inactiveMenu = createMenuWithDetails(
        inactiveMenuBase,
        [new MenuComposition("comp123", "menu123", "item123", "", true, false)],
        [validMenuVariation]
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        inactiveMenu
      )

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Cardápio não está disponível"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error for past date reservation", async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1) // Yesterday

      const pastDateMenu = new Menu(
        "menu123",
        pastDate,
        DayOfWeek.MONDAY,
        50,
        "Menu do dia",
        true,
        new Date(),
        new Date()
      )

      const pastDateMenuWithDetails = createMenuWithDetails(
        pastDateMenu,
        [new MenuComposition("comp123", "menu123", "item123", "", true, false)],
        [validMenuVariation]
      )

      const pastDateDTO = {
        ...createReservationDTO,
        reservationDate: pastDate,
      }

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        pastDateMenuWithDetails
      )

      await expect(service.create(pastDateDTO)).rejects.toThrow(AppError)
      await expect(service.create(pastDateDTO)).rejects.toThrow(
        "Não é possível fazer reserva para data passada"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error if reservation date doesn't match menu date", async () => {
      const differentDate = new Date()
      differentDate.setDate(differentDate.getDate() + 3) // Different from menu date

      const differentDateDTO = {
        ...createReservationDTO,
        reservationDate: differentDate,
      }

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        validMenuWithDetails
      )

      await expect(service.create(differentDateDTO)).rejects.toThrow(AppError)
      await expect(service.create(differentDateDTO)).rejects.toThrow(
        "Data da reserva deve corresponder à data do cardápio"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error if user already has active reservation for date", async () => {
      const existingReservation = new Reservation(
        "existing123",
        createReservationDTO.userId,
        "otherMenu123",
        "otherVariation123",
        createReservationDTO.reservationDate,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        validMenuWithDetails
      )
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        existingReservation
      )

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Usuário já possui reserva ativa para esta data"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error if menu variation not found", async () => {
      const menuWithoutVariation = createMenuWithDetails(
        validMenu,
        [new MenuComposition("comp123", "menu123", "item123", "", true, false)],
        [] // No variations
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        menuWithoutVariation
      )
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        null
      )

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Variação de cardápio não encontrada"
      )
      expect(mockReservationRepository.create).not.toHaveBeenCalled()
    })

    it("should allow reservation if user has cancelled reservation for same date", async () => {
      const cancelledReservation = new Reservation(
        "cancelled123",
        createReservationDTO.userId,
        "otherMenu123",
        "otherVariation123",
        createReservationDTO.reservationDate,
        ReservationStatus.CANCELLED,
        false,
        new Date(),
        new Date()
      )

      const createdReservation = new Reservation(
        "reservation123",
        createReservationDTO.userId,
        createReservationDTO.menuId,
        createReservationDTO.menuVariationId,
        createReservationDTO.reservationDate,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        validMenuWithDetails
      )
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        cancelledReservation
      )
      vi.mocked(mockReservationRepository.create).mockResolvedValue(
        createdReservation
      )

      const result = await service.create(createReservationDTO)

      expect(result).toEqual(createdReservation)
      expect(mockReservationRepository.create).toHaveBeenCalled()
    })
  })

  describe("cancel", () => {
    it("should cancel active reservation within cutoff time", async () => {
      // Create a reservation for tomorrow to ensure it's within cutoff time
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const activeReservation = new Reservation(
        "reservation123",
        "user123",
        "menu123",
        "variation123",
        tomorrow,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      const cancelledReservation = new Reservation(
        "reservation123",
        "user123",
        "menu123",
        "variation123",
        tomorrow,
        ReservationStatus.CANCELLED,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockReservationRepository.findById).mockResolvedValue(
        activeReservation
      )
      vi.mocked(mockReservationRepository.update).mockResolvedValue(
        cancelledReservation
      )

      const result = await service.cancel("reservation123")

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        "reservation123"
      )
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        "reservation123",
        {
          status: ReservationStatus.CANCELLED,
        }
      )
      expect(result.status).toBe(ReservationStatus.CANCELLED)
    })

    it("should throw error if reservation not found", async () => {
      vi.mocked(mockReservationRepository.findById).mockResolvedValue(null)

      await expect(service.cancel("nonexistent123")).rejects.toThrow(AppError)
      await expect(service.cancel("nonexistent123")).rejects.toThrow(
        "Reserva não encontrada"
      )
      expect(mockReservationRepository.update).not.toHaveBeenCalled()
    })

    it("should throw error if reservation already cancelled", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const cancelledReservation = new Reservation(
        "reservation123",
        "user123",
        "menu123",
        "variation123",
        tomorrow,
        ReservationStatus.CANCELLED,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockReservationRepository.findById).mockResolvedValue(
        cancelledReservation
      )

      await expect(service.cancel("reservation123")).rejects.toThrow(AppError)
      await expect(service.cancel("reservation123")).rejects.toThrow(
        "Reserva não pode ser cancelada (prazo expirado)"
      )
      expect(mockReservationRepository.update).not.toHaveBeenCalled()
    })

    it("should throw error if cutoff time has passed", async () => {
      // Create a reservation for today with past cutoff time
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today

      const pastCutoffReservation = new Reservation(
        "reservation123",
        "user123",
        "menu123",
        "variation123",
        today,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      // Mock current time to be after 8:30 AM
      const mockCurrentTime = new Date()
      mockCurrentTime.setHours(9, 0, 0, 0)
      vi.setSystemTime(mockCurrentTime)

      vi.mocked(mockReservationRepository.findById).mockResolvedValue(
        pastCutoffReservation
      )

      await expect(service.cancel("reservation123")).rejects.toThrow(AppError)
      await expect(service.cancel("reservation123")).rejects.toThrow(
        "Reserva não pode ser cancelada (prazo expirado)"
      )
      expect(mockReservationRepository.update).not.toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe("canUserMakeReservation", () => {
    const validUser = new User(
      "user123",
      "11144477735",
      "hashedPassword",
      "João Silva",
      UserRole.USER,
      UserType.NAO_FIXO,
      UserStatus.ATIVO,
      new Date(),
      new Date()
    )

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const validMenu = new Menu(
      "menu123",
      futureDate,
      DayOfWeek.TUESDAY,
      50,
      "Menu do dia",
      true,
      new Date(),
      new Date()
    )

    it("should return true for valid reservation conditions", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findById).mockResolvedValue(validMenu)
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        null
      )

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        futureDate
      )

      expect(result.canReserve).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it("should return false if user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        futureDate
      )

      expect(result.canReserve).toBe(false)
      expect(result.reason).toBe("Usuário não encontrado")
    })

    it("should return false if user is inactive", async () => {
      const inactiveUser = new User(
        validUser.id,
        validUser.cpf,
        validUser.password,
        validUser.name,
        validUser.role,
        validUser.userType,
        UserStatus.INATIVO,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(inactiveUser)

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        futureDate
      )

      expect(result.canReserve).toBe(false)
      expect(result.reason).toBe("Usuário inativo")
    })

    it("should return false if menu not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findById).mockResolvedValue(null)

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        futureDate
      )

      expect(result.canReserve).toBe(false)
      expect(result.reason).toBe("Cardápio não encontrado")
    })

    it("should return false if menu is inactive", async () => {
      const inactiveMenu = new Menu(
        validMenu.id,
        validMenu.date,
        validMenu.dayOfWeek,
        validMenu.weekNumber,
        validMenu.observations,
        false, // inactive
        validMenu.createdAt,
        validMenu.updatedAt
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findById).mockResolvedValue(inactiveMenu)

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        futureDate
      )

      expect(result.canReserve).toBe(false)
      expect(result.reason).toBe("Cardápio não disponível")
    })

    it("should return false for past date", async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findById).mockResolvedValue(validMenu)

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        pastDate
      )

      expect(result.canReserve).toBe(false)
      expect(result.reason).toBe("Data já passou")
    })

    it("should return false if user already has active reservation", async () => {
      const existingReservation = new Reservation(
        "existing123",
        "user123",
        "menu123",
        "variation123",
        futureDate,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findById).mockResolvedValue(validMenu)
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        existingReservation
      )

      const result = await service.canUserMakeReservation(
        "user123",
        "menu123",
        futureDate
      )

      expect(result.canReserve).toBe(false)
      expect(result.reason).toBe("Já possui reserva para esta data")
    })
  })

  describe("cutoff time validation", () => {
    it("should respect 8:30 AM cutoff time for same-day reservations", async () => {
      // Mock current time to be 9:00 AM
      const mockDate = new Date()
      mockDate.setHours(9, 0, 0, 0)
      vi.setSystemTime(mockDate)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const validUser = new User(
        "user123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      const validMenu = new Menu(
        "menu123",
        today,
        DayOfWeek.TUESDAY,
        50,
        "Menu do dia",
        true,
        new Date(),
        new Date()
      )

      const validMenuVariation = new MenuVariation(
        "variation123",
        "menu123",
        VariationType.STANDARD,
        "protein123",
        true
      )

      const validMenuWithDetails = createMenuWithDetails(
        validMenu,
        [new MenuComposition("comp123", "menu123", "item123", "", true, false)],
        [validMenuVariation]
      )

      const createReservationDTO: CreateReservationDTO = {
        userId: "user123",
        menuId: "menu123",
        menuVariationId: "variation123",
        reservationDate: today,
      }

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        validMenuWithDetails
      )
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        null
      )

      await expect(service.create(createReservationDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.create(createReservationDTO)).rejects.toThrow(
        "Prazo para reservas do dia já expirou (limite: 8:30)"
      )

      vi.useRealTimers()
    })

    it("should allow same-day reservation before 8:30 AM", async () => {
      // Mock current time to be 8:00 AM
      const mockDate = new Date()
      mockDate.setHours(8, 0, 0, 0)
      vi.setSystemTime(mockDate)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const validUser = new User(
        "user123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      const validMenu = new Menu(
        "menu123",
        today,
        DayOfWeek.TUESDAY,
        50,
        "Menu do dia",
        true,
        new Date(),
        new Date()
      )

      const validMenuVariation = new MenuVariation(
        "variation123",
        "menu123",
        VariationType.STANDARD,
        "protein123",
        true
      )

      const validMenuWithDetails = createMenuWithDetails(
        validMenu,
        [new MenuComposition("comp123", "menu123", "item123", "", true, false)],
        [validMenuVariation]
      )

      const createReservationDTO: CreateReservationDTO = {
        userId: "user123",
        menuId: "menu123",
        menuVariationId: "variation123",
        reservationDate: today,
      }

      const createdReservation = new Reservation(
        "reservation123",
        createReservationDTO.userId,
        createReservationDTO.menuId,
        createReservationDTO.menuVariationId,
        createReservationDTO.reservationDate,
        ReservationStatus.ACTIVE,
        false,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(validUser)
      vi.mocked(mockMenuRepository.findWithComposition).mockResolvedValue(
        validMenuWithDetails
      )
      vi.mocked(mockReservationRepository.findByUserAndDate).mockResolvedValue(
        null
      )
      vi.mocked(mockReservationRepository.create).mockResolvedValue(
        createdReservation
      )

      const result = await service.create(createReservationDTO)

      expect(result).toEqual(createdReservation)
      expect(mockReservationRepository.create).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })
})
