// Simple utility module for context analysis
import { User, UserData } from './auth';

export interface ConfigOptions {
  maxRetries: number;
  timeout: number;
  debug: boolean;
}

export function createConfig(options: Partial<ConfigOptions> = {}): ConfigOptions {
  return {
    maxRetries: options.maxRetries ?? 3,
    timeout: options.timeout ?? 5000,
    debug: options.debug ?? false,
  };
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function formatOutput(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}

export class EventEmitter {
  private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: unknown[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }
}

export class EventEmitter {
  private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: unknown[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }
}
