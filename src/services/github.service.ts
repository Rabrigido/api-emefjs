import axios from 'axios';
import { ENV } from '../config/env.js';


const GITHUB_API = 'https://api.github.com';


export async function searchPopularRepos() {
const headers: Record<string, string> = ENV.GITHUB_TOKEN ? { Authorization: `Bearer ${ENV.GITHUB_TOKEN}` } : {};
const url = `${GITHUB_API}/search/repositories?q=stars:%3E20000+language:TypeScript+OR+language:JavaScript&sort=stars&order=desc&per_page=50`;
const { data } = await axios.get(url, { headers });
return data.items as Array<{ full_name: string; clone_url: string; default_branch: string }>;
}


export async function getRepoByFullName(fullName: string) {
const headers: Record<string, string> = ENV.GITHUB_TOKEN ? { Authorization: `Bearer ${ENV.GITHUB_TOKEN}` } : {};
const url = `${GITHUB_API}/repos/${fullName}`;
const { data } = await axios.get(url, { headers });
return {
full_name: data.full_name as string,
clone_url: data.clone_url as string,
default_branch: data.default_branch as string,
};
}