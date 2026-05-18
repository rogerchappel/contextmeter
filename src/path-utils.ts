import path from "node:path";

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function relativePath(root: string, filePath: string): string {
  return toPosixPath(path.relative(root, filePath));
}

export function resolveRoot(rootArg: string): string {
  return path.resolve(process.cwd(), rootArg);
}
