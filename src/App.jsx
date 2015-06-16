import React from 'react';
import Immutable from 'immutable';

import Style from './Style';
import theme from './theme';

import page from 'page';
import qs from 'qs';

import createFretboard from './createFretboard';
import getFingeringsFromChord from './getFingeringsFromChord';

import DraggableGrid from './DraggableGrid';

import ChordCard from './ChordCard';

import Color from 'color';

let WRAPPER = Style.registerStyle({
  width: '100vmin',
  minHeight: '100vh',
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

const topBarHeight = 13;

let CHORD_INPUT = Style.registerStyle({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  width: '100vmin',
  padding: `${theme.mainPadding}vmin`,
  position: 'fixed',
  backgroundColor: Color(theme.bgColor).alpha(0.9).rgbString(),
  zIndex: 3,
  height: `${topBarHeight}vmin`,
  top: 0,
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
  height: '100%',
  // textAlign: 'center',
});

let LABEL = Style.registerStyle({
  margin: 0,
  marginBottom: '2vmin',
  fontSize: '5vmin',
  fontWeight: 600,
  color: theme.labelColor,
});

let CHORD_OUTPUT = Style.registerStyle({
  width: '100%',
  marginTop: `${topBarHeight - theme.mainPadding}vmin`,
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
      chords: Immutable.List(),
    };
  },
  
  getInitialState: function () {
    return Object.assign({}, this.props);
  },

  render: function () {
    const chordInputs = this.state.chordsText.split(/\s/).filter(c => c.length);

    const chordCards = chordInputs.map((chord, idx) => {
      return <ChordCard
        key={idx}
        chord={chord}
        fretboard={fretboard}
        transpose={parseInt(this.state.transpose)}
        style={{
          margin: '1vmin',
        }}
      />;
    });

    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className}>
          <form className={CHORD_INPUT.className}
            onSubmit={(e) => {
              e.preventDefault();
              console.log('submit');
              this.setState({
                chords: this.state.chords.push(...chordInputs),
                chordsText: '',
              });
            }}
          >
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
          </form>

          <div className={CHORD_OUTPUT.className}>
            <DraggableGrid 
              rowHeight={(100 - 5 * 2)/4}
              spacing={theme.mainPadding}
              layout={this.state.layout}
              onLayoutChanged={(layout) => {
                console.log('layout changed!');
                this.setState({
                  layout: layout,
                });
              }}
            >
              {this.state.chords.map((chord, idx) => {
                return <ChordCard
                  key={idx}
                  chord={chord}
                  fretboard={fretboard}
                  transpose={parseInt(this.state.transpose)}
                />;
              })}
            </DraggableGrid>
          </div>
        </div>

        <Style.Element />
      </div>
    );
  }
});

export default Style.component(App);