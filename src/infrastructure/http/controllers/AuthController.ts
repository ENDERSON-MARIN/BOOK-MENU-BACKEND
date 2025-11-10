import { Request, Response } from "express"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import { AuthService } from "@/app/modules/auth/AuthService"
import { loginSchema } from "../validators/authSchemas"

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const data = loginSchema.parse(req.body)
      const result = await this.authService.login(data.cpf, data.password)

      return res.status(200).json(result)
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
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

  async logout(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      message: "Logout realizado com sucesso",
    })
  }
}
