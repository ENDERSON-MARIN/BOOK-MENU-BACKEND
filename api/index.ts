import { Express } from "express"
import { createServer } from "../dist/infrastructure/http/server"
import { applicationRouter } from "../dist/infrastructure/http/routes"

// Create Main Router
const appRouter = applicationRouter()

// Create Express app
const app: Express = createServer(appRouter)

// Export for Vercel serverless
export default app
