import { Reservation } from "../entities/Reservation"
import { User } from "../entities/User"
import { ReservationRepository } from "../repositories/ReservationRepository"
import { MenuRepository, MenuWithDetails } from "../repositories/MenuRepository"
import { UserRepository } from "../repositories/UserRepository"
import {
  CreateReservationDTO,
  UpdateReservationDTO,
} from "../../dtos/ReservationDTOs"
import { AppError } from "@/app/shared"

export interface ReservationWithDetails extends Reservation {
  menu?: MenuWithDetails
  user?: User
}

export class ReservationService {
  private readonly CUTOFF_HOUR = 8
  private readonly CUTOFF_MINUTE = 30

  constructor(
    private reservationRepository: ReservationRepository,
    private menuRepository: MenuRepository,
    private userRepository: UserRepository
  ) {}

  async create(reservationData: CreateReservationDTO): Promise<Reservation> {
    // Validate user exists and is active
    const user = await this.userRepository.findById(reservationData.userId)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }
    if (!user.isActive()) {
      throw new AppError("Usuário inativo não pode fazer reservas", 400)
    }

    // Validate menu exists and is active
    const menu = await this.menuRepository.findWithComposition(
      reservationData.menuId
    )
    if (!menu) {
      throw new AppError("Cardápio não encontrado", 404)
    }
    if (!menu.isActive) {
      throw new AppError("Cardápio não está disponível", 400)
    }

    // Validate reservation date is not in the past
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const reservationDate = new Date(reservationData.reservationDate)
    reservationDate.setUTCHours(0, 0, 0, 0)

    if (reservationDate < today) {
      throw new AppError("Não é possível fazer reserva para data passada", 400)
    }

    // Validate reservation date matches menu date
    const menuDate = new Date(menu.date)
    menuDate.setUTCHours(0, 0, 0, 0)
    if (reservationDate.getTime() !== menuDate.getTime()) {
      throw new AppError(
        "Data da reserva deve corresponder à data do cardápio",
        400
      )
    }

    // Check if user already has a reservation for this date
    const existingReservation =
      await this.reservationRepository.findByUserAndDate(
        reservationData.userId,
        reservationData.reservationDate
      )
    if (existingReservation && existingReservation.isActive()) {
      throw new AppError("Usuário já possui reserva ativa para esta data", 409)
    }

    // Validação explícita: verificar se variations existe e é um array
    if (!menu.variations || !Array.isArray(menu.variations)) {
      throw new AppError("Cardápio não possui variações disponíveis", 400)
    }

    // Validate menu variation exists
    const menuVariation = menu.variations.find(
      (v) => v.id === reservationData.menuVariationId
    )
    if (!menuVariation) {
      throw new AppError(
        `Variação de cardápio com ID ${reservationData.menuVariationId} não encontrada no cardápio`,
        404
      )
    }

    // Validação: verificar se a variação pertence ao menu correto
    if (menuVariation.menuId !== reservationData.menuId) {
      throw new AppError(
        "A variação selecionada não pertence ao cardápio especificado",
        400
      )
    }

    // Check cutoff time for same-day reservations
    if (reservationDate.getTime() === today.getTime()) {
      if (!this.isWithinCutoffTime(new Date())) {
        throw new AppError(
          "Prazo para reservas do dia já expirou (limite: 8:30)",
          400
        )
      }
    }

    const createdReservation =
      await this.reservationRepository.create(reservationData)
    return createdReservation
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id)
    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404)
    }
    return reservation
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    // Validate user exists
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    return await this.reservationRepository.findByUser(userId)
  }

  async findActiveByUser(userId: string): Promise<Reservation[]> {
    const userReservations = await this.findByUser(userId)
    return userReservations.filter((reservation) => reservation.isActive())
  }

  async findByUserAndDate(
    userId: string,
    date: Date
  ): Promise<Reservation | null> {
    return await this.reservationRepository.findByUserAndDate(userId, date)
  }

  async update(
    id: string,
    reservationData: UpdateReservationDTO
  ): Promise<Reservation> {
    // LOG DE INVESTIGAÇÃO: Início do método
    console.log("[ReservationService.update] Iniciando atualização")
    console.log("[ReservationService.update] ID:", id)
    console.log(
      "[ReservationService.update] Dados:",
      JSON.stringify(reservationData, null, 2)
    )

    const existingReservation = await this.reservationRepository.findById(id)
    if (!existingReservation) {
      console.log("[ReservationService.update] Reserva não encontrada:", id)
      throw new AppError("Reserva não encontrada", 404)
    }

    // LOG DE INVESTIGAÇÃO: Reserva encontrada
    console.log("[ReservationService.update] Reserva encontrada:")
    console.log(
      "[ReservationService.update] - Status:",
      existingReservation.status
    )
    console.log(
      "[ReservationService.update] - MenuId:",
      existingReservation.menuId
    )
    console.log(
      "[ReservationService.update] - MenuVariationId atual:",
      existingReservation.menuVariationId
    )
    console.log(
      "[ReservationService.update] - Data da reserva:",
      existingReservation.reservationDate
    )

    // Check if reservation can be modified
    console.log(
      "[ReservationService.update] Verificando se pode ser modificada..."
    )
    if (!existingReservation.canBeModified()) {
      console.log("[ReservationService.update] Reserva não pode ser modificada")
      throw new AppError(
        "Reserva não pode ser alterada (prazo expirado ou cancelada)",
        400
      )
    }
    console.log("[ReservationService.update] Reserva pode ser modificada ✓")

    // If changing menu variation, validate it exists
    if (reservationData.menuVariationId) {
      console.log(
        "[ReservationService.update] Validando nova variação:",
        reservationData.menuVariationId
      )

      const menu = await this.menuRepository.findWithComposition(
        existingReservation.menuId
      )

      // LOG DE INVESTIGAÇÃO: Menu encontrado
      console.log(
        "[ReservationService.update] Menu encontrado:",
        menu ? "SIM" : "NÃO"
      )
      if (menu) {
        console.log("[ReservationService.update] - Menu ID:", menu.id)
        console.log(
          "[ReservationService.update] - Menu variations:",
          menu.variations ? menu.variations.length : "undefined"
        )
        if (menu.variations) {
          console.log(
            "[ReservationService.update] - Variations IDs:",
            menu.variations.map((v) => v.id)
          )
        }
      }

      if (!menu) {
        console.log("[ReservationService.update] Cardápio não encontrado")
        throw new AppError("Cardápio da reserva não encontrado", 404)
      }

      // Validação explícita: verificar se variations existe e é um array
      if (!menu.variations || !Array.isArray(menu.variations)) {
        console.log(
          "[ReservationService.update] Menu não possui variações disponíveis"
        )
        throw new AppError("Cardápio não possui variações disponíveis", 400)
      }

      const menuVariation = menu.variations.find(
        (v) => v.id === reservationData.menuVariationId
      )

      // LOG DE INVESTIGAÇÃO: Variação encontrada
      console.log(
        "[ReservationService.update] Variação encontrada:",
        menuVariation ? "SIM" : "NÃO"
      )
      if (menuVariation) {
        console.log(
          "[ReservationService.update] - Variation ID:",
          menuVariation.id
        )
      }

      if (!menuVariation) {
        console.log(
          "[ReservationService.update] Variação não encontrada no menu"
        )
        throw new AppError(
          `Variação de cardápio com ID ${reservationData.menuVariationId} não encontrada no cardápio da reserva`,
          404
        )
      }

      // Validação: verificar se a variação pertence ao menu correto
      if (menuVariation.menuId !== existingReservation.menuId) {
        console.log(
          "[ReservationService.update] Variação não pertence ao menu da reserva"
        )
        throw new AppError(
          "A variação selecionada não pertence ao cardápio desta reserva",
          400
        )
      }

      console.log("[ReservationService.update] Variação validada ✓")
    }

    console.log("[ReservationService.update] Chamando repository.update...")
    const updatedReservation = await this.reservationRepository.update(
      id,
      reservationData
    )
    console.log("[ReservationService.update] Atualização concluída com sucesso")
    return updatedReservation
  }

  async cancel(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id)
    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404)
    }

    // Check if reservation can be cancelled
    if (!reservation.canBeModified()) {
      throw new AppError("Reserva não pode ser cancelada (prazo expirado)", 400)
    }

    if (reservation.isCancelled()) {
      throw new AppError("Reserva já está cancelada", 400)
    }

    // Cancel reservation using entity method
    reservation.cancel()

    // Update in repository
    const updatedReservation = await this.reservationRepository.update(id, {
      status: reservation.status,
    })

    return updatedReservation
  }

  async reactivate(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id)
    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404)
    }

    if (!reservation.isCancelled()) {
      throw new AppError("Apenas reservas canceladas podem ser reativadas", 400)
    }

    // Check if reservation can be reactivated (within cutoff time)
    if (!this.isWithinCutoffTime(new Date(), reservation.reservationDate)) {
      throw new AppError(
        "Prazo para reativar reserva já expirou (limite: 8:30)",
        400
      )
    }

    // Validate menu is still active
    const menu = await this.menuRepository.findById(reservation.menuId)
    if (!menu || !menu.isActive) {
      throw new AppError("Cardápio não está mais disponível", 400)
    }

    // Reactivate reservation using entity method
    reservation.activate()

    // Update in repository
    const updatedReservation = await this.reservationRepository.update(id, {
      status: reservation.status,
    })

    return updatedReservation
  }

  async adminCancelReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id)
    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404)
    }

    if (reservation.isCancelled()) {
      throw new AppError("Reserva já está cancelada", 400)
    }

    // Cancel reservation using entity method
    reservation.cancel()

    // Update in repository
    const updatedReservation = await this.reservationRepository.update(id, {
      status: reservation.status,
    })

    return updatedReservation
  }

  async adminReactivateReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id)
    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404)
    }

    if (!reservation.isCancelled()) {
      throw new AppError("Apenas reservas canceladas podem ser reativadas", 400)
    }

    // Admin can reactivate without cutoff time validation
    // Reactivate reservation using entity method
    reservation.activate()

    // Update in repository
    const updatedReservation = await this.reservationRepository.update(id, {
      status: reservation.status,
    })

    return updatedReservation
  }

  async changeMenuVariation(
    id: string,
    newMenuVariationId: string
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id)
    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404)
    }

    // Check if reservation can be modified
    if (!reservation.canBeModified()) {
      throw new AppError(
        "Reserva não pode ser alterada (prazo expirado ou cancelada)",
        400
      )
    }

    // Validate new menu variation exists
    const menu = await this.menuRepository.findWithComposition(
      reservation.menuId
    )
    if (!menu) {
      throw new AppError("Cardápio da reserva não encontrado", 404)
    }

    // Validação explícita: verificar se variations existe e é um array
    if (!menu.variations || !Array.isArray(menu.variations)) {
      throw new AppError("Cardápio não possui variações disponíveis", 400)
    }

    const newMenuVariation = menu.variations.find(
      (v) => v.id === newMenuVariationId
    )
    if (!newMenuVariation) {
      throw new AppError(
        `Variação de cardápio com ID ${newMenuVariationId} não encontrada no cardápio da reserva`,
        404
      )
    }

    // Validação: verificar se a variação pertence ao menu correto
    if (newMenuVariation.menuId !== reservation.menuId) {
      throw new AppError(
        "A variação selecionada não pertence ao cardápio desta reserva",
        400
      )
    }

    // Update menu variation
    const updatedReservation = await this.reservationRepository.update(id, {
      menuVariationId: newMenuVariationId,
    })

    return updatedReservation
  }

  async getReservationsForDate(date: Date): Promise<Reservation[]> {
    return await this.reservationRepository.findActiveReservationsForDate(date)
  }

  async getReservationsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Reservation[]> {
    return await this.reservationRepository.findByDateRange(startDate, endDate)
  }

  async getUserUpcomingReservations(userId: string): Promise<Reservation[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const userReservations = await this.findActiveByUser(userId)

    return userReservations
      .filter((reservation) => {
        const reservationDate = new Date(reservation.reservationDate)
        reservationDate.setHours(0, 0, 0, 0)
        return reservationDate >= today
      })
      .sort((a, b) => a.reservationDate.getTime() - b.reservationDate.getTime())
  }

  async getUserPastReservations(userId: string): Promise<Reservation[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const userReservations = await this.findByUser(userId)

    return userReservations
      .filter((reservation) => {
        const reservationDate = new Date(reservation.reservationDate)
        reservationDate.setHours(0, 0, 0, 0)
        return reservationDate < today
      })
      .sort((a, b) => b.reservationDate.getTime() - a.reservationDate.getTime())
  }

  async getReservationStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalReservations: number
    activeReservations: number
    cancelledReservations: number
    autoGeneratedReservations: number
    manualReservations: number
  }> {
    const reservations = await this.reservationRepository.findByDateRange(
      startDate,
      endDate
    )

    return {
      totalReservations: reservations.length,
      activeReservations: reservations.filter((r) => r.isActive()).length,
      cancelledReservations: reservations.filter((r) => r.isCancelled()).length,
      autoGeneratedReservations: reservations.filter((r) => r.isAutoGenerated)
        .length,
      manualReservations: reservations.filter((r) => !r.isAutoGenerated).length,
    }
  }

  private isWithinCutoffTime(
    currentTime: Date,
    reservationDate?: Date
  ): boolean {
    const targetDate = reservationDate || currentTime
    const cutoffTime = new Date(targetDate)
    cutoffTime.setHours(this.CUTOFF_HOUR, this.CUTOFF_MINUTE, 0, 0)

    return currentTime < cutoffTime
  }

  async canUserMakeReservation(
    userId: string,
    menuId: string,
    reservationDate: Date
  ): Promise<{
    canReserve: boolean
    reason?: string
  }> {
    try {
      // Validate user
      const user = await this.userRepository.findById(userId)
      if (!user) {
        return { canReserve: false, reason: "Usuário não encontrado" }
      }
      if (!user.isActive()) {
        return { canReserve: false, reason: "Usuário inativo" }
      }

      // Validate menu
      const menu = await this.menuRepository.findById(menuId)
      if (!menu) {
        return { canReserve: false, reason: "Cardápio não encontrado" }
      }
      if (!menu.isActive) {
        return { canReserve: false, reason: "Cardápio não disponível" }
      }

      // Check date
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const targetDate = new Date(reservationDate)
      targetDate.setHours(0, 0, 0, 0)

      if (targetDate < today) {
        return { canReserve: false, reason: "Data já passou" }
      }

      // Check cutoff time for same-day reservations
      if (targetDate.getTime() === today.getTime()) {
        if (!this.isWithinCutoffTime(new Date())) {
          return { canReserve: false, reason: "Prazo expirado (limite: 8:30)" }
        }
      }

      // Check existing reservation
      const existingReservation =
        await this.reservationRepository.findByUserAndDate(
          userId,
          reservationDate
        )
      if (existingReservation && existingReservation.isActive()) {
        return { canReserve: false, reason: "Já possui reserva para esta data" }
      }

      return { canReserve: true }
    } catch {
      return { canReserve: false, reason: "Erro interno do sistema" }
    }
  }
}
