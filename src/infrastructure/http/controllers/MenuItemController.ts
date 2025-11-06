import { Request, Response } from "express"
import { MenuItemManagementService } from "@/app/modules/lunch-reservation/domain/services/MenuItemManagementService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  uuidParamSchema,
  categoryQuerySchema,
} from "../validators"

export class MenuItemController {
  constructor(private menuItemManagementService: MenuItemManagementService) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = createMenuItemSchema.parse(req.body)
      const menuItem = await this.menuItemManagementService.create(data)

      return res.status(201).json(menuItem)
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
      const query = categoryQuerySchema.parse(req.query)

      let menuItems
      if (query.categoryId) {
        menuItems = await this.menuItemManagementService.findByCategory(
          query.categoryId
        )
      } else {
        menuItems = await this.menuItemManagementService.findAll()
      }

      return res.status(200).json(menuItems)
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

  async getActive(req: Request, res: Response): Promise<Response> {
    try {
      const query = categoryQuerySchema.parse(req.query)

      let menuItems
      if (query.categoryId) {
        menuItems = await this.menuItemManagementService.findActiveByCategoryId(
          query.categoryId
        )
      } else {
        menuItems = await this.menuItemManagementService.findActive()
      }

      return res.status(200).json(menuItems)
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
      const menuItem = await this.menuItemManagementService.findById(id)

      return res.status(200).json(menuItem)
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
      const data = updateMenuItemSchema.parse(req.body)

      const menuItem = await this.menuItemManagementService.update(id, data)

      return res.status(200).json(menuItem)
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
      await this.menuItemManagementService.delete(id)

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
