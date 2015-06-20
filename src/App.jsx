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

const WRAPPER = Style.registerStyle({
  width: '100vmin',
  minHeight: '100vh',
  margin: 'auto',
  backgroundColor: theme.bgColor,
});

const STYLE = Style.registerStyle({
  display: 'flex',
  flexDirection: 'column',
  fontFamily: theme.fontFamily,
  color: theme.color,
  width: '100%',
  height: '100%',
  textAlign: 'left',
  fontSize: '4vmin',
});

const BRAND_HEADER = Style.registerStyle({
  margin: 0,
  fontWeight: 400,
  marginTop: '-0.7vmin',
  textTransform: 'lowercase',
  fontSize: '4vmin',
  opacity: 0.5,
});

const topBarHeight = 15;

const TOP_BAR = Style.registerStyle({
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

const CHORD_TEXT_INPUT = Style.registerStyle({
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

const TRANSPOSE_INPUT = Style.registerStyle({
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

const TRANSPOSE_INDICATOR = Style.registerStyle({
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

const BUTTON = Style.registerStyle({
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

let EDIT_BUTTON = Style.registerStyle(BUTTON.style, {
  width: '20vmin',
});

const LABEL = Style.registerStyle({
  margin: 0,
  marginBottom: '2vmin',
  fontSize: '5vmin',
  fontWeight: 600,
  color: theme.labelColor,
});

const CHORD_OUTPUT = Style.registerStyle({
  width: '100%',
  marginTop: `${topBarHeight}vmin`,
});

const fretboard = createFretboard({
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
  opacity: 0.8,
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

function addChordsToLayout ({chords, layout}) {
  const secondToLastSection = layout.get(layout.size-2).push(...getChordInputIDs(chords).toJS());
  return layout.set(layout.size-2, secondToLastSection);
}

let App = React.createClass({
  getDefaultProps: function () {
    const chordText = 'C G Am F';
    const chords = getChordInputsFromChordText({chordText});
    const layout = addChordsToLayout({
      layout: Immutable.fromJS([[]]),
      chords,
    });

    return {
      chordText: '',
      transpose: 0,
      chords: chords,
      chordInputs: Immutable.List(),
      chordVariations: Immutable.Map(),
      layout: processLayout({layout}),
      editing: false,
    };
  },
  
  getInitialState: function () {
    return Object.assign({}, this.props);
  },

  deleteChord: function (chordID) {
    let chordIdx;
    const sectionIdx = this.state.layout.findIndex(section => (chordIdx = section.indexOf(chordID)) >= 0);
    const layout = this.state.layout.set(sectionIdx, this.state.layout.get(sectionIdx).splice(chordIdx, 1));
    this.setState({
      layout: processLayout({layout}),
      chords: this.state.chords.splice(this.state.chords.findIndex(c => c.id === chordID), 1),
    })
  },

  render: function () {
    const {
      chordInputs,
      chordVariations,
      chords,
      editing,
      chordBeingEdited,
    } = this.state;

    let layout = this.state.layout;
    // console.log('layout', layout && layout.toJS());

    if (chordInputs.size > 0) {
      layout = addChordsToLayout({chords: chordInputs, layout});
    }

    let chordTextInput;
    let onSubmit;

    if (editing && !!chordBeingEdited) {
      chordTextInput = (
        <input className={CHORD_TEXT_INPUT.className}
          type="text"
          ref="chordText"
          value={this.state.chordText}
          spellCheck={false}
          onChange={(e) => {
            const chordText = e.target.value;
            let chord = chords.find(c => c.id === chordBeingEdited);
            chord.text = chordText;
            this.setState({
              chordText: chordText,
            });
          }}
        />
      );
    
      onSubmit = (e) => {
        e.preventDefault();
        this.setState({
          chordText: '',
          chordBeingEdited: null,
        });
      }

    } else {
      chordTextInput = (
        <input className={CHORD_TEXT_INPUT.className}
          type="text"
          ref="chordText"
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
      );

      onSubmit = (e) => {
        e.preventDefault();
        const chordInputIDs = getChordInputIDs(chordInputs);
        // const layout = this.state.layout;
        // const secondToLastSection = layout.get(layout.size-2).push(...(chordInputIDs.toJS()));
        // const newLayout = layout.set(layout.size-2, secondToLastSection);
        this.setState({
          chords: this.state.chords.push(...(chordInputs.toJS())),
          layout: processLayout({layout}),
          chordText: '',
          chordInputs: Immutable.List(),
        });
      };
    }
    
    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className}>
          <form className={TOP_BAR.className}
            onSubmit={onSubmit}
          >
            {chordTextInput}
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

            <div className={EDIT_BUTTON.className} onClick={(e) => {
              this.setState({
                editing: !editing,
                chordBeingEdited: null,
                chordText: '',
                chordInputs: Immutable.List(),
              });
            }}>{editing ? 'Done' : 'Edit'}</div>

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
                let hovering = false;
                let inactive = false;
                if (chordInputs.size > 0) {
                  locked = true;
                  if (idx < this.state.chords.size) {
                    inactive = true;
                  } else {
                    hovering = true;
                  }
                } else if (editing && !!chordBeingEdited) {
                  if (chord.id === chordBeingEdited) {
                    hovering = true;
                  } else {
                    inactive = true;
                  }
                }
                return <ChordCard
                  key={chord.id}
                  locked={locked}
                  hovering={hovering}
                  inactive={inactive}
                  chord={chord.text}
                  canDelete={editing && !hovering && !chordBeingEdited}
                  onDelete={() => {
                    this.deleteChord(chord.id);
                  }}
                  variation={chordVariations.get(chord.id)}
                  onClick={() => {
                    if (editing) {
                      this.setState({
                        chordBeingEdited: chord.id,
                        chordText: chord.text,
                      });
                      React.findDOMNode(this.refs.chordText).focus();

                    } else {
                      console.log('variation changed...', (chordVariations.get(chord.id)||0) + 1);
                      this.setState({
                        chordVariations: chordVariations.set(chord.id, ((chordVariations.get(chord.id)||0) + 1)%16),
                      });
                    }
                  }}
                  fretboard={fretboard}
                  fretWindow={5}
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