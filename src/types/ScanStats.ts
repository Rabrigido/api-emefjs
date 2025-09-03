export interface ScanStats {
files: number;
lines: number;
byExtension: Record<string, number>;
imports: number;
exports: number;
}