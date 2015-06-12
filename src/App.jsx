import React from 'react';
import Immutable from 'immutable';

import Style from './Style';
import theme from './theme';

import page from 'page';
import qs from 'qs';

import createFretboard from './createFretboard';
import getFingeringsFromChord from './getFingeringsFromChord';

import ReactGridLayout from 'react-grid-layout';

import ChordCard from './ChordCard';

let WRAPPER = Style.registerStyle({
  width: '100vmin',
  minHeight: '100vh',
  padding: `${theme.mainPadding}vmin`,
  margin: 'auto',
  backgroundColor: theme.bgColor,
});

let STYLE = Style.registerStyle({
  display: 'flex',
  flexDirection: 'column',
  fontFamily: theme.fontFamily,
  color: theme.color,
  width: '100%',
  height: '100%',
  textAlign: 'left',
});

let BRAND_HEADER = Style.registerStyle({
  margin: 0,
  fontWeight: 400,
  marginTop: '-0.7vmin',
  textTransform: 'lowercase',
  fontSize: '4vmin',
  opacity: 0.5,
});

let CHORD_INPUT = Style.registerStyle({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  width: '100%',
  marginBottom: '1vmin',
});

let TEXT_INPUT = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '5vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  padding: '1.5vmin 2vmin',
  width: '100%',
  fontWeight: 700,
  textAlign: 'center',
});

let LABEL = Style.registerStyle({
  margin: 0,
  marginBottom: '2vmin',
  fontSize: '5vmin',
  fontWeight: 600,
  color: theme.labelColor,
});

let CHORD_OUTPUT = Style.registerStyle({
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  alignItems: 'center',
  width: '100%',
  flexWrap: 'wrap',
});

let fretboard = createFretboard({
  tuning: ['G', 'C', 'E', 'A'],
  fretCount: 5,
});

let App = React.createClass({
  getDefaultProps: function () {
    return {
      chordsText: 'C G Am F F F',
      transpose: 0,
    };
  },
  
  getInitialState: function () {
    return Object.assign({}, this.props);
  },

  render: function () {
    let chordCards = this.state.chordsText.split(/\s/).filter(c => c.length).map((chord, idx) => {
      return <ChordCard
        key={idx}
        chord={chord}
        fretboard={fretboard}
        transpose={parseInt(this.state.transpose)}
        _grid={{
          w: 1,
          h: 1,
          x: idx % 6,
          y: Math.floor(idx / 6),
        }}
      />;
    });

    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className}>
          <div className={CHORD_INPUT.className}>
            <input className={TEXT_INPUT.className}
              type="text"
              value={this.state.chordsText}
              spellCheck={false}
              onChange={(e) => {
                this.setState({
                  chordsText: e.target.value,
                });
              }}
            />
          </div>

          <div className={CHORD_OUTPUT.className}>
            {chordCards}
          </div>
        </div>

        <Style.Element />
      </div>
    );
  }
});

export default Style.component(App);