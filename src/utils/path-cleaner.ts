export function cleanPath(p: string): string {
  // normaliza a forward-slash y quita dobles
  return p.replace(/\\/g, '/').replace(/\/+/g, '/');
}
