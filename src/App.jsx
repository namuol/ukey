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

const CHORD_TEXT_INPUT = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '5vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  padding: '1.5vmin 2vmin',
  flexGrow: 2,
  width: '20vmin',
  fontWeight: 700,
  height: '100%',
  cursor: 'pointer',
  marginLeft: `${theme.mainPadding}vmin`,
  transition: 'width 250ms, flex-grow 250ms',
  textAlign: 'center',
});

const TRANSPOSE_BUTTON = Style.registerStyle(theme.BUTTON.style, {
  // backgroundColor: Color(theme.highlight).lighten(0.3).rgbString(),
  // color: 'white',
  fontSize: '8vmin',
  width: '6vmin',
  fontWeight: 400,
  backgroundColor: 'rgba(0,0,0,0.1)',
});

const TRANSPOSE_INDICATOR = Style.registerStyle(theme.BUTTON.style, {
  color: 'rgba(0,0,0,0.7)',
  cursor: 'initial',
  padding: 0,
});

let EDIT_BUTTON = Style.registerStyle(theme.BUTTON.style, {
  minWidth: '20vmin',
  flexGrow: 0,
  flexShrink: 0,
  marginLeft: 0,
});

let BACK_BUTTON = Style.registerStyle(theme.BUTTON.style, {
  minWidth: '12vmin',
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
  marginTop: `${theme.topBarHeight}vmin`,
  marginBottom: `${theme.bottomBarHeight}vmin`,
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

const minSectionCount = 4;

function processLayout ({layout}) {
  // Filter empty sections:
  const filteredLayout = layout.filter(section => section.size > 0);
  // return filteredLayout.push(Immutable.List());
  const empties = Immutable.Range(0, Math.max(1, minSectionCount - filteredLayout.size)).toJS().map(c => Immutable.List());
  return filteredLayout.push(...empties);
}

function getChordInputsFromChordText ({chordText, chordInputs=Immutable.List()}) {
  let filteredInputText = Immutable.List(chordText.split(/\s/).filter(c => c.length > 0));
  
  if (filteredInputText.size === 0) {
    filteredInputText = filteredInputText.push('');
  }

  return filteredInputText.map((chord, idx) => {
    const existingChord = chordInputs.get(idx);
    return {
      id: existingChord ? existingChord.id : uuid.v4(),
      text: chord,
    };
  });
}

function getChordInputIDs (chordInputs) {
  return chordInputs.map(c => c.id);
}

function preventDefault (e) {
  e.preventDefault();
}

function findLastEmptySection (layout) {
  return Math.max(0, layout.findLastIndex(section => section.size > 0));;
}

function addChordsToLayout ({chords, layout, sectionToAddTo=findLastEmptySection(layout)}) {
  const secondToLastSection = layout.get(sectionToAddTo).push(...getChordInputIDs(chords).toJS());
  return layout.set(sectionToAddTo, secondToLastSection);
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
    
    const hiddenIfThereAreNoChords = {
      visibility: chords.size > 0 ? 'visible' : 'hidden',
    };

    return (
      <form className={theme.BOTTOM_BAR.className}
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
          <div className={TRANSPOSE_INDICATOR.className}
            style={hiddenIfThereAreNoChords}
          >
            Transpose: +<span style={{width: '4vmin'}}>{transpose}</span>
          </div>
        }

        {!chordBeingEdited &&
          <div className={TRANSPOSE_BUTTON.className} onClick={(e) => {
            this.setState({
              transpose: mod(transpose-1, 12),
            });
          }}>-</div>
        }

        {!chordBeingEdited &&
          <div className={TRANSPOSE_BUTTON.className} onClick={(e) => {
            this.setState({
              transpose: mod(transpose+1, 12),
            });
          }}>+</div>
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
      <form className={theme.BOTTOM_BAR.className}
        onSubmit={(e) => {
          e.preventDefault();

          let chordsToAdd;
          if (chordInputs.size === 1 && chordInputs.get(0).text.trim() === '') {
            let toRemove = chordInputs.get(0);
            chordsToAdd = Immutable.List();
            layout = layout.map(section => section.filter(id => id !== toRemove.id));
          } else {
            chordsToAdd = chordInputs;
          }

          this.setState({
            chords: this.state.chords.push(...(chordsToAdd.toJS())),
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

            this.setState({
              chordText: chordText,
              chordInputs: chordInputs,
            });
          }}
        />

        <input type="submit" value="Done" className={EDIT_BUTTON.className} style={{
          marginLeft: theme.BUTTON.style['margin-left'],
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
      <form className={theme.BOTTOM_BAR.className}>
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

        <div className={EDIT_BUTTON.className} style={{
          marginLeft: theme.BUTTON.style['margin-left'],
          fontWeight: 700,
        }} onClick={(e) => {
          e.stopPropagation();
          const chordText = '';
          this.setState({
            editing: false,
            adding: true,
            sectionToAddTo: null,
            chordText,
            chordInputs: getChordInputsFromChordText({chordText}),
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
      sectionToAddTo,
    } = this.state;

    let {
      layout,
    } = this.state;

    if (chordInputs.size > 0) {
      let params = {
        chords: chordInputs,
        layout,
      };

      if (typeof sectionToAddTo === 'number') {
        params.sectionToAddTo = sectionToAddTo;
      }
      layout = addChordsToLayout(params);
    }

    let bottomBar;
    
    if (adding) {
      bottomBar = this.renderTopBar_adding({layout});
    } else if (editing) {
      bottomBar = this.renderTopBar_editing({layout});
    } else {
      bottomBar = this.renderTopBar_default({layout});
    }

    return (
      <div className={theme.WRAPPER.className} onClick={() => {
        if (editing && chordBeingEdited) {
          this.setState({
            chordBeingEdited: null,
          });
        }
      }}>
        <div className={STYLE.className}>
          <div className={theme.TOP_BAR.className}>
            <div className={BACK_BUTTON.className}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <strong>&lt;</strong>&nbsp;&nbsp;Songs
            </div>
          </div>

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
              onClickSection={!this.state.adding && !this.state.editing ? (sectionNumber) => {
                const chordText = '';

                this.setState({
                  adding: true,
                  editing: false,
                  chordText,
                  chordInputs: getChordInputsFromChordText({chordText, sectionToAddTo: sectionNumber}),
                  sectionToAddTo: sectionNumber
                });
              } : null}
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

          {bottomBar}
        </div>

        <Style.Element />
      </div>
    );
  }
});

export default Style.component(App);