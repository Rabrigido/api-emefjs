// metrics-runner.js  (ESM porque "type":"module" en package.json)
import { calculateMetrics } from 'metrics-js-ts'; // intenta primero alias
// Si en tu entorno real el paquete se llama "modularity-metrics", cambia arriba por:
// import { calculateMetrics } from 'modularity-metrics';

const [,, codePath] = process.argv;

(async () => {
  try {
    const result = await calculateMetrics({
      codePath,
      useDefaultMetrics: true,
      include: ['**/*.{js,jsx,ts,tsx}'],
      excludeGlobs: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.next/**',
        '**/.turbo/**',
        '**/.output/**',
        '**/.cache/**',
        '**/docs/**',
        '**/examples/**',
        '**/*.min.*',
        '**/*.map',
      ],
    });
    process.stdout.write(JSON.stringify(result ?? {}));
  } catch (e) {
    // Manda el error al padre y sal con código 1 para que el servidor lo registre
    console.error(e?.stack || String(e));
    process.exit(1);
  }
})();
