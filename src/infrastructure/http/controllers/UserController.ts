import { Request, Response } from "express"
import { UserManagementService } from "@/app/modules/lunch-reservation/domain/services/UserManagementService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import {
  createUserSchema,
  updateUserSchema,
  uuidParamSchema,
} from "../validators"

export class UserController {
  constructor(private userManagementService: UserManagementService) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = createUserSchema.parse(req.body)
      const user = await this.userManagementService.create(data)

      // Remove password from response
      const { password, ...userResponse } = user

      return res.status(201).json(userResponse)
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
      const includeInactive = req.query.includeInactive === "true"
      const users = await this.userManagementService.findAll(includeInactive)

      // Remove passwords from response
      const usersResponse = users.map(({ password, ...user }) => user)

      return res.status(200).json(usersResponse)
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
      const user = await this.userManagementService.findById(id)

      // Remove password from response
      const { password, ...userResponse } = user

      return res.status(200).json(userResponse)
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
      const data = updateUserSchema.parse(req.body)

      const user = await this.userManagementService.update(id, data)

      // Remove password from response
      const { password, ...userResponse } = user

      return res.status(200).json(userResponse)
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
      await this.userManagementService.delete(id)

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
