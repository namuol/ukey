import React from 'react';
import Style from './Style';
import theme from './theme';

import Color from 'color';

const SONG = Style.registerStyle({
  display: 'flex',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
  borderBottom: `0.3vmin solid ${Color(theme.dark).clearer(0.8).rgbString()}`,
  height: `${12}vmin`,
  color: theme.dark,
  fontWeight: 700,
  cursor: 'pointer',
});

const chevronWidth = 10;
const SONG_TITLE = Style.registerStyle({
  flexGrow: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingLeft: `${theme.mainPadding}vmin`,
  maxWidth: `${100 - chevronWidth - theme.mainPadding}vmin`,
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

class Song extends React.Component {
  render () {
    return (
      <div className={SONG.className}>
        <div className={SONG_TITLE.className}>
          {this.props.title}
        </div>

        <div className={SONG_CHEVRON.className}>
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

class SongList extends React.Component {
  render () {
    return (
      <div className={theme.WRAPPER.className}>
        <div className={STYLE.className}>
          <div className={theme.TOP_BAR.className}>
            <div>
              {/*SPACER*/}
            </div>

            <div className={NEW_BUTTON.className}>
              New
            </div>
          </div>
          
          <div className={SONG_LIST.className}>
            <Song title="a song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song, but this one has a ridiculously long title that will probably wrap around and ruin everything. Great job." />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
            <Song title="Another song!" />
          </div>
          
          {/*
          <div className={theme.BOTTOM_BAR.className}>
            Bottom Bar
          </div>
          */}
        </div>

        <Style.Element />
      </div>
    );
  }
}

export default Style.component(SongList);