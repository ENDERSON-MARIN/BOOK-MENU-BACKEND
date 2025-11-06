import { Request, Response } from "express"
import { ReservationService } from "@/app/modules/lunch-reservation/domain/services/ReservationService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import {
  createReservationSchema,
  updateReservationSchema,
  uuidParamSchema,
  dateRangeQuerySchema,
} from "../validators"

export class ReservationController {
  constructor(private reservationService: ReservationService) {}

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
      throw error
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

      return res.status(200).json(reservations)
    } catch (error) {
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
      throw error
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
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
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
      throw error
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

      return res.status(200).json(reservation)
    } catch (error) {
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
      throw error
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
      throw error
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
      throw error
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

      return res.status(200).json(reservations)
    } catch (error) {
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
      throw error
    }
  }
}
