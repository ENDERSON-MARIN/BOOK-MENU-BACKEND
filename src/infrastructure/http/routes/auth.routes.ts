import { Router, type IRouter } from "express"
import { makeAuthModule } from "@/app/modules/auth"

const authRouter: IRouter = Router()

// Initialize auth module to get auth controller
const { authController } = makeAuthModule()

// Authentication routes
// POST /login - Authenticate user and return token (Requirements: 1.1, 6.1)
// Validation is handled inside the controller using loginSchema
authRouter.post("/login", authController.login.bind(authController))

// POST /logout - Logout user (Requirements: 6.1)
authRouter.post("/logout", authController.logout.bind(authController))

export { authRouter }
