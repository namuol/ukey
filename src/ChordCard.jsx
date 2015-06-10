import React from 'react';
import Style from './Style';
import theme from './theme';

import getFingeringsFromChord from './getFingeringsFromChord';
import createFretboard from './createFretboard';

let STYLE = Style.registerStyle({
  display: 'flex',
  fontSize: '3vmin',
  backgroundColor: 'white',
  padding: '2vmin',
  borderRadius: '1vmin',
  margin: '1vmin',
});

let STRING = Style.registerStyle({
  fontFamily: theme.fontFamily,
  width: '2vmin',
  textAlign: 'center',
});

let ChordCard = React.createClass({
  getDefaultProps: function () {
    return {
      fingerings: getFingeringsFromChord({
        chord: 'C',
        fretboard: createFretboard({
          tuning: ['G','C','E','A'],
          fretCount: 5,
          fretWindow: 5,
        }),
      }).get(0),
    };
  },

  render: function () {
    let notes = this.props.fingerings.map((n) => {
      return <div className={STRING.className}>{n}</div>;
    });

    return (
      <div className={STYLE.className} style={this.props.style}>
        {notes}
      </div>
    );
  }
});

export default Style.component(ChordCard);