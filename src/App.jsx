import React from 'react';
import Immutable from 'immutable';

import Style from './Style';
import theme from './theme';

import page from 'page';
import qs from 'qs';

import createFretboard from './createFretboard';
import getFingeringsFromChord from './getFingeringsFromChord';

import SortableGridList from './SortableGridList';

import ChordCard from './ChordCard';

import Color from 'color';
import uuid from 'uuid';

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
  marginTop: `${topBarHeight}vmin`,
});

let fretboard = createFretboard({
  tuning: ['G', 'C', 'E', 'A'],
  fretCount: 5,
});

const ITEM = Style.registerStyle({
  width: '100%',
  height: '100%',
  textAlign: 'center',
  borderRadius: '2vmin',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '4vmin',
});

function processLayout (layout) {
  // Filter empty sections:
  return layout.filter(section => section.size > 0).push(Immutable.List());
}

let App = React.createClass({
  getDefaultProps: function () {
    return {
      chordsText: '',
      transpose: 0,
      chords: Immutable.List(),
      chordInputs: Immutable.List(),
      layout: processLayout(Immutable.fromJS([[]])),
    };
  },
  
  getInitialState: function () {
    return Object.assign({}, this.props);
  },

  render: function () {
    const chordInputs = this.state.chordInputs;
    let layout = this.state.layout;
    
    if (chordInputs.size > 0) {
      layout = layout.unshift(chordInputs.map(c => c.id));
    }

    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className}>
          <form className={CHORD_INPUT.className}
            onSubmit={(e) => {
              const chordIDs = chordInputs.map(c => c.id);
              e.preventDefault();
              const layout = this.state.layout;
              const newLayout = processLayout(layout.set(layout.size-2, layout.get(layout.size-2).push(...(chordIDs.toJS()))));
              this.setState({
                chords: this.state.chords.push(...(chordInputs.toJS())),
                layout: newLayout,
                chordsText: '',
                chordInputs: Immutable.List(),
              });
            }}
          >
            <input className={TEXT_INPUT.className}
              type="text"
              value={this.state.chordsText}
              spellCheck={false}
              onChange={(e) => {
                const chordInputs = Immutable.List(e.target.value.split(/\s/).filter(c => c.length).map((chord, idx) => {
                  const existingChord = this.state.chordInputs.get(idx);
                  return {
                    id: existingChord ? existingChord.id : uuid.v4(),
                    text: chord,
                  };
                }));


                this.setState({
                  chordsText: e.target.value,
                  chordInputs: chordInputs,
                });
              }}
            />
          </form>

          <div className={CHORD_OUTPUT.className}>
            <SortableGridList 
              rowHeight={(100 - 5 * 2)/4}
              spacing={theme.mainPadding}
              layout={layout}
              onLayoutChanged={(layout) => {
                this.setState({
                  layout: processLayout(layout),
                });
              }}
            >
              {this.state.chords.push(...(chordInputs.toJS())).map((chord, idx) => {
                return <ChordCard
                  key={chord.id}
                  chord={chord.text}
                  fretboard={fretboard}
                  transpose={parseInt(this.state.transpose)}
                />;
              })}
            </SortableGridList>
          </div>
        </div>

        <Style.Element />
      </div>
    );
  }
});

export default Style.component(App);