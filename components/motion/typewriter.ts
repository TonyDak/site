export function getTypedText(text: string, count: number): string {
  const graphemes = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment);
  return graphemes.slice(0, Math.max(0, Math.floor(count))).join('');
}

export function getTypewriterFrame(text: string, elapsedMs: number): { text: string; phase: 'typing' | 'holding' | 'deleting' | 'waiting' } {
  const graphemes = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment);
  if (!graphemes.length) return { text: '', phase: 'waiting' };
  const typing = graphemes.length * 100;
  const holding = 2600;
  const deleting = graphemes.length * 55;
  const cycle = typing + holding + deleting + 800;
  const time = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0) % cycle;
  if (time < typing) return { text: graphemes.slice(0, Math.floor(time / 100)).join(''), phase: 'typing' };
  if (time < typing + holding) return { text, phase: 'holding' };
  if (time < typing + holding + deleting) return { text: graphemes.slice(0, graphemes.length - Math.floor((time - typing - holding) / 55)).join(''), phase: 'deleting' };
  return { text: '', phase: 'waiting' };
}
