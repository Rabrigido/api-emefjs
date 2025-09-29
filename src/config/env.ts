import 'dotenv/config';
import path from 'node:path';


export const ENV = {
PORT: Number(process.env.PORT || 3000),
DATA_DIR: process.env.DATA_DIR || path.resolve(process.cwd(), 'data'),
REPOS_DIR(): string { return path.join(this.DATA_DIR, 'repos'); },
GITHUB_TOKEN: process.env.GITHUB_TOKEN,
SCAN_GLOB: process.env.SCAN_GLOB || '**/*.{ts,js}',
REGISTRY_FILE(): string { return path.join(this.DATA_DIR, 'registry.json'); }


};

