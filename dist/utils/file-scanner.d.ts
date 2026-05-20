export declare const EXTENSION_MAP: Record<string, string>;
export declare function getLanguage(filePath: string): string | null;
export declare function isBinary(filePath: string): boolean;
export interface FileEntry {
    path: string;
    relativePath: string;
    language: string | null;
    size: number;
    content?: string;
    isBinary: boolean;
}
export declare function scanDirectory(dirPath: string, excludes?: string[]): FileEntry[];
export declare function loadGitignore(dirPath: string): string[];
export declare const DEFAULT_EXCLUDES: string[];
//# sourceMappingURL=file-scanner.d.ts.map