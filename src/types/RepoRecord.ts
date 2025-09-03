export interface RepoRecord {
id: string;
fullName: string; // "owner/name"
defaultBranch: string;
cloneUrl: string;
localPath: string;
createdAt: string; // ISO
}