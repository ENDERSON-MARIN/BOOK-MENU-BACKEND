import { Reservation, ReservationStatus } from '../entities/Reservation';
import { CreateReservationDTO, UpdateReservationDTO } from '../../dtos/ReservationDTOs';

export interface ReservationRepository {
  findByUserAndDate(userId: string, date: Date): Promise<Reservation | null>;
  findByUser(userId: string): Promise<Reservation[]>;
  findByUserId(userId: string): Promise<Reservation[]>;
  findByMenuId(menuId: string): Promise<Reservation[]>;
  findByStatus(status: ReservationStatus): Promise<Reservation[]>;
  findActiveReservationsForDate(date: Date): Promise<Reservation[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]>;
  findById(id: string): Promise<Reservation | null>;
  findAll(): Promise<Reservation[]>;
  create(reservationData: CreateReservationDTO): Promise<Reservation>;
  update(id: string, reservationData: UpdateReservationDTO): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
