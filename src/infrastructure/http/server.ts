import express, { Express } from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { errorHandler } from "./middlewares"
import { swaggerDocument } from "@/config/swagger"

/**
 * Creates and configures the Express server with middleware
 * @param appRouter The main application router with all routes configured
 * @returns Configured Express application instance
 */
export function createServer(appRouter: express.Router): Express {
  const app = express()

  // Middleware setup
  app.use(cors())
  app.use(express.json())

  // Swagger Documentation
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #303b93; }
    `,
      customSiteTitle: "Device Management API Documentation",
    })
  )

  // API Routes
  app.use("/api", appRouter)

  // Error Handler
  app.use(errorHandler)

  return app
}
