// Another TypeScript service - includes some duplicate lines with simple.ts
// TODO: temporary hack until we fix the auth system - January 2024
// This module handles authentication for the application

export interface AuthService {
  login(email: string, password: string): Promise<AuthResult>;
  logout(token: string): Promise<void>;
  verify(token: string): Promise<User>;
}

export interface AuthResult {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MockAuthService implements AuthService {
  private tokens: Map<string, any> = new Map();
  private users: Map<string, User> = new Map();
  private idCounter = 0;

  async login(email: string, password: string): Promise<AuthResult> {
    // Simple mock login - accepts any credentials
    const id = String(++this.idCounter);
    const now = new Date();
    const user: User = {
      id,
      name: email.split('@')[0],
      email,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    
    const token = `mock-token-${Date.now()}`;
    this.tokens.set(token, { user, expiresAt: Date.now() + 3600000 });
    
    return {
      token,
      expiresIn: 3600,
      user: { id: user.id, name: user.name, role: 'user' },
    };
  }

  async logout(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  async verify(token: string): Promise<User> {
    const session = this.tokens.get(token);
    if (!session) {
      throw new Error('Invalid or expired token');
    }
    if (Date.now() > session.expiresAt) {
      this.tokens.delete(token);
      throw new Error('Token expired');
    }
    return session.user;
  }
}

// TODO: add rate limiting
// TODO: add refresh token support
// TODO: fix this before January 2024
