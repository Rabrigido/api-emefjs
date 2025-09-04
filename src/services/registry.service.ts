import { mkdir, stat, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ENV } from '../config/env.js';
import { RepoRecord } from '../types/RepoRecord';



const registry = new Map<string, RepoRecord>();


export async function ensureDirs() {
await mkdir(ENV.REPOS_DIR(), { recursive: true });
}

export async function removeRepo(id: string) {
  const rec = registry.get(id);
  if (!rec) return false;
  await resetRepoDir(id);         // elimina carpeta si existe
  registry.delete(id);            // saca del registro en memoria
  await persistRegistry();        // persiste a disco
  return true;
}


export async function loadRegistryFromDisk() {
try {
const txt = await stat(ENV.REGISTRY_FILE())
.then(() => readFile(ENV.REGISTRY_FILE(), 'utf8'))
.catch(() => null);
if (txt) (JSON.parse(txt) as RepoRecord[]).forEach(r => registry.set(r.id, r));
} catch {}
}


export async function persistRegistry() {
await mkdir(ENV.DATA_DIR, { recursive: true });
await writeFile(ENV.REGISTRY_FILE(), JSON.stringify(Array.from(registry.values()), null, 2), 'utf8');
}


export function listRepos() { return Array.from(registry.values()); }
export function getRepo(id: string) { return registry.get(id); }
export function upsertRepo(r: RepoRecord) { registry.set(r.id, r); }


export async function resetRepoDir(id: string) {
const dest = `${ENV.REPOS_DIR()}/${id}`;
if (existsSync(dest)) await rm(dest, { recursive: true, force: true });
return dest;
}