// Adapted from https://github.com/cgarvis/react-vendor-prefix

let prefix = (function () {
  if (typeof window === "undefined") {
    return {};
  }
  let styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1];
  return {
    dom: pre === 'ms' ? 'MS' : pre,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre === 'ms' ? pre : pre[0].toUpperCase() + pre.substr(1)
  };
}());

let vendorSpecificProperties = [
  'animation',
  'animationDelay',
  'animationDirection',
  'animationDuration',
  'animationFillMode',
  'animationIterationCount',
  'animationName',
  'animationPlayState',
  'animationTimingFunction',
  'appearance',
  'backfaceVisibility',
  'backgroundClip',
  'borderImage',
  'borderImageSlice',
  'boxSizing',
  'boxShadow',
  'contentColumns',
  'transform',
  'transformOrigin',
  'transformStyle',
  'transition',
  'transitionDelay',
  'transitionDuration',
  'transitionProperty',
  'transitionTimingFunction',
  'perspective',
  'perspectiveOrigin',
  'userSelect',
  'filter',
];

function prefixName (name) {
  return prefix.js + name[0].toUpperCase() + name.substr(1);
}

function prefixStyle (properties) {
  return Object.keys(properties).reduce((previous, property) => {
    if(vendorSpecificProperties.indexOf(property) !== -1) {
      previous[prefixName(property)] = properties[property];
    } else {
      previous[property] = properties[property];
    }

    return previous;
  }, {});
}

let FLEXBOX_KEYS = [
  'alignItems',
  'alignContent',
  'justifyContent',
  'flexDirection',
  'flex',
  'flexWrap',
  'flexGrow',
  'flexShrink',
];

let MSIE10_2012_FLEXBOX_KEYS = {
  'alignItems': 'flexAlign',
  'alignContent': 'flexLinePack',
  'justifyContent': 'flexPack',
  'flexDirection': 'flexDirection',
  'flex': 'flex',
  'flexWrap': 'flexWrap',
  'flexGrow': 'flexPositive',
  'flexShrink': 'flexNegative',
};

let MSIE10_2012_FLEXBOX_VALUE_RENAMES = {
  'flex-start': 'start',
  'flex-end': 'end',
  'space-around': 'distribute',
  'space-between': 'justify',
};

let MSIE10_2012_FLEXBOX_VALUES = Object.keys(MSIE10_2012_FLEXBOX_VALUE_RENAMES);

let rename = function(obj, from, to) {
  if(obj[from] !== undefined && obj[from] !== null) {
    obj[to] = obj[from];
    delete obj[from];
  }
}

function flexbox (properties) {
  let ua = navigator.userAgent.toLowerCase();

  // polyfill for safari
  let iOS = false;
  if (navigator.platform) {
    iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform.replace(' Simulator', '')) > -1;
  }

  if ((ua.indexOf('safari') !== -1 || iOS ) && ua.indexOf('chrome') === -1) {
    if(properties.display === 'flex') {
      properties.display = '-webkit-flex';
    }

    FLEXBOX_KEYS.forEach((prop) => {
      rename(properties, prop, prefixName(prop));
    });

  // polyfill for IE10
  } else if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
    if(properties.display === 'flex') {
      properties.display = '-ms-flexbox';
    }

    // TODO: implement 2012 flexbox syntax (in a cleaner and more thorough way -Lou)
    Object.keys(MSIE10_2012_FLEXBOX_KEYS).forEach((prop) => {
      let newProp = MSIE10_2012_FLEXBOX_KEYS[prop];
      if (properties.hasOwnProperty(prop)) {
        if (MSIE10_2012_FLEXBOX_VALUES.indexOf(properties[prop]) >= 0) {
          properties[prop] = MSIE10_2012_FLEXBOX_VALUE_RENAMES[properties[prop]];
        }

        rename(properties, prop, prefixName(newProp));
      }
    });
  }

  return properties;
}

function prefixStyles (styles) {
  if (true || typeof window === "undefined") {
    return styles;
  }
  return Object.keys(styles).reduce((previous, current) => {
    previous[current] = flexbox(prefixStyle(styles[current]));
    return previous;
  }, {});
}

export default (style) => {
  return flexbox(prefixStyle(style));
};
