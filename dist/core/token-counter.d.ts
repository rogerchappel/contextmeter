/**
 * Approximate cl100k_base token count for a string.
 * Uses a character-level model calibrated against tiktoken benchmarks.
 */
export declare function approximateTokens(text: string): number;
/**
 * More accurate token count using BPE with known token patterns.
 */
export declare function countTokens(text: string): number;
export declare function getTokensPerChar(language: string): number;
export declare function countTokensForLanguage(text: string, language: string): number;
//# sourceMappingURL=token-counter.d.ts.map