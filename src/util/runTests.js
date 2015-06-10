import equal from 'deep-equal';
import pretty from './pretty';

export default function runTests ({funcName, func, tests}) {
  let errorMsgs = [];

  tests.forEach(({input, expected}) => {
    let result = func(input);
    
    if (typeof result.toJS === 'function') {
      result = result.toJS();
    }

    if (!equal(result, expected)) {
      errorMsgs.push(`${funcName}(${pretty(input)}):\nExpected ${pretty(expected)}\nbut got ${pretty(result)}`);
    }
  });

  if (errorMsgs.length > 0) {
    throw new Error(errorMsgs.join('\n\n'));
  }
}
