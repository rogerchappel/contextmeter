export class ContextMeterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContextMeterError";
  }
}
