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

  async logout(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      message: "Logout realizado com sucesso",
    })
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({
          error: "Token de atualização não fornecido",
        })
      }

      // Validate the refresh token (in this simple implementation, we just validate and generate a new token)
      const decoded = await this.authService.validateToken(refreshToken)

      // Generate a new token with the same user data
      const user = await this.authService["userRepository"].findByCpf(
        decoded.cpf
      )

      if (!user) {
        return res.status(401).json({
          error: "Token inválido",
        })
      }

      const newToken = this.authService.generateToken(user)

      return res.status(200).json({
        token: newToken,
        user: {
          id: user.id,
          cpf: user.cpf,
          name: user.name,
          role: user.role,
        },
      })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      return res.status(401).json({
        error: "Token inválido",
      })
    }
  }
}
