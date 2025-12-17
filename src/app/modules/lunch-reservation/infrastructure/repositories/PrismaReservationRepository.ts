// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import {
  Reservation,
  ReservationStatus,
} from "../../domain/entities/Reservation"
import { ReservationRepository } from "../../domain/repositories/ReservationRepository"
import {
  CreateReservationDTO,
  UpdateReservationDTO,
} from "../../dtos/ReservationDTOs"
import { AppError } from "../../../../shared/errors/AppError"

export class PrismaReservationRepository implements ReservationRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserAndDate(
    userId: string,
    date: Date
  ): Promise<Reservation | null> {
    // Normalize date to start of day for comparison (UTC)
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    const reservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservation ? this.toDomain(reservation) : null
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { reservationDate: "desc" },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservations.map(this.toDomain)
  }

  async findByUserId(userId: string): Promise<Reservation[]> {
    return this.findByUser(userId)
  }

  async findByMenuId(menuId: string): Promise<Reservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { menuId },
      orderBy: { createdAt: "desc" },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservations.map(this.toDomain)
  }

  async findByStatus(status: ReservationStatus): Promise<Reservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { status },
      orderBy: { reservationDate: "desc" },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservations.map(this.toDomain)
  }

  async findActiveReservationsForDate(date: Date): Promise<Reservation[]> {
    // Normalize date to start of day for comparison
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const reservations = await this.prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: ReservationStatus.ACTIVE,
      },
      orderBy: { createdAt: "asc" },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservations.map(this.toDomain)
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Reservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { reservationDate: "asc" },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservations.map(this.toDomain)
  }

  async findById(id: string): Promise<Reservation | null> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservation ? this.toDomain(reservation) : null
  }

  async findAll(): Promise<Reservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      orderBy: { reservationDate: "desc" },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return reservations.map(this.toDomain)
  }

  async create(reservationData: CreateReservationDTO): Promise<Reservation> {
    const created = await this.prisma.reservation.create({
      data: {
        userId: reservationData.userId,
        menuId: reservationData.menuId,
        menuVariationId: reservationData.menuVariationId,
        reservationDate: reservationData.reservationDate,
        status: ReservationStatus.ACTIVE,
        isAutoGenerated: reservationData.isAutoGenerated ?? false,
      },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return this.toDomain(created)
  }

  async update(
    id: string,
    reservationData: UpdateReservationDTO
  ): Promise<Reservation> {
    // Validação de foreign key: verificar se menuVariationId existe e pertence ao menu correto
    if (reservationData.menuVariationId !== undefined) {
      // Buscar a reserva atual para obter o menuId
      const currentReservation = await this.prisma.reservation.findUnique({
        where: { id },
        select: { menuId: true },
      })

      if (!currentReservation) {
        throw new AppError("Reserva não encontrada", 404)
      }

      // Verificar se a variação existe na tabela menu_variations
      const menuVariation = await this.prisma.menuVariation.findUnique({
        where: { id: reservationData.menuVariationId },
        select: { id: true, menuId: true },
      })

      if (!menuVariation) {
        throw new AppError("Variação de cardápio não encontrada", 404)
      }

      // Verificar se a variação pertence ao menu da reserva
      if (menuVariation.menuId !== currentReservation.menuId) {
        throw new AppError(
          "A variação de cardápio não pertence ao menu desta reserva",
          404
        )
      }
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        ...(reservationData.menuVariationId !== undefined && {
          menuVariationId: reservationData.menuVariationId,
        }),
        ...(reservationData.status !== undefined && {
          status: reservationData.status,
        }),
      },
      include: {
        menu: {
          include: {
            menuCompositions: {
              include: {
                menuItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            variations: {
              include: {
                proteinItem: true,
              },
            },
          },
        },
        menuVariation: {
          include: {
            proteinItem: true,
          },
        },
        user: true,
      },
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({
      where: { id },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): any {
    const reservation = new Reservation(
      data.id,
      data.userId,
      data.menuId,
      data.menuVariationId,
      data.reservationDate,
      data.status as ReservationStatus,
      data.isAutoGenerated,
      data.createdAt,
      data.updatedAt
    )

    // Preserve Prisma relations if they exist by attaching them to the instance
    if (data.menu) {
      Object.assign(reservation, { menu: data.menu })
    }
    if (data.menuVariation) {
      Object.assign(reservation, { menuVariation: data.menuVariation })
    }
    if (data.user) {
      Object.assign(reservation, { user: data.user })
    }

    return reservation
  }
}
