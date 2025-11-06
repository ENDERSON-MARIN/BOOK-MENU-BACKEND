import express from "express"
import cors from "cors"
import { applicationRouter } from "../../../src/infrastructure/http/routes"
import { errorHandler } from "../../../src/infrastructure/http/middlewares/errorHandler"

export const app = express()

app.use(cors())
app.use(express.json())
app.use("/api", applicationRouter())
app.use(errorHandler)
