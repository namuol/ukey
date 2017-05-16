import React from 'react';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import SongList from './SongList';
import ChordLayoutEditor from './ChordLayoutEditor';

import UserData from './UserData';

function serializeLayout (layout) {
  return layout;
}

class App extends React.Component {

  state = (() => {
    return {
    };
  })();

  componentWillMount () {
    this._refreshSongs = () => {
      this.setState({
        songs: UserData.get('songs') || Immutable.List(),
      });
    };

    UserData.on('change:songs', this._refreshSongs);
    this._refreshSongs();
  }

  componentDidMount () {
    this.setState({
      animateNewlyMountedSongs: true,
    });
  }

  componentWillUnmount () {
    UserData.removeListener('change:songs', this._refreshSongs);
  }

  render () {
    const {
      songs,
      selectedSongID,
    } = this.state;
    const [selectedSongIdx, selectedSong] = selectedSongID ? songs.findEntry(s => s.get('id') === selectedSongID) : [null,null];
    let content;

    if (selectedSong) {
      content = <ChordLayoutEditor
        onSongChanged={(newSong) => {
          UserData.set('songs', songs.set(selectedSongIdx, newSong));
        }}
        onClickSongsButton={() => {
          this.setState({
            selectedSongID: null,
          });
        }}
        song={selectedSong}
      />;
    } else {
      content = <SongList
        songs={this.state.songs}
        onSelectSong={(song) => {
          this.setState({
            selectedSongID: song.get('id'),
          });
        }}
      />;
    }

    return (
      <div className={theme.WRAPPER.className}>
        {content}

        <Style.Element />
      </div>
    );
  }
};

export default Style.component(App);
