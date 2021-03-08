import React from 'react';
import App from './App';
import SongList from './SongList';

import page from 'page';

import teoria from 'teoria';
window.teoria = teoria;

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
    // eslint-disable-next-line react/no-deprecated
    React.render(
      <App />
    , document.getElementById('main'));
  });

  page('/testgrid', (ctx, next) => {
    // eslint-disable-next-line react/no-deprecated
    React.render(
      <TestGrid />
    , document.getElementById('main'));
  });

  page('/testgrid2', (ctx, next) => {
    // eslint-disable-next-line react/no-deprecated
    React.render(
      <TestGrid2 />
    , document.getElementById('main'));
  });

  page('/songs', (ctx, next) => {
    // eslint-disable-next-line react/no-deprecated
    React.render(
      <SongList />
    , document.getElementById('main'));
  });


  page.base(process.env.BASEPATH || '');

  page.start();
});
