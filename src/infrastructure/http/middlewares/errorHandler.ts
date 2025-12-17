/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express"
import { AppError, devError } from "../../../app/shared"

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  devError("Internal server error:", err)

  return res.status(500).json({
    error: "Internal server error",
  })
}
