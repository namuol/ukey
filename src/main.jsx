import 'babel/polyfill';

import React from 'react';
import App from './App';

import page from 'page';

import qs from 'qs';

import teoria from 'teoria';
window.teoria = teoria;

import createFretboard from './createFretboard';
import getFingeringsFromChord from './getFingeringsFromChord';

console.log(getFingeringsFromChord({
  chord: 'B#',
  fretboard: createFretboard({
    tuning: ['G','C','E','A'],
    fretCount: 5,
  }),
  fretWindow: 5,
}).toJS());

window.addEventListener('load', () => {
  page('*', (ctx, next) => {
    React.render(
      <App />
    , document.getElementById('main'));
  });

  page.base(process.env.BASEPATH || '');

  page.start();
});