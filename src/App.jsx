import React from 'react';
import Immutable from 'immutable';

import Style from './Style';
import theme from './theme';

import page from 'page';
import qs from 'qs';

let WRAPPER = Style.registerStyle({
  width: '100vmin',
  height: '100vh',
  padding: '0vmin',
  margin: 'auto',
  backgroundColor: theme.bgColor,
});

let STYLE = Style.registerStyle({
  display: 'flex',
  fontFamily: theme.fontFamily,
  color: theme.color,
  width: '100%',
  height: '100%',
  textAlign: 'left',
});

let BRAND_HEADER = Style.registerStyle({
  margin: 0,
  fontWeight: 400,
  marginTop: '-0.7vmin',
  textTransform: 'lowercase',
  fontSize: '4vmin',
  opacity: 0.5,
});

let App = React.createClass({
  getDefaultProps: function () {
    return {
    };
  },
  
  getInitialState: function () {
    return Object.assign({}, this.props);
  },

  render: function () {
    return (
      <div className={WRAPPER.className}>
        <div className={STYLE.className}>
        </div>

        <Style.Element />
      </div>
    );
  }
});

export default Style.component(App);