// Copyright (c) 2024 ContextMeter Project
// MIT License
import { ConfigOptions } from './simple';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
}

export class AuthManager {
  private users: Map<string, User> = new Map();
  private idCounter = 0;

  async register(name: string, email: string): Promise<User> {
    const id = String(++this.idCounter);
    const now = new Date();
    const user: User = {
      id, name, email,
      role: 'user',
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // TODO: temporary hack until we fix the auth system - January 2024
  async grantAdmin(id: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;
    user.role = 'admin';
    return true;
  }
}

export class AuthManager {
  private users: Map<string, User> = new Map();
  private idCounter = 0;

  async register(name: string, email: string): Promise<User> {
    const id = String(++this.idCounter);
    const now = new Date();
    const user: User = {
      id, name, email,
      role: 'user',
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // TODO: temporary hack until we fix the auth system - January 2024
  async grantAdmin(id: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;
    user.role = 'admin';
    return true;
  }
}
