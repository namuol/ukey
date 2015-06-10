import React from 'react';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import getFingeringsFromChord from './getFingeringsFromChord';
import createFretboard from './createFretboard';

let WRAPPER = Style.registerStyle({
});

let LABEL = Style.registerStyle({
  fontSize: '2vmin',
  fontWeight: 600,
  color: 'black',
  width: '100%',
  textAlign: 'center',
  margin: 0,
});

let STYLE = Style.registerStyle({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  fontSize: '3vmin',
  backgroundColor: 'white',
  padding: '1.5vmin',
  paddingTop: '0.5vmin',
  borderRadius: '1vmin',
  margin: '0 1vmin',
});

let SVG = Style.registerStyle({
  width: '8vmin',
});

let STRING = Style.registerStyle({
  stroke: theme.labelColor,
  strokeLinecap: 'round',
  strokeWidth: 2,
});

let NOTE = Style.registerStyle({  
  fill: theme.color,
  stroke: 'none',
  transform: `translate3d(0, 0, 0)`,
  transition: 'all 500ms',
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
    let stringCount = this.props.fingerings.size;

    let fretCount = 5;
    let height = (120 / (stringCount - 1)) * (fretCount-1);
    let radius = height / fretCount * 0.33;
    let sidePadding = radius;

    let stringX = function (stringNumber) {
      return sidePadding + (100-sidePadding*2) * (stringNumber / (stringCount-1));
    };

    let strings = this.props.fingerings.map((n, stringNumber) => {
      let x = stringX(stringNumber);

      return <polyline
        key={stringNumber}
        className={STRING.className}
        points={`${x},${0} ${x},${height}`}
      />;
    });

    let left = sidePadding;
    let right = sidePadding + (100-sidePadding*2);

    let fretY = function (fretNumber) {
      return 2 + (height - 2) * (fretNumber / fretCount);
    };

    let frets = Immutable.Range(0, fretCount+1).map((fretNumber) => {
      let y = fretY(fretNumber);
      let style = {};
      if (fretNumber === 0) {
        style.strokeWidth = 4;
      }
      return <polyline
        key={fretNumber}
        className={STRING.className}
        points={`${left},${y} ${right},${y}`}
        style={style}
      />;
    });

    let notes = this.props.fingerings.map((fretNumber, stringNumber) => {
      let x = stringX(stringNumber);
      let y = fretY(fretNumber) - (height/fretCount * 0.5);
      return <circle className={NOTE.className}
        key={stringNumber}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
        }}
        r={radius}
      />;
    });

    let cardSVG = (
      <svg viewBox={`0 0 100 ${height}`} className={SVG.className}>
        {strings}
        {frets}
        {notes}
      </svg>
    );

    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className} style={this.props.style}>
          <div className={LABEL.className}>
            {this.props.chord}
          </div>
          {cardSVG}
        </div>
      </div>
    );
  }
});

export default Style.component(ChordCard);