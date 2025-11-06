import { describe, it, expect } from "vitest"
import { AppError } from "../../../../src/app/shared"

describe("AppError", () => {
  it("should create error with message and default status code", () => {
    const error = new AppError("Test error")

    expect(error.message).toBe("Test error")
    expect(error.statusCode).toBe(400)
    expect(error.name).toBe("AppError")
  })

  it("should create error with custom status code", () => {
    const error = new AppError("Not found", 404)

    expect(error.message).toBe("Not found")
    expect(error.statusCode).toBe(404)
  })

  it("should be instance of Error", () => {
    const error = new AppError("Test error")

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })

  it("should have stack trace", () => {
    const error = new AppError("Test error")

    expect(error.stack).toBeDefined()
    expect(error.stack).toContain("AppError")
  })

  it("should capture correct stack trace", () => {
    function throwError() {
      throw new AppError("Test error", 500)
    }

    try {
      throwError()
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.stack).toContain("throwError")
      }
    }
  })

  describe("Common HTTP Status Codes", () => {
    it("should handle 400 Bad Request", () => {
      const error = new AppError("Bad request", 400)
      expect(error.statusCode).toBe(400)
    })

    it("should handle 401 Unauthorized", () => {
      const error = new AppError("Unauthorized", 401)
      expect(error.statusCode).toBe(401)
    })

    it("should handle 403 Forbidden", () => {
      const error = new AppError("Forbidden", 403)
      expect(error.statusCode).toBe(403)
    })

    it("should handle 404 Not Found", () => {
      const error = new AppError("Not found", 404)
      expect(error.statusCode).toBe(404)
    })

    it("should handle 409 Conflict", () => {
      const error = new AppError("Conflict", 409)
      expect(error.statusCode).toBe(409)
    })

    it("should handle 500 Internal Server Error", () => {
      const error = new AppError("Internal server error", 500)
      expect(error.statusCode).toBe(500)
    })
  })
})
