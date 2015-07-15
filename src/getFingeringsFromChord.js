import Immutable from 'immutable';
import teoria from 'teoria';
import transposeChord from './transposeChord';

import runTests from './util/runTests';

function combos (strings, results=Immutable.List(), currentResult=Immutable.List()) {
  if (strings.size === 0) {
    return results.push(currentResult);
  }

  strings.first().forEach((fingerPosition) => {
    results = combos(strings.rest(), results, currentResult.push(fingerPosition));
  });

  return results;
}

function uniqueCombos (strings) {
  return combos(strings.map(string => string.flatten()));
}

const uniqueCombos_tests = [
  {
    input: Immutable.fromJS([
      //9    0    4
      [[2], [ ], [ ]], // First string
      [[ ], [0], [4]], // Second string
      [[ ], [ ], [0]], // Third string
      [[0], [3], [ ]], // Fourth string
    ]),

    expected: [
      [2, 0, 0, 0],
      [2, 0, 0, 3],
      [2, 4, 0, 0],
      [2, 4, 0, 3],
    ],
  },
];

runTests({
  func: uniqueCombos,
  funcName: 'uniqueCombos',
  tests: uniqueCombos_tests,
});

function getFingeringsFromChord ({chord, fretboard, fretWindow, transpose=0}) {
  // First, get a list of the unique chroma in our chord.
  // Eg. chord('A') => [9, 0, 4]
  const transposedChord = transposeChord({
    chord,
    semitones: transpose,
  });

  const chromas = Immutable.OrderedSet(transposedChord.notes().map((n) => { return n.chroma(); }));

  // Now, build a list of all finger positions that match
  //  notes in this chord:
  //
  // [ //9    0    4
  //   [[2],  [],  []], // First string
  //   [ [], [0], [4]], // Second string
  //   [ [],  [], [0]], // Third string
  //   [[0], [3],  []], // Fourth string
  // ]
  const chordChromaFingerPositionsPerString = fretboard.map((string) => {
    return chromas.map((chroma) => {
      return string.map((fretChroma, idx) => {
        return idx;
      }).filter((idx) => {
        return string.get(idx) === chroma;
      });
    });
  });

  // From that, get all combinations:
  // 2 0 0 0
  // 2 0 0 3
  // 2 4 0 0
  // 2 4 0 3
  
  return uniqueCombos(chordChromaFingerPositionsPerString).filter((fingerPositions) => {
    if (fretWindow) {
      const max = fingerPositions.reduce((max, current) => {
        return max > current ? max : current;
      }, 0);

      const min = fingerPositions.reduce((min, current) => {
        return min < current ? min : current;
      }, Math.Infinity);

      if (max - min > fretWindow) {
        return false;
      }
    }

    // ...and filter out any that don't cover
    // every note our chord needs:
    // 2 0 0 0
    // 2 0 0 3
    // 2 4 0 3
    const chromasCoveredByThisConfiguration = fingerPositions.map((fingerPos, stringNum) => {
      return fretboard.get(stringNum).get(fingerPos);
    }).toSet();

    return chromas.subtract(chromasCoveredByThisConfiguration).size === 0;
  });
}

const tests = [
  {
    input: {
      chord: 'Am',
      fretboard: Immutable.fromJS([
      // 0   1   2   3   4  
        [7,  8,  9, 10, 11], // G
        [0,  1,  2,  3,  4], // C
        [4,  5,  6,  7,  8], // E
        [9, 10, 11,  0,  1], // A
      ]),
      fretWindow: 5,
    },

    expected: [
      [2, 0, 0, 0],
      [2, 0, 0, 3],
      [2, 4, 0, 3],
    ],
  },
];

runTests({
  func: getFingeringsFromChord,
  funcName: 'getFingeringsFromChord',
  tests: tests,
});

export default getFingeringsFromChord;