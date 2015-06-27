import React from 'react';
import Style from './Style';
import theme from './theme';

import Color from 'color';

import UserData from './UserData';

import Immutable from 'immutable';

import uuid from 'uuid';

import isFunc from './isFunc';

const deleteAnimationDuration = 200;

const songHeight = 12;
const SONG = Style.registerStyle({
  display: 'flex',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
  borderBottom: `0.3vmin solid ${Color(theme.dark).clearer(0.8).rgbString()}`,
  height: `${songHeight}vmin`,
  color: theme.dark,
  fontWeight: 700,
  cursor: 'pointer',
  position: 'relative',
  transitionProperty: `padding, height, opacity, border`,
  transitionDuration: `${deleteAnimationDuration}ms`,
  overflow: 'hidden',
});

const SONG_CAN_DELETE = Style.registerStyle(SONG.style, {
  paddingLeft: `${theme.badgeWidth + theme.mainPadding}vmin`,
});

const SONG_HIDDEN = Style.registerStyle(SONG.style, {
  height: 0,
  borderBottom: 0,
  opacity: 0.2,
});

const SONG_DELETED = Style.registerStyle(SONG_HIDDEN.style, {
  paddingLeft: `${theme.badgeWidth + theme.mainPadding}vmin`,
});

const chevronWidth = 10;
const SONG_TITLE = Style.registerStyle({
  flexGrow: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingLeft: `${theme.mainPadding}vmin`,
  width: '100%',
  maxWidth: `${100 - chevronWidth - theme.mainPadding}vmin`,
  height: `${songHeight - theme.mainPadding*2}vmin`,
  display: 'flex',
  alignItems: 'center',
});

const SONG_TITLE_INPUT = Style.registerStyle({
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  backgroundColor: 'white',
  borderRadius: `1vmin`,
  border: 0,
  outline: 0,
  height: '100%',
  width: '100%',
  padding: `${theme.mainPadding/2}vmin`,
});

const SONG_CHEVRON = Style.registerStyle({
  fontWeight: 700,
  fontSize: '6vmin',
  width: `${chevronWidth}vmin`,
  textAlign: 'center',
  flexShrink: 0,
  margin: 0,
  color: Color(theme.dark).clearer(0.3).rgbString(),
});

const DELETE_BUTTON = Style.registerStyle(theme.BADGE.style, {
  transform: 'scale(1)',
  left: `${theme.mainPadding}vmin`,
  top: `${theme.badgeWidth/2}vmin`,
  // border: 0,
  cursor: 'pointer',
  transitionTimingFunction: 'ease',
});

const DELETE_BUTTON_HIDDEN = Style.registerStyle(DELETE_BUTTON.style, {
  opacity: 0,
  left: `${-theme.badgeWidth}vmin`,
});

class Song extends React.Component {
  state = (() => {
    return {
      visible: !this.props.animate,
      title: this.props.title,
    };
  })();

  componentDidMount () {
    setTimeout(() => {
      this.setState({
        visible: true,
      });
    }, 10);
  }

  render () {
    const {
      canDelete,
      editing,
    } = this.props;
    
    const {
      deleted,
      visible,
      title,
    } = this.state;

    let SONG_className;
    
    if (deleted) {
      SONG_className = SONG_DELETED.className;
    } else if (!visible) {
      SONG_className = SONG_HIDDEN.className;
    } else if (canDelete) {
      SONG_className = SONG_CAN_DELETE.className;
    } else {
      SONG_className = SONG.className;
    }

    const DELETE_BUTTON_className = canDelete ? DELETE_BUTTON.className : DELETE_BUTTON_HIDDEN.className;

    return (
      <div className={SONG_className} onClick={!deleted && this.props.onClick}>
        <div className={DELETE_BUTTON_className} onClick={(e) => {
          if (!canDelete) {
            return;
          }

          e.stopPropagation();

          setTimeout(this.props.onDelete, deleteAnimationDuration);
          this.setState({
            deleted: true,
          });
        }}>⨯</div>
        {
          editing ?
            <form className={SONG_TITLE.className}
              onSubmit={(e) => {
                e.preventDefault();

                if (isFunc(this.props.onTitleChange)) {
                  this.props.onTitleChange(title);
                }
              }}
            >
              <input className={SONG_TITLE_INPUT.className}
                autoFocus={true}
                onFocus={(e) => {
                  e.target.select();
                }}
                onBlur={(e) => {
                  e.preventDefault();

                  if (isFunc(this.props.onTitleChange)) {
                    this.props.onTitleChange(title);
                  }
                }}
                type='text'
                value={title}
                onChange={(e) => {
                  this.setState({
                    title: e.target.value,
                  });
                }}
              />
            </form>
          :
            <div className={SONG_TITLE.className}>
              {this.props.title}
            </div>
        }

        <div className={SONG_CHEVRON.className} style={{
          display: canDelete ? 'none' : 'block',
        }}>
          &gt;
        </div>
      </div>
    );
  }
}

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

const SONG_LIST = Style.registerStyle({
  width: '100%',
  marginTop: `${theme.topBarHeight}vmin`,
  // marginBottom: `${theme.bottomBarHeight}vmin`,
  // paddingLeft: `${theme.mainPadding}vmin`,
});

const NEW_BUTTON = Style.registerStyle(theme.BUTTON.style, {
  flexGrow: 0,
  fontWeight: 700,
});

function getDefaultSongTitle (existingSongs) {
  const matcher = /Untitled Song #(\d+)/gi;

  const maxUntitledSongNumber = existingSongs.reduce((result, song) => {
    const number = parseInt(song.get('title').replace(matcher, '$1')) || 0;
    return Math.max(result, number);
  }, 0);

  return `Untitled Song #${maxUntitledSongNumber + 1}`;
}

class SongList extends React.Component {
  state = (() => {
    return {
      animateNewlyMountedSongs: false,
    };
  })();

  componentDidMount () {
    this.setState({
      animateNewlyMountedSongs: true,
    });
  }

  render () {
    const {
      songs,
    } = this.props;

    const {
      editing,
      songIsNew,
      songBeingEdited,
      animateNewlyMountedSongs,
    } = this.state;

    return (
      <div className={STYLE.className}>
        <div className={theme.TOP_BAR.className}>
          <div>
            <div className={NEW_BUTTON.className}
              onClick={() => {
                this.setState({
                  editing: !editing,
                  songBeingEdited: null,
                });
              }}
              style={{
                fontWeight: editing ? 700 : 400,
              }}
            >
              {editing ? 'Done' : 'Edit'}
            </div>
          </div>

          <div className={NEW_BUTTON.className}
            onClick={() => {
              const songID = uuid.v4();

              UserData.set('songs', songs.push(Immutable.fromJS({
                id: songID,
                title: getDefaultSongTitle(songs),
                chords: [],
                layout: [],
              })));

              this.setState({
                songBeingEdited: songID,
                songIsNew: true,
              });
            }}
            style={{
              visibility: editing ? 'hidden' : 'visible',
            }}
          >
            New
          </div>
        </div>
        
        <div className={SONG_LIST.className}>
          {songs.reverse().map((song, reverseIDX) => {
            const songID = song.get('id');
            const idx = songs.size - reverseIDX - 1;

            return <Song key={songID}
              title={song.get('title')}
              animate={animateNewlyMountedSongs}
              editing={songBeingEdited === songID}
              canDelete={editing}
              onClick={
                editing ? (() => {
                  this.setState({
                    songBeingEdited: songID,
                  });
                })
                :
                (() => {
                  if (isFunc(this.props.onSelectSong)) {
                    this.props.onSelectSong(song);
                  }
                })
              }
              onDelete={() => {
                this.setState({
                  songBeingEdited: null,
                });
                UserData.set('songs', songs.splice(idx, 1));
              }}
              onTitleChange={(newTitle) => {
                this.setState({
                  songBeingEdited: null,
                  songIsNew: false,
                });

                const newSong = song.set('title', newTitle);
                UserData.set('songs', songs.set(idx, newSong));

                if (songIsNew && isFunc(this.props.onSelectSong)) {
                  this.props.onSelectSong(newSong);
                }
              }}
            />;
          })}
        </div>
        
        {/*
        <div className={theme.BOTTOM_BAR.className}>
          Bottom Bar
        </div>
        */}
      </div>
    );
  }
}

export default Style.component(SongList);