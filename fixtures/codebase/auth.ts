export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
}

export type UserData = Omit<User, 'id'>;

export class Authenticator {
  private tokens: Map<string, string> = new Map();

  async authenticate(email: string): Promise<string> {
    const token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.tokens.set(token, email);
    return token;
  }

  async validate(token: string): Promise<string | null> {
    return this.tokens.get(token) ?? null;
  }

  async revoke(token: string): Promise<boolean> {
    return this.tokens.delete(token);
  }
}

export class Authenticator {
  private tokens: Map<string, string> = new Map();

  async authenticate(email: string): Promise<string> {
    const token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.tokens.set(token, email);
    return token;
  }

  async validate(token: string): Promise<string | null> {
    return this.tokens.get(token) ?? null;
  }

  async revoke(token: string): Promise<boolean> {
    return this.tokens.delete(token);
  }
}
