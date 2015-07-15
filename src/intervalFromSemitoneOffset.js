import mod from './mod';

const INTERVAL_NAMES = [
  'P1',
  'm2',
  'M2',
  'm3',
  'M3',
  'P4',
  'A4',
  'P5',
  'm6',
  'M6',
  'm7',
  'M7',
  'P8',
];


window.intervalFromSemitoneOffset = intervalFromSemitoneOffset;

export default function intervalFromSemitoneOffset (n) {
  return INTERVAL_NAMES[mod(n, 12)];
}