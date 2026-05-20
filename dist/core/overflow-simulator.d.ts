export declare const CONTEXT_PRESETS: Record<string, number>;
export type PruningStrategy = 'combined' | 'truncate' | 'remove-boilerplate' | 'remove-low-value' | 'deduplicate';
export interface SimulationResult {
    totalTokens: number;
    limit: number;
    overflows: boolean;
    fits: boolean;
    strategy: PruningStrategy;
    saved: number;
    afterPruning: number;
    prunedFiles: {
        path: string;
        originalTokens: number;
        savedTokens: number;
    }[];
    suggestions: string[];
}
export declare function simulateOverflow(files: {
    path: string;
    tokens: number;
    content?: string;
}[], limit: number, strategy?: PruningStrategy): SimulationResult;
export declare function generateOptimizationSuggestions(files: {
    path: string;
    tokens: number;
    content?: string;
}[], totalTokens: number, limit: number, strategy: PruningStrategy, saved: number): string[];
//# sourceMappingURL=overflow-simulator.d.ts.map