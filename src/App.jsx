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
import clamp from './clamp';
import mod from './mod';

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
  fontSize: '4vmin',
});

let BRAND_HEADER = Style.registerStyle({
  margin: 0,
  fontWeight: 400,
  marginTop: '-0.7vmin',
  textTransform: 'lowercase',
  fontSize: '4vmin',
  opacity: 0.5,
});

const topBarHeight = 15;

let TOP_BAR = Style.registerStyle({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
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

let CHORD_TEXT_INPUT = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '5vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  padding: '1.5vmin 2vmin',
  flexGrow: 8,
  fontWeight: 700,
  height: '100%',
  // textAlign: 'center',
});

let TRANSPOSE_INPUT = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '4vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  padding: '1.5vmin 2vmin',
  fontWeight: 700,
  flexGrow: 1,
  height: '100%',
  marginLeft: `${theme.mainPadding}vmin`,
  // textAlign: 'center',
});

let TRANSPOSE_INDICATOR = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '6vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  fontWeight: 700,
  flexGrow: 1,
  height: '100%',
  marginLeft: `${theme.mainPadding}vmin`,
  background: 'transparent',
  display: 'flex',
  // textAlign: 'center',
  // justifyContent: 'center',
  alignItems: 'center',
  // alignContent: 'center',
  whiteSpace: 'nowrap',
  width: '10vmin',
  flexShrink: 0,
  padding: 0,
});

let BUTTON = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '5vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  padding: '1.5vmin 2vmin',
  fontWeight: 700,
  color: 'white',
  flexGrow: 1,
  flexShrink: 0,
  height: '100%',
  marginLeft: `${theme.mainPadding}vmin`,
  backgroundColor: theme.highlight,
  cursor: 'pointer',
  textAlign: 'center',
  minWidth: '14vmin',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  textTransform: 'uppercase',
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

const INACTIVE_CARD = Style.registerStyle({
  opacity: 0.5,
});

const EDITING_CARD = Style.registerStyle({
  boxShadow: '0 1vmin 2vmin rgba(0,0,0,0.3)',
});

function processLayout ({layout}) {
  // Filter empty sections:
  return layout.filter(section => section.size > 0).push(Immutable.List());
}

function getChordInputsFromChordText ({chordText, chordInputs=Immutable.List()}) {
  return Immutable.List(chordText.split(/\s/).filter(c => c.length).map((chord, idx) => {
    const existingChord = chordInputs.get(idx);
    return {
      id: existingChord ? existingChord.id : uuid.v4(),
      text: chord,
    };
  }));
}

function getChordInputIDs (chordInputs) {
  return chordInputs.map(c => c.id);
}

function preventDefault (e) {
  e.preventDefault();
}

let App = React.createClass({
  getDefaultProps: function () {
    const chordText = 'C G Am F';
    const chordInputs = getChordInputsFromChordText({chordText});
    const chordInputIDs = getChordInputIDs(chordInputs);
    return {
      chordText: chordText,
      transpose: 0,
      chords: Immutable.List(),
      chordInputs: chordInputs,
      chordVariations: Immutable.Map(),
      layout: processLayout({layout: Immutable.fromJS([[]])}),
    };
  },
  
  getInitialState: function () {
    return Object.assign({}, this.props);
  },

  render: function () {
    const {
      chordInputs,
      chordVariations,
    } = this.state;

    let layout = this.state.layout;
    // console.log('layout', layout && layout.toJS());

    if (chordInputs.size > 0) {
      layout = layout.unshift(getChordInputIDs(chordInputs));
    }
    
    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className}>
          <form className={TOP_BAR.className}
            onSubmit={(e) => {
              e.preventDefault();
              const chordInputIDs = getChordInputIDs(chordInputs);
              const layout = this.state.layout;
              const secondToLastSection = layout.get(layout.size-2).push(...(chordInputIDs.toJS()));
              const newLayout = layout.set(layout.size-2, secondToLastSection);
              this.setState({
                chords: this.state.chords.push(...(chordInputs.toJS())),
                layout: processLayout({layout: newLayout}),
                chordText: '',
                chordInputs: Immutable.List(),
              });
            }}
          >
            <input className={CHORD_TEXT_INPUT.className}
              type="text"
              value={this.state.chordText}
              spellCheck={false}
              onChange={(e) => {
                const chordText = e.target.value;
                const chordInputs = getChordInputsFromChordText({chordText, chordInputs: this.state.chordInputs});
                const chordInputIDs = getChordInputIDs(chordInputs);
                this.setState({
                  chordText: chordText,
                  chordInputs: chordInputs,
                });
              }}
            />
            
            <div className={TRANSPOSE_INDICATOR.className}>
              {`+${this.state.transpose}`}
            </div>

            <div className={BUTTON.className} onClick={(e) => {
              this.setState({
                transpose: mod(this.state.transpose-1, 12),
              });
            }}>▼</div>

            <div className={BUTTON.className} onClick={(e) => {
              this.setState({
                transpose: mod(this.state.transpose+1, 12),
              });
            }}>▲</div>

            <div className={BUTTON.className} onClick={(e) => {
            }}>Edit</div>

            <input type="submit" style={{height: 0, padding: 0, margin: 0, position: 'absolute', visibility: 'hidden'}} />
          </form>

          <div className={CHORD_OUTPUT.className}>
            <SortableGridList
              gridWidth={6}
              rowHeight={(100 - 5 * 2)/4}
              spacing={theme.mainPadding}
              layout={layout}
              onLayoutChanged={(layout) => {
                const chordInputIDs = getChordInputIDs(chordInputs);
                this.setState({
                  layout: processLayout({layout}),
                });
              }}
            >
              {this.state.chords.push(...(chordInputs.toJS())).map((chord, idx) => {
                let style = {
                  cursor: 'pointer',
                };

                let locked = false;
                if (chordInputs.size > 0) {
                  locked = true;
                  if (idx < this.state.chords.size) {
                    style = INACTIVE_CARD.style;
                  } else {
                    style = EDITING_CARD.style;
                  }
                }
                return <ChordCard
                  key={chord.id}
                  locked={locked}
                  chord={chord.text}
                  variation={chordVariations.get(chord.id)}
                  onVariationChanged={(variation) => {
                    console.log('variation CHANGED!');
                    this.setState({
                      chordVariations: chordVariations.set(chord.id, variation),
                    });
                  }}
                  fretboard={fretboard}
                  transpose={parseInt(this.state.transpose)}
                  style={style}
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