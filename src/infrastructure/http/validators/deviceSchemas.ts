import { z } from "zod"

export const createDeviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  mac: z
    .string()
    .trim()
    .min(1, "MAC address is required")
    .max(17, "MAC address must be at most 17 characters"),
})

export const deviceIdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
})
