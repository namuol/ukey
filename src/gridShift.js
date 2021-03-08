import Immutable from 'immutable';

import runTests from './util/runTests';

const isEmpty = v => v == null;

window.isEmpty = isEmpty;

function shift1D ({list, pos, expand}) {
  // Search for the first empty space from X, to the left:
  const leftSpace = list.slice(0,pos).findLastIndex(isEmpty);
  let rightSpace;
  if (leftSpace >= 0) {
    // There's room to our left, so shift left:
    const rangeToShift = list.slice(leftSpace+1,pos+1).toJS();
    return list.set(pos, null).splice(leftSpace, rangeToShift.length, ...rangeToShift);
    // eslint-disable-next-line no-cond-assign
  } else if ((rightSpace = list.slice(pos+1,list.size+1).findIndex(isEmpty)) >= 0) {
    rightSpace = pos + rightSpace + 1;
    const rangeToShift = list.slice(pos,rightSpace).toJS();
    return list.set(pos, null).splice(pos+1, rangeToShift.length, ...rangeToShift);
  }

  if (expand) {
    return list.splice(pos, 0, null);
  }

  return null;
}

export default function gridShift ({grid, coord}) {
  const {x, y} = coord;
  
  const row = grid.get(y);

  if (row == null || isEmpty(row.get(x))) {
    // Empty space; no need to shift anything.
    return grid;
  }

  const newRow = shift1D({
    list: row,
    pos: x,
  });

  if (newRow != null) {
    return grid.set(y, newRow);
  }

  const col = grid.map(row => row.get(x));

  const newCol = shift1D({
    list: col,
    pos: y,
    expand: true,
  });

  const width = grid.get(0).size;
  return newCol.map((newValue, y) => {
    const row = grid.get(y) || Immutable.List(new Array(width));
    return row.set(x, newValue);
  });
};

const N = null;

const tests = [
  {
    input: {
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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
      grid: Immutable.fromJS([
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

  {
    input: {
      grid: Immutable.fromJS([]),
      coord: {x: 0, y: 0},
    },

    expected: [],
  },

  {
    input: {
      grid: Immutable.fromJS([
        [0],
        [1],
        [2],
      ]),
      coord: {x: 0, y: 0},
    },

    expected: [
      [N],
      [0],
      [1],
      [2],
    ],
  },
];

runTests({
  func: gridShift,
  funcName: 'gridShift',
  tests: tests,
});
