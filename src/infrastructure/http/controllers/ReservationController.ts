import { Request, Response } from "express"
import { ReservationService } from "@/app/modules/lunch-reservation/domain/services/ReservationService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import {
  createReservationSchema,
  updateReservationSchema,
  updateReservationStatusSchema,
  uuidParamSchema,
  dateRangeQuerySchema,
} from "../validators"

// Prisma error type for better error handling
interface PrismaError extends Error {
  code?: string
  meta?: {
    target?: string[]
    cause?: string
  }
}

export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  /**
   * Trata erros do Prisma e retorna resposta HTTP apropriada
   */
  private handlePrismaError(error: PrismaError, res: Response): Response {
    const code = error.code

    switch (code) {
      case "P2002":
        // Unique constraint violation
        return res.status(409).json({
          error: "Já existe um registro com esses dados",
          details: error.meta?.target,
        })

      case "P2003":
        // Foreign key constraint violation
        return res.status(400).json({
          error:
            "Referência inválida. Verifique se os dados relacionados existem",
          details: error.meta?.target,
        })

      case "P2025":
        // Record not found
        return res.status(404).json({
          error: "Registro não encontrado",
        })

      default:
        // Log do erro completo para erros desconhecidos do Prisma
        console.error("[ReservationController] Erro do Prisma não tratado:")
        console.error("[ReservationController] Código:", code)
        console.error("[ReservationController] Mensagem:", error.message)
        console.error("[ReservationController] Meta:", error.meta)
        console.error("[ReservationController] Stack:", error.stack)

        return res.status(500).json({
          error: "Erro interno do servidor",
        })
    }
  }

  /**
   * Trata erros genéricos e retorna resposta HTTP apropriada
   */
  private handleError(error: unknown, res: Response): Response {
    // Log completo do erro
    console.error("[ReservationController] Erro capturado:")
    console.error(
      "[ReservationController] Tipo:",
      error instanceof Error ? error.constructor.name : typeof error
    )
    console.error(
      "[ReservationController] Mensagem:",
      error instanceof Error ? error.message : String(error)
    )
    console.error(
      "[ReservationController] Stack:",
      error instanceof Error ? error.stack : "N/A"
    )

    // Tratamento específico por tipo de erro
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Erro de validação",
        details: error.issues,
      })
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      })
    }

    // Verificar se é erro do Prisma
    if (error && typeof error === "object" && "code" in error) {
      return this.handlePrismaError(error as PrismaError, res)
    }

    // Erro genérico não tratado
    return res.status(500).json({
      error: "Erro interno do servidor",
    })
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const data = createReservationSchema.parse(req.body)
      const reservationDate = new Date(data.reservationDate)
      reservationDate.setUTCHours(0, 0, 0, 0)

      const reservation = await this.reservationService.create({
        userId: req.user.id,
        menuId: data.menuId,
        menuVariationId: data.menuVariationId,
        reservationDate,
      })

      return res.status(201).json(reservation)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async getMyReservations(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const query = dateRangeQuerySchema.parse(req.query)

      let reservations
      if (query.startDate && query.endDate) {
        reservations = await this.reservationService.getReservationsByDateRange(
          new Date(query.startDate),
          new Date(query.endDate)
        )
        // Filter by user
        reservations = reservations.filter((r) => r.userId === req.user!.id)
      } else {
        reservations = await this.reservationService.findByUser(req.user!.id)
      }

      // Apply status filter if provided
      if (query.status) {
        reservations = reservations.filter((r) => r.status === query.status)
      }

      return res.status(200).json(reservations)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async getMyActiveReservations(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const reservations = await this.reservationService.findActiveByUser(
        req.user.id
      )

      return res.status(200).json(reservations)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const { id } = uuidParamSchema.parse(req.params)
      const reservation = await this.reservationService.findById(id)

      // Check if user owns this reservation (unless admin)
      if (req.user.role !== "ADMIN" && reservation.userId !== req.user.id) {
        return res.status(403).json({
          error: "Acesso negado",
        })
      }

      return res.status(200).json(reservation)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const { id } = uuidParamSchema.parse(req.params)
      const data = updateReservationSchema.parse(req.body)

      // LOG DE INVESTIGAÇÃO: Parâmetros da requisição
      console.log(
        "[ReservationController.update] Iniciando atualização de reserva"
      )
      console.log("[ReservationController.update] ID da reserva:", id)
      console.log(
        "[ReservationController.update] Body da requisição:",
        JSON.stringify(data, null, 2)
      )
      console.log(
        "[ReservationController.update] Usuário:",
        req.user.id,
        req.user.name
      )

      // Get reservation to check ownership
      const existingReservation = await this.reservationService.findById(id)

      // Check if user owns this reservation (unless admin)
      if (
        req.user.role !== "ADMIN" &&
        existingReservation.userId !== req.user.id
      ) {
        return res.status(403).json({
          error: "Acesso negado",
        })
      }

      const reservation = await this.reservationService.update(id, data)

      // LOG DE INVESTIGAÇÃO: Sucesso
      console.log(
        "[ReservationController.update] Reserva atualizada com sucesso:",
        reservation.id
      )

      return res.status(200).json(reservation)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async cancel(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const { id } = uuidParamSchema.parse(req.params)

      // Get reservation to check ownership
      const existingReservation = await this.reservationService.findById(id)

      // Check if user owns this reservation (unless admin)
      if (
        req.user.role !== "ADMIN" &&
        existingReservation.userId !== req.user.id
      ) {
        return res.status(403).json({
          error: "Acesso negado",
        })
      }

      const reservation = await this.reservationService.cancel(id)

      return res.status(200).json(reservation)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        })
      }

      const { id } = uuidParamSchema.parse(req.params)

      // Get reservation to check ownership
      const existingReservation = await this.reservationService.findById(id)

      // Check if user owns this reservation (unless admin)
      if (
        req.user.role !== "ADMIN" &&
        existingReservation.userId !== req.user.id
      ) {
        return res.status(403).json({
          error: "Acesso negado",
        })
      }

      // Note: ReservationService doesn't have delete method, using cancel instead
      await this.reservationService.cancel(id)

      return res.status(204).send()
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  // Admin-only endpoints
  async getAllReservations(req: Request, res: Response): Promise<Response> {
    try {
      const query = dateRangeQuerySchema.parse(req.query)

      let reservations
      if (query.startDate && query.endDate) {
        reservations = await this.reservationService.getReservationsByDateRange(
          new Date(query.startDate),
          new Date(query.endDate)
        )
      } else {
        // Note: ReservationService doesn't have getAllReservations, using getReservationsByDateRange with wide range
        const startDate = new Date(2020, 0, 1) // Far past date
        const endDate = new Date(2030, 11, 31) // Far future date
        reservations = await this.reservationService.getReservationsByDateRange(
          startDate,
          endDate
        )
      }

      // Apply status filter if provided
      if (query.status) {
        reservations = reservations.filter((r) => r.status === query.status)
      }

      // Apply userId filter if provided
      if (query.userId) {
        reservations = reservations.filter((r) => r.userId === query.userId)
      }

      return res.status(200).json(reservations)
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async updateReservationStatus(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = uuidParamSchema.parse(req.params)
      const { status } = updateReservationStatusSchema.parse(req.body)

      let reservation
      if (status === "CANCELLED") {
        reservation = await this.reservationService.adminCancelReservation(id)
      } else if (status === "ACTIVE") {
        reservation =
          await this.reservationService.adminReactivateReservation(id)
      } else {
        return res.status(400).json({
          error: "Status inválido",
        })
      }

      return res.status(200).json(reservation)
    } catch (error) {
      return this.handleError(error, res)
    }
  }
}
