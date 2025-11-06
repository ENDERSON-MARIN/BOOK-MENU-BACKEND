import { z } from "zod"
import {
  UserRole,
  UserType,
  UserStatus,
  ReservationStatus,
} from "@/app/modules/lunch-reservation/domain/entities"

// Auth schemas
export const loginSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, "CPF deve ter 11 dígitos")
    .max(11, "CPF deve ter 11 dígitos")
    .regex(/^\d{11}$/, "CPF deve conter apenas números"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
})

// User schemas
export const createUserSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, "CPF deve ter 11 dígitos")
    .max(11, "CPF deve ter 11 dígitos")
    .regex(/^\d{11}$/, "CPF deve conter apenas números"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
  userType: z.nativeEnum(UserType).optional().default(UserType.NAO_FIXO),
  status: z.nativeEnum(UserStatus).optional().default(UserStatus.ATIVO),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres")
    .optional(),
  role: z.nativeEnum(UserRole).optional(),
  userType: z.nativeEnum(UserType).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional(),
})

// Category schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .default(""),
  displayOrder: z
    .number()
    .int()
    .min(0, "Ordem de exibição deve ser um número positivo"),
})

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  displayOrder: z
    .number()
    .int()
    .min(0, "Ordem de exibição deve ser um número positivo")
    .optional(),
  isActive: z.boolean().optional(),
})

// MenuItem schemas
export const createMenuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  description: z
    .string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .default(""),
  categoryId: z.string().uuid("ID da categoria deve ser um UUID válido"),
})

export const updateMenuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  categoryId: z
    .string()
    .uuid("ID da categoria deve ser um UUID válido")
    .optional(),
  isActive: z.boolean().optional(),
})

// Menu schemas
export const createMenuSchema = z.object({
  date: z.string().datetime("Data deve estar no formato ISO"),
  observations: z
    .string()
    .trim()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional()
    .default(""),
  menuItems: z
    .array(
      z.object({
        menuItemId: z.string().uuid("ID do item deve ser um UUID válido"),
        observations: z
          .string()
          .trim()
          .max(500, "Observações devem ter no máximo 500 caracteres")
          .optional()
          .default(""),
        isMainProtein: z.boolean().optional().default(false),
        isAlternativeProtein: z.boolean().optional().default(false),
      })
    )
    .min(1, "Menu deve ter pelo menos um item"),
})

export const updateMenuSchema = z.object({
  observations: z
    .string()
    .trim()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
  isActive: z.boolean().optional(),
  menuItems: z
    .array(
      z.object({
        menuItemId: z.string().uuid("ID do item deve ser um UUID válido"),
        observations: z
          .string()
          .trim()
          .max(500, "Observações devem ter no máximo 500 caracteres")
          .optional()
          .default(""),
        isMainProtein: z.boolean().optional().default(false),
        isAlternativeProtein: z.boolean().optional().default(false),
      })
    )
    .optional(),
})

// Reservation schemas
export const createReservationSchema = z.object({
  menuId: z.string().uuid("ID do menu deve ser um UUID válido"),
  menuVariationId: z.string().uuid("ID da variação deve ser um UUID válido"),
  reservationDate: z
    .string()
    .datetime("Data da reserva deve estar no formato ISO"),
})

export const updateReservationSchema = z.object({
  menuVariationId: z
    .string()
    .uuid("ID da variação deve ser um UUID válido")
    .optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
})

// Common param schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
})

export const dateParamSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
})

export const weekNumberParamSchema = z.object({
  weekNumber: z
    .string()
    .regex(/^\d+$/, "Número da semana deve ser um número")
    .transform(Number),
})

// Query schemas
export const categoryQuerySchema = z.object({
  categoryId: z
    .string()
    .uuid("ID da categoria deve ser um UUID válido")
    .optional(),
})

export const dateRangeQuerySchema = z.object({
  startDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Data inicial deve estar no formato YYYY-MM-DD"
    )
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final deve estar no formato YYYY-MM-DD")
    .optional(),
})
