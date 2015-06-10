import React from 'react';
import Style from './Style';
import theme from './theme';

import getFingeringsFromChord from './getFingeringsFromChord';
import createFretboard from './createFretboard';

let WRAPPER = Style.registerStyle({
});

let LABEL = Style.registerStyle({
  fontSize: '3vmin',
  fontWeight: 600,
  color: theme.labelColor,
  width: '100%',
  textAlign: 'center',
});

let STYLE = Style.registerStyle({
  display: 'flex',
  fontSize: '3vmin',
  backgroundColor: 'white',
  padding: '2vmin',
  borderRadius: '1vmin',
  margin: '0 1vmin',
  marginTop: '0.5vmin',
});

let STRING = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontWeight: 600,
  width: '2vmin',
  textAlign: 'center',
});

let ChordCard = React.createClass({
  getDefaultProps: function () {
    return {
      chord: 'C',
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
      <div className={WRAPPER.className}>
        <div className={LABEL.className}>
          {this.props.chord}
        </div>
        <div className={STYLE.className} style={this.props.style}>
          {notes}
        </div>
      </div>
    );
  }
});

export default Style.component(ChordCard);