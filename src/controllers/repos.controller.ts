// src/controllers/repos.controller.ts
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { ENV } from "../config/env.js";
import { getRepo, listRepos, persistRegistry, resetRepoDir, upsertRepo, removeRepo as removeFromRegistry } from "../services/registry.service.js";
import { scanRepo } from "../services/scanner.service.js";
import { shallowClone } from "../services/git.service.js";
import { searchPopularRepos, getRepoByFullName } from "../services/github.service.js";
import type { RepoRecord } from "../types/RepoRecord.js";

function parseFullNameFromGitUrl(gitUrl: string): string {
  // soporta: https://github.com/owner/repo(.git) o git@github.com:owner/repo.git
  let m = gitUrl.match(/github\.com[:/]+([^/]+)\/([^/.]+)(?:\.git)?$/i);
  if (!m) {
    const e = new Error("gitUrl no reconocido. Usa https://github.com/owner/repo(.git)");
    (e as any).status = 400;
    throw e;
  }
  return `${m[1]}/${m[2]}`;
}

export const ReposController = {
  list: () => listRepos(),

  get: (id: string) => {
    const rec = getRepo(id);
    if (!rec) {
      const e = new Error("Repo no encontrado");
      (e as any).status = 404;
      throw e;
    }
    return rec;
  },

  async create(payload: { fullName?: string; gitUrl?: string }) {
    const fullName = payload.fullName?.trim()
      || (payload.gitUrl ? parseFullNameFromGitUrl(payload.gitUrl) : undefined);

    if (!fullName) {
      const e = new Error("Debe enviar fullName ('owner/repo') o gitUrl");
      (e as any).status = 400;
      throw e;
    }
    // reutilizamos la lógica de loadByFullName
    return await this.loadByFullName(fullName);
  },

  loadRandom: async () => {
    const items = await searchPopularRepos();
    if (!items?.length) throw new Error("No se pudieron obtener repos populares");
    const pick = items[Math.floor(Math.random() * Math.min(items.length, 50))];
    const id = uuidv4();
    const dest = path.join(ENV.REPOS_DIR(), id);
    await resetRepoDir(id);
    await shallowClone(pick.clone_url, dest);
    const rec: RepoRecord = {
      id,
      fullName: pick.full_name,
      defaultBranch: pick.default_branch,
      cloneUrl: pick.clone_url,
      localPath: dest,
      createdAt: new Date().toISOString(),
    };
    upsertRepo(rec);
    await persistRegistry();
    return rec;
  },

  loadByFullName: async (fullName: string) => {
    if (!fullName.includes("/")) {
      const e = new Error("Use el formato owner/repo");
      (e as any).status = 400;
      throw e;
    }
    const info = await getRepoByFullName(fullName);
    const id = uuidv4();
    const dest = path.join(ENV.REPOS_DIR(), id);
    await resetRepoDir(id);
    await shallowClone(info.clone_url, dest);
    const rec: RepoRecord = {
      id,
      fullName: info.full_name,
      defaultBranch: info.default_branch,
      cloneUrl: info.clone_url,
      localPath: dest,
      createdAt: new Date().toISOString(),
    };
    upsertRepo(rec);
    await persistRegistry();
    return rec;
  },

  scan: async (id: string) => {
    console.log('[CTRL] scan id=', id);
    const rec = getRepo(id);
    if (!rec) {
      const e = new Error('Repo no encontrado');
      (e as any).status = 404;
      throw e;
    }
    const out = await scanRepo(id, rec.localPath, ENV.SCAN_GLOB);
    console.log('[CTRL] scan ok');
    return out;
  },

  remove: async (id: string) => {
    const ok = await removeFromRegistry(id);
    if (!ok) {
      const e = new Error("Repo no encontrado");
      (e as any).status = 404;
      throw e;
    }
    return { ok: true };
  }
};
