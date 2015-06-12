import React from 'react';
import Style from './Style';
import theme from './theme';

import ReactGridLayout from 'react-grid-layout';
import DraggableGrid from './DraggableGrid';

import Immutable from 'immutable';

let WRAPPER = Style.registerStyle({
  width: '100vmin',
  minHeight: '100vh',
  backgroundColor: theme.bgColor,
});

let STYLE = Style.registerStyle({
  width: '100%',
  height: '100%',
});

let GRID = Style.registerStyle({
  width: '100%',
});

let ITEM = Style.registerStyle({
  width: '100%',
  height: '100%',
  textAlign: 'center',
  borderRadius: '2vmin',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '4vmin',
});

let TestGrid = React.createClass({
  render: function () {
    let items = Immutable.Range(0,16).map((n) => {
      return <div className={ITEM.className} key={n}>
        {n}
      </div>;
    });

    return (
      <div className={WRAPPER.className} style={this.props.style}>
        <div className={STYLE.className}>
          <DraggableGrid className={GRID.className} rowHeight={(100 - 5 * 2)/4}>
            {items}
          </DraggableGrid>

          <Style.Element />
        </div>
        </div>
    );
  }
});

export default Style.component(TestGrid);