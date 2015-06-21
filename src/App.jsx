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

  // HACK: Why do I have to do this?
  transform: 'translate3d(0,0,0)',
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
  cursor: 'pointer',
  marginLeft: `${theme.mainPadding}vmin`,
  transition: 'width 250ms, flex-grow 250ms',
  textAlign: 'center',
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
  width: '8vmin',
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
  fontWeight: 400,
  // color: 'white',
  color: theme.highlight,
  flexGrow: 1,
  flexShrink: 0,
  height: '100%',
  marginLeft: `${theme.mainPadding}vmin`,
  // backgroundColor: theme.highlight,
  backgroundColor: 'transparent',
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
  minWidth: '24vmin',
  flexGrow: 0,
  flexShrink: 0,
  marginLeft: 0,
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

const minSectionCount = 6;

function processLayout ({layout}) {
  // Filter empty sections:
  const filteredLayout = layout.filter(section => section.size > 0);
  // return filteredLayout.push(Immutable.List());
  const empties = Immutable.Range(0, Math.max(1, minSectionCount - filteredLayout.size)).toJS().map(c => Immutable.List());
  return filteredLayout.push(...empties);
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
  let lastNonEmptySlot = Math.max(0, layout.findLastIndex(section => section.size > 0));
  const secondToLastSection = layout.get(lastNonEmptySlot).push(...getChordInputIDs(chords).toJS());
  return layout.set(lastNonEmptySlot, secondToLastSection);
}

let App = React.createClass({
  getDefaultProps: function () {
    const chordText = 'C G Am F D';
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
    const newChords = this.state.chords.splice(this.state.chords.findIndex(c => c.id === chordID), 1);

    this.setState({
      layout: processLayout({layout}),
      chords: newChords,
      editing: newChords.size > 0 ? this.state.editing : false,
    });
  },

  renderTopBar_editing: function () {
    const {
      chordInputs,
      chordVariations,
      chords,
      editing,
      chordBeingEdited,
      transpose,
    } = this.state;
    console.log('chordBeingEdited', chordBeingEdited);

    return (
      <form className={TOP_BAR.className}
        onSubmit={(e) => {
          e.preventDefault();
          this.setState({
            chordText: '',
            chordBeingEdited: null,
          });
        }}
      >
        <div className={EDIT_BUTTON.className} style={{
          fontWeight: 700,
        }} onClick={(e) => {
          e.stopPropagation();

          this.setState({
            editing: false,
            chordBeingEdited: null,
            chordText: '',
            chordInputs: Immutable.List(),
          });
        }}>
          Done
        </div>

        {!!chordBeingEdited &&
          <input className={CHORD_TEXT_INPUT.className}
            key={'chord text editor'}
            type="text"
            ref="chordText"
            value={this.state.chordText}
            spellCheck={false}
            onClick={e => e.stopPropagation()}
            autoFocus={true}
            onChange={(e) => {
              const chordText = e.target.value;
              let chord = chords.find(c => c.id === chordBeingEdited);
              chord.text = chordText;
              this.setState({
                chordText: chordText,
              });
            }}
          />
        }

        {!chordBeingEdited &&
          <div className={EDIT_BUTTON.className} style={{
            marginLeft: BUTTON.style['margin-left'],
          }} onClick={(e) => {
            e.stopPropagation();

            this.setState({
              editing: false,
              adding: true,
            }, () => {
              React.findDOMNode(this.refs.chordText).focus();
            });
          }}>
            Add
          </div>
        }
        
        <input type="submit" style={{height: 0, padding: 0, margin: 0, position: 'absolute', visibility: 'hidden'}} />
      </form>
    );
  },

  renderTopBar_adding: function ({layout}) {
    const {
      chordInputs,
      chords,
    } = this.state;
    return (
      <form className={TOP_BAR.className}
        onSubmit={(e) => {
          e.preventDefault();
          const chordInputIDs = getChordInputIDs(chordInputs);
          this.setState({
            chords: this.state.chords.push(...(chordInputs.toJS())),
            layout: processLayout({layout}),
            chordText: '',
            chordInputs: Immutable.List(),
            adding: false,
          });
        }}
      >
        <div className={EDIT_BUTTON.className} onClick={(e) => {
          e.stopPropagation();
        
          this.setState({
            adding: false,
            chordText: '',
            chordInputs: Immutable.List(),
          });
        }}>
          Cancel
        </div>

        <input className={CHORD_TEXT_INPUT.className}
          type="text"
          ref="chordText"
          value={this.state.chordText}
          autoFocus={true}
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

        <input type="submit" value="Done" className={EDIT_BUTTON.className} style={{
          marginLeft: BUTTON.style['margin-left'],
          fontWeight: 700,
        }} onClick={(e) => {
          e.stopPropagation();
        }}/>
      </form>
    );
  },

  renderTopBar_default: function ({layout}) {
    const {
      chordInputs,
      chordVariations,
      chords,
      editing,
      chordBeingEdited,
      transpose,
    } = this.state;
    
    const hiddenIfThereAreNoChords = {
      visibility: chords.size > 0 ? 'visible' : 'hidden',
    };

    return (
      <form className={TOP_BAR.className}>
        <div className={EDIT_BUTTON.className}
          style={hiddenIfThereAreNoChords}
          onClick={(e) => {
            this.setState({
              editing: true,
              chordBeingEdited: null,
              chordText: '',
              chordInputs: Immutable.List(),
              adding: false,
            });
          }}
        >
          Edit
        </div>

        {/*
        <div className={BUTTON.className} onClick={(e) => {
          this.setState({
            transpose: mod(transpose-1, 12),
          });
        }}>▼</div>

        <div className={TRANSPOSE_INDICATOR.className}>
          {`+${transpose}`}
        </div>

        <div className={BUTTON.className} onClick={(e) => {
          this.setState({
            transpose: mod(transpose+1, 12),
          });
        }}>▲</div>
        */}

        <div className={BUTTON.className}
          style={hiddenIfThereAreNoChords}
          onClick={(e) => {
            e.stopPropagation();

            this.setState({
              transposing: true,
            });
          }}
        >
          Transpose
        </div>

        <div className={EDIT_BUTTON.className} style={{
          marginLeft: BUTTON.style['margin-left'],
          fontWeight: 700,
        }} onClick={(e) => {
          e.stopPropagation();

          this.setState({
            editing: false,
            adding: true,
          }, () => {
            React.findDOMNode(this.refs.chordText).focus();
          });
        }}>
          Add
        </div>

        <input type="submit" style={{height: 0, padding: 0, margin: 0, position: 'absolute', visibility: 'hidden'}} />
      </form>
    );
  },

  render: function () {
    const {
      chordInputs,
      chordVariations,
      chords,
      editing,
      adding,
      chordBeingEdited,
    } = this.state;

    let {
      layout,
    } = this.state;

    if (chordInputs.size > 0) {
      layout = addChordsToLayout({chords: chordInputs, layout});
    }

    let topBar;
    
    if (adding) {
      topBar = this.renderTopBar_adding({layout});
    } else if (editing) {
      topBar = this.renderTopBar_editing({layout});
    } else {
      topBar = this.renderTopBar_default({layout});
    }

    return (
      <div className={WRAPPER.className} onClick={() => {
        if (editing && chordBeingEdited) {
          this.setState({
            chordBeingEdited: null,
          });
        }
      }}>
        <div className={STYLE.className}>
          {topBar}

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
                  onClick={(e) => {
                    e.stopPropagation();

                    if (editing) {
                      this.setState({
                        chordBeingEdited: chord.id,
                        chordText: chord.text,
                      }, () => {
                        React.findDOMNode(this.refs.chordText).focus();
                      });
                    } else {
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