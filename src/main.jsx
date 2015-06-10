import 'babel/polyfill';

import React from 'react';
import App from './App';

import page from 'page';

import qs from 'qs';

import teoria from 'teoria';
window.teoria = teoria;

import createFretboard from './createFretboard';
import getFingeringsFromChord from './getFingeringsFromChord';

window.addEventListener('load', () => {
  page('*', (ctx, next) => {
    React.render(
      <App />
    , document.getElementById('main'));
  });

  page.base(process.env.BASEPATH || '');

  page.start();
});