import { Express } from "express"
import { createServer } from "../src/infrastructure/http/server"
import { applicationRouter } from "../src/infrastructure/http/routes"

// Create Main Router
const appRouter = applicationRouter()

// Create Express app
const app: Express = createServer(appRouter)

// Export for Vercel serverless
export default app
