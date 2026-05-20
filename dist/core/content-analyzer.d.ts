export interface Finding {
    type: 'duplicate' | 'boilerplate' | 'verbose' | 'stale-reference';
    severity: 'high' | 'medium' | 'low';
    file: string;
    message: string;
    suggestion: string;
}
export interface FileAnalysis {
    path: string;
    tokens: number;
    findings: Finding[];
}
export interface AnalysisReport {
    totalTokens: number;
    duplicateGroups: {
        content: string;
        files: string[];
        tokenCount: number;
    }[];
    boilerplateCount: number;
    redundantTokenCount: number;
    findings: Finding[];
    suggestions: string[];
    fileBreakdown: {
        path: string;
        tokens: number;
        percentage: number;
        language: string | null;
    }[];
}
export declare function detectBoilerplate(content: string, filePath: string): Finding[];
export declare function detectStaleReferences(content: string, filePath: string): Finding[];
export declare function detectVerboseContent(content: string, filePath: string): Finding[];
export declare function detectDuplicates(files: {
    path: string;
    content: string;
}[]): {
    content: string;
    files: string[];
    tokenCount: number;
}[];
export declare function analyzeFile(filePath: string, content: string, tokens: number, language: string | null): FileAnalysis;
export declare function analyzeContent(files: {
    path: string;
    content: string;
    tokens: number;
    language: string | null;
}[], totalTokens: number): AnalysisReport;
//# sourceMappingURL=content-analyzer.d.ts.map