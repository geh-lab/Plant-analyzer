import { calculateMda } from '@/utils/mda';

// Deliberately separate from the result stores and form state.
const signals = [[0.108, 0.110, 0.118, 0.123, 0.164], [0.163, 0.177, 0.188, 0.193, 0.202]];
function exampleSamples(lang) {
  return signals.flatMap((values, g) => values.map((signal, index) => ({
    name: (g === 0 ? 'C' : 'T') + (index + 1),
    group: (lang === 'en' ? ['Control', 'Treatment'] : ['대조구', '처리구'])[g],
    signal, replicate: index + 1
  })));
}

export function exampleAbsorbance(lang) {
  return exampleSamples(lang).map(s => ({
    sample_name: s.name, treatment_name: s.group,
    ...calculateMda({ 532: s.signal + 0.02, 600: 0.02 })
  }));
}

export function exampleHplc(lang) {
  return exampleSamples(lang).flatMap(s => ['A', 'B'].map((letter, index) => ({
    sampleName: s.name, treatment: s.group, replicate: s.replicate,
    compound: (lang === 'en' ? 'Compound ' : '성분 ') + letter,
    concentration: index === 0 ? s.signal : 0.3 - s.signal
  })));
}
