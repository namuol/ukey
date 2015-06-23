import 'babel/polyfill';

import React from 'react';
import App from './App';
import SongList from './SongList';

import page from 'page';

import qs from 'qs';

import teoria from 'teoria';
window.teoria = teoria;

import createFretboard from './createFretboard';
import getFingeringsFromChord from './getFingeringsFromChord';

import Style from './Style';
Style.inject();

// console.log(getFingeringsFromChord({
//   chord: 'B#',
//   fretboard: createFretboard({
//     tuning: ['G','C','E','A'],
//     fretCount: 5,
//   }),
//   fretWindow: 5,
// }).toJS());

import TestGrid from './TestGrid';
import TestGrid2 from './TestGrid2';

window.addEventListener('load', () => {
  page('/', (ctx, next) => {
    React.render(
      <App />
    , document.getElementById('main'));
  });

  page('/testgrid', (ctx, next) => {
    React.render(
      <TestGrid />
    , document.getElementById('main'));
  });

  page('/testgrid2', (ctx, next) => {
    React.render(
      <TestGrid2 />
    , document.getElementById('main'));
  });

  page('/songs', (ctx, next) => {
    React.render(
      <SongList />
    , document.getElementById('main'));
  });


  page.base(process.env.BASEPATH || '');

  page.start();
});