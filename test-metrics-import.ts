// test-metrics-import.ts
import * as mm from 'metrics-js-ts';

async function main() {
  console.log('[TEST] keys exportadas:', Object.keys(mm));

  // Si existe calculateMetrics, probamos un call mínimo
  if (typeof (mm as any).calculateMetrics === 'function') {
    const result = await (mm as any).calculateMetrics({
      codePath: './', // prueba con la raíz
      useDefaultMetrics: true,
    });
    console.log('[TEST] métricas OK, keys del resultado:', Object.keys(result));
  } else {
    console.log('[TEST] No encontré calculateMetrics en metrics-js-ts');
  }
}

main().catch((e) => console.error('[TEST] error:', e));
