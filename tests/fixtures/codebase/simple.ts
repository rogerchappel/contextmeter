// Sample TypeScript codebase fixture for testing
// This file represents a typical TypeScript service module

export interface UserService {
  findById(id: string): Promise<User>;
  findAll(): Promise<User[]>;
  create(user: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  role?: User['role'];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: User['role'];
}

export class InMemoryUserService implements UserService {
  private users: Map<string, User> = new Map();
  private idCounter = 0;

  async findById(id: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async create(data: CreateUserData): Promise<User> {
    const id = String(++this.idCounter);
    const now = new Date();
    const user: User = {
      ...data,
      id,
      role: data.role ?? 'user',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const existing = await this.findById(id);
    const updated: User = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User not found: ${id}`);
    }
    this.users.delete(id);
  }
}
