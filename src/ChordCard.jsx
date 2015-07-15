import React from 'react/addons';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import getFingeringsFromChord from './getFingeringsFromChord';
import intervalFromSemitoneOffset from './intervalFromSemitoneOffset';
import createFretboard from './createFretboard';

import transposeChord from './transposeChord';

import isFunc from './isFunc';

import FitText from './FitText';

// let cardWidth = (100 - 2*theme.mainPadding)/6 - 2;
// let cardHeight = 1.8*cardWidth;

const APPEAR = Style.registerKeyframes({
  from: {
    transform: 'scale(0)',
    // opacity: 0,
  },
  to: {
    transform: 'scale(1)',
    // opacity: 1,
  },
});

const APPEAR_THEN_DISAPPEAR = Style.registerKeyframes({
  '0%': {transform: 'scale(0)'},
  '10%': {transform: 'scale(1)'},
  '90%': {transform: 'scale(1)'},
  '100%': {transform: 'scale(0)'},
});

const DISAPPEAR = Style.registerKeyframes({
  from: {
    transform: 'scale(1)',
    opacity: 1,
  },
  to: {
    transform: 'scale(0)',
    opacity: 0,
  },
});

const shakeAmount = 1;
const shakeSteps = 4;
const shakeTranslateAmount = 1;
const shakeRotateAmount = 25;
const shakeKeyframes = Immutable.Range(0, shakeSteps+1).reduce((result, stepNumber) => {
  const modifier = (stepNumber % 2 ? -1 : 1) * shakeAmount * (1-(stepNumber / shakeSteps));
  return result.set(`${(stepNumber/shakeSteps) * 100}%`, {
    transform: `perspective(100vmin) translateX(${modifier * shakeTranslateAmount}vmin) rotateY(${modifier * shakeRotateAmount}deg)`,
  });
}, Immutable.OrderedMap()).toJS();
const SHAKE = Style.registerKeyframes(shakeKeyframes);

const WRAPPER = Style.registerStyle({
  flexShrink: 0,
  // width: `${cardWidth}vmin`,
  // height: `${cardHeight}vmin`,
  width: '100%',
  height: '100%',
  margin: '0vmin',
  border: `1vmin solid white`,
  borderRadius: '1vmin',
  background: 'white',
  transition: 'box-shadow 200ms, transform 200ms',
  transitionTimingFunction: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
  position: 'relative',
  overflow: 'visible',
  perspective: '100vmin',
  // transformOrigin: '50% 50% 0',
  // transform: 'rotateY(60deg)'
});

const WRAPPER_SELECTED = Style.registerStyle(WRAPPER.style, {
  border: `1vmin solid ${theme.highlight}`,
});

const WRAPPER_HOVERING = Style.registerStyle(WRAPPER.style, {
  boxShadow: '0 1vmin 3vmin rgba(0,0,0,0.3)',
  transform: 'translateY(-1vmin)',
});

const shakeAnimationDuration = 300;
const WRAPPER_SHAKING = Style.registerStyle(WRAPPER.style, {
  animationName: SHAKE.name,
  animationDuration: `${shakeAnimationDuration}ms`,
});

const deleteAnimationDuration = 150;
const WRAPPER_DELETED = Style.registerStyle(WRAPPER.style, {
  animationName: DISAPPEAR.name,
  animationDuration: `${deleteAnimationDuration}ms`,
});

const WRAPPER_INACTIVE = Style.registerStyle(WRAPPER.style, {
  opacity: 0.6,
});

const LABEL = Style.registerStyle({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  fontSize: '3.5vmin',
  fontWeight: 700,
  color: 'black',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  margin: 0,
});

const STYLE = Style.registerStyle({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  fontSize: '3vmin',
  backgroundColor: 'white',
  padding: '0.5vmin',
  paddingTop: '0vmin',
  borderRadius: '1vmin',
  flexShrink: 0,
  overflow: 'hidden',
});

const SVG = Style.registerStyle({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: '4vmin',
  // width: '100%',
});

const STRING = Style.registerStyle({
  stroke: '#aaf',//theme.labelColor,
  // strokeLinecap: 'round',
  strokeWidth: 2,
});

const NOTE = Style.registerStyle({  
  fill: theme.color,
  stroke: 'none',
  transform: `translate3d(0, 0, 0)`,
  transition: 'all 450ms',
});

const DELETE_BUTTON = Style.registerStyle(theme.BADGE.style, {
  transform: 'scale(1)',
});

const DELETE_BUTTON_HIDDEN = Style.registerStyle(theme.BADGE.style, {
  transform: 'scale(0)',
});

const VARIATION_BADGE = Style.registerStyle(theme.BADGE.style, {
  left: 'initial',
  right: `-${theme.badgeWidth/2 - 1}vmin`,
  background: theme.highlight,
  color: 'white',
  opacity: 1,
  transform: 'scale(1)',
});

const VARIATION_BADGE_HIDDEN = Style.registerStyle(VARIATION_BADGE.style, {
  transform: 'scale(0)',
});

const ChordCard = React.createClass({

  getDefaultProps: function () {
    const fretboard = createFretboard({
      tuning: ['G','C','E','A'],
      fretCount: 8,
    });

    return {
      chord: 'C',
      fretboard: fretboard,
      fretWindow: 8,
      transpose: 0,
    };
  },

  getInitialState: function () {
    return {
      deleted: false,
      variationBadgeVisible: false,
    };
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.variation !== this.props.variation) {
      this.showVariationBadge();
    }
  },

  shouldComponentUpdate: function (newProps, newState) {
    return !Immutable.is(newState, this.state) || !Immutable.is(newProps, this.props);
  },

  showVariationBadge: function () {
    clearTimeout(this.state.variationBadgeTimeout);
    
    const variationBadgeTimeout = setTimeout(() => {
      this.setState({
        variationBadgeVisible: false,
      });
    }, 1000);

    this.setState({
      variationBadgeVisible: true,
      variationBadgeTimeout: variationBadgeTimeout,
    });
  },

  _onClick: function _onClick (e) {
    if (isFunc(this.props.onClick)) {
      this.props.onClick(e);
    }
  },

  getCardSVG: function (fingerings) {
    const stringCount = fingerings.size;

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
    let {
      variation,
      hovering,
      inactive,
      canDelete,
      fretWindow,
      fretboard,
      transpose,
      chord,
    } = this.props;

    let {
      deleted,
      variationBadgeVisible,
    } = this.state;

    let fingerings, cardSVG, chordName, variations;

    let style = {};

    try {

      chordName = transposeChord({
        chord,
        semitones: transpose,
      }).name;

      variations = getFingeringsFromChord({
        chord: teoria.chord(chord).name,
        fretboard,
        fretWindow,
        transpose,
      });
      variation = (variation || 0) % variations.size;
      fingerings = variations.get(variation);
      cardSVG = this.getCardSVG(fingerings);
    } catch (e) {
      chordName = chord + '?';
      cardSVG = <div className={SVG.className}></div>;
    }

    let WRAPPER_className = WRAPPER.className;

    if (deleted) {
      WRAPPER_className = WRAPPER_DELETED.className;
    } else if (hovering) {
      WRAPPER_className = WRAPPER_HOVERING.className;
    } else if (inactive) {
      WRAPPER_className = WRAPPER_INACTIVE.className;
    }

    let DELETE_BUTTON_className;
    if (canDelete && !deleted) {
      DELETE_BUTTON_className = DELETE_BUTTON.className;
    } else {
      DELETE_BUTTON_className = DELETE_BUTTON_HIDDEN.className;
    }

    let VARIATION_BADGE_className;
    if (variationBadgeVisible) {
      VARIATION_BADGE_className = VARIATION_BADGE.className;
      if (variations.size < 2) {
        WRAPPER_className = WRAPPER_SHAKING.className;
      }
    } else {
      VARIATION_BADGE_className = VARIATION_BADGE_HIDDEN.className;
    }

    return (
      <div className={WRAPPER_className} style={this.props.style}>
        <div className={STYLE.className} style={style} onClick={this._onClick}>
          <FitText>
            <div className={LABEL.className}>
              {chordName}
            </div>
          </FitText>
          {cardSVG}
        </div>

        {<div className={DELETE_BUTTON_className} onClick={() => {
          if (!canDelete) {
            return;
          }

          setTimeout(this.props.onDelete, deleteAnimationDuration);
          this.setState({
            deleted: true,
          });
        }}>⨯</div>}

        {
          <div className={VARIATION_BADGE_className} onClick={this._onClick}>
            {(variation||0) + 1}
          </div>
        }
      </div>
    );
  }
});

export default Style.component(ChordCard);