import { Router, type Router as ExpressRouter } from "express"
import { makeLunchReservationModule } from "@/app/modules/lunch-reservation"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireAdmin, requireUser } from "../middlewares/roleMiddleware"

const lunchReservationRouter: ExpressRouter = Router()

// Initialize lunch reservation module
const {
  authController,
  userController,
  categoryController,
  menuItemController,
  weekDayController,
  menuController,
  reservationController,
  authenticationService,
} = makeLunchReservationModule()

// Create auth middleware instance
const authMiddleware = createAuthMiddleware(authenticationService)

// Authentication routes (public)
lunchReservationRouter.post(
  "/auth/login",
  authController.login.bind(authController)
)
lunchReservationRouter.post(
  "/auth/logout",
  authController.logout.bind(authController)
)
lunchReservationRouter.post(
  "/auth/refresh",
  authController.refresh.bind(authController)
)

// User management routes (ADMIN only)
lunchReservationRouter.post(
  "/users",
  authMiddleware,
  requireAdmin(),
  userController.create.bind(userController)
)
lunchReservationRouter.get(
  "/users",
  authMiddleware,
  requireAdmin(),
  userController.getAll.bind(userController)
)
lunchReservationRouter.get(
  "/users/:id",
  authMiddleware,
  requireAdmin(),
  userController.getById.bind(userController)
)
lunchReservationRouter.put(
  "/users/:id",
  authMiddleware,
  requireAdmin(),
  userController.update.bind(userController)
)
lunchReservationRouter.delete(
  "/users/:id",
  authMiddleware,
  requireAdmin(),
  userController.delete.bind(userController)
)

// Category management routes (ADMIN only)
lunchReservationRouter.post(
  "/categories",
  authMiddleware,
  requireAdmin(),
  categoryController.create.bind(categoryController)
)
lunchReservationRouter.get(
  "/categories",
  authMiddleware,
  requireAdmin(),
  categoryController.getAll.bind(categoryController)
)
lunchReservationRouter.get(
  "/categories/:id",
  authMiddleware,
  requireAdmin(),
  categoryController.getById.bind(categoryController)
)
lunchReservationRouter.put(
  "/categories/:id",
  authMiddleware,
  requireAdmin(),
  categoryController.update.bind(categoryController)
)
lunchReservationRouter.delete(
  "/categories/:id",
  authMiddleware,
  requireAdmin(),
  categoryController.delete.bind(categoryController)
)
lunchReservationRouter.patch(
  "/categories/:id/toggle-active",
  authMiddleware,
  requireAdmin(),
  categoryController.toggleActive.bind(categoryController)
)

// Menu item management routes (ADMIN only)
lunchReservationRouter.post(
  "/menu-items",
  authMiddleware,
  requireAdmin(),
  menuItemController.create.bind(menuItemController)
)
lunchReservationRouter.get(
  "/menu-items",
  authMiddleware,
  requireUser(),
  menuItemController.getAll.bind(menuItemController)
)
lunchReservationRouter.get(
  "/menu-items/active",
  authMiddleware,
  requireUser(),
  menuItemController.getActive.bind(menuItemController)
)
lunchReservationRouter.get(
  "/menu-items/:id",
  authMiddleware,
  requireAdmin(),
  menuItemController.getById.bind(menuItemController)
)
lunchReservationRouter.put(
  "/menu-items/:id",
  authMiddleware,
  requireAdmin(),
  menuItemController.update.bind(menuItemController)
)
lunchReservationRouter.delete(
  "/menu-items/:id",
  authMiddleware,
  requireAdmin(),
  menuItemController.delete.bind(menuItemController)
)

// Week day routes (read-only for all authenticated users)
lunchReservationRouter.get(
  "/week-days",
  authMiddleware,
  requireUser(),
  weekDayController.getAll.bind(weekDayController)
)
lunchReservationRouter.get(
  "/week-days/working",
  authMiddleware,
  requireUser(),
  weekDayController.getWorkingDays.bind(weekDayController)
)

// Menu management routes
// ADMIN: full CRUD access
lunchReservationRouter.post(
  "/menus",
  authMiddleware,
  requireAdmin(),
  menuController.create.bind(menuController)
)
lunchReservationRouter.put(
  "/menus/:id",
  authMiddleware,
  requireAdmin(),
  menuController.update.bind(menuController)
)
lunchReservationRouter.delete(
  "/menus/:id",
  authMiddleware,
  requireAdmin(),
  menuController.delete.bind(menuController)
)

// USER: read-only access to available menus
lunchReservationRouter.get(
  "/menus",
  authMiddleware,
  requireUser(),
  menuController.getAvailableMenus.bind(menuController)
)
lunchReservationRouter.get(
  "/menus/:id",
  authMiddleware,
  requireUser(),
  menuController.getById.bind(menuController)
)
lunchReservationRouter.get(
  "/menus/date/:date",
  authMiddleware,
  requireUser(),
  menuController.getByDate.bind(menuController)
)
lunchReservationRouter.get(
  "/menus/week/:weekNumber",
  authMiddleware,
  requireUser(),
  menuController.getByWeekNumber.bind(menuController)
)

// Reservation routes (USER access)
lunchReservationRouter.post(
  "/reservations",
  authMiddleware,
  requireUser(),
  reservationController.create.bind(reservationController)
)
lunchReservationRouter.get(
  "/reservations",
  authMiddleware,
  requireUser(),
  reservationController.getMyReservations.bind(reservationController)
)
lunchReservationRouter.get(
  "/reservations/active",
  authMiddleware,
  requireUser(),
  reservationController.getMyActiveReservations.bind(reservationController)
)
lunchReservationRouter.get(
  "/reservations/:id",
  authMiddleware,
  requireUser(),
  reservationController.getById.bind(reservationController)
)
lunchReservationRouter.put(
  "/reservations/:id",
  authMiddleware,
  requireUser(),
  reservationController.update.bind(reservationController)
)
lunchReservationRouter.delete(
  "/reservations/:id",
  authMiddleware,
  requireUser(),
  reservationController.cancel.bind(reservationController)
)

// Admin reservation routes (ADMIN access)
lunchReservationRouter.get(
  "/admin/reservations",
  authMiddleware,
  requireAdmin(),
  reservationController.getAllReservations.bind(reservationController)
)
// Note: Using getAllReservations with query parameters for date filtering
// The controller handles date range filtering via query parameters

export { lunchReservationRouter }
