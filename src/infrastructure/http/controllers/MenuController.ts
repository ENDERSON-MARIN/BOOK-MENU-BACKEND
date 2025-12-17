import { Request, Response } from "express"
import { MenuManagementService } from "@/app/modules/lunch-reservation/domain/services/MenuManagementService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import {
  createMenuSchema,
  updateMenuSchema,
  uuidParamSchema,
  dateParamSchema,
  weekNumberParamSchema,
  dateRangeQuerySchema,
} from "../validators"

export class MenuController {
  constructor(private menuManagementService: MenuManagementService) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = createMenuSchema.parse(req.body)
      const menu = await this.menuManagementService.create({
        date: new Date(data.date),
        observations: data.observations,
        menuItems: data.menuItems,
      })

      return res.status(201).json(menu)
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

  async getByDate(req: Request, res: Response): Promise<Response> {
    try {
      const { date } = dateParamSchema.parse(req.params)

      // Normalize date to avoid timezone issues
      // Parse YYYY-MM-DD and create date at midnight UTC
      const [year, month, day] = date.split("-").map(Number)
      const normalizedDate = new Date(
        Date.UTC(year, month - 1, day, 0, 0, 0, 0)
      )

      const menu =
        await this.menuManagementService.findWithCompositionByDate(
          normalizedDate
        )

      if (!menu) {
        return res.status(404).json({
          error: "Cardápio não encontrado para esta data",
        })
      }

      return res.status(200).json(menu)
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

  async getByWeekNumber(req: Request, res: Response): Promise<Response> {
    try {
      const { weekNumber } = weekNumberParamSchema.parse(req.params)
      const menus =
        await this.menuManagementService.findByWeekNumber(weekNumber)

      return res.status(200).json(menus)
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

  async getByDateRange(req: Request, res: Response): Promise<Response> {
    try {
      const query = dateRangeQuerySchema.parse(req.query)

      if (!query.startDate || !query.endDate) {
        return res.status(400).json({
          error: "Data inicial e final são obrigatórias",
        })
      }

      const menus = await this.menuManagementService.findByDateRange(
        new Date(query.startDate),
        new Date(query.endDate)
      )

      return res.status(200).json(menus)
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

  async getAvailableMenus(req: Request, res: Response): Promise<Response> {
    try {
      const query = dateRangeQuerySchema.parse(req.query)

      // If no date range provided, get menus for next 30 days
      const startDate = query.startDate ? new Date(query.startDate) : new Date()
      const endDate = query.endDate
        ? new Date(query.endDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const menus = await this.menuManagementService.getAvailableMenus(
        startDate,
        endDate
      )

      return res.status(200).json(menus)
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

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = uuidParamSchema.parse(req.params)
      const menu = await this.menuManagementService.findWithComposition(id)

      return res.status(200).json(menu)
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
      const { id } = uuidParamSchema.parse(req.params)
      const data = updateMenuSchema.parse(req.body)

      const menu = await this.menuManagementService.update(id, data)

      return res.status(200).json(menu)
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
      const { id } = uuidParamSchema.parse(req.params)
      await this.menuManagementService.delete(id)

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
}
