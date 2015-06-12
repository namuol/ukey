import equal from 'deep-equal';
import pretty from './pretty';

export default function runTests ({funcName, func, tests}) {
  console.info('Running tests for', funcName);

  let errorMsgs = [];

  tests.forEach(({input, expected}, testNum) => {
    let result = func(input);
    
    if (!!result && typeof result.toJS === 'function') {
      result = result.toJS();
    }

    if (!equal(result, expected)) {
      errorMsgs.push(`${funcName} test #${testNum}:\nExpected ${pretty(expected)}\nbut got ${pretty(result)}`);
    }
  });

  if (errorMsgs.length > 0) {
    throw new Error(errorMsgs.join('\n\n'));
  }
}
