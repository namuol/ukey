import React from 'react/addons';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import getFingeringsFromChord from './getFingeringsFromChord';
import createFretboard from './createFretboard';

// let cardWidth = (100 - 2*theme.mainPadding)/6 - 2;
// let cardHeight = 1.8*cardWidth;

let WRAPPER = Style.registerStyle({
  flexShrink: 0,
  // width: `${cardWidth}vmin`,
  // height: `${cardHeight}vmin`,
  width: '100%',
  height: '100%',
  margin: '0vmin',
  overflow: 'hidden',
});

let LABEL = Style.registerStyle({
  fontSize: '3.5vmin',
  fontWeight: 700,
  color: 'black',
  width: '100%',
  textAlign: 'center',
  margin: 0,
});

let STYLE = Style.registerStyle({
  width: '100%',
  height: '100%',
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
  flexShrink: 0,
});

let SVG = Style.registerStyle({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: '4vmin',
  // width: '100%',
});

let STRING = Style.registerStyle({
  stroke: theme.labelColor,
  // strokeLinecap: 'round',
  strokeWidth: 2,
});

let NOTE = Style.registerStyle({  
  fill: theme.color,
  stroke: 'none',
  transform: `translate3d(0, 0, 0)`,
  transition: 'all 450ms',
});

let ChordCard = React.createClass({
  getDefaultProps: function () {
    let fretboard = createFretboard({
      tuning: ['G','C','E','A'],
      fretCount: 5,
      fretWindow: 5,
    });

    return {
      chord: 'C',
      fretboard: fretboard,
      transpose: 0,
    };
  },

  // shouldComponentUpdate: function (newProps, newState) {
  //   try {
  //     return teoria.chord(this.props.chord).name !== teoria.chord(newProps.chord).name;
  //   } catch (e) {
  //     return true;
  //   }
  // },

  getCardSVG: function (fingerings) {
    let stringCount = fingerings.size;

    let fretCount = 5;
    let height = (100 / (stringCount - 1)) * (fretCount-1);
    let radius = height / fretCount * 0.33;
    let sidePadding = radius;

    let stringX = function (stringNumber) {
      return sidePadding + (100-sidePadding*2) * (stringNumber / (stringCount-1));
    };

    let topFretWidth = 8;

    let fretY = function (fretNumber) {
      return topFretWidth + (height - topFretWidth) * (fretNumber / fretCount);
    };

    let strings = fingerings.map((n, stringNumber) => {
      let x = stringX(stringNumber);

      return <polyline
        key={stringNumber}
        className={STRING.className}
        points={`${x},${0} ${x},${fretY(fretCount)}`}
      />;
    });

    let left = sidePadding;
    let right = sidePadding + (100-sidePadding*2);

    let frets = Immutable.Range(0, fretCount+1).map((fretNumber) => {
      let y = fretY(fretNumber);

      let style = {};
      if (fretNumber === 0) {
        style.strokeWidth = topFretWidth;
        style.transform = `translateY(${-topFretWidth/2}px)`;
      }
      return <polyline
        key={fretNumber}
        className={STRING.className}
        points={`${left},${y} ${right},${y}`}
        style={style}
      />;
    });

    let notes = fingerings.map((fretNumber, stringNumber) => {
      let x = stringX(stringNumber);
      let y = (fretY(fretNumber-1) + fretY(fretNumber))/2;
      return <circle className={NOTE.className}
        key={stringNumber}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
          transitionDelay: `${50*stringNumber}ms`,
          opacity: fretNumber ? 1 : 0,
        }}
        r={radius}
      />;
    });

    return (
      <svg viewBox={`0 0 100 ${height}`} className={SVG.className}>
        {React.addons.createFragment({
          strings: strings,
          frets: frets,
          notes: notes
        })}
      </svg>
    );
  },

  render: function () {
    let fingerings, cardSVG, chordName;

    let style = {};

    try {
      chordName = teoria.chord(this.props.chord).name;
      fingerings = getFingeringsFromChord({
        chord: chordName,
        fretboard: this.props.fretboard,
        transpose: this.props.transpose,
      }).get(0);
      cardSVG = this.getCardSVG(fingerings);
    } catch (e) {
      chordName = '?';
      cardSVG = <div className={SVG.className}></div>;
      style.backgroundColor = '#faa';
    }

    return (
      <div className={WRAPPER.className} style={this.props.style}>
        <div className={STYLE.className} style={style}>
          <div className={LABEL.className}>
            {chordName}
          </div>
          {cardSVG}
        </div>
      </div>
    );
  }
});

export default Style.component(ChordCard);