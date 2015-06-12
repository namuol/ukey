import Immutable from 'immutable';

import runTests from './util/runTests';

let isEmpty = v => v == null;

function shift1D ({row, x}) {
  // Search for the first empty space from X, to the left:
  let leftSpace = row.slice(0,x).findLastIndex(isEmpty);
  let rightSpace;

  if (leftSpace >= 0) {
    // There's room to our left, so shift left:
    let rangeToShift = row.slice(leftSpace+1,x+1).toJS();
    return row.set(x, null).splice(leftSpace, rangeToShift.length, ...rangeToShift);
  } else if ((rightSpace = row.slice(x+1,row.size).findIndex(isEmpty)) >= 0) {
    rightSpace = x + rightSpace + 1;
    let rangeToShift = row.slice(x,rightSpace).toJS();
    return row.set(x, null).splice(x+1, rangeToShift.length, ...rangeToShift);
  }

  return null;
}

export default function gridShift ({layout, coord}) {
  let {x, y} = coord;
  
  let row = layout.get(y);

  if (!row.get(x)) {
    // Empty space; no need to shift anything.
    return layout;
  }

  let newRow = shift1D({
    row: row,
    x: x,
  });

  if (newRow != null) {
    return layout.set(y, newRow);
  }

  let col = layout.map(row => row.get(x));

  let newCol = shift1D({
    row: col,
    x: y,
  });

  if (newCol != null) {
    return layout.map((row, y) => {
      return row.set(x, newCol.get(y));
    });
  }

  return layout;
};

let N = null;

let tests = [
  {
    input: {
      layout: Immutable.fromJS([
        [N,1,2],
      ]),
      coord: {x: 0, y: 0},
    },

    expected: [
      [N,1,2],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [0,1,N],
      ]),
      coord: {x: 1, y: 0},
    },

    expected: [
      [0,N,1],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [N,1,2],
      ]),
      coord: {x: 1, y: 0},
    },

    expected: [
      [1,N,2],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [N,1,2,3],
      ]),
      coord: {x: 2, y: 0},
    },

    expected: [
      [1,2,N,3],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [0,1,2,N],
      ]),
      coord: {x: 1, y: 0},
    },

    expected: [
      [0,N,1,2],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [N],
        [1],
        [2],
      ]),
      coord: {x: 0, y: 0},
    },

    expected: [
      [N],
      [1],
      [2],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [0],
        [1],
        [N],
      ]),
      coord: {x: 0, y: 1},
    },

    expected: [
      [0],
      [N],
      [1],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [N],
        [1],
        [2],
      ]),
      coord: {x: 0, y: 1},
    },

    expected: [
      [1],
      [N],
      [2],
    ],
  },

  {
    input: {
      layout: Immutable.fromJS([
        [N],
        [1],
        [2],
        [3],
      ]),
      coord: {x: 0, y: 2},
    },

    expected: [
      [1],
      [2],
      [N],
      [3],
    ],
  },
];

runTests({
  func: gridShift,
  funcName: 'gridShift',
  tests: tests,
});
