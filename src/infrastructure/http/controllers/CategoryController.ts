import { Request, Response } from "express"
import { CategoryManagementService } from "@/app/modules/lunch-reservation/domain/services/CategoryManagementService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import {
  createCategorySchema,
  updateCategorySchema,
  uuidParamSchema,
} from "../validators"

export class CategoryController {
  constructor(private categoryManagementService: CategoryManagementService) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = createCategorySchema.parse(req.body)
      const category = await this.categoryManagementService.create(data)

      return res.status(201).json(category)
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

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.categoryManagementService.findAll()

      return res.status(200).json(categories)
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
      const { id } = uuidParamSchema.parse(req.params)
      const category = await this.categoryManagementService.findById(id)

      return res.status(200).json(category)
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
      const data = updateCategorySchema.parse(req.body)

      const category = await this.categoryManagementService.update(id, data)

      return res.status(200).json(category)
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
      await this.categoryManagementService.delete(id)

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
