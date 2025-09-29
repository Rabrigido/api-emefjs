import { simpleGit } from 'simple-git';
const git = simpleGit();
export async function shallowClone(cloneUrl: string, dest: string) {
	await git.clone(cloneUrl, dest, ['--depth', '1']);
}