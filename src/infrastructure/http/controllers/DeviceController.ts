import { Request, Response } from "express"
import { DeviceService } from "@/app/modules/device"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import { createDeviceSchema, deviceIdParamSchema } from "../validators"

export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = createDeviceSchema.parse(req.body)
      const device = await this.deviceService.create(data)
      return res.status(201).json(device)
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

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const devices = await this.deviceService.findAll()
      return res.status(200).json(devices)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
    }
  }

  async toggleStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = deviceIdParamSchema.parse(req.params)
      const device = await this.deviceService.toggleStatus(id)
      return res.status(200).json(device)
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
}
