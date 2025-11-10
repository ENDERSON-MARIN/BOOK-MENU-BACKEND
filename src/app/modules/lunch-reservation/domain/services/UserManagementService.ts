import { User, UserRole, UserType, UserStatus } from "../entities/User"
import { UserRepository } from "../repositories/UserRepository"
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/UserDTOs"
import { AppError } from "@/app/shared"
import { AuthService } from "@/app/modules/auth/AuthService"

export class UserManagementService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async create(userData: CreateUserDTO): Promise<User> {
    // Validate CPF uniqueness
    const existingUser = await this.userRepository.findByCpf(userData.cpf)
    if (existingUser) {
      throw new AppError("Usuário com este CPF já existe", 409)
    }

    // Validate CPF format using AuthenticationService
    if (!this.isValidCpf(userData.cpf)) {
      throw new AppError("CPF inválido", 400)
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(
      userData.password
    )

    // Create user data with hashed password
    const userDataWithHashedPassword: CreateUserDTO = {
      ...userData,
      password: hashedPassword,
    }

    const createdUser = await this.userRepository.create(
      userDataWithHashedPassword
    )
    return createdUser
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll()
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }
    return user
  }

  async findByCpf(cpf: string): Promise<User> {
    const user = await this.userRepository.findByCpf(cpf)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }
    return user
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // If password is being updated, hash it
    const updateData = { ...userData }
    if (userData.password) {
      updateData.password = await this.authService.hashPassword(
        userData.password
      )
    }

    const updatedUser = await this.userRepository.update(id, updateData)
    return updatedUser
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new AppError("Usuário não encontrado", 404)
    }

    await this.userRepository.delete(id)
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Toggle status using entity method
    user.toggleStatus()

    // Update in repository
    const updatedUser = await this.userRepository.update(id, {
      status: user.status,
    })

    return updatedUser
  }

  async changeUserType(id: string, userType: UserType): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Validate user type change
    if (user.userType === userType) {
      throw new AppError("Usuário já possui este tipo", 400)
    }

    // Update user type
    const updatedUser = await this.userRepository.update(id, {
      userType,
    })

    return updatedUser
  }

  async changeRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Validate role change
    if (user.role === role) {
      throw new AppError("Usuário já possui este papel", 400)
    }

    // Update role
    const updatedUser = await this.userRepository.update(id, {
      role,
    })

    return updatedUser
  }

  async getActiveUsers(): Promise<User[]> {
    const allUsers = await this.userRepository.findAll()
    return allUsers.filter((user) => user.status === UserStatus.ATIVO)
  }

  async getFixedUsers(): Promise<User[]> {
    const allUsers = await this.userRepository.findAll()
    return allUsers.filter(
      (user) =>
        user.userType === UserType.FIXO && user.status === UserStatus.ATIVO
    )
  }

  async getNonFixedUsers(): Promise<User[]> {
    const allUsers = await this.userRepository.findAll()
    return allUsers.filter(
      (user) =>
        user.userType === UserType.NAO_FIXO && user.status === UserStatus.ATIVO
    )
  }

  async getAdminUsers(): Promise<User[]> {
    const allUsers = await this.userRepository.findAll()
    return allUsers.filter(
      (user) => user.role === UserRole.ADMIN && user.status === UserStatus.ATIVO
    )
  }

  private isValidCpf(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCpf = cpf.replace(/\D/g, "")

    // Check if has 11 digits
    if (cleanCpf.length !== 11) {
      return false
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false
    }

    // Validate CPF algorithm
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false

    return true
  }
}
