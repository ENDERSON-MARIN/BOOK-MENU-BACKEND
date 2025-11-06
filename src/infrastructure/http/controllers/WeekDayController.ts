import { Request, Response } from "express"
import { WeekDayManagementService } from "@/app/modules/lunch-reservation/domain/services/WeekDayManagementService"
import { AppError } from "@/app/shared"

export class WeekDayController {
  constructor(private weekDayManagementService: WeekDayManagementService) {}

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const weekDays = await this.weekDayManagementService.findAll()

      return res.status(200).json(weekDays)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
    }
  }

  async getWorkingDays(req: Request, res: Response): Promise<Response> {
    try {
      const workingDays = await this.weekDayManagementService.getBusinessDays()

      return res.status(200).json(workingDays)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
    }
  }
}
