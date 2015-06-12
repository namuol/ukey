import React from 'react';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import gridShift from './gridShift';

let DraggableItem = React.createClass({
  render: function () {
    return (
      <div
        onMouseDown={(e) => {

        }}
        style={Object.assign({}, {
          cursor: 'pointer',
          overflow: 'visible',
        }, this.props.style)}
      >
        {this.props.children}
      </div>
    );
  }
});

let DraggableGrid = React.createClass({
  getDefaultProps: function () {
    return {
      columns: 6,
      rowHeight: 12,
      spacing: 2,
      unit: 'vmin'
    };
  },

  getInitialState: function () {
    let {
      columns,
    } = this.props;

    let keys = Immutable.List();
    React.Children.forEach(this.props.children, c => keys = keys.push(c.key));

    let layout = keys.reduce((result, key, idx) => {
      return result.set(key, {
        x: idx % columns,
        y: Math.floor(idx/columns),
      });
    }, Immutable.Map());

    return {
      layout: layout,
    };
  },

  render: function () {
    let {
      columns,
      rowHeight,
      spacing,
      unit,
    } = this.props;

    let totalHeight = 0;

    let children = React.Children.map(this.props.children, (child, idx) => {
      let grid = this.state.layout.get(child.key);
      let gridX = grid.x;
      let gridY = grid.y;

      let width = `(${100/columns}% - ${spacing + spacing/columns}${unit})`;

      let x = `calc(${gridX} * ${width} + (${spacing*(gridX+1)}${unit}))`;
      let y = gridY*rowHeight + spacing*(gridY+1);

      let itemStyle = {
        width: `calc(${width})`,
        height: `${rowHeight}${unit}`,
        position: 'absolute',
        left: x,
        top: `${y}${unit}`,
      };

      totalHeight = Math.max(totalHeight, y + rowHeight + spacing);

      return (
        <DraggableItem key={idx} style={itemStyle}>
          {child}
        </DraggableItem>
      );
    });

    return (
      <div className={this.props.className} style={Object.assign({}, this.props.style, {
        position: 'relative',
        height: `${totalHeight}${unit}`,
      })}>
        {children}
      </div>
    );
  }
});

export default DraggableGrid;