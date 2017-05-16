import React, {PropTypes} from 'react';
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
import isFunc from './isFunc';

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
  // tuning: ['D', 'G', 'B', 'E'],
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

const SONG_TITLE = Style.registerStyle({
  flexGrow: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginLeft: `${theme.mainPadding*2}vmin`,
  color: theme.dark,
  textTransform: 'none',
  // fontWeight: 700,
  fontSize: '4vmin',
});

const minSectionCount = 4;

function processLayout ({layout}) {
  // Filter empty sections:
  const filteredLayout = layout.filter(section => section.size > 0);
  // return filteredLayout.push(Immutable.List());
  const empties = Immutable.Range(0, Math.max(1, minSectionCount - filteredLayout.size)).toList().map(c => Immutable.List());
  return filteredLayout.push(...empties.toArray());
}

function getChordInputsFromChordText ({chordInputText, chordInputs=Immutable.List(), transposeOffset=0}) {
  let filteredInputText = Immutable.List(chordInputText.split(/\s/).filter(c => c.length > 0));
  
  if (filteredInputText.size === 0) {
    filteredInputText = filteredInputText.push('');
  }

  return filteredInputText.map((chord, idx) => {
    const existingChord = chordInputs.get(idx);
    return Immutable.fromJS({
      id: existingChord ? existingChord.get('id') : uuid.v4(),
      text: chord,
      transposeOffset,
    });
  });
}

function getChordInputIDs (chordInputs) {
  return chordInputs.map(c => c.get('id'));
}

function preventDefault (e) {
  e.preventDefault();
}

function findLastEmptySection (layout) {
  return Math.max(0, layout.findLastIndex(section => section.size > 0));;
}

function addChordsToLayout ({chords, layout, sectionToAddTo=findLastEmptySection(layout)}) {
  const secondToLastSection = layout.get(sectionToAddTo).push(...getChordInputIDs(chords).toArray());
  return layout.set(sectionToAddTo, secondToLastSection);
}

let ChordLayoutEditor = React.createClass({
  propTypes: {
    song: PropTypes.object.isRequired,
    onSongChanged: PropTypes.func.isRequired,
  },

  getDefaultProps: function () {
    return {
    };
  },
  
  getInitialState: function () {
    return {
      chordInputText: '',
      chordInputs: Immutable.List(),
      transpose: 0,
      editing: false,
    };
  },

  componentWillUpdate: function (newProps, newState) {
  },

  deleteChord: function (chordID) {
    let chordIdx;
    const song = this.props.song;
    const layout = song.get('layout');
    const chords = song.get('chords');

    const sectionIdx = layout.findIndex(section => (chordIdx = section.indexOf(chordID)) >= 0);
    const newLayout = layout.set(sectionIdx, layout.get(sectionIdx).splice(chordIdx, 1));
    const newChords = chords.splice(chords.findIndex(c => c.get('id') === chordID), 1);
    const newSong = song.set('layout', processLayout({layout: newLayout})).set('chords', newChords);
    this.props.onSongChanged(newSong);

    this.setState({
      editing: newChords.size > 0 ? this.state.editing : false,
    });
  },

  renderTopBar_editing: function () {
    const {
      chordInputs,
      editing,
      chordBeingEdited,
    } = this.state;

    const song = this.props.song;
    const chords = song.get('chords');
    const transpose = song.get('transpose') || 0;
    const onSongChanged = this.props.onSongChanged;
    
    const hiddenIfThereAreNoChords = {
      visibility: chords.size > 0 ? 'visible' : 'hidden',
    };

    return (
      <form className={theme.BOTTOM_BAR.className}
        onSubmit={(e) => {
          e.preventDefault();
          this.setState({
            chordInputText: '',
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
            chordInputText: '',
            chordInputs: Immutable.List(),
          });
        }}>
          Done
        </div>

        {!!chordBeingEdited &&
          <input className={CHORD_TEXT_INPUT.className}
            key={'chord text editor'}
            type="text"
            ref="chordInputText"
            value={this.state.chordInputText}
            spellCheck={false}
            onClick={e => e.stopPropagation()}
            autoFocus={true}
            onChange={(e) => {
              const chordInputText = e.target.value;
              this.setState({
                chordInputText: chordInputText,
              });
              const [chordIdx, chord] = chords.findEntry(c => c.get('id') === chordBeingEdited);
              const newSong = song.set('chords', chords.set(chordIdx, chord.set('text', chordInputText)));
              onSongChanged(newSong);
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
            const newSong = song.set('transpose', mod(transpose-1, 12));
            onSongChanged(newSong);
          }}>-</div>
        }

        {!chordBeingEdited &&
          <div className={TRANSPOSE_BUTTON.className} onClick={(e) => {
            const newSong = song.set('transpose', mod(transpose+1, 12));
            onSongChanged(newSong);
          }}>+</div>
        }
        
        <input type="submit" style={{height: 0, padding: 0, margin: 0, position: 'absolute', visibility: 'hidden'}} />
      </form>
    );
  },

  renderTopBar_adding: function ({layout}) {
    const {
      chordInputs,
      transpose,
    } = this.state;
    
    return (
      <form className={theme.BOTTOM_BAR.className}
        onSubmit={(e) => {
          e.preventDefault();

          let chordsToAdd;
          if (chordInputs.size === 1 && chordInputs.get(0).get('text').trim() === '') {
            let idToRemove = chordInputs.get(0).get('id');
            chordsToAdd = Immutable.List();
            layout = layout.map(section => section.filter(id => id !== idToRemove));
          } else {
            chordsToAdd = chordInputs;
          }

          const song = this.props.song;
          const newChords = song.get('chords').push(...chordsToAdd.toArray());
          const newSong = song.set('layout', processLayout({layout})).set('chords', newChords);
          this.props.onSongChanged(newSong);

          this.setState({
            chordInputText: '',
            chordInputs: Immutable.List(),
            adding: false,
          });
        }}
      >
        <div className={EDIT_BUTTON.className} onClick={(e) => {
          e.stopPropagation();
        
          this.setState({
            adding: false,
            chordInputText: '',
            chordInputs: Immutable.List(),
          });
        }}>
          Cancel
        </div>

        <input className={CHORD_TEXT_INPUT.className}
          type="text"
          ref="chordInputText"
          placeholder="Enter Chord Name"
          value={this.state.chordInputText}
          autoFocus={true}
          spellCheck={false}
          onChange={(e) => {
            const chordInputText = e.target.value;
            const chordInputs = getChordInputsFromChordText({chordInputText, chordInputs: this.state.chordInputs, transpose});

            this.setState({
              chordInputText: chordInputText,
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
      editing,
      chordBeingEdited,
    } = this.state;

    const song = this.props.song;
    const chords = song.get('chords');

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
              chordInputText: '',
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
          const chordInputText = '';
          this.setState({
            editing: false,
            adding: true,
            sectionToAddTo: null,
            chordInputText,
            chordInputs: getChordInputsFromChordText({chordInputText}),
          }, () => {
            React.findDOMNode(this.refs.chordInputText).focus();
          });
        }}>
          Add Chords
        </div>

        <input type="submit" style={{height: 0, padding: 0, margin: 0, position: 'absolute', visibility: 'hidden'}} />
      </form>
    );
  },

  render: function () {
    const {
      song,
      onClickSongsButton,
      onSongChanged,
    } = this.props;

    const chords = song.get('chords');
    let layout = processLayout({layout: song.get('layout')});
    const transpose = song.get('transpose') || 0;

    const {
      chordInputs,
      editing,
      adding,
      chordBeingEdited,
      sectionToAddTo,
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

                if (isFunc(onClickSongsButton)) {
                  onClickSongsButton();
                }
              }}
            >
              <strong>&lt;</strong>&nbsp;&nbsp;Songs
            </div>

            <div className={SONG_TITLE.className}>
              {song.get('title')}
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
                const newLayout = processLayout({layout});
                const newSong = song.set('layout', newLayout);
                onSongChanged(newSong);
              }}
              onClickSection={!this.state.adding && !this.state.editing ? (sectionNumber) => {
                const chordInputText = '';

                this.setState({
                  adding: true,
                  editing: false,
                  chordInputText,
                  chordInputs: getChordInputsFromChordText({chordInputText, sectionToAddTo: sectionNumber}),
                  sectionToAddTo: sectionNumber
                });
              } : null}
            >
              {chords.push(...chordInputs.toArray()).map((chord, idx) => {
                const chordID = chord.get('id');
                const chordText = chord.get('text');

                let style = {
                  cursor: 'pointer',
                };

                let locked = false;
                let hovering = false;
                let inactive = false;

                if (chordInputs.size > 0) {
                  locked = true;
                  if (idx < chords.size) {
                    inactive = true;
                  } else {
                    hovering = true;
                  }
                } else if (editing && !!chordBeingEdited) {
                  if (chordID === chordBeingEdited) {
                    hovering = true;
                  } else {
                    inactive = true;
                  }
                }

                return <ChordCard
                  key={chordID}
                  locked={locked}
                  hovering={hovering}
                  inactive={inactive}
                  chord={chordText}
                  canDelete={editing && !hovering && !chordBeingEdited}
                  onDelete={() => {
                    this.deleteChord(chordID);
                  }}
                  variation={chord.get('variation')}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (editing) {
                      this.setState({
                        chordBeingEdited: chordID,
                        chordInputText: chordText,
                      }, () => {
                        React.findDOMNode(this.refs.chordInputText).focus();
                      });
                    } else {
                      const chordIdx = chords.findIndex(c => c.get('id') === chordID);
                      
                      if (chordIdx < 0) {
                        // TODO: Allow variations while inputting?
                        return;
                      }

                      const newChord = chord.set('variation', (chord.get('variation') || 0) + 1);
                      const newSong = song.set('chords', chords.set(chordIdx, newChord));
                      onSongChanged(newSong);
                    }
                  }}
                  fretboard={fretboard}
                  fretWindow={8}
                  transpose={transpose}
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

export default Style.component(ChordLayoutEditor);