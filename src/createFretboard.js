import Immutable from 'immutable';
import teoria from 'teoria';

// Returns an array representation of the chroma of each note on a fretted instrument.
function createFretboard ({tuning, fretCount}) {
  return tuning.reduce((result, stringNote) => {
    let startChroma = teoria.note(stringNote).chroma();

    return result.push(Immutable.Range(startChroma, startChroma+fretCount).map((chroma) => {
      return chroma % 12;
    }));
  }, Immutable.List());
}

import runTests from './util/runTests';

const tests = [
  {
    input: {
      tuning: ['G','C','E','A'],
      fretCount: 5,
    },
    expected: [
      [7,  8,  9, 10, 11], // G
      [0,  1,  2,  3,  4], // C
      [4,  5,  6,  7,  8], // E
      [9, 10, 11,  0,  1], // A
    ]
  },
];

tests.forEach((test) => {
  runTests({
    func: createFretboard,
    funcName: 'createFretboard',
    tests: tests,
  });
});

export default createFretboard;